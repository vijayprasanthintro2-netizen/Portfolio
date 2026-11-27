import { useLayoutEffect, useRef, useState } from 'react';

const HIDDEN = { left: 0, width: 0, visible: false };

// Measures the active link inside whichever navigation container is currently
// visible. The same hook powers the desktop bar and the mobile menu, so there
// is only one underline implementation and no hardcoded positions.
export function useNavIndicator(activeId, selector, enabled = true) {
  const ref = useRef(null);
  const [style, setStyle] = useState(HIDDEN);

  useLayoutEffect(() => {
    if (!enabled || !activeId) {
      setStyle(HIDDEN);
      return undefined;
    }

    let cancelled = false;
    const measure = () => {
      const container = ref.current;
      const el = container?.querySelector(selector);
      if (cancelled || !el) {
        if (!cancelled) setStyle(HIDDEN);
        return;
      }
      setStyle({ left: el.offsetLeft, width: el.offsetWidth, visible: true });
    };

    measure();
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure).catch(() => {});

    return () => {
      cancelled = true;
      window.removeEventListener('resize', measure);
    };
  }, [activeId, enabled, selector]);

  return [ref, style];
}
