import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const HOME_PATHS = new Set(['/', '']);

function initialActive(ids) {
  try {
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (ids.includes(hash)) return hash;
  } catch {
    // An invalid encoded hash should not break the navigation state.
  }
  return ids[0];
}

function probeOffset() {
  // The same value the browser uses for scroll-padding-top, so a section that
  // was just scrolled into view is treated as the active one immediately.
  const value = Number.parseFloat(
    window.getComputedStyle(document.documentElement).scrollPaddingTop
  );
  return Number.isFinite(value) ? value : 84;
}

function readActive(ids, probe) {
  let active = ids[0];

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.getBoundingClientRect().top <= probe + 2) active = id;
  });

  // The final section can be shorter than the viewport; always select it at
  // the very bottom of the page.
  const doc = document.documentElement;
  if (window.scrollY + window.innerHeight >= doc.scrollHeight - 2) {
    active = ids[ids.length - 1];
  }

  return active;
}

// Tracks the visible section from the URL on first load, from scroll position
// afterwards, and keeps the URL hash in sync so refresh/bookmark works.
export function useActiveSection(ids, options = {}) {
  const { forceId = null, pathname = '/', syncHash = true } = options;
  const firstActive = useMemo(() => initialActive(ids), [ids]);
  const [active, setActive] = useState(forceId || firstActive);
  const pendingRef = useRef(
    !forceId && HOME_PATHS.has(pathname) && ids.includes(firstActive) ? firstActive : null
  );
  const idsRef = useRef(ids);
  const idsKey = ids.join('|');

  idsRef.current = ids;

  const select = useCallback((id) => {
    pendingRef.current = id;
    setActive(id);
  }, []);

  useEffect(() => {
    if (forceId) {
      pendingRef.current = null;
      setActive(forceId);
      return undefined;
    }
    if (!HOME_PATHS.has(pathname)) return undefined;

    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const probe = probeOffset();
        let next = readActive(idsRef.current, probe);
        const pending = pendingRef.current;

        // While smooth scrolling runs, hold the selected item. Release the
        // lock once the target section reaches its scroll-padding position.
        if (pending && idsRef.current.includes(pending)) {
          const target = document.getElementById(pending);
          if (target && Math.abs(target.getBoundingClientRect().top - probe) > 14) {
            next = pending;
          } else {
            pendingRef.current = null;
          }
        }

        setActive((prev) => (prev === next ? prev : next));
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);

    const observer = new IntersectionObserver(update, {
      rootMargin: '-20% 0px -65% 0px',
      threshold: 0,
    });
    idsRef.current.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      observer.disconnect();
    };
  }, [forceId, idsKey, pathname]);

  useEffect(() => {
    if (!syncHash || forceId || !HOME_PATHS.has(pathname) || !ids.includes(active)) return;
    const hash = `#${active}`;
    if (window.location.hash === hash) return;
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${window.location.search}${hash}`
    );
  }, [active, forceId, idsKey, pathname, syncHash]);

  return [active, select];
}
