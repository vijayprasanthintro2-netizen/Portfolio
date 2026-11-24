import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Atom,
  Leaf,
  Server,
  Braces,
  ArrowRight,
  ArrowDown,
  Download,
  Instagram,
  Share2,
  Link2,
  MessageCircle,
  Linkedin,
  Facebook,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { profile as defaultProfile, socials as defaultSocials } from '../config';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useMobileDevice } from '../hooks/useMobileDevice';
import { useContent } from '../content/ContentContext';
import { Magnetic } from './Magnetic';
import { Terminal } from './Terminal';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.12 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

const particles = Array.from({ length: 18 }, (_, i) => ({
  left: `${(i * 53 + 11) % 94}%`,
  bottom: `${(i * 37 + 8) % 40}%`,
  delay: `${(i % 6) * 1.4}s`,
  duration: `${8 + (i % 5) * 1.6}s`,
  char: ['< />', '{ }', '()', '=>', 'M', 'R', '</>', '&&'][i % 8],
}));

// Ambient floating lights — small, slow, random drift, react to mouse slightly.
const lights = Array.from({ length: 12 }, (_, i) => ({
  left: `${(i * 79 + 23) % 100}%`,
  top: `${(i * 53 + 11) % 92}%`,
  size: 3 + ((i * 7) % 5),
  duration: `${9 + (i % 5) * 2.4}s`,
  delay: `${(i % 7) * 1.1}s`,
  depth: 0.6 + ((i * 3) % 10) / 10, // parallax depth
  opacity: 0.14 + ((i * 5) % 10) / 100,
}));

function isTouchDevice() {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window)
  );
}

const SHARE_URL = 'https://portfolio-self-36.vercel.app';
const SHARE_TITLE = 'Vijayprasanth S – MERN Stack Developer';
const SHARE_TEXT = 'Check out my portfolio and projects!';
const SHARE_DATA = { title: SHARE_TITLE, text: SHARE_TEXT, url: SHARE_URL };

const SHARE_LINKS = {
  whatsapp: `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${SHARE_URL}`)}`,
  linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SHARE_URL)}`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SHARE_URL)}`,
};

export function Hero() {
  const reduced = usePrefersReducedMotion();
  const mobile = useMobileDevice();
  const heroRef = useRef(null);
  const lightsRef = useRef(null);
  const raf = useRef(0);
  const measureRaf = useRef(0);
  const heroBox = useRef(null);
  const heroVisible = useRef(true);
  const { content } = useContent();
  const profile = content.profile || defaultProfile;
  const socials = content.socials || defaultSocials;

  const [shareOpen, setShareOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState('idle');
  const shareButtonRef = useRef(null);
  const shareCloseRef = useRef(null);
  const shareInputRef = useRef(null);

  const closeShare = useCallback(() => {
    setShareOpen(false);
    setCopyStatus('idle');
    requestAnimationFrame(() => shareButtonRef.current?.focus());
  }, []);

  const openShare = useCallback(() => {
    setCopyStatus('idle');
    setShareOpen(true);
  }, []);

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share(SHARE_DATA);
        return;
      } catch (err) {
        // A user cancelling the native sheet is not an error.
        if (err?.name === 'AbortError') return;
        // Other failures fall through to the custom popup.
      }
    }
    openShare();
  };

  const copyShareLink = async () => {
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(SHARE_URL);
        copied = true;
      }
    } catch {
      // Try the legacy selection fallback below.
    }

    if (!copied && shareInputRef.current) {
      try {
        shareInputRef.current.focus();
        shareInputRef.current.select();
        copied = document.execCommand('copy');
      } catch {
        copied = false;
      }
    }

    setCopyStatus(copied ? 'success' : 'error');
  };

  useEffect(() => {
    if (!shareOpen) return undefined;
    shareCloseRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeShare();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [shareOpen, closeShare]);

  useEffect(() => {
    if (reduced || isTouchDevice()) return;
    const el = heroRef.current;
    const lightsEl = lightsRef.current;
    if (!el) return;

    // Measure only when layout can change. Reading the hero rectangle inside
    // every mousemove forced a reflow after the previous frame's CSS variable
    // writes and made the whole page's pointer interactions feel sticky.
    const measure = () => {
      const r = el.getBoundingClientRect();
      heroBox.current = { left: r.left, top: r.top, width: r.width, height: r.height };
    };
    const onScroll = () => {
      if (measureRaf.current) return;
      measureRaf.current = requestAnimationFrame(() => {
        measureRaf.current = 0;
        measure();
      });
    };
    const onResize = () => measure();
    measure();

    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              heroVisible.current = entry.isIntersecting;
            },
            { rootMargin: '100px' }
          );
    observer?.observe(el);

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    const onMove = (e) => {
      const box = heroBox.current;
      if (!heroVisible.current || !box || !box.width || !box.height) return;
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const x = (e.clientX - box.left) / box.width;
        const y = (e.clientY - box.top) / box.height;
        el.style.setProperty('--hx', x.toFixed(3));
        el.style.setProperty('--hy', y.toFixed(3));
        if (lightsEl) {
          lightsEl.style.setProperty('--lx', `${((x - 0.5) * 30).toFixed(2)}px`);
          lightsEl.style.setProperty('--ly', `${((y - 0.5) * 22).toFixed(2)}px`);
        }
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      observer?.disconnect();
      cancelAnimationFrame(raf.current);
      cancelAnimationFrame(measureRaf.current);
    };
  }, [reduced]);

  const floats = useMemo(
    () => [
      { className: 'f1', icon: Atom, label: 'React' },
      { className: 'f2', icon: Leaf, label: 'MongoDB' },
      { className: 'f3', icon: Server, label: 'Node.js' },
      { className: 'f4', icon: Braces, label: 'JavaScript' },
      { className: 'f5', icon: Braces, label: 'Express' },
    ],
    []
  );

  return (
    <section id="home" aria-label="Introduction">
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-grid-persp" />
        <div className="hero-radial-light" />
        {!mobile && (
          <div ref={lightsRef} className="hero-lights">
            {lights.map((l, i) => (
              <span
                key={i}
                className="hero-light"
                style={{
                  left: l.left,
                  top: l.top,
                  width: l.size,
                  height: l.size,
                  animationDuration: l.duration,
                  animationDelay: l.delay,
                  opacity: l.opacity,
                  '--depth': l.depth,
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="container hero" ref={heroRef}>
        <div className="hero-glow" aria-hidden="true" />

        <div className="hero-content">
          {profile.image && (
            <motion.div
              className="hero-avatar-wrap"
              variants={fadeUp}
              initial={reduced ? 'show' : 'hidden'}
              animate="show"
              custom={0}
            >
              <span className="hero-avatar">
                <img
                  src={profile.image}
                  alt={`${profile.name} profile`}
                  width={148}
                  height={148}
                  loading="eager"
                  fetchpriority="high"
                  decoding="async"
                  onError={(e) => {
                    const wrap = e.currentTarget.closest('.hero-avatar-wrap');
                    if (wrap) wrap.style.display = 'none';
                  }}
                />
              </span>
            </motion.div>
          )}

          <motion.div variants={fadeUp} initial={reduced ? 'show' : 'hidden'} animate="show" custom={0}>
            <span className="hero-badge">
              <span className="pulse-dot" aria-hidden="true" />
              {profile.availability}
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} initial={reduced ? 'show' : 'hidden'} animate="show" custom={1}>
            {profile.name}
          </motion.h1>

          <motion.p className="hero-role" variants={fadeUp} initial={reduced ? 'show' : 'hidden'} animate="show" custom={2}>
            {profile.role}
          </motion.p>

          <motion.p className="hero-headline" variants={fadeUp} initial={reduced ? 'show' : 'hidden'} animate="show" custom={3}>
            «{profile.headline}»
          </motion.p>

          <motion.p className="hero-intro" variants={fadeUp} initial={reduced ? 'show' : 'hidden'} animate="show" custom={4}>
            {profile.intro}
          </motion.p>

          <motion.div className="hero-actions" variants={fadeUp} initial={reduced ? 'show' : 'hidden'} animate="show" custom={5}>
            <Magnetic>
              <a href="#projects" className="btn btn-primary">
                View My Projects
                <ArrowRight className="btn-icon" aria-hidden="true" />
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#contact" className="btn btn-ghost">
                Contact Me
                <ArrowDown className="btn-icon" aria-hidden="true" />
              </a>
            </Magnetic>
            {profile.resume && (
              <Magnetic>
                <a href={profile.resume} className="btn btn-ghost" download>
                  Download Resume
                  <Download className="btn-icon" aria-hidden="true" />
                </a>
              </Magnetic>
            )}
            <Magnetic className="share-magnetic">
              <button
                ref={shareButtonRef}
                type="button"
                className="btn btn-ghost btn-share"
                onClick={handleShare}
                aria-haspopup="dialog"
                aria-expanded={shareOpen}
              >
                Share Portfolio
                <Share2 className="btn-icon" aria-hidden="true" />
              </button>
            </Magnetic>
            {(Array.isArray(profile.heroButtons) ? profile.heroButtons : []).map((button, index) =>
              button?.label && button?.href ? (
                <Magnetic key={`${button.label}-${index}`}>
                  <a
                    href={button.href}
                    className={`btn ${button.style === 'primary' ? 'btn-primary' : 'btn-ghost'}`}
                    {...(/^https?:/i.test(button.href) ? { target: '_blank', rel: 'noreferrer' } : {})}
                  >
                    {button.label}
                    <ArrowRight className="btn-icon" aria-hidden="true" />
                  </a>
                </Magnetic>
              ) : null
            )}
          </motion.div>

          <motion.div className="hero-socials" variants={fadeUp} initial={reduced ? 'show' : 'hidden'} animate="show" custom={6}>
            <Magnetic strength={9}>
              <a className="social-link" href={socials.github} target="_blank" rel="noreferrer" aria-label="GitHub profile">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.16c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 2.87-.39c.97 0 1.95.13 2.87.39 2.18-1.49 3.14-1.18 3.14-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.66.41.35.78 1.05.78 2.12v3.14c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                </svg>
              </a>
            </Magnetic>
            <Magnetic strength={9}>
              <a className="social-link" href={socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn profile">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.2 8.3h4.6V23H.2V8.3Zm7.6 0h4.4v2h.06c.61-1.16 2.1-2.38 4.33-2.38 4.63 0 5.48 3.05 5.48 7.01V23h-4.6v-7.1c0-1.69-.03-3.87-2.36-3.87-2.36 0-2.72 1.84-2.72 3.75V23H7.8V8.3Z" />
                </svg>
              </a>
            </Magnetic>
            <Magnetic strength={9}>
              <a className="social-link" href={`mailto:${socials.email}`} aria-label="Send an email">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 6L2 7" />
                </svg>
              </a>
            </Magnetic>
            {socials.instagram && (
              <Magnetic strength={9}>
                <a className="social-link" href={socials.instagram} target="_blank" rel="noreferrer" aria-label="Instagram profile">
                  <Instagram size={18} aria-hidden="true" />
                </a>
              </Magnetic>
            )}
          </motion.div>
        </div>

        <motion.div
          className="hero-visual"
          initial={reduced ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        >
          {!mobile && (
            <div className="hero-code-particles">
              {particles.map((p, i) => (
                <span
                  key={i}
                  style={{
                    left: p.left,
                    bottom: p.bottom,
                    animationDelay: p.delay,
                    animationDuration: p.duration,
                  }}
                >
                  {p.char}
                </span>
              ))}
            </div>
          )}

          {!mobile && (
            <div className="hero-orbit">
              <span className="ring r1" style={reduced ? undefined : { animation: 'spin-slow 60s linear infinite' }} />
              <span className="ring r2" style={reduced ? undefined : { animation: 'spin-slow 90s linear infinite reverse' }} />
              <span className="ring r3" />
            </div>
          )}

          <div className="hero-terminal-wrap">
            <Terminal />
          </div>

          {!mobile &&
            floats.map(({ className, icon: Icon, label }) => (
              <div
                key={label}
                className={`hero-float ${className}`}
                role="img"
                aria-label={label}
                title={label}
                style={reduced ? { animation: 'none' } : undefined}
              >
                <Icon aria-hidden="true" />
              </div>
            ))}
        </motion.div>
      </div>

      {shareOpen && (
        <div
          className="share-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeShare();
          }}
        >
          <div
            className="share-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-dialog-title"
            aria-describedby="share-dialog-desc"
          >
            <button
              ref={shareCloseRef}
              type="button"
              className="share-close"
              onClick={closeShare}
              aria-label="Close share options"
            >
              <X size={18} aria-hidden="true" />
            </button>

            <span className="share-dialog-icon" aria-hidden="true">
              <Share2 size={22} />
            </span>
            <h3 id="share-dialog-title">Share this portfolio</h3>
            <p id="share-dialog-desc">Choose how you’d like to share Vijayprasanth’s work.</p>

            <div className="share-link-row">
              <input
                ref={shareInputRef}
                type="text"
                readOnly
                value={SHARE_URL}
                aria-label="Portfolio URL"
                onFocus={(event) => event.target.select()}
              />
              <button type="button" className="share-copy" onClick={copyShareLink}>
                <Link2 size={16} aria-hidden="true" />
                Copy Link
              </button>
            </div>

            {copyStatus !== 'idle' && (
              <p className={`share-status ${copyStatus}`} role="status">
                {copyStatus === 'success' ? (
                  <CheckCircle2 size={16} aria-hidden="true" />
                ) : (
                  <AlertCircle size={16} aria-hidden="true" />
                )}
                {copyStatus === 'success'
                  ? 'Link copied successfully!'
                  : 'Couldn’t copy automatically. Please copy the URL above.'}
              </p>
            )}

            <div className="share-options">
              <a
                className="share-option share-whatsapp"
                href={SHARE_LINKS.whatsapp}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={19} aria-hidden="true" />
                WhatsApp
              </a>
              <a
                className="share-option share-linkedin"
                href={SHARE_LINKS.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                <Linkedin size={19} aria-hidden="true" />
                LinkedIn
              </a>
              <a
                className="share-option share-facebook"
                href={SHARE_LINKS.facebook}
                target="_blank"
                rel="noreferrer"
              >
                <Facebook size={19} aria-hidden="true" />
                Facebook
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
