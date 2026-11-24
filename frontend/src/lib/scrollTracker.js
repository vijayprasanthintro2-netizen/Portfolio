// One passive scroll listener + one animation frame shared by every
// scroll-derived UI (progress bar, sticky navbar, back-to-top button).
// Previously each of those components owned its own listener and rAF loop.
const subscribers = new Set();

// Programmatic scrolling should respect the same preference as CSS animations.
export function getScrollBehavior() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}
let frame = 0;
let listening = false;

function flush() {
  frame = 0;
  const y = window.scrollY;
  subscribers.forEach((notify) => notify(y));
}

function requestFlush() {
  if (!frame) frame = requestAnimationFrame(flush);
}

function start() {
  if (listening) return;
  listening = true;
  window.addEventListener('scroll', requestFlush, { passive: true });
  window.addEventListener('resize', requestFlush, { passive: true });
}

function stop() {
  if (!listening) return;
  listening = false;
  window.removeEventListener('scroll', requestFlush);
  window.removeEventListener('resize', requestFlush);
  if (frame) {
    cancelAnimationFrame(frame);
    frame = 0;
  }
}

// Returns an unsubscribe function. The initial value is delivered synchronously
// so consumers render correctly before the first scroll event.
export function subscribeScroll(notify) {
  subscribers.add(notify);
  start();
  notify(window.scrollY);

  return () => {
    subscribers.delete(notify);
    if (subscribers.size === 0) stop();
  };
}
