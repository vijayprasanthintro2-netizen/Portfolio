import { api } from '../config';

const TOKEN_KEY = 'vp-admin-token';
const USER_KEY = 'vp-admin-user';

export const adminToken = {
  get: () => {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  user: () => {
    try {
      return window.localStorage.getItem(USER_KEY);
    } catch {
      return null;
    }
  },
  set(token, username) {
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
      window.localStorage.setItem(USER_KEY, username || '');
    } catch {
      /* ignore */
    }
  },
  clear() {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    } catch {
      /* ignore */
    }
  },
};

async function http(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = adminToken.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${api.baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export function adminLogin(username, password) {
  return http('/admin/login', { method: 'POST', body: { username, password } });
}

export function adminGetSection(section) {
  return http(`/content/${section}`, { auth: true });
}

export function adminSaveSection(section, data) {
  return http(`/content/${section}`, { method: 'PUT', body: { data }, auth: true });
}

export function adminResetSection(section) {
  return http(`/content/${section}`, { method: 'DELETE', auth: true });
}

export function adminChangePassword(currentPassword, newPassword) {
  return http('/admin/password', {
    method: 'PUT',
    body: { currentPassword, newPassword },
    auth: true,
  });
}

export function adminGetMessages() {
  return http('/contact', { auth: true });
}

export function adminDeleteMessage(id) {
  return http(`/contact/${id}`, { method: 'DELETE', auth: true });
}