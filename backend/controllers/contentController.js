import Content from '../models/Content.js';
import { defaultContent, sectionKeys } from '../config/defaultContent.js';

// images get stored as base64 strings, drop any single image that's
// way too big before it's written to the db
const MAX_IMAGE_CHARS = 4 * 1024 * 1024; // ~4MB of base64 text

function hasOversizedImage(value) {
  if (typeof value === 'string') {
    return value.startsWith('data:image/') && value.length > MAX_IMAGE_CHARS;
  }
  if (Array.isArray(value)) return value.some(hasOversizedImage);
  if (value && typeof value === 'object') return Object.values(value).some(hasOversizedImage);
  return false;
}

// Public: returns every stored section as { sectionKey: data }.
export async function getPublicContent(req, res) {
  try {
    const docs = await Content.find({}).select('section data').lean();
    const sections = {};
    for (const doc of docs) sections[doc.section] = doc.data;
    return res.json({ success: true, content: sections });
  } catch (err) {
    console.error('[content] getPublicContent error:', err);
    return res.status(500).json({ success: false, message: 'Could not load content.' });
  }
}

// Admin: returns stored data for a section, falling back to the default seed
// so editors are always pre-filled.
export async function getSection(req, res) {
  const { section } = req.params;
  if (!sectionKeys.includes(section)) {
    return res.status(404).json({ success: false, message: 'Unknown section.' });
  }
  try {
    const doc = await Content.findOne({ section }).lean();
    return res.json({
      success: true,
      section,
      data: doc ? doc.data : defaultContent[section],
    });
  } catch (err) {
    console.error('[content] getSection error:', err);
    return res.status(500).json({ success: false, message: 'Could not load section.' });
  }
}

// Admin: upserts the section's data.
export async function saveSection(req, res) {
  const { section } = req.params;
  const { data } = req.body || {};
  if (!sectionKeys.includes(section)) {
    return res.status(404).json({ success: false, message: 'Unknown section.' });
  }
  if (data === undefined || data === null) {
    return res.status(400).json({ success: false, message: 'No data provided.' });
  }
  if (hasOversizedImage(data)) {
    return res.status(413).json({
      success: false,
      message: 'Image is too large. Please upload a smaller image (max ~3MB).',
    });
  }

  try {
    const doc = await Content.findOneAndUpdate(
      { section },
      { section, data, updatedBy: req.adminName || 'admin' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    return res.json({ success: true, section, data: doc.data });
  } catch (err) {
    console.error('[content] saveSection error:', err);
    return res.status(500).json({ success: false, message: 'Could not save section.' });
  }
}

// Admin: resets a section back to the default seed.
export async function resetSection(req, res) {
  const { section } = req.params;
  if (!sectionKeys.includes(section)) {
    return res.status(404).json({ success: false, message: 'Unknown section.' });
  }
  try {
    await Content.deleteOne({ section });
    return res.json({ success: true, section, data: defaultContent[section] });
  } catch (err) {
    console.error('[content] resetSection error:', err);
    return res.status(500).json({ success: false, message: 'Could not reset section.' });
  }
}
