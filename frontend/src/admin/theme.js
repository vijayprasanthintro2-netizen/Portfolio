export const ADMIN_THEME_KEY = 'vp-admin-theme';

// Only two admin themes exist. When nothing has been saved, open in light
// (white) mode without changing any existing color definitions.
export function readAdminTheme() {
  try {
    const stored = window.localStorage.getItem(ADMIN_THEME_KEY);
    return stored === 'dark' || stored === 'light' ? stored : 'light';
  } catch {
    return 'light';
  }
}

export function applyAdminTheme(theme) {
  try {
    document.documentElement.setAttribute('data-admin-theme', theme);
  } catch {
    /* ignore */
  }
}
