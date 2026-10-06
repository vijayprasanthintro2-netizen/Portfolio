// Reads the picked image and compresses it into a base64 data url,
// that's what gets saved along with the section content in MongoDB.

const MAX_DIMENSION = 1600;
const MAX_OUTPUT_CHARS = 3 * 1024 * 1024; // ~3MB of base64 text
const MAX_SOURCE_BYTES = 12 * 1024 * 1024;

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read that file.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('That file could not be decoded as an image.'));
    img.src = src;
  });
}

function encode(img, sourceType) {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight) || 1);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext('2d');

  // white bg first so jpeg doesn't end up with black corners
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  if (sourceType === 'image/png') return canvas.toDataURL('image/png');
  let out = '';
  try {
    out = canvas.toDataURL('image/webp', 0.85);
  } catch {
    out = '';
  }
  if (!out.startsWith('data:image/webp')) out = canvas.toDataURL('image/jpeg', 0.85);
  return out;
}

export async function fileToDataUrl(file) {
  if (!file) throw new Error('No image selected.');
  if (file.type && !file.type.startsWith('image/')) {
    throw new Error('Please choose an image file (JPG, PNG, WebP…).');
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error('That image is too large — choose one under 12MB.');
  }

  const raw = await readFileAsDataURL(file);

  // svg/gif go as-is, re-encoding would mess them up
  const passthrough = file.type === 'image/svg+xml' || file.type === 'image/gif';
  const output = passthrough ? raw : encode(await loadImage(raw), file.type);

  if (output.length > MAX_OUTPUT_CHARS) {
    throw new Error('Image is still too large after compression — try a smaller photo.');
  }
  return output;
}
