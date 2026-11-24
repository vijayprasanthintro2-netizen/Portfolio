import { useCallback, useEffect, useRef, useState } from 'react';
import {
  LogOut,
  ExternalLink,
  Save,
  RotateCcw,
  Menu,
  X,
  Moon,
  Sun,
  Search,
  AlertCircle,
} from 'lucide-react';
import { LogoMark } from '../components/Logo';
import { useContent, applyDesign } from '../content/ContentContext';
import { sectionNav, navGroups, sections, getSectionMeta } from './sections';
import { SectionForm, validateSection } from './FormBuilder';
import { readAdminTheme, applyAdminTheme, ADMIN_THEME_KEY } from './theme';
import { normalizeSectionValue } from '../content/shape';
import { getScrollBehavior } from '../lib/scrollTracker';
import { Toast, ConfirmDialog } from './ui';
import { Dashboard } from './Dashboard';
import { ResumePage } from './ResumePage';
import { MediaPage } from './MediaPage';
import { InboxPage } from './InboxPage';
import { SettingsPage } from './SettingsPage';
import {
  adminToken,
  adminGetSection,
  adminSaveSection,
  adminResetSection,
} from '../content/api';

export function AdminShell({ onLogout }) {
  const { content, refresh } = useContent();
  const [activeKey, setActiveKey] = useState(() => {
    const match = window.location.hash.match(/^#\/admin\/([\w-]+)/);
    return match && sectionNav.some((s) => s.key === match[1]) ? match[1] : 'dashboard';
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [theme, setThemeState] = useState(readAdminTheme);
  const [draft, setDraft] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [confirmNav, setConfirmNav] = useState(null);
  const toastId = useRef(0);
  const toastTimers = useRef(new Map());
  const prevActive = useRef(activeKey);

  const meta = sections[activeKey];
  const navItem = getSectionMeta(activeKey);

  const setTheme = useCallback((value) => {
    setThemeState(value);
    try {
      window.localStorage.setItem(ADMIN_THEME_KEY, value);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    applyAdminTheme(theme);
  }, [theme]);

  const toast = useCallback((message, kind = 'success') => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, message, kind }]);
    const timer = setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
      toastTimers.current.delete(id);
    }, 4500);
    toastTimers.current.set(id, timer);
  }, []);

  useEffect(
    () => () => {
      toastTimers.current.forEach(clearTimeout);
      toastTimers.current.clear();
    },
    []
  );

  const removeToast = useCallback((id) => {
    const timer = toastTimers.current.get(id);
    if (timer) clearTimeout(timer);
    toastTimers.current.delete(id);
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const handleError = useCallback(
    (err) => {
      if (err?.status === 401) {
        try {
          sessionStorage.setItem('vp-admin-notice', 'Your session has expired — please sign in again.');
        } catch {
          /* ignore */
        }
        onLogout();
        return;
      }
      toast(err?.message || 'Something went wrong.', 'error');
    },
    [onLogout, toast]
  );

  const navigate = useCallback(
    (key) => {
      setActiveKey(key);
      setDrawerOpen(false);
      const hash = key === 'dashboard' ? '#/admin' : `#/admin/${key}`;
      if (window.location.hash !== hash) window.location.hash = hash;
      window.scrollTo({ top: 0, behavior: getScrollBehavior() });
    },
    []
  );

  const open = useCallback(
    (key) => {
      if (dirty && key !== activeKey) {
        setConfirmNav(key);
        return;
      }
      navigate(key);
    },
    [activeKey, dirty, navigate]
  );

  // Browser back/forward inside the hash route.
  useEffect(() => {
    const onHash = () => {
      const match = window.location.hash.match(/^#\/admin\/([\w-]+)/);
      const key = match && sectionNav.some((s) => s.key === match[1]) ? match[1] : 'dashboard';
      setActiveKey((current) => (dirty && current !== key ? current : key));
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, [dirty]);

  // Warn about unsaved changes when leaving the page entirely.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // Load a section only when its editor is open. Keeping callbacks stable
  // prevents content refreshes from wiping a draft that is being edited.
  useEffect(() => {
    if (!meta) {
      setReady(true);
      setDraft(null);
      setLoadError('');
      return undefined;
    }
    let cancelled = false;
    setReady(false);
    setDirty(false);
    setDraft(null);
    setLoadError('');
    adminGetSection(activeKey)
      .then((res) => {
        if (!cancelled) {
          setDraft(normalizeSectionValue(meta, res.data) ?? null);
          setReady(true);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        if (err.status === 401) {
          handleError(err);
          return;
        }
        setDraft(null);
        setLoadError(err.message || 'Could not load section.');
        setReady(true);
        toast(err.message || 'Could not load section.', 'error');
      });
    return () => {
      cancelled = true;
    };
  }, [activeKey, meta, handleError, toast]);

  // Live design preview while editing design tokens.
  useEffect(() => {
    if (activeKey === 'design') {
      if (draft) applyDesign(draft);
    } else if (prevActive.current === 'design') {
      const root = document.documentElement;
      const colorScheme = root.style.colorScheme;
      root.removeAttribute('style');
      root.style.colorScheme = colorScheme;
      if (content.design) applyDesign(content.design);
    }
    prevActive.current = activeKey;
  }, [activeKey, draft, content.design]);

  const onSave = async () => {
    const errors = validateSection(meta, draft);
    if (errors.length) {
      toast(errors[0], 'error');
      return;
    }
    setSaving(true);
    try {
      await adminSaveSection(activeKey, draft);
      setDirty(false);
      toast('Section published — the site updates instantly.');
      refresh();
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  const onReset = async () => {
    try {
      const res = await adminResetSection(activeKey);
      setDraft(normalizeSectionValue(meta, res.data) ?? null);
      setDirty(true);
      toast('Section reset to defaults — press Publish to save.');
    } catch (err) {
      handleError(err);
    }
  };

  const renderContent = () => {
    if (activeKey === 'dashboard') return <Dashboard onOpen={open} toast={toast} />;
    if (activeKey === 'resume') return <ResumePage toast={toast} onError={handleError} onOpen={open} />;
    if (activeKey === 'media') return <MediaPage toast={toast} onError={handleError} />;
    if (activeKey === 'messages') {
      return (
        <InboxPage toast={toast} onError={handleError} />
      );
    }
    if (activeKey === 'settings') {
      return (
        <SettingsPage
          toast={toast}
          theme={theme}
          setTheme={setTheme}
          onLogout={onLogout}
          onError={handleError}
          onOpen={open}
        />
      );
    }

    if (meta) {
      return (
        <div className="ad-editor">
          <section className="ad-card ad-editor-card">
            {!ready ? (
              <div className="ad-loading"><span className="admin-spinner" /> Loading section…</div>
            ) : loadError ? (
              <div className="ad-load-error" role="alert">
                <AlertCircle size={20} />
                <div>
                  <strong>Could not load this section.</strong>
                  <p>{loadError}</p>
                </div>
                <button type="button" className="af-btn ghost" onClick={() => window.location.reload()}>
                  Retry
                </button>
              </div>
            ) : (
              <SectionForm
                meta={meta}
                value={draft}
                onChange={(value) => {
                  setDraft(value);
                  setDirty(true);
                }}
              />
            )}
          </section>

          <div className="ad-editor-actions">
            <div className="ad-editor-actions-inner">
              {dirty && <span className="ad-unsaved"><AlertCircle size={15} /> Unsaved changes</span>}
              <button type="button" className="af-btn ghost" onClick={onReset} disabled={saving || !ready || loadError}>
                <RotateCcw size={16} />
                Reset
              </button>
              <button
                type="button"
                className={`af-btn primary${dirty ? ' pulsing' : ''}`}
                onClick={onSave}
                disabled={saving || !ready || loadError || draft == null}
              >
                {saving ? <span className="admin-spinner" /> : <Save size={16} />}
                {saving ? 'Publishing…' : dirty ? 'Publish changes' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="ad-shell">
      {drawerOpen && (
        <button
          type="button"
          className="ad-drawer-backdrop"
          onClick={() => setDrawerOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside className={`ad-sidebar${drawerOpen ? ' open' : ''}`}>
        <div className="ad-sidebar-brand">
          <LogoMark size={34} />
          <div>
            <strong>Portfolio Studio</strong>
            <span>Vijayprasanth CMS</span>
          </div>
          <button type="button" className="ad-icon-btn ad-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="ad-nav" aria-label="Admin sections">
          {navGroups.map((group) => (
            <div className="ad-nav-group" key={group.key}>
              <span className="ad-nav-group-label">{group.label}</span>
              {sectionNav
                .filter((item) => item.group === group.key)
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      type="button"
                      key={item.key}
                      className={`ad-nav-item${activeKey === item.key ? ' active' : ''}`}
                      onClick={() => open(item.key)}
                    >
                      <Icon size={18} aria-hidden="true" />
                      <span>{item.label}</span>
                      {item.badge && <em className={`ad-badge ${item.badge}`}>{item.badge}</em>}
                    </button>
                  );
                })}
            </div>
          ))}
        </nav>

        <div className="ad-sidebar-foot">
          <a className="ad-nav-item" href="/" title="Back to the site">
            <ExternalLink size={17} />
            <span>View live site</span>
          </a>
          <button type="button" className="ad-nav-item" onClick={onLogout}>
            <LogOut size={17} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <div className="ad-main">
        <header className="ad-topbar">
          <div className="ad-topbar-leading">
            <button
              type="button"
              className="ad-icon-btn ad-menu-btn"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>
            <div className="ad-topbar-title">
              <h1>{activeKey === 'dashboard' ? 'Dashboard' : navItem?.label || 'Admin'}</h1>
              <p>
                {activeKey === 'dashboard'
                  ? 'Manage every part of your portfolio from one place.'
                  : meta?.description || navItem?.desc || ''}
              </p>
            </div>
          </div>

          <div className="ad-topbar-actions">
            <label className="ad-search-top" title="Find a section">
              <Search size={16} aria-hidden="true" />
              <select
                value={activeKey}
                onChange={(e) => open(e.target.value)}
                aria-label="Go to section"
              >
                {sectionNav.map((item) => (
                  <option key={item.key} value={item.key}>{item.label}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="ad-icon-btn"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a className="af-btn ghost topbar-site" href="/" target="_blank" rel="noreferrer">
              <ExternalLink size={15} />
              Live site
            </a>
            <span className="ad-topbar-user">{adminToken.user() || 'admin'}</span>
          </div>
        </header>

        <main className="ad-content">{renderContent()}</main>
      </div>

      {confirmNav && (
        <ConfirmDialog
          title="Leave without saving?"
          message="You have unsaved changes in this section. They will be lost if you switch pages."
          confirmLabel="Discard changes"
          onCancel={() => setConfirmNav(null)}
          onConfirm={() => {
            setDirty(false);
            navigate(confirmNav);
            setConfirmNav(null);
          }}
        />
      )}

      <Toast toasts={toasts} remove={removeToast} />
    </div>
  );
}
