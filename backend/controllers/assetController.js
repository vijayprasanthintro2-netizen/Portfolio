import Content from '../models/Content.js';
import { defaultContent } from '../config/defaultContent.js';
import { invalidateCache } from './contentController.js';
import {
  assetUrl,
  dbReady,
  findAsset,
  findAssetByKey,
  listAssets,
  removeAsset,
  removeAssetByKey,
  saveAsset,
  getBucket,
} from '../config/gridfs.js';

const KEY_RE = /^[a-zA-Z0-9_-]{1,100}$/;
const PDF_HEADER = Buffer.from('%PDF-');

function noDb(res) {
  return res
    .status(503)
    .json({ success: false, message: 'MongoDB is not connected — uploads are unavailable.' });
}

function safeKey(value, fallbackPrefix = 'media') {
  const clean = String(value || '').trim();
  if (!clean) return `${fallbackPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  if (!KEY_RE.test(clean)) {
    throw Object.assign(new Error('Use only letters, numbers, hyphens and underscores in the file key.'), {
      status: 400,
    });
  }
  return clean;
}

function assertPdf(file) {
  if (!file?.buffer?.length) throw Object.assign(new Error('No PDF was selected.'), { status: 400 });
  if (!file.buffer.subarray(0, 5).equals(PDF_HEADER)) {
    throw Object.assign(new Error('That file is not a valid PDF.'), { status: 400 });
  }
}

function assertImage(file) {
  if (!file?.buffer?.length) throw Object.assign(new Error('No image was selected.'), { status: 400 });
  const b = file.buffer;
  const isPng = b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isJpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const isGif = b.subarray(0, 3).toString() === 'GIF';
  const isWebp = b.subarray(0, 4).toString() === 'RIFF' && b.subarray(8, 12).toString() === 'WEBP';
  const isSvg = /^\s*(<\?xml[\s\S]{0,200}?<svg|<svg)/i.test(b.subarray(0, 512).toString('utf8'));
  if (!isPng && !isJpeg && !isGif && !isWebp && !isSvg) {
    throw Object.assign(new Error('That file is not a valid image.'), { status: 400 });
  }
}

function errorResponse(res, err, fallback) {
  if (err?.status) return res.status(err.status).json({ success: false, message: err.message });
  console.error('[assets]', err);
  return res.status(500).json({ success: false, message: fallback });
}

// ---------- Public streaming ----------

export async function streamAsset(req, res) {
  if (!dbReady()) return noDb(res);
  try {
    const key = req.params.key;
    const file = key ? await findAssetByKey(key) : await findAsset(req.params.id);
    if (!file) return res.status(404).json({ success: false, message: 'File not found.' });

    const mime = file.metadata?.mimeType || 'application/octet-stream';
    const download = req.query.download === '1';
    const name = String(file.metadata?.originalName || file.filename || 'download').replace(
      /["\r\n]/g,
      ''
    );
    res.set('Content-Type', mime);
    res.set('Content-Length', String(file.length));
    res.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    res.set(
      'Content-Disposition',
      `${download ? 'attachment' : 'inline'}; filename="${name}"`
    );

    const stream = getBucket().openDownloadStream(file._id);
    stream.on('error', (err) => {
      console.error('[assets] stream error:', err.message);
      if (!res.headersSent) res.status(500).json({ success: false, message: 'Could not read file.' });
      else res.destroy(err);
    });
    return stream.pipe(res);
  } catch (err) {
    return errorResponse(res, err, 'Could not load file.');
  }
}

// ---------- Media library (admin) ----------

export async function getAssets(req, res) {
  try {
    const kind = String(req.query.kind || '').trim();
    return res.json({ success: true, data: await listAssets(kind || undefined) });
  } catch (err) {
    return errorResponse(res, err, 'Could not list files.');
  }
}

export async function uploadAsset(req, res) {
  if (!dbReady()) return noDb(res);
  try {
    if (!req.file) throw Object.assign(new Error('Choose a file to upload.'), { status: 400 });
    assertImage(req.file);
    const kind = String(req.body?.kind || 'image').trim();
    if (!['image', 'certificate', 'other'].includes(kind)) {
      throw Object.assign(new Error('Invalid file category.'), { status: 400 });
    }
    const key = safeKey(req.body?.key, kind);
    const view = await saveAsset({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      kind,
      key,
      uploadedBy: req.adminName || 'admin',
    });
    return res.status(201).json({ success: true, data: view });
  } catch (err) {
    return errorResponse(res, err, 'Upload failed.');
  }
}

export async function replaceAsset(req, res) {
  if (!dbReady()) return noDb(res);
  try {
    if (!req.file) throw Object.assign(new Error('Choose a replacement file.'), { status: 400 });
    assertImage(req.file);
    const old = await findAssetByKey(req.params.key);
    if (!old) return res.status(404).json({ success: false, message: 'File not found.' });

    const view = await saveAsset({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      kind: old.metadata?.kind || 'image',
      key: req.params.key,
      uploadedBy: req.adminName || 'admin',
    });
    // Delete every older version, keeping the newly written one. The public
    // URL (based on the key) is unchanged.
    const all = await listAssetsByKey(req.params.key);
    await Promise.all(
      all.filter((file) => file._id.toString() !== view.id).map((file) => removeAsset(file._id))
    );
    return res.json({ success: true, data: view });
  } catch (err) {
    return errorResponse(res, err, 'Could not replace file.');
  }
}

async function listAssetsByKey(key) {
  const bucket = getBucket();
  if (!bucket) return [];
  return bucket.find({ 'metadata.key': String(key) }).toArray();
}

export async function deleteAsset(req, res) {
  try {
    const removed = await removeAssetByKey(req.params.key);
    if (!removed) return res.status(404).json({ success: false, message: 'File not found.' });
    return res.json({ success: true, message: 'File deleted.' });
  } catch (err) {
    return errorResponse(res, err, 'Could not delete file.');
  }
}

// ---------- Resume (stored in the profile CMS section) ----------

export async function getResume(req, res) {
  try {
    const doc = await Content.findOne({ section: 'profile' }).lean();
    const data = doc?.data || defaultContent.profile;
    const meta = data.resumeMeta || null;
    const key = meta?.key || null;
    const file = key ? await findAssetByKey(key) : null;

    return res.json({
      success: true,
      data: {
        url: data.resume || '',
        previewUrl: key ? assetUrl(key) : data.resume || '',
        downloadUrl: key ? assetUrl(key, { download: true }) : data.resume || '',
        filename: meta?.filename || (data.resume ? data.resume.split('/').pop() : ''),
        size: file?.length ?? meta?.size ?? null,
        uploadedAt: meta?.uploadedAt || file?.metadata?.uploadedAt || null,
        uploadedBy: meta?.uploadedBy || '',
        storage: file ? 'gridfs' : data.resume ? 'static' : 'none',
        status: file ? 'uploaded' : data.resume ? 'legacy' : 'missing',
      },
    });
  } catch (err) {
    return errorResponse(res, err, 'Could not load resume information.');
  }
}

export async function uploadResume(req, res) {
  if (!dbReady()) return noDb(res);
  try {
    if (!req.file) throw Object.assign(new Error('Choose a PDF to upload.'), { status: 400 });
    assertPdf(req.file);

    const key = 'resume';
    const view = await saveAsset({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      mimeType: 'application/pdf',
      kind: 'resume',
      key,
      uploadedBy: req.adminName || 'admin',
    });

    const doc = await Content.findOne({ section: 'profile' }).lean();
    const data = doc?.data ? { ...doc.data } : { ...defaultContent.profile };
    data.resume = assetUrl(key, { download: true });
    data.resumeMeta = {
      key,
      filename: view.originalName,
      size: view.size,
      mimeType: 'application/pdf',
      uploadedAt: view.uploadedAt,
      uploadedBy: view.uploadedBy,
    };

    await Content.findOneAndUpdate(
      { section: 'profile' },
      { section: 'profile', data, updatedBy: req.adminName || 'admin' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    invalidateCache();

    // Remove previous resume versions; the stable URL keeps working.
    const all = await listAssetsByKey(key);
    await Promise.all(
      all.filter((file) => file._id.toString() !== view.id).map((file) => removeAsset(file._id))
    );

    return res.status(201).json({ success: true, data: view });
  } catch (err) {
    return errorResponse(res, err, 'Resume upload failed.');
  }
}

export async function deleteResume(req, res) {
  try {
    await Content.findOneAndUpdate(
      { section: 'profile' },
      {
        $set: {
          'data.resume': '',
          'data.resumeMeta': null,
          updatedBy: req.adminName || 'admin',
        },
      },
      { new: true }
    );
    await removeAssetByKey('resume');
    invalidateCache();
    return res.json({ success: true, message: 'Resume removed.' });
  } catch (err) {
    return errorResponse(res, err, 'Could not delete resume.');
  }
}
