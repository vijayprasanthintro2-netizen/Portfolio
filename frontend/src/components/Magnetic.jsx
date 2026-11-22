import { useCallback, useEffect, useRef } from 'react';
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
  const rectCache = useRef(null);

  const stopLoop = useCallback(() => {
    if (raf.current) {
      cancelAnimationFrame(raf.current);
      raf.current = 0;
    }
  }, []);

  const tick = useCallback(() => {
    const el = ref.current;
    if (el) {
      const c = current.current;
      const t = target.current;
      c.x += (t.x - c.x) * 0.22;
      c.y += (t.y - c.y) * 0.22;
      const x = Math.abs(c.x) < 0.05 ? 0 : c.x;
      const y = Math.abs(c.y) < 0.05 ? 0 : c.y;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (!hovering.current && x === 0 && y === 0) {
        stopLoop();
        return;
      }
    }
    raf.current = requestAnimationFrame(tick);
  }, [stopLoop]);

  const startLoop = useCallback(() => {
    if (!raf.current) raf.current = requestAnimationFrame(tick);
  }, [tick]);

  const onMove = useCallback(
    (e) => {
      if (e.pointerType !== 'mouse' || reduced) return;
      const el = ref.current;
      if (!el) return;
      // Measure on enter (and after scroll/resize) instead of on every move:
      // reading layout after the previous frame's transform forces a reflow.
      const rect = rectCache.current || el.getBoundingClientRect();
      rectCache.current = rect;
      const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      target.current.x = clamp(dx, -1, 1) * strength;
      target.current.y = clamp(dy, -1, 1) * strength;
      hovering.current = true;
      startLoop();
    },
    [reduced, startLoop, strength]
  );

  const onEnter = useCallback(
    (e) => {
      if (e.pointerType !== 'mouse' || reduced) return;
      if (ref.current) {
        rectCache.current = ref.current.getBoundingClientRect();
        ref.current.style.transition = 'none';
      }
    },
    [reduced]
  );

  const onLeave = useCallback(() => {
    if (reduced) return;
    hovering.current = false;
    rectCache.current = null;
    target.current = { x: 0, y: 0 };
    if (ref.current) ref.current.style.transition = 'transform 0.5s var(--ease-out)';
    startLoop();
  }, [reduced, startLoop]);

  useEffect(() => {
    const invalidate = () => {
      rectCache.current = null;
    };
    window.addEventListener('scroll', invalidate, { passive: true });
    window.addEventListener('resize', invalidate);
    return () => {
      window.removeEventListener('scroll', invalidate);
      window.removeEventListener('resize', invalidate);
    };
  }, []);

  // Never leave an animation frame running after unmount.
  useEffect(() => stopLoop, [stopLoop]);

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
