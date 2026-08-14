import { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Atom, Leaf, Server, Braces, ArrowRight, ArrowDown, Download } from 'lucide-react';
import { profile, socials } from '../config';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { Magnetic } from './Magnetic';

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

function isTouchDevice() {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window)
  );
}

export function Hero() {
  const reduced = usePrefersReducedMotion();
  const heroRef = useRef(null);
  const raf = useRef(0);

  useEffect(() => {
    if (reduced || isTouchDevice()) return;
    const el = heroRef.current;
    if (!el) return;
    const onMove = (e) => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.setProperty('--hx', x.toFixed(3));
        el.style.setProperty('--hy', y.toFixed(3));
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(raf.current);
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
      <div className="container hero" ref={heroRef}>
        <div className="hero-glow" aria-hidden="true" />

        <div className="hero-content">
          <motion.div variants={fadeUp} initial={reduced ? 'show' : 'hidden'} animate="show" custom={0}>
            <span className="hero-badge">
              <span className="pulse-dot" aria-hidden="true" />
              Available for opportunities
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
          </motion.div>

          <motion.div className="hero-socials" variants={fadeUp} initial={reduced ? 'show' : 'hidden'} animate="show" custom={6}>
            <Magnetic strength={9} max={5}>
              <a className="social-link" href={socials.github} target="_blank" rel="noreferrer" aria-label="GitHub profile">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.16c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 2.87-.39c.97 0 1.95.13 2.87.39 2.18-1.49 3.14-1.18 3.14-1.18.63 1.59.24 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.41-2.69 5.38-5.25 5.66.41.35.78 1.05.78 2.12v3.14c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                </svg>
              </a>
            </Magnetic>
            <Magnetic strength={9} max={5}>
              <a className="social-link" href={socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn profile">
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.2 8.3h4.6V23H.2V8.3Zm7.6 0h4.4v2h.06c.61-1.16 2.1-2.38 4.33-2.38 4.63 0 5.48 3.05 5.48 7.01V23h-4.6v-7.1c0-1.69-.03-3.87-2.36-3.87-2.36 0-2.72 1.84-2.72 3.75V23H7.8V8.3Z" />
                </svg>
              </a>
            </Magnetic>
            <Magnetic strength={9} max={5}>
              <a className="social-link" href={`mailto:${socials.email}`} aria-label="Send an email">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 6L2 7" />
                </svg>
              </a>
            </Magnetic>
          </motion.div>
        </div>

        <motion.div
          className="hero-visual"
          initial={reduced ? false : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          aria-hidden="true"
        >
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

          <div className="hero-orbit">
            <span className="ring r1" style={reduced ? undefined : { animation: 'spin-slow 60s linear infinite' }} />
            <span className="ring r2" style={reduced ? undefined : { animation: 'spin-slow 90s linear infinite reverse' }} />
            <span className="ring r3" />
          </div>

          <div className="hero-core">
            <pre className="core-code">
              <span className="t-const">const</span> dev = <span className="g">{'{'}</span>
              {'\n'}
              {'  '}stack: <span className="s">'MERN'</span>,
              {'\n'}
              {'  '}build: <span className="s">'web apps'</span>
              {'\n'}
              <span className="g">{'};'}</span>
            </pre>
          </div>

          {floats.map(({ className, icon: Icon, label }) => (
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
    </section>
  );
}
