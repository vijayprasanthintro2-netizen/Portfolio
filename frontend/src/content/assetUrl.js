import { api } from '../config';

const API_PREFIX = '/api/';
const CONTENT_ASSET_PREFIX = '/api/content/asset/';
const FILE_ASSET_PREFIX = '/api/assets/';

function trimTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '');
}

// Returns the configured API base with a trailing `/api`, whether the site is
// using the Vite proxy (`/api`) or a separately hosted backend.
function apiBase() {
  const raw = trimTrailingSlash(api.baseUrl || '/api');
  if (!/^https?:\/\//i.test(raw)) return raw;

  try {
    const url = new URL(raw);
    const path = trimTrailingSlash(url.pathname);
    return path.endsWith('/api') ? `${url.origin}${path}` : `${url.origin}${path}/api`;
  } catch {
    return raw;
  }
}

function withApiBase(storedPath) {
  const base = apiBase();
  if (!/^https?:\/\//i.test(base)) return storedPath;
  return `${base}/${storedPath.slice(API_PREFIX.length)}`;
}

// Turns CMS-stored asset paths into URLs the browser can load. Data URLs and
// absolute URLs are left untouched so older saved content keeps working.
export function resolveAssetUrl(value) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^(data:|https?:\/\/|\/\/|blob:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith(CONTENT_ASSET_PREFIX) || trimmed.startsWith(FILE_ASSET_PREFIX)) {
    return withApiBase(trimmed);
  }
  if (trimmed.startsWith(API_PREFIX)) return withApiBase(trimmed);
  return trimmed;
}

export function resolveAssetUrls(value) {
  if (typeof value === 'string') return resolveAssetUrl(value);
  if (Array.isArray(value)) return value.map(resolveAssetUrls);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [key, item] of Object.entries(value)) out[key] = resolveAssetUrls(item);
    return out;
  }
  return value;
}
