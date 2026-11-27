import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { useContent } from '../content/ContentContext';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { LogoMark } from './Logo';

const BOOT_STAGES = [
  {
    label: 'Welcome',
    heading: 'Welcome to my digital space.',
    details: ['Preparing your experience.'],
  },
  {
    label: 'System Initialization',
    heading: 'Initializing portfolio environment.',
    details: ['Preparing interface and animations.'],
  },
  {
    label: 'Experience Setup',
    heading: 'Loading creative projects.',
    details: ['Preparing professional experience.', 'Connecting portfolio services.'],
  },
  {
    label: 'Final Preparation',
    heading: 'Optimizing visual experience.',
    details: ['Almost ready.'],
  },
];

const READY_STAGE = {
  label: 'Ready',
  heading: 'Welcome to my portfolio.',
  details: ['Experience creativity. Explore my work.'],
};

// Progress is tied to settled readiness signals, not elapsed time.
const STAGE_PROGRESS = [8, 38, 76, 94, 100];
const SIGNAL_KEYS = ['interface', 'fonts', 'content'];

const PARTICLES = [
  { x: '9%', y: '18%', size: 3, delay: '0s', duration: '7.5s' },
  { x: '78%', y: '14%', size: 2, delay: '1.2s', duration: '8.5s' },
  { x: '16%', y: '76%', size: 2, delay: '2.1s', duration: '9s' },
  { x: '88%', y: '68%', size: 3, delay: '0.7s', duration: '8s' },
  { x: '52%', y: '8%', size: 2, delay: '2.8s', duration: '7s' },
  { x: '34%', y: '89%', size: 2, delay: '1.7s', duration: '9.5s' },
];

function isSettled(value) {
  return value === 'done' || value === 'fallback';
}

// Premium one-time boot sequence. The portfolio behind it is mounted only after
// this calls onDone, so every milestone below represents real readiness.
export function Preloader({ onDone, onExited }) {
  const reduced = usePrefersReducedMotion();
  const { status: contentStatus } = useContent();

  const [mounted, setMounted] = useState(true);
  const [hiding, setHiding] = useState(false);
  const [stage, setStage] = useState(0);
  const [signals, setSignals] = useState({
    interface: 'waiting',
    fonts: 'waiting',
    content: 'waiting',
  });

  const doneRef = useRef(false);
  const unmountTimer = useRef(null);

  useBodyScrollLock(mounted);

  const settle = useCallback((key, value = 'done') => {
    setSignals((prev) => {
      if (prev[key] === value || prev[key] === 'done') return prev;
      return { ...prev, [key]: value };
    });
  }, []);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setHiding(true);
    if (onDone) onDone();
    unmountTimer.current = window.setTimeout(() => setMounted(false), reduced ? 0 : 520);
  }, [onDone, reduced]);

  useEffect(
    () => () => {
      if (unmountTimer.current) window.clearTimeout(unmountTimer.current);
    },
    []
  );

  // The scroll lock is released by unmounting, not by starting the fade-out.
  // Notify the app only after that commit so hash restoration can actually move
  // the document on a refreshed deep link.
  useEffect(() => {
    if (mounted || !doneRef.current) return;
    if (onExited) onExited();
  }, [mounted, onExited]);

  // Signal 01 — React/interface is mounted. A timer (not rAF) keeps this
  // reliable when the tab is backgrounded during load.
  useEffect(() => {
    const timeout = window.setTimeout(() => settle('interface'), 0);
    return () => window.clearTimeout(timeout);
  }, [settle]);

  // Signal 02 — Fonts are ready, with a graceful timeout for slow/blocked CDNs.
  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(
      () => settle('fonts', 'fallback'),
      reduced ? 900 : 2600
    );

    const done = () => {
      if (cancelled) return;
      window.clearTimeout(timeout);
      settle('fonts');
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(done).catch(() => {
        if (!cancelled) settle('fonts', 'fallback');
      });
    } else {
      done();
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [reduced, settle]);

  // Signal 03 — The real content request. An error is reported honestly and
  // still lets the site open with its built-in default content.
  useEffect(() => {
    if (contentStatus === 'ready') settle('content');
    if (contentStatus === 'error') settle('content', 'fallback');
  }, [contentStatus, settle]);

  useEffect(() => {
    const timeout = window.setTimeout(
      () => settle('content', 'fallback'),
      reduced ? 1800 : 6200
    );
    return () => window.clearTimeout(timeout);
  }, [reduced, settle]);

  const settled = useMemo(
    () => SIGNAL_KEYS.filter((key) => isSettled(signals[key])).length,
    [signals]
  );

  // Advance one stage at a time. Even when every signal settles in the same
  // React batch, each stage still gets its minimum display time.
  useEffect(() => {
    if (stage >= BOOT_STAGES.length) return undefined;
    const required = Math.min(stage + 1, SIGNAL_KEYS.length);
    if (settled < required) return undefined;
    const timeout = window.setTimeout(
      () => setStage((prev) => Math.min(prev + 1, BOOT_STAGES.length)),
      reduced ? 90 : 430
    );
    return () => window.clearTimeout(timeout);
  }, [reduced, settled, stage]);

  useEffect(() => {
    if (stage !== 4) return undefined;
    const timeout = window.setTimeout(finish, reduced ? 180 : 650);
    return () => window.clearTimeout(timeout);
  }, [finish, reduced, stage]);

  // Absolute safety net: never leave a visitor behind a loading screen.
  useEffect(() => {
    const timeout = window.setTimeout(finish, reduced ? 2600 : 9000);
    return () => window.clearTimeout(timeout);
  }, [finish, reduced]);

  if (!mounted) return null;

  const activeStage = stage === 4 ? READY_STAGE : BOOT_STAGES[stage];
  const progress = STAGE_PROGRESS[Math.min(stage, STAGE_PROGRESS.length - 1)];

  const contentNote =
    contentStatus === 'error'
      ? 'Content service unavailable — continuing with built-in content.'
      : signals.content === 'fallback'
        ? 'Content service is slow — continuing with built-in content.'
        : null;

  return (
    <div
      className={`vp-boot${hiding ? ' is-hidden' : ''}`}
      aria-label="Loading portfolio"
    >
      <div className="vp-boot__ambient" aria-hidden="true" />
      <div className="vp-boot__grid" aria-hidden="true" />
      <div className="vp-boot__particles" aria-hidden="true">
        {PARTICLES.map((particle, index) => (
          <span
            key={index}
            className="vp-boot__particle"
            style={{
              '--x': particle.x,
              '--y': particle.y,
              '--s': `${particle.size}px`,
              '--delay': particle.delay,
              '--duration': particle.duration,
            }}
          />
        ))}
      </div>

      <section className="vp-boot__panel">
        <div className="vp-boot__topline" aria-hidden="true">
          <span className="vp-boot__signal">
            <i />
            <i />
            <i />
          </span>
          <span>VP / PORTFOLIO</span>
          <span>{progress === 100 ? 'READY' : 'BOOT SEQUENCE'}</span>
        </div>

        <div className="vp-boot__logo-wrap">
          <span className="vp-boot__logo-orbit" aria-hidden="true" />
          <span className="vp-boot__logo-halo" aria-hidden="true" />
          <span className="vp-boot__logo-mark">
            <LogoMark size={64} title="VP monogram" />
          </span>
        </div>

        <div className="vp-boot__intro">
          <p className="vp-boot__eyebrow">WELCOME / VP</p>
          <div className="vp-boot__message" role="status" aria-live="polite">
            <div key={stage} className="vp-boot__message-body">
              <h1>{activeStage.heading}</h1>
              {activeStage.details.map((detail) => (
                <p key={detail}>{detail}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="vp-boot__stages" aria-hidden="true">
          {BOOT_STAGES.map((item, index) => {
            const state = index < stage ? 'done' : index === stage ? 'active' : 'waiting';
            return (
              <div key={item.label} className={`vp-boot__stage is-${state}`}>
                <span className="vp-boot__stage-index">0{index + 1}</span>
                <span className="vp-boot__stage-label">{item.label}</span>
                <span className="vp-boot__stage-status">
                  {state === 'done' ? (
                    <span className="vp-boot__check">
                      <Check size={13} strokeWidth={2.6} aria-hidden="true" />
                    </span>
                  ) : state === 'active' ? (
                    <span className="vp-boot__spinner" />
                  ) : (
                    <span className="vp-boot__dot" />
                  )}
                </span>
              </div>
            );
          })}
        </div>

        <div className="vp-boot__progress">
          <div
            className="vp-boot__progress-track"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-valuetext={`${progress}% — ${activeStage.label}`}
          >
            <div
              className="vp-boot__progress-fill"
              style={{ width: `${progress}%` }}
            >
              <span className="vp-boot__progress-shine" aria-hidden="true" />
            </div>
          </div>
          <div className="vp-boot__progress-meta">
            <strong>{progress}%</strong>
            <span>
              {stage === 4 ? 'Ready' : `Stage 0${stage + 1} · ${activeStage.label}`}
            </span>
          </div>
        </div>

        {contentNote && <p className="vp-boot__note">{contentNote}</p>}

        <p className="vp-boot__footer">CRAFTED WITH PASSION • BUILT WITH TECHNOLOGY</p>
      </section>
    </div>
  );
}
