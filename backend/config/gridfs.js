import mongoose from 'mongoose';

// Binary files live in MongoDB GridFS (a chunks collection), never inside a
// Content document. GridFS is part of MongoDB itself — no second CMS, no local
// disk — and it works on serverless hosts as long as MongoDB is reachable.

const BUCKET_NAME = 'portfolio_assets';
let bucket = null;

export function dbReady() {
  return mongoose.connection.readyState === 1 && Boolean(mongoose.connection.db);
}

export function getBucket() {
  if (!dbReady()) return null;
  if (!bucket) {
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: BUCKET_NAME,
      chunkSizeBytes: 255 * 1024,
    });
  }
  return bucket;
}

function toObjectId(id) {
  try {
    return new mongoose.mongo.ObjectId(String(id));
  } catch {
    return null;
  }
}

export function assetUrl(key, { download = false } = {}) {
  return `/api/assets/k/${encodeURIComponent(key)}${download ? '?download=1' : ''}`;
}

export function assetView(file) {
  if (!file) return null;
  const meta = file.metadata || {};
  const key = meta.key || file._id.toString();
  return {
    id: file._id.toString(),
    key,
    filename: meta.originalName || file.filename || 'file',
    originalName: meta.originalName || file.filename || 'file',
    mimeType: meta.mimeType || 'application/octet-stream',
    size: file.length || meta.size || 0,
    kind: meta.kind || 'other',
    uploadedAt: meta.uploadedAt || file.uploadDate || null,
    uploadedBy: meta.uploadedBy || 'admin',
    url: assetUrl(key),
  };
}

export async function saveAsset({
  buffer,
  originalName,
  mimeType,
  kind,
  key,
  uploadedBy = 'admin',
}) {
  const bucketInstance = getBucket();
  if (!bucketInstance) throw Object.assign(new Error('MongoDB is not connected.'), { status: 503 });

  const metadata = {
    originalName,
    mimeType,
    kind,
    key,
    size: buffer.length,
    uploadedAt: new Date().toISOString(),
    uploadedBy,
  };
  const stream = bucketInstance.openUploadStream(originalName, { metadata });

  await new Promise((resolve, reject) => {
    stream.once('error', reject);
    stream.once('finish', resolve);
    stream.end(buffer);
  });

  return assetView({
    _id: stream.id,
    filename: originalName,
    length: buffer.length,
    metadata,
  });
}

export async function findAsset(id) {
  const bucketInstance = getBucket();
  const objectId = toObjectId(id);
  if (!bucketInstance || !objectId) return null;
  const files = await bucketInstance.find({ _id: objectId }).toArray();
  return files[0] || null;
}

// A key is a stable public URL. Replacing a file writes a new GridFS version
// with the same key and removes the old one, so links never break.
export async function findAssetByKey(key) {
  const bucketInstance = getBucket();
  if (!bucketInstance || !key) return null;
  const files = await bucketInstance
    .find({ 'metadata.key': String(key) })
    .sort({ uploadDate: -1 })
    .toArray();
  return files[0] || null;
}

export async function listAssets(kind) {
  const bucketInstance = getBucket();
  if (!bucketInstance) throw Object.assign(new Error('MongoDB is not connected.'), { status: 503 });
  const filter = kind ? { 'metadata.kind': kind } : {};
  const files = await bucketInstance.find(filter).sort({ uploadDate: -1 }).toArray();

  const latestByKey = new Map();
  for (const file of files) {
    const key = file.metadata?.key || file._id.toString();
    if (!latestByKey.has(key)) latestByKey.set(key, file);
  }
  return [...latestByKey.values()].map(assetView).sort((a, b) => {
    const x = new Date(a.uploadedAt || 0).getTime();
    const y = new Date(b.uploadedAt || 0).getTime();
    return y - x;
  });
}

export async function removeAsset(id) {
  const bucketInstance = getBucket();
  const objectId = toObjectId(id);
  if (!bucketInstance || !objectId) return false;
  const file = await findAsset(id);
  if (!file) return false;
  await bucketInstance.delete(objectId);
  return true;
}

export async function removeAssetByKey(key) {
  const bucketInstance = getBucket();
  if (!bucketInstance || !key) return 0;
  const files = await bucketInstance.find({ 'metadata.key': String(key) }).toArray();
  await Promise.all(files.map((file) => bucketInstance.delete(file._id)));
  return files.length;
}
