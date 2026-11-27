import { api } from '../config';
import { normalizeProjects } from '../lib/normalizeProject';

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

async function request(path, { method = 'GET', body, auth = false } = {}) {
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

// React StrictMode can run mount effects twice. Share only the in-flight GET
// (never a completed response) so no admin page issues a duplicate request.
const inFlight = new Map();

function http(path, options = {}) {
  const method = options.method || 'GET';
  if (method !== 'GET') return request(path, options);

  const key = `${options.auth ? adminToken.get() || '' : ''}:${path}`;
  let promise = inFlight.get(key);
  if (!promise) {
    promise = request(path, options).finally(() => inFlight.delete(key));
    inFlight.set(key, promise);
  }
  return promise;
}

export function adminLogin(username, password) {
  return http('/admin/login', { method: 'POST', body: { username, password } });
}

export async function adminGetSection(section) {
  const result = await http(`/content/${section}`, { auth: true });
  if (section === 'projects' && result?.data) {
    result.data = normalizeProjects(result.data);
  }
  return result;
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

export function adminSetMessageRead(id, read) {
  return http(`/contact/${id}/read`, {
    method: 'PATCH',
    body: { read },
    auth: true,
  });
}

export function adminGetOverview() {
  return http('/admin/overview', { auth: true });
}

export function adminGetResume() {
  return http('/admin/resume', { auth: true });
}

export function adminDeleteResume() {
  return http('/admin/resume', { method: 'DELETE', auth: true });
}

export function adminListAssets(kind) {
  return http(`/admin/assets${kind ? `?kind=${encodeURIComponent(kind)}` : ''}`, { auth: true });
}

export function adminDeleteAsset(key) {
  return http(`/admin/assets/key/${encodeURIComponent(key)}`, { method: 'DELETE', auth: true });
}

// XHR is used for files so real upload progress can be shown on mobile.
function uploadFile(path, file, { method = 'POST', extra = {}, onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const token = adminToken.get();
    const xhr = new XMLHttpRequest();
    xhr.open(method, `${api.baseUrl}${path}`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      };
    }

    xhr.onload = () => {
      let data;
      try {
        data = JSON.parse(xhr.responseText || '{}');
      } catch {
        reject(new Error('The server returned an unexpected response. Please try again.'));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve(data);
        return;
      }
      const err = new Error(data.message || `Upload failed (${xhr.status})`);
      err.status = xhr.status;
      reject(err);
    };
    xhr.onerror = () => reject(new Error('Network error — check your connection and try again.'));
    xhr.onabort = () => reject(new Error('Upload cancelled.'));

    const form = new FormData();
    form.append('file', file);
    Object.entries(extra).forEach(([key, value]) => {
      if (value !== undefined && value !== null) form.append(key, String(value));
    });
    xhr.send(form);
  });
}

export function adminUploadResume(file, onProgress) {
  return uploadFile('/admin/resume', file, { onProgress });
}

export function adminUploadAsset(file, { kind = 'image', key, onProgress } = {}) {
  return uploadFile('/admin/assets', file, {
    onProgress,
    extra: { kind, key },
  });
}

export function adminReplaceAsset(key, file, onProgress) {
  return uploadFile(`/admin/assets/key/${encodeURIComponent(key)}`, file, {
    method: 'PUT',
    onProgress,
  });
}