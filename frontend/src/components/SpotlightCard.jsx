import { useCallback, useEffect, useRef } from 'react';

// Card with a soft spotlight that follows the cursor (pointer-only).
// Exposes both pixel (--mouse-x/--mouse-y) and percent (--mx/--my) coordinates.
export function SpotlightCard({ children, className = '' }) {
  const ref = useRef(null);
  const raf = useRef(0);
  const point = useRef({ x: 0, y: 0 });
  const rectCache = useRef(null);

  const onEnter = useCallback((e) => {
    if (e.pointerType !== 'mouse') return;
    if (ref.current) rectCache.current = ref.current.getBoundingClientRect();
  }, []);

  const onMove = useCallback((e) => {
    if (e.pointerType !== 'mouse') return;
    point.current.x = e.clientX;
    point.current.y = e.clientY;
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const el = ref.current;
      if (!el) return;
      const rect = rectCache.current || el.getBoundingClientRect();
      rectCache.current = rect;
      const x = point.current.x - rect.left;
      const y = point.current.y - rect.top;
      el.style.setProperty('--mouse-x', `${x}px`);
      el.style.setProperty('--mouse-y', `${y}px`);
      el.style.setProperty('--mx', `${x}px`);
      el.style.setProperty('--my', `${y}px`);
    });
  }, []);

  useEffect(() => {
    const invalidate = () => {
      rectCache.current = null;
    };
    window.addEventListener('scroll', invalidate, { passive: true });
    window.addEventListener('resize', invalidate);
    return () => {
      window.removeEventListener('scroll', invalidate);
      window.removeEventListener('resize', invalidate);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <div ref={ref} onPointerEnter={onEnter} onPointerMove={onMove} className={`spotlight-card ${className}`.trim()}>
      {children}
    </div>
  );
}
