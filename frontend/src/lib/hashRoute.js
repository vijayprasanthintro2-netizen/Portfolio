// The portfolio uses hash-based routes (e.g. #projects, #/admin/projects).
// Keeping hash writes and scroll restoration in one place ensures a refreshed
// URL still lands on the section the visitor was viewing.

export function setSectionHash(id) {
  const hash = `#${id}`;
  if (window.location.hash !== hash) {
    // pushState changes the URL without a document reload or hashchange event;
    // the caller performs the scroll so navigation stays instant.
    window.history.pushState(null, '', hash);
  }
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

  // CSS uses smooth scrolling globally. Restore instantly so a refresh never
  // looks like it is animating back from the Welcome/Home section.
  const root = document.documentElement;
  const previous = root.style.scrollBehavior;
  root.style.scrollBehavior = 'auto';
  target.scrollIntoView({ block: 'start' });
  root.style.scrollBehavior = previous;
}
