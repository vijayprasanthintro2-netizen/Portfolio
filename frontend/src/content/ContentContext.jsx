import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../config';
import { resolveAssetUrls } from './assetUrl';

const ContentContext = createContext(null);

export function hexToRgba(hex, alpha) {
  let h = String(hex || '').replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6 || /[^0-9a-f]/i.test(h)) return `rgba(59, 130, 246, ${alpha})`;
  const n = parseInt(h, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Mixes a hex color towards white (0..1 amount). Used by the optional dark theme.
export function lighten(hex, amount = 0.35) {
  let h = String(hex || '').replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6 || /[^0-9a-f]/i.test(h)) return '#7ab3ff';
  const n = parseInt(h, 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  r = Math.round(r + (255 - r) * amount);
  g = Math.round(g + (255 - g) * amount);
  b = Math.round(b + (255 - b) * amount);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function parseHex(hex) {
  let h = String(hex || '').replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6 || /[^0-9a-f]/i.test(h)) return null;
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function toHex({ r, g, b }) {
  const channel = (v) => Math.max(0, Math.min(255, Math.round(v)));
  return `#${((1 << 24) | (channel(r) << 16) | (channel(g) << 8) | channel(b))
    .toString(16)
    .slice(1)}`;
}

// Mixes a hex color towards black. Keeps CMS-chosen hues while making them
// readable on the default white background.
export function darken(hex, amount = 0.2) {
  const rgb = parseHex(hex);
  if (!rgb) return '#2563eb';
  return toHex({
    r: rgb.r * (1 - amount),
    g: rgb.g * (1 - amount),
    b: rgb.b * (1 - amount),
  });
}

function luminance({ r, g, b }) {
  const linear = (value) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

// Returns the darkest-enough variant of a CMS color for white surfaces.
export function readableOnLight(hex, fallback = '#2563eb') {
  let rgb = parseHex(hex) || parseHex(fallback) || { r: 37, g: 99, b: 235 };
  for (let i = 0; i <= 16; i += 1) {
    if (1.05 / (luminance(rgb) + 0.05) >= 4.5) break;
    rgb = { r: rgb.r * 0.94, g: rgb.g * 0.94, b: rgb.b * 0.94 };
  }
  return toHex(rgb);
}

// Applies the design settings (from the admin "Design" section) directly onto
// the CSS custom properties used by tokens.css. CMS colors are preserved, but
// light mode receives contrast-safe variants so no text disappears on white.
export function applyDesign(design) {
  if (!design) return;
  const root = document.documentElement;
  const set = (key, value) => {
    if (value) root.style.setProperty(key, value);
  };
  const isLight = root.getAttribute('data-theme') === 'light';
  const d = design;
  const accent = isLight ? readableOnLight(d.accent || '#2563eb') : d.accent || '#3b82f6';
  const from = isLight ? readableOnLight(d.gradientFrom || '#2563eb') : d.gradientFrom || '#2563eb';
  const mid = isLight ? readableOnLight(d.gradientMid || '#2563eb') : d.gradientMid || '#3b82f6';
  const to = isLight ? readableOnLight(d.gradientTo || '#2563eb') : d.gradientTo || '#38bdf8';
  const accent2 = d.accent2 && (isLight ? readableOnLight(d.accent2) : d.accent2);
  const accent3 = d.accent3 && (isLight ? readableOnLight(d.accent3) : d.accent3);

  set('--accent', accent);
  set('--accent-1', accent);
  set('--accent-blue', accent);
  set('--accent-blue-glow', hexToRgba(accent, isLight ? 0.4 : 0.55));
  set('--accent-1-soft', hexToRgba(accent, isLight ? 0.1 : 0.16));
  if (accent2) set('--accent-2', accent2);
  if (accent3) set('--accent-3', accent3);

  const gradient = `linear-gradient(135deg, ${from} 0%, ${mid} 45%, ${to} 100%)`;
  set('--grad-blue', gradient);
  set('--grad-primary', gradient);
  set(
    '--grad-text',
    isLight
      ? `linear-gradient(120deg, ${darken(from, 0.12)} 0%, ${to} 100%)`
      : `linear-gradient(120deg, ${lighten(from, 0.42)} 0%, ${lighten(to, 0.3)} 100%)`
  );
  set('--font-display', d.fontDisplay);
  set('--font-body', d.fontBody);
  set('--font-mono', d.fontMono);
  if (d.radius) {
    const r = Number(d.radius);
    root.style.setProperty('--radius-sm', `${Math.round(r * 0.62)}px`);
    root.style.setProperty('--radius', `${r}px`);
    root.style.setProperty('--radius-lg', `${Math.round(r * 1.5)}px`);
    root.style.setProperty('--radius-xl', `${Math.round(r * 2)}px`);
  }
}

export function ContentProvider({ children }) {
  const [content, setContent] = useState({});
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  const refresh = useCallback(async (signal) => {
    try {
      const res = await fetch(`${api.baseUrl}/content`, { signal });
      if (!res.ok) throw new Error(`Content API ${res.status}`);
      const data = await res.json();
      if (signal?.aborted) return false;
      setContent(resolveAssetUrls(data.content || {}));
      setStatus('ready');
      return true;
    } catch (err) {
      if (err.name === 'AbortError' || signal?.aborted) return false;
      setStatus('error');
      return false;
    }
  }, []);

  useEffect(() => {
    // StrictMode mounts effects twice in development; abort the first request
    // instead of letting two responses race each other.
    const controller = new AbortController();
    refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);

  // Keep design custom properties in sync with both CMS edits and theme switches.
  const design = content.design;
  useEffect(() => {
    applyDesign(design);
  }, [design]);

  useEffect(() => {
    const onThemeChange = () => applyDesign(design);
    window.addEventListener('vp-theme-change', onThemeChange);
    return () => window.removeEventListener('vp-theme-change', onThemeChange);
  }, [design]);

  const value = useMemo(
    () => ({ content, status, refresh }),
    [content, status, refresh]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  return useContext(ContentContext);
}
