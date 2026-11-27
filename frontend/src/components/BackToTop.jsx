import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { getScrollBehavior, subscribeScroll } from '../lib/scrollTracker';

export function BackToTop() {
  const navigate = useNavigate();
  const location = useLocation();
  const [show, setShow] = useState(false);
  const shown = useRef(false);

  useEffect(
    () =>
      subscribeScroll((y) => {
        const next = y > 600;
        if (next === shown.current) return;
        shown.current = next;
        setShow(next);
      }),
    []
  );

  const toTop = () => {
    const to = { pathname: '/', search: location.search, hash: '#home' };
    const home = document.getElementById('home');

    if (home) {
      navigate(to);
      window.scrollTo({ top: 0, behavior: getScrollBehavior() });
    } else {
      navigate(to, { state: { restoreHash: true } });
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          className="back-to-top"
          aria-label="Back to top"
          onClick={toTop}
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <ArrowUp size={20} aria-hidden="true" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
