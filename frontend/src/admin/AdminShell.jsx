import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LogOut,
  ExternalLink,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Check,
  Inbox,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { LogoMark } from '../components/Logo';
import { useContent, applyDesign } from '../content/ContentContext';
import { sectionNav, sections, getSectionMeta } from './sections';
import { SectionForm } from './FormBuilder';
import {
  adminToken,
  adminGetSection,
  adminSaveSection,
  adminResetSection,
  adminChangePassword,
  adminGetMessages,
  adminDeleteMessage,
} from '../content/api';

function Toast({ toasts, remove }) {
  if (!toasts.length) return null;
  return (
    <div className="admin-toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`admin-toast ${t.kind}`} role="status">
          {t.kind === 'error' ? <AlertCircle size={17} /> : <CheckCircle2 size={17} />}
          <span>{t.message}</span>
          <button type="button" className="admin-toast-close" onClick={() => remove(t.id)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function Dashboard({ onOpen, status }) {
  const editable = sectionNav.filter((s) => sections[s.key] || s.key === 'account');
  const coreCount = sectionNav.filter((s) => s.badge === 'core').length;
  return (
    <div className="admin-dashboard">
      <div className="admin-stat-row">
        <div className="admin-stat">
          <span className="admin-stat-value">{editable.length - 1}</span>
          <span className="admin-stat-label">Editable sections</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">{coreCount}</span>
          <span className="admin-stat-label">Core content</span>
        </div>
        <div className="admin-stat">
          <span className="admin-stat-value">{status === 'ready' ? '● Live' : status === 'error' ? '○ Offline' : '···'}</span>
          <span className="admin-stat-label">Content API</span>
        </div>
      </div>

      <div className="admin-grid">
        {sectionNav
          .filter((s) => s.key !== 'dashboard' && s.key !== 'account')
          .map((s) => {
            const Icon = s.icon;
            return (
              <button type="button" className="admin-tile" key={s.key} onClick={() => onOpen(s.key)}>
                <span className="admin-tile-icon">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <span className="admin-tile-name">{s.label}</span>
                <span className="admin-tile-desc">{s.desc}</span>
                <span className="admin-tile-open">Edit →</span>
              </button>
            );
          })}
      </div>
    </div>
  );
}

function AccountPage({ toast }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

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
      setDone(true);
      toast('Password updated successfully.', 'success');
    } catch (err) {
      toast(err.message || 'Could not change password.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-account">
      <div className="admin-panel">
        <div className="admin-panel-head">
          <span className="admin-panel-icon">
            <KeyRound size={20} />
          </span>
          <div>
            <h3>Change admin password</h3>
            <p>Signed in as <strong>{adminToken.user() || 'admin'}</strong></p>
          </div>
        </div>
        <form onSubmit={submit} noValidate>
          <label className="af-label" htmlFor="ac-current">
            Current password
          </label>
          <input
            className="af-input"
            id="ac-current"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
          />
          <label className="af-label" htmlFor="ac-next">
            New password
          </label>
          <input
            className="af-input"
            id="ac-next"
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            autoComplete="new-password"
          />
          <button className="af-btn primary" type="submit" disabled={saving}>
            {saving ? <span className="admin-spinner" /> : <Check size={16} />}
            {done ? 'Password saved' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
}

function MessagesPage({ toast }) {
  const [items, setItems] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() => {
    setItems(null);
    adminGetMessages()
      .then((res) => setItems(res.data || []))
      .catch((err) => {
        setItems([]);
        toast(err.message || 'Could not load messages.', 'error');
      });
  }, [toast]);

  useEffect(load, [load]);

  const remove = async (id) => {
    setDeleting(id);
    try {
      await adminDeleteMessage(id);
      setItems((prev) => prev.filter((m) => m._id !== id));
      toast('Message deleted.');
    } catch (err) {
      toast(err.message || 'Could not delete message.', 'error');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="admin-messages">
      <div className="admin-panel">
        <div className="admin-panel-head">
          <span className="admin-panel-icon">
            <Inbox size={20} />
          </span>
          <div>
            <h3>Contact messages</h3>
            <p>{items === null ? 'Loading…' : `${items.length} message${items.length === 1 ? '' : 's'}`}</p>
          </div>
          <button type="button" className="af-btn ghost" onClick={load} disabled={items === null}>
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>
        {items === null ? (
          <div className="admin-loading">
            <span className="admin-spinner" />
            Loading messages…
          </div>
        ) : items.length === 0 ? (
          <div className="admin-empty">
            No messages yet. Submissions from the contact form will appear here.
          </div>
        ) : (
          <div className="admin-msg-list">
            {items.map((m) => (
              <article className="admin-msg" key={m._id}>
                <header className="admin-msg-head">
                  <div className="admin-msg-who">
                    <strong>{m.name}</strong>
                    <a href={`mailto:${m.email}`}>{m.email}</a>
                  </div>
                  <span className="admin-msg-date">
                    {new Date(m.createdAt).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    className="af-btn danger-ghost"
                    onClick={() => remove(m._id)}
                    disabled={deleting === m._id}
                    title="Delete message"
                    aria-label={`Delete message from ${m.name}`}
                  >
                    {deleting === m._id ? <span className="admin-spinner" /> : <Trash2 size={15} />}
                  </button>
                </header>
                <p className="admin-msg-body">{m.message}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminShell({ onLogout }) {
  const { content, status, refresh } = useContent();
  const [activeKey, setActiveKey] = useState(() => {
    const m = window.location.hash.match(/^#\/admin\/([\w-]+)/);
    return m && sectionNav.some((s) => s.key === m[1]) ? m[1] : 'dashboard';
  });

  const [draft, setDraft] = useState(null);
  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);
  const prevActive = useRef(activeKey);

  const meta = sections[activeKey];
  const navItem = getSectionMeta(activeKey);

  const toast = useCallback((message, kind = 'success') => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);
  const removeToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const open = useCallback((key) => {
    setActiveKey(key);
    const hash = key === 'dashboard' ? '#/admin' : `#/admin/${key}`;
    if (window.location.hash !== hash) window.location.hash = hash;
  }, []);

  useEffect(() => {
    if (!meta) {
      setReady(true);
      setDraft(null);
      return;
    }
    let cancelled = false;
    setReady(false);
    setDirty(false);
    setDraft(null);
    adminGetSection(activeKey)
      .then((res) => {
        if (!cancelled) {
          setDraft(res.data || null);
          setReady(true);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) {
          try {
            sessionStorage.setItem('vp-admin-notice', 'Your session has expired — please sign in again.');
          } catch {
            /* ignore */
          }
          onLogout();
          return;
        }
        setDraft(null);
        setReady(true);
        toast(err.message || 'Could not load section.', 'error');
      });
    return () => {
      cancelled = true;
    };
  }, [activeKey, meta, onLogout]);

  // Live preview for the design section while editing; restore the saved
  // design (or token defaults) when leaving the design editor.
  useEffect(() => {
    if (activeKey === 'design') {
      if (draft) applyDesign(draft);
    } else if (prevActive.current === 'design') {
      document.documentElement.removeAttribute('style');
      if (content.design) applyDesign(content.design);
    }
    prevActive.current = activeKey;
  }, [activeKey, draft, content.design]);

  const onSave = async () => {
    setSaving(true);
    try {
      await adminSaveSection(activeKey, draft);
      setDirty(false);
      toast('Section published — the site updates instantly.');
      refresh();
    } catch (err) {
      toast(err.message || 'Save failed.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const onReset = async () => {
    try {
      const res = await adminResetSection(activeKey);
      setDraft(res.data || null);
      setDirty(true);
      toast('Section reset to defaults — press Save to publish.');
    } catch (err) {
      toast(err.message || 'Reset failed.', 'error');
    }
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <LogoMark size={34} />
          <div>
            <strong>Portfolio CMS</strong>
            <span>Content control</span>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Admin sections">
          {sectionNav.map((s) => {
            const Icon = s.icon;
            return (
              <button
                type="button"
                key={s.key}
                className={`admin-nav-item${activeKey === s.key ? ' active' : ''}`}
                onClick={() => open(s.key)}
              >
                <Icon size={17} aria-hidden="true" />
                <span>{s.label}</span>
                {s.badge && <em className={`admin-badge ${s.badge}`}>{s.badge}</em>}
              </button>
            );
          })}
        </nav>

        <div className="admin-sidebar-foot">
          <a className="admin-nav-item" href="#" title="Back to the site">
            <ExternalLink size={16} />
            <span>View site</span>
          </a>
          <button type="button" className="admin-nav-item" onClick={onLogout}>
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            <h2>{activeKey === 'dashboard' ? 'Dashboard' : navItem ? navItem.label : 'Admin'}</h2>
            <p>
              {activeKey === 'dashboard'
                ? 'Manage every part of your portfolio from one place.'
                : meta
                  ? meta.description
                  : ''}
            </p>
          </div>
          <div className="admin-topbar-actions">
            <span className="admin-topbar-user">{adminToken.user() || 'admin'}</span>
            <a className="af-btn ghost" href="#">
              <ExternalLink size={15} />
              Open site
            </a>
          </div>
        </header>

        <main className="admin-content">
          {activeKey === 'dashboard' && <Dashboard onOpen={open} status={status} />}

          {activeKey === 'account' && <AccountPage toast={toast} />}

          {activeKey === 'messages' && <MessagesPage toast={toast} />}

          {meta && (
            <div className="admin-editor">
              <div className="admin-panel">
                {!ready ? (
                  <div className="admin-loading">
                    <span className="admin-spinner" />
                    Loading section…
                  </div>
                ) : (
                  <SectionForm
                    meta={meta}
                    value={draft}
                    onChange={(v) => {
                      setDraft(v);
                      setDirty(true);
                    }}
                  />
                )}
              </div>

              <div className="admin-sticky-actions">
                <div className="admin-actions-inner">
                  <button type="button" className="af-btn ghost" onClick={onReset} disabled={saving}>
                    <RotateCcw size={16} />
                    Reset to defaults
                  </button>
                  <button
                    type="button"
                    className={`af-btn primary${dirty ? ' pulsing' : ''}`}
                    onClick={onSave}
                    disabled={saving || !ready}
                  >
                    {saving ? <span className="admin-spinner" /> : <Save size={16} />}
                    {saving ? 'Publishing…' : dirty ? 'Publish changes' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Toast toasts={toasts} remove={removeToast} />
    </div>
  );
}