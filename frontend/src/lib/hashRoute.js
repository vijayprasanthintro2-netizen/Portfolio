// Public sections are hash routes (e.g. #projects). These helpers keep URL
// restoration and programmatic scrolling consistent after a refresh or a
// history traversal.

function instantScrollTo(top) {
  // The site scrolls smoothly by default. `behavior: 'instant'` overrides that
  // CSS so route changes land directly at the target instead of animating
  // through the page.
  window.scrollTo({ top, left: 0, behavior: 'instant' });
}

export function scrollToY(y) {
  if (!Number.isFinite(y)) return;
  instantScrollTo(y);
}

export function scrollToHashTarget() {
  let id = '';
  try {
    id = decodeURIComponent(window.location.hash.slice(1));
  } catch {
    return;
  }

  // Admin routes are handled by AdminShell; unknown/empty hashes keep the top.
  if (!id || id.startsWith('/')) return;

  const target = document.getElementById(id);
  if (!target) return;

  const root = document.documentElement;
  const padding = Number.parseFloat(window.getComputedStyle(root).scrollPaddingTop) || 0;
  const top = target.getBoundingClientRect().top + window.scrollY - padding;
  instantScrollTo(Math.max(0, top));
}
