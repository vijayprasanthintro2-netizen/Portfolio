import DOMPurify from 'dompurify';

// Keep the editor output deliberately small: these are the only tags the
// portfolio needs, and the same allow-list is used before anything is rendered.
const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'h1',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'a',
  'span',
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'style'];
let hookAdded = false;

function ensureHook() {
  if (hookAdded || typeof window === 'undefined') return;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;

    // TextAlign is the only style the portfolio supports.
    const style = node.getAttribute('style');
    if (style) {
      const align = /^\s*text-align\s*:\s*(left|center|right|justify)\s*;?\s*$/i.exec(style);
      if (align) node.setAttribute('style', `text-align: ${align[1].toLowerCase()}`);
      else node.removeAttribute('style');
    }

    if (node.tagName === 'A') {
      node.setAttribute('rel', 'noopener noreferrer nofollow');
      const href = node.getAttribute('href') || '';
      if (/^https?:\/\//i.test(href)) node.setAttribute('target', '_blank');
      else node.removeAttribute('target');
    }
  });
  hookAdded = true;
}

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

export function sanitizeHtml(value) {
  const raw = String(value ?? '');
  if (!raw) return '';
  ensureHook();
  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  }).trim();
}

export function isHtml(value) {
  return /<\/?[a-z][^>]*>/i.test(String(value ?? ''));
}

export function plainTextToHtml(value) {
  const raw = String(value ?? '').replace(/\r\n?/g, '\n');
  if (!raw) return '';
  return raw
    .split('\n')
    .map((line) => `<p>${escapeHtml(line) || '<br>'}</p>`)
    .join('');
}

// Plain-text CMS records from before the editor stay valid; they are wrapped
// into paragraphs on the way into the editor and on the way to the page.
export function normalizeRichHtml(value) {
  const raw = typeof value === 'string' ? value : '';
  if (!raw.trim()) return '';
  return isHtml(raw) ? sanitizeHtml(raw) : plainTextToHtml(raw);
}

function normalizeListItem(value) {
  const raw = typeof value === 'string' ? value : '';
  if (!raw.trim()) return '';
  if (!isHtml(raw)) return escapeHtml(raw).replace(/\n/g, '<br>');

  const clean = sanitizeHtml(raw);
  if (typeof document === 'undefined') return clean;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = clean;
  const first = wrapper.firstElementChild;
  if (first && first.tagName === 'P') {
    const inner = first.innerHTML;
    first.remove();
    return sanitizeHtml(inner + wrapper.innerHTML);
  }
  return clean;
}

export function listToHtml(value) {
  const items = (Array.isArray(value) ? value : [])
    .map(normalizeListItem)
    .filter(Boolean);
  if (!items.length) return '';
  return `<ul>${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

export function htmlToList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeListItem(item)).filter(Boolean);
  }

  const html = normalizeRichHtml(value);
  if (!html || typeof document === 'undefined') return [];

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const list = doc.querySelector('ul, ol');
  if (list) {
    return Array.from(list.children)
      .filter((node) => node.tagName === 'LI')
      .map((node) => sanitizeHtml(node.innerHTML))
      .filter(Boolean);
  }

  const blocks = Array.from(doc.body.children);
  if (blocks.length > 1) {
    return blocks
      .map((node) => sanitizeHtml(node.innerHTML))
      .filter(Boolean);
  }

  const text = stripHtml(html);
  return text ? [escapeHtml(text)] : [];
}

export function stripHtml(value) {
  const raw = String(value ?? '');
  if (!raw) return '';
  if (!isHtml(raw)) return raw.replace(/\r\n?/g, '\n').replace(/\s+/g, ' ').trim();

  const safe = sanitizeHtml(raw)
    .replace(/<br\s*\/?\s*>/gi, ' ')
    .replace(/<\/(?:p|li|h1|h2|h3|div)>/gi, ' ');
  const doc = new DOMParser().parseFromString(safe, 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
}

export function isEmptyRich(value) {
  if (Array.isArray(value)) return value.every((item) => isEmptyRich(item));
  return !stripHtml(value);
}
