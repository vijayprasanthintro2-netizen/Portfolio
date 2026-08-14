import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { LogoMark } from './Logo';

// Elegant one-time preloader shown briefly on first visit.
export function Preloader() {
  const reduced = usePrefersReducedMotion();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), reduced ? 350 : 1100);
    return () => clearTimeout(t);
  }, [reduced]);

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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <LogoMark size={52} />
            <div className="preloader-bar">
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: reduced ? 1 : [0, 0.45, 0.8, 1] }}
                transition={{
                  duration: reduced ? 0.2 : 1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              />
            </div>
            <span className="preloader-text">Vijayprasanth S</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
