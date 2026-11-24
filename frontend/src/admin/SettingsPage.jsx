import { useState } from 'react';
import {
  KeyRound,
  Moon,
  Sun,
  User,
  Share2,
  Palette,
  FileText,
  LogOut,
  ShieldCheck,
  Clock3,
  ExternalLink,
} from 'lucide-react';
import { adminChangePassword, adminToken } from '../content/api';
import { formatDate } from './ui';

function sessionExpiry() {
  const token = adminToken.get();
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(
      decodeURIComponent(
        atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
          .split('')
          .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`)
          .join('')
      )
    );
    return decoded.exp ? new Date(decoded.exp * 1000) : null;
  } catch {
    return null;
  }
}

export function SettingsPage({ toast, theme, setTheme, onLogout, onError, onOpen }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [saving, setSaving] = useState(false);
  const expiry = sessionExpiry();

  const submit = async (e) => {
    e.preventDefault();
    if (next.length < 8) {
      toast('New password must be at least 8 characters.', 'error');
      return;
    }
    setSaving(true);
    try {
      await adminChangePassword(current, next);
      setCurrent('');
      setNext('');
      toast('Password updated successfully.');
    } catch (err) {
      if (err.status === 401) onError(err);
      else toast(err.message || 'Could not change password.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const shortcuts = [
    { key: 'profile', label: 'Admin profile information', desc: 'Name, role and introduction', icon: User },
    { key: 'socials', label: 'Social links', desc: 'GitHub, LinkedIn, Instagram and email', icon: Share2 },
    { key: 'design', label: 'Portfolio metadata & design', desc: 'Brand colors, fonts and logo', icon: Palette },
    { key: 'resume', label: 'Resume information', desc: 'File, size and upload date', icon: FileText },
  ];

  return (
    <div className="ad-settings">
      <section className="ad-card">
        <div className="ad-card-head">
          <div>
            <h3>Appearance</h3>
            <p>Choose the theme for this admin dashboard. The public site keeps its own theme.</p>
          </div>
        </div>
        <div className="ad-theme-switch" role="group" aria-label="Admin theme">
          <button
            type="button"
            className={theme === 'light' ? 'active' : ''}
            aria-pressed={theme === 'light'}
            onClick={() => setTheme('light')}
          >
            <Sun size={18} /> Light
          </button>
          <button
            type="button"
            className={theme === 'dark' ? 'active' : ''}
            aria-pressed={theme === 'dark'}
            onClick={() => setTheme('dark')}
          >
            <Moon size={18} /> Dark
          </button>
        </div>
      </section>

      <section className="ad-card">
        <div className="ad-card-head">
          <div>
            <h3>Change admin password</h3>
            <p>Signed in as <strong>{adminToken.user() || 'admin'}</strong>.</p>
          </div>
          <KeyRound size={20} />
        </div>
        <form className="ad-settings-form" onSubmit={submit} noValidate>
          <label className="af-label" htmlFor="ad-current">Current password</label>
          <input
            className="af-input"
            id="ad-current"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            required
          />
          <label className="af-label" htmlFor="ad-new">New password</label>
          <input
            className="af-input"
            id="ad-new"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            required
          />
          <div>
            <button type="submit" className="af-btn primary" disabled={saving}>
              {saving ? <span className="admin-spinner" /> : <ShieldCheck size={16} />}
              Update password
            </button>
          </div>
        </form>
      </section>

      <section className="ad-card">
        <div className="ad-card-head">
          <div>
            <h3>Portfolio settings</h3>
            <p>All public content is edited in one CMS — no duplicate records.</p>
          </div>
        </div>
        <div className="ad-shortcuts">
          {shortcuts.map(({ key, label, desc, icon: Icon }) => (
            <button type="button" className="ad-quick" key={key} onClick={() => onOpen(key)}>
              <Icon size={18} />
              <span><strong>{label}</strong><small>{desc}</small></span>
              <ExternalLink size={14} />
            </button>
          ))}
        </div>
      </section>

      <section className="ad-card">
        <div className="ad-card-head">
          <div>
            <h3>Session</h3>
            <p>Signed in on this device with a protected token.</p>
          </div>
          <Clock3 size={20} />
        </div>
        <div className="ad-session">
          <div><span>Account</span><strong>{adminToken.user() || 'admin'}</strong></div>
          <div><span>Token expires</span><strong>{expiry ? formatDate(expiry, true) : 'Unknown'}</strong></div>
        </div>
        <button type="button" className="af-btn danger-ghost" onClick={onLogout}>
          <LogOut size={16} />
          Log out of this device
        </button>
        <p className="ad-session-note">Passwords, JWT secrets and environment variables are never shown in the dashboard.</p>
      </section>
    </div>
  );
}
