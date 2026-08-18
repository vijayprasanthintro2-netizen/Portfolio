import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { LogoMark } from './Logo';

const BOOT = ['INITIALIZING PORTFOLIO', 'LOADING COMPONENTS', 'LOADING PROJECTS', 'CONNECTING', 'READY'];

// One-time preloader that plays a short boot sequence, then reveals the site.
// Under ~1.5s on normal motion, nearly instant for reduced-motion users.
export function Preloader({ onDone }) {
  const reduced = usePrefersReducedMotion();
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const doneRef = useRef(false);

  useEffect(() => {
    const finish = () => {
      setLoading(false);
      if (onDone && !doneRef.current) {
        doneRef.current = true;
        onDone();
      }
    };

    const total = BOOT.length;
    const timers = [];

    if (reduced) {
      timers.push(setTimeout(finish, 380));
    } else {
      BOOT.forEach((_, i) => timers.push(setTimeout(() => setIdx(i + 1), 180 + i * 240)));
      timers.push(setTimeout(finish, 240 + total * 240 + 260));
    }

    return () => timers.forEach((t) => clearTimeout(t));
  }, [reduced, onDone]);

  useEffect(() => {
    document.body.style.overflow = loading ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [loading]);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <motion.div
            className="preloader-inner"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <LogoMark size={52} />
            <div className="boot-console">
              {BOOT.slice(0, idx).map((line, i) => (
                <div className={`boot-line${i === idx - 1 ? ' active' : ''}`} key={line}>
                  <span className="boot-prompt">$</span>
                  <span className="boot-cmd">{line}</span>
                  {i === idx - 1 && <span className="boot-cursor" />}
                </div>
              ))}
            </div>
            <div className="preloader-bar">
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: reduced ? 1 : [0, 0.45, 0.8, 1] }}
                transition={{ duration: reduced ? 0.2 : 1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
