import { useEffect } from 'react';

// Several overlays (preloader, mobile menu, modals) can be open at once.
// A shared counter keeps one overlay from unlocking scroll while another is
// still open, which otherwise causes visible flicker.
let locks = 0;
let previousBodyOverflow = '';
let previousHtmlOverflow = '';
let previousBodyPaddingRight = '';
let scrollbarWidth = 0;

function apply() {
  const locked = locks > 0;
  document.body.style.overflow = locked ? 'hidden' : previousBodyOverflow;
  // Locking body alone is not enough: html remains the scrolling element in
  // modern browsers, so the background would still move under the overlay.
  document.documentElement.style.overflow = locked ? 'hidden' : previousHtmlOverflow;
  if (!locked) {
    document.body.style.paddingRight = previousBodyPaddingRight;
    return;
  }
  const compensation = scrollbarWidth ? `${scrollbarWidth}px` : '0px';
  document.body.style.paddingRight = previousBodyPaddingRight
    ? `calc(${previousBodyPaddingRight} + ${compensation})`
    : compensation;
}

export function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return undefined;
    if (locks === 0) {
      previousBodyOverflow = document.body.style.overflow;
      previousHtmlOverflow = document.documentElement.style.overflow;
      previousBodyPaddingRight = document.body.style.paddingRight;
      scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    }
    locks += 1;
    apply();
    return () => {
      locks = Math.max(0, locks - 1);
      apply();
    };
  }, [active]);
}
