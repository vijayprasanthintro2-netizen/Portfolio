// Legacy CMS records were sometimes saved as `{ "0": {...}, "1": {...} }`
// instead of arrays. Convert those numeric-key maps back into ordered arrays
// without dropping or altering any record.
export function normalizeList(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'object') return null;

  const keys = Object.keys(value);
  if (!keys.length || !keys.every((key) => /^\d+$/.test(key))) return null;

  return keys
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => value[key]);
}

export function asArray(value) {
  return normalizeList(value) || [];
}

export function normalizeSectionValue(meta, value) {
  if (!meta || (meta.type !== 'records' && meta.type !== 'strings')) return value;
  return normalizeList(value) ?? value;
}
