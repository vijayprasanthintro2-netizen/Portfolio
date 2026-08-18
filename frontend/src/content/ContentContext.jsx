import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../config';

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

// Mixes a hex color towards white (0..1 amount).
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

// Applies the design settings (from the admin "Design" section) directly onto
// the CSS custom properties used by tokens.css.
export function applyDesign(design) {
  if (!design) return;
  const root = document.documentElement;
  const set = (key, value) => {
    if (value) root.style.setProperty(key, value);
  };
  const d = design;
  const accent = d.accent || '#3b82f6';
  const from = d.gradientFrom || '#2563eb';
  const mid = d.gradientMid || '#3b82f6';
  const to = d.gradientTo || '#38bdf8';

  set('--accent-1', accent);
  set('--accent-blue', accent);
  set('--accent-blue-glow', hexToRgba(accent, 0.55));
  set('--accent-1-soft', hexToRgba(accent, 0.16));
  set('--accent-2', d.accent2);
  set('--accent-3', d.accent3);
  set('--grad-blue', `linear-gradient(135deg, ${from} 0%, ${mid} 45%, ${to} 100%)`);
  set('--grad-primary', `linear-gradient(135deg, ${from} 0%, ${mid} 45%, ${to} 100%)`);
  set('--grad-text', `linear-gradient(120deg, ${lighten(from, 0.42)} 0%, ${lighten(to, 0.3)} 100%)`);
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

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`${api.baseUrl}/content`);
      if (!res.ok) throw new Error(`Content API ${res.status}`);
      const data = await res.json();
      setContent(data.content || {});
      setStatus('ready');
      return true;
    } catch {
      setStatus('error');
      return false;
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Keep design custom properties in sync.
  const design = content.design;
  useEffect(() => {
    applyDesign(design);
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