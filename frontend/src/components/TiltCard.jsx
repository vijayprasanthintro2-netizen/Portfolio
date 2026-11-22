import { useCallback, useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

// Card with a subtle 3D tilt, a cursor-following glow and a hover shimmer.
// Mouse-only: disabled on touch devices and for reduced-motion users.
export function TiltCard({ children, className = '', max = 5, lift = 6, ...rest }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const raf = useRef(0);
  const rectCache = useRef(null);

  const onEnter = useCallback((e) => {
    if (e.pointerType !== 'mouse' || reduced) return;
    if (ref.current) rectCache.current = ref.current.getBoundingClientRect();
  }, [reduced]);

  const onMove = useCallback(
    (e) => {
      if (e.pointerType !== 'mouse' || reduced) return;
      const el = ref.current;
      if (!el) return;
      const { clientX, clientY } = e;
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        raf.current = 0;
        const rect = rectCache.current || el.getBoundingClientRect();
        rectCache.current = rect;
        const px = (clientX - rect.left) / rect.width;
        const py = (clientY - rect.top) / rect.height;
        el.style.setProperty('--mx', `${px * 100}%`);
        el.style.setProperty('--my', `${py * 100}%`);
        el.style.setProperty('--par-x', `${(0.5 - px).toFixed(3)}`);
        el.style.setProperty('--par-y', `${(0.5 - py).toFixed(3)}`);
        el.style.setProperty('--rx', `${(0.5 - py) * max}deg`);
        el.style.setProperty('--ry', `${(px - 0.5) * max}deg`);
        el.style.setProperty('--lift', `${lift}px`);
        el.style.setProperty('--dx', `${(px - 0.5) * 22}px`);
        el.style.setProperty('--dy', `${(py - 0.5) * 14}px`);
      });
    },
    [reduced, max, lift]
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    rectCache.current = null;
    if (raf.current) cancelAnimationFrame(raf.current);
    el.style.transition = 'transform 0.55s var(--ease-out), box-shadow 0.35s var(--ease-out)';
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--lift', '0px');
    el.style.setProperty('--par-x', '0');
    el.style.setProperty('--par-y', '0');
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
    <div
      ref={ref}
      className={`tilt-card ${className}`.trim()}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...rest}
    >
      {children}
    </div>
  );
}
