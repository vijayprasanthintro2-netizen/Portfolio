export const ADMIN_THEME_KEY = 'vp-admin-theme';

const META_COLORS = {
  light: '#ffffff',
  dark: '#05070d',
};

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
    const root = document.documentElement;
    root.setAttribute('data-admin-theme', theme);
    root.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', META_COLORS[theme] || META_COLORS.light);
  } catch {
    /* ignore */
  }
}
