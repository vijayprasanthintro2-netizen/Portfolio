import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const ORBIT_COUNT = 3;
const ORBIT_RADIUS = 17;
const ORBIT_PERIOD = 2800; // ms per revolution
const TRAIL_COUNT = 6;
const TRAIL_GAP = 20; // px between spawned dots while fast
const TRAIL_MIN_SPEED = 1.1; // px per ms — only trails on quick swipes
const TRAIL_DURATION = 600;
const TRAIL_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

// Match the CSS: the custom cursor belongs to fine pointers that can hover.
// Touch-only devices keep the native touch experience.
function getPointerQuery() {
  return window.matchMedia('(pointer: fine) and (hover: hover)');
}

// Decide the cursor state from the hovered element.
function getState(target) {
  if (!target || !(target instanceof Element)) return 'default';

  // GitHub repo cards behave like nav links
  if (target.closest('.repo-card')) return 'link';

  // Navigation links
  if (target.closest('.nav-link, .mobile-link, .nav-logo, .footer-nav a')) return 'link';

  // External links / social icons — plain link state, no label
  if (target.closest('a[href^="http"], a[href^="mailto"], a[href^="tel"], .social-link, .contact-link'))
    return 'link';

  // Project cards — larger circular indicator with a "VIEW" label
  if (target.closest('.project-card')) return 'project';

  // Project media, cards and any interactive element — plain button state
  if (target.closest('a, button, input, textarea, select, [role="button"]')) return 'button';

  // Skill cards — magnetic glowing ring
  if (target.closest('.skill-card')) return 'skill';

  // Experience timeline
  if (target.closest('#experience .timeline-item')) return 'timeline';

  // Hero visual
  if (target.closest('.hero-visual, .hero-orbit, .hero-core, .hero-code-particles')) return 'energy';

  // Plain text — dim and quiet so reading is comfortable
  if (
    target.closest(
      'p, li, td, blockquote, pre, code, figcaption, label, h1, h2, h3, h4, h5, h6, .skill-desc, .about-terminal'
    )
  )
    return 'text';

  return 'default';
}

const STATE_META = {
  default: { scale: 1, dot: 1, orb: 1, arrow: false, mag: false, label: '' },
  energy: { scale: 1.2, dot: 1.05, orb: 1.35, arrow: false, mag: false, label: '' },
  link: { scale: 1.5, dot: 1.2, orb: 0.5, arrow: true, mag: true, label: '' },
  button: { scale: 1.8, dot: 1.5, orb: 0.35, arrow: true, mag: true, label: '' },
  project: { scale: 2.1, dot: 0.4, orb: 0, arrow: false, mag: true, label: 'VIEW' },
  skill: { scale: 1.3, dot: 1.05, orb: 0.7, arrow: false, mag: true, label: '' },
  timeline: { scale: 1.25, dot: 1, orb: 0, arrow: false, mag: false, label: '' },
  text: { scale: 0.85, dot: 0.4, orb: 0, arrow: false, mag: false, label: '' },
};

const STATE_CLASSES = Object.keys(STATE_META).map((state) => `cursor-${state}`);
const DEFAULT_INFO = { state: 'default', meta: STATE_META.default, label: '', magEl: null };

export function CustomCursor() {
  const reduced = usePrefersReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const rootRef = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const arrowRef = useRef(null);
  const spotRef = useRef(null);
  const labelRef = useRef(null);
  const orbiterRefs = useRef([]);
  const stateRef = useRef('default');
  const magnet = useRef(null);
  const magnetEl = useRef(null);
  const pendingMagnetEl = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  // Only the tiny magnetic offset and the visual scale values are eased.
  // Position itself is never interpolated, so the cursor cannot trail the mouse.
  const visual = useRef({ ox: 0, oy: 0, scale: 1, dot: 1, orb: 1 });
  const offsetTarget = useRef({ x: 0, y: 0 });
  const trail = useRef([]);
  const trailAnims = useRef([]);
  const trailIdx = useRef(0);
  const last = useRef({ x: 0, y: 0, t: 0 });
  const spawned = useRef({ x: 0, y: 0 });
  const writes = useRef({});
  const targetCache = useRef(new WeakMap());
  const raf = useRef(0);
  const active = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const query = getPointerQuery();
    const sync = () => setEnabled(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!enabled || reduced) return undefined;
    const root = rootRef.current;
    if (!root) return undefined;

    document.documentElement.classList.add('vpc-cursor');

    for (let i = 0; i < TRAIL_COUNT; i++) {
      const dot = document.createElement('span');
      dot.className = 'trail-dot';
      root.appendChild(dot);
      trail.current.push(dot);
    }

    // Skipping identical writes keeps the loop cheap when the pointer is still.
    const setTransform = (key, el, value) => {
      if (!el || writes.current[key] === value) return;
      el.style.transform = value;
      writes.current[key] = value;
    };

    const applyState = (state, meta, label) => {
      root.classList.remove(...STATE_CLASSES);
      root.classList.add(`cursor-${state}`);
      stateRef.current = state;
      if (arrowRef.current) arrowRef.current.style.display = meta.arrow ? 'block' : 'none';
      if (labelRef.current) {
        labelRef.current.style.display = meta.label ? 'block' : 'none';
        if (meta.label) labelRef.current.textContent = label || meta.label;
      }
    };

    // Hover targets repeat constantly (every child of a button/card fires
    // mouseover). Resolving each element once removes repeated selector walks
    // from the mouse path.
    const resolveTarget = (target) => {
      if (!(target instanceof Element)) return DEFAULT_INFO;
      let info = targetCache.current.get(target);
      if (!info) {
        const state = getState(target);
        const meta = STATE_META[state] || STATE_META.default;
        let label = meta.label;
        if (state === 'project') {
          label = target.closest('.project-featured') ? 'OPEN' : 'VIEW';
        }
        let magEl = null;
        if (meta.mag) {
          magEl =
            target.closest(
              'a, button, input, textarea, select, .project-card, .skill-card, .repo-card'
            ) || target;
        }
        info = { state, meta, label, magEl };
        targetCache.current.set(target, info);
      }
      return info;
    };

    const onOver = (e) => {
      const info = resolveTarget(e.target);
      if (info.state !== stateRef.current) applyState(info.state, info.meta, info.label);
      pendingMagnetEl.current = info.magEl;
    };

    const onDown = (e) => {
      if (e.button !== 0) return;
      root.classList.add('cursor-clicking');

      // One insertion per click instead of nine; the animation itself is unchanged.
      const burst = document.createDocumentFragment();
      const ripple = document.createElement('span');
      ripple.className = 'cursor-ripple';
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
      burst.appendChild(ripple);

      // Small particle burst on click.
      const count = 8;
      for (let i = 0; i < count; i++) {
        const p = document.createElement('span');
        p.className = 'cursor-particle';
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
        const dist = 24 + Math.random() * 22;
        p.style.left = `${e.clientX}px`;
        p.style.top = `${e.clientY}px`;
        p.style.setProperty('--px', `${Math.cos(angle) * dist}px`);
        p.style.setProperty('--py', `${Math.sin(angle) * dist}px`);
        p.style.color = i % 2 ? 'rgba(34, 211, 238, 0.95)' : 'rgba(167, 139, 250, 0.95)';
        const size = 3 + Math.random() * 3.5;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.marginLeft = `${-size / 2}px`;
        p.style.marginTop = `${-size / 2}px`;
        p.style.animationDelay = `${Math.floor(Math.random() * 40)}ms`;
        p.addEventListener('animationend', () => p.remove(), { once: true });
        burst.appendChild(p);
      }
      root.appendChild(burst);
    };
    const onUp = () => root.classList.remove('cursor-clicking');
    const onMove = (e) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
      // Avoid writing the same class on every mousemove; style invalidation on a
      // hot event adds delay before the next frame.
      if (!active.current) {
        root.classList.add('cursor-active');
        active.current = true;
      }
      if (!raf.current) raf.current = requestAnimationFrame(tick);
    };
    const onLeaveWin = () => {
      root.classList.remove('cursor-active');
      active.current = false;
    };
    const invalidateMagnet = () => {
      magnetEl.current = null;
      pendingMagnetEl.current = null;
      magnet.current = null;
      offsetTarget.current.x = 0;
      offsetTarget.current.y = 0;
    };

    document.addEventListener('mouseover', onOver, { passive: true });
    window.addEventListener('scroll', invalidateMagnet, { passive: true });
    window.addEventListener('resize', invalidateMagnet);
    window.addEventListener('mousedown', onDown, { passive: true });
    window.addEventListener('mouseup', onUp, { passive: true });
    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeaveWin);

    const tick = (t) => {
      const p = pointer.current;
      const v = visual.current;

      // Measure the magnetic element at the start of the frame, before any
      // transform writes. Measuring once per element avoids forced layout
      // reads on every mouseover and never interleaves reads with writes.
      if (pendingMagnetEl.current !== magnetEl.current) {
        magnetEl.current = pendingMagnetEl.current;
        const el = magnetEl.current;
        if (el && typeof el.getBoundingClientRect === 'function') {
          const r = el.getBoundingClientRect();
          magnet.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        } else {
          magnet.current = null;
        }
      }

      const meta = STATE_META[stateRef.current] || STATE_META.default;
      if (magnet.current && meta.mag) {
        const dx = magnet.current.x - p.x;
        const dy = magnet.current.y - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        const pull = Math.min(dist * 0.13, 9);
        offsetTarget.current.x = (dx / dist) * pull;
        offsetTarget.current.y = (dy / dist) * pull;
      } else {
        offsetTarget.current.x = 0;
        offsetTarget.current.y = 0;
      }

      // The old 0.55 positional easing needed ~600 ms to settle after a fast
      // move, which read as cursor lag. Only the <=9px magnetic offset and the
      // visual scales are eased; position is pinned to the physical pointer.
      v.ox += (offsetTarget.current.x - v.ox) * 0.2;
      v.oy += (offsetTarget.current.y - v.oy) * 0.2;
      v.scale += (meta.scale - v.scale) * 0.4;
      v.dot += (meta.dot - v.dot) * 0.4;
      v.orb += (meta.orb - v.orb) * 0.3;

      const rx = p.x + v.ox;
      const ry = p.y + v.oy;

      setTransform('dot', dotRef.current, `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) scale(${v.dot})`);
      setTransform('ring', ringRef.current, `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%) scale(${v.scale})`);
      setTransform('arrow', arrowRef.current, `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`);
      setTransform('label', labelRef.current, `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`);
      setTransform('spot', spotRef.current, `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`);

      // Orbiting particles around the ring.
      const base = (t % ORBIT_PERIOD) / ORBIT_PERIOD;
      const radius = ORBIT_RADIUS * v.orb;
      for (let i = 0; i < ORBIT_COUNT; i++) {
        const el = orbiterRefs.current[i];
        if (!el) continue;
        const a = (base + i / ORBIT_COUNT) * Math.PI * 2;
        const x = rx + Math.cos(a) * radius;
        const y = ry + Math.sin(a) * radius * 0.82;
        setTransform(`orb${i}`, el, `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`);
        const opacity = String(Math.min(1, v.orb));
        if (el.style.opacity !== opacity) el.style.opacity = opacity;
      }

      // Speed-based trail. Position is a compositor transform, and the fade
      // runs through the Web Animations API — no left/top and no forced reflow
      // to restart a CSS animation while the pointer is moving fast.
      const dt = Math.max(t - last.current.t, 1);
      const speed = Math.hypot(p.x - last.current.x, p.y - last.current.y) / dt;
      const moved = Math.hypot(p.x - spawned.current.x, p.y - spawned.current.y);
      if (speed > TRAIL_MIN_SPEED && moved > TRAIL_GAP) {
        const idx = trailIdx.current % TRAIL_COUNT;
        const dot = trail.current[idx];
        trailIdx.current += 1;
        if (dot) {
          const at = `translate3d(${p.x}px, ${p.y}px, 0)`;
          dot.style.transform = at;
          if (typeof dot.animate === 'function') {
            if (trailAnims.current[idx]) trailAnims.current[idx].cancel();
            trailAnims.current[idx] = dot.animate(
              [
                { transform: `${at} scale(1)`, opacity: 0.5 },
                { transform: `${at} scale(0.2)`, opacity: 0 },
              ],
              { duration: TRAIL_DURATION, easing: TRAIL_EASING, fill: 'forwards' }
            );
          } else {
            dot.style.opacity = '0.5';
          }
        }
        spawned.current.x = p.x;
        spawned.current.y = p.y;
      }
      last.current.x = p.x;
      last.current.y = p.y;
      last.current.t = t;

      // Keep animating only while the pointer is inside the window; otherwise
      // idle until the next mousemove restarts the loop.
      raf.current = active.current ? requestAnimationFrame(tick) : 0;
    };

    return () => {
      invalidateMagnet();
      stateRef.current = 'default';
      visual.current = { ox: 0, oy: 0, scale: 1, dot: 1, orb: 1 };
      document.documentElement.classList.remove('vpc-cursor');
      document.removeEventListener('mouseover', onOver);
      window.removeEventListener('scroll', invalidateMagnet);
      window.removeEventListener('resize', invalidateMagnet);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeaveWin);
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = 0;
      active.current = false;
      trailAnims.current.forEach((anim) => anim && anim.cancel());
      trail.current.forEach((dot) => dot.remove());
      trail.current = [];
      trailAnims.current = [];
      writes.current = {};
      targetCache.current = new WeakMap();
    };
  }, [enabled, reduced]);

  if (!enabled || reduced) return null;

  return (
    <div ref={rootRef} className="custom-cursor cursor-default" aria-hidden="true">
      <div ref={spotRef} className="cursor-spotlight" />
      {Array.from({ length: ORBIT_COUNT }).map((_, i) => (
        <span
          key={i}
          ref={(el) => {
            orbiterRefs.current[i] = el;
          }}
          className="cursor-orbiter"
        />
      ))}
      <div ref={ringRef} className="cursor-ring" />
      <span ref={arrowRef} className="cursor-arrow" style={{ display: 'none' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </span>
      <span ref={labelRef} className="cursor-label" style={{ display: 'none' }} />
      <div ref={dotRef} className="cursor-dot" />
    </div>
  );
}
