import { useRef } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

// Card with a subtle 3D tilt, a cursor-following glow and a hover shimmer.
// Mouse-only: disabled on touch devices and for reduced-motion users.
export function TiltCard({ children, className = '', max = 5, lift = 6, ...rest }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const raf = useRef(0);

  const onMove = (e) => {
    if (e.pointerType !== 'mouse' || reduced) return;
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      el.style.setProperty('--mx', `${px * 100}%`);
      el.style.setProperty('--my', `${py * 100}%`);
      el.style.setProperty('--rx', `${(0.5 - py) * max}deg`);
      el.style.setProperty('--ry', `${(px - 0.5) * max}deg`);
      el.style.setProperty('--lift', `${lift}px`);
      el.style.transition = 'none';
    });
  };

  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.transition = 'transform 0.55s var(--ease-out), box-shadow 0.35s var(--ease-out)';
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--lift', '0px');
  };

  return (
    <div
      ref={ref}
      className={`tilt-card ${className}`.trim()}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      {...rest}
    >
      {children}
    </div>
  );
}
