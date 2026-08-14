import { useRef } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

function isTouchDevice() {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window)
  );
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// Subtle magnetic wrapper: the button eases toward the cursor when nearby.
// Mouse-only, small movement, smooth return. Disabled for touch/reduced motion.
export function Magnetic({ children, strength = 10, max = 7, className = '' }) {
  const ref = useRef(null);
  const reduced = usePrefersReducedMotion();
  const raf = useRef(0);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const hovering = useRef(false);

  const stopLoop = () => {
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    }
  };

  const tick = () => {
    const el = ref.current;
    if (el) {
      current.current.x += (target.current.x - current.current.x) * 0.22;
      current.current.y += (target.current.y - current.current.y) * 0.22;
      const x = Math.abs(current.current.x) < 0.05 ? 0 : current.current.x;
      const y = Math.abs(current.current.y) < 0.05 ? 0 : current.current.y;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (!hovering.current && x === 0 && y === 0) {
        stopLoop();
        return;
      }
    }
    raf.current = requestAnimationFrame(tick);
  };

  const startLoop = () => {
    if (!raf.current) raf.current = requestAnimationFrame(tick);
  };

  const onMove = (e) => {
    if (e.pointerType !== 'mouse' || reduced) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    target.current.x = clamp(dx, -1, 1) * strength;
    target.current.y = clamp(dy, -1, 1) * strength;
    hovering.current = true;
    startLoop();
  };

  const onEnter = (e) => {
    if (e.pointerType !== 'mouse' || reduced) return;
    if (ref.current) ref.current.style.transition = 'none';
  };

  const onLeave = () => {
    if (reduced) return;
    hovering.current = false;
    target.current = { x: 0, y: 0 };
    if (ref.current) ref.current.style.transition = 'transform 0.5s var(--ease-out)';
    startLoop();
  };

  const enabled = !isTouchDevice() && !reduced;

  return (
    <span
      ref={ref}
      className={`magnetic-wrap ${className}`.trim()}
      onPointerEnter={enabled ? onEnter : undefined}
      onPointerMove={enabled ? onMove : undefined}
      onPointerLeave={enabled ? onLeave : undefined}
    >
      {children}
    </span>
  );
}
