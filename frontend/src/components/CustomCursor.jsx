import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

const ORBIT_COUNT = 3;
const ORBIT_RADIUS = 17;
const ORBIT_PERIOD = 2800; // ms per revolution
const TRAIL_COUNT = 8;
const TRAIL_GAP = 20; // px between spawned dots while fast
const TRAIL_MIN_SPEED = 1.1; // px per ms — only trails on quick swipes

// Only activate for real mouse/trackpad pointers.
function isFinePointer() {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;
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

  // Project media, cards and any interactive element — plain button state
  if (target.closest('a, button, input, textarea, select, [role="button"], .project-card'))
    return 'button';

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
  default: { scale: 1, dot: 1, orb: 1, arrow: false, mag: false },
  energy: { scale: 1.2, dot: 1.05, orb: 1.35, arrow: false, mag: false },
  link: { scale: 1.5, dot: 1.2, orb: 0.5, arrow: true, mag: true },
  button: { scale: 1.8, dot: 1.5, orb: 0.35, arrow: true, mag: true },
  skill: { scale: 1.3, dot: 1.05, orb: 0.7, arrow: false, mag: true },
  timeline: { scale: 1.25, dot: 1, orb: 0, arrow: false, mag: false },
  text: { scale: 0.85, dot: 0.4, orb: 0, arrow: false, mag: false },
};

export function CustomCursor() {
  const reduced = usePrefersReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const rootRef = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const arrowRef = useRef(null);
  const spotRef = useRef(null);
  const orbiterRefs = useRef([]);
  const stateRef = useRef('default');
  const magnet = useRef(null);
  const pointer = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0, scale: 1, dot: 1, orb: 1, sx: 0, sy: 0 });
  const trail = useRef([]);
  const trailIdx = useRef(0);
  const last = useRef({ x: 0, y: 0, t: 0 });
  const spawned = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  useEffect(() => {
    if (!isFinePointer()) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled || reduced) return;
    const root = rootRef.current;
    if (!root) return;

    document.documentElement.classList.add('vpc-cursor');

    for (let i = 0; i < TRAIL_COUNT; i++) {
      const dot = document.createElement('span');
      dot.className = 'trail-dot';
      root.appendChild(dot);
      trail.current.push(dot);
    }

    const applyState = (state) => {
      const meta = STATE_META[state] || STATE_META.default;
      root.classList.remove(...Object.keys(STATE_META).map((s) => `cursor-${s}`));
      root.classList.add(`cursor-${state}`);
      stateRef.current = state;
      if (arrowRef.current) {
        arrowRef.current.style.display = meta.arrow ? 'block' : 'none';
      }
    };

    const readTarget = (e) => {
      const state = getState(e.target);
      applyState(state);
      const meta = STATE_META[state] || STATE_META.default;
      if (meta.mag) {
        const el =
          e.target.closest(
            'a, button, input, textarea, select, .project-card, .skill-card, .repo-card, .project-media'
          ) || e.target;
        if (el && typeof el.getBoundingClientRect === 'function') {
          const r = el.getBoundingClientRect();
          magnet.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        } else {
          magnet.current = null;
        }
      } else {
        magnet.current = null;
      }
    };

    const onOver = (e) => readTarget(e);
    const onDown = (e) => {
      if (e.button !== 0) return;
      root.classList.add('cursor-clicking');

      const ripple = document.createElement('span');
      ripple.className = 'cursor-ripple';
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      root.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());

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
        root.appendChild(p);
        p.addEventListener('animationend', () => p.remove());
      }
    };
    const onUp = () => root.classList.remove('cursor-clicking');
    const onMove = (e) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
      root.classList.add('cursor-active');
    };
    const onLeaveWin = () => root.classList.remove('cursor-active');

    document.addEventListener('mouseover', onOver, { passive: true });
    window.addEventListener('mousedown', onDown, { passive: true });
    window.addEventListener('mouseup', onUp, { passive: true });
    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeaveWin);

    const tick = (t) => {
      const p = pointer.current;
      const c = current.current;
      const meta = STATE_META[stateRef.current] || STATE_META.default;

      // Ring target = pointer + gentle magnetic pull toward the element center.
      let tx = p.x;
      let ty = p.y;
      if (magnet.current && meta.mag) {
        const dx = magnet.current.x - p.x;
        const dy = magnet.current.y - p.y;
        const dist = Math.hypot(dx, dy) || 1;
        const pull = Math.min(dist * 0.13, 9);
        tx += (dx / dist) * pull;
        ty += (dy / dist) * pull;
      }

      c.x += (tx - c.x) * 0.16;
      c.y += (ty - c.y) * 0.16;
      c.scale += (meta.scale - c.scale) * 0.16;
      c.dot += (meta.dot - c.dot) * 0.18;
      c.orb += (meta.orb - c.orb) * 0.12;

      // The spotlight lags more for a soft ambient feel.
      c.sx += (p.x - c.sx) * 0.07;
      c.sy += (p.y - c.sy) * 0.07;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) scale(${c.dot})`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) translate(-50%, -50%) scale(${c.scale})`;
      }
      if (arrowRef.current) {
        arrowRef.current.style.transform = `translate3d(${c.x}px, ${c.y}px, 0) translate(-50%, -50%)`;
      }
      if (spotRef.current) {
        spotRef.current.style.transform = `translate3d(${c.sx}px, ${c.sy}px, 0) translate(-50%, -50%)`;
      }

      // Orbiting particles around the ring.
      const base = (t % ORBIT_PERIOD) / ORBIT_PERIOD;
      for (let i = 0; i < ORBIT_COUNT; i++) {
        const el = orbiterRefs.current[i];
        if (!el) continue;
        const a = (base + i / ORBIT_COUNT) * Math.PI * 2;
        const r = ORBIT_RADIUS * c.orb;
        el.style.transform = `translate3d(${c.x + Math.cos(a) * r}px, ${c.y + Math.sin(a) * r * 0.82}px, 0) translate(-50%, -50%)`;
        el.style.opacity = String(Math.min(1, c.orb));
      }

      // Speed-based trail: spawn only while moving quickly.
      const now = performance.now();
      const dt = Math.max(now - last.current.t, 1);
      const speed = Math.hypot(p.x - last.current.x, p.y - last.current.y) / dt;
      const moved = Math.hypot(p.x - spawned.current.x, p.y - spawned.current.y);
      if (speed > TRAIL_MIN_SPEED && moved > TRAIL_GAP) {
        const dot = trail.current[trailIdx.current % TRAIL_COUNT];
        trailIdx.current += 1;
        if (dot) {
          dot.style.left = `${p.x}px`;
          dot.style.top = `${p.y}px`;
          dot.style.animation = 'none';
          void dot.offsetWidth;
          dot.style.animation = '';
        }
        spawned.current.x = p.x;
        spawned.current.y = p.y;
      }
      last.current.x = p.x;
      last.current.y = p.y;
      last.current.t = now;

      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove('vpc-cursor');
      document.removeEventListener('mouseover', onOver);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeaveWin);
      cancelAnimationFrame(raf.current);
      trail.current.forEach((dot) => dot.remove());
      trail.current = [];
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
      <div ref={dotRef} className="cursor-dot" />
    </div>
  );
}
