import { useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export function Toast({ toasts, remove }) {
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

export function Modal({ title, onClose, children, wide = false }) {
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeRef.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="ad-modal-layer" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`ad-modal${wide ? ' wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="ad-modal-head">
          <h3>{title}</h3>
          <button type="button" className="ad-icon-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="ad-modal-body">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({ title, message, confirmLabel = 'Confirm', danger = true, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={onCancel}>
      <p className="ad-confirm-message">{message}</p>
      <div className="ad-confirm-actions">
        <button type="button" className="af-btn ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className={`af-btn ${danger ? 'danger' : 'primary'}`} onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export function StatCard({ icon: Icon, label, value, hint, tone = 'blue', onClick }) {
  const className = `ad-stat-card${onClick ? ' clickable' : ''} tone-${tone}`;
  const inner = (
    <>
      <span className="ad-stat-icon"><Icon size={19} aria-hidden="true" /></span>
      <span className="ad-stat-value">{value}</span>
      <span className="ad-stat-label">{label}</span>
      {hint && <span className="ad-stat-hint">{hint}</span>}
    </>
  );
  return onClick ? (
    <button type="button" className={className} onClick={onClick}>{inner}</button>
  ) : (
    <div className={className}>{inner}</div>
  );
}

export function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="ad-empty">
      {Icon && <span className="ad-empty-icon"><Icon size={24} aria-hidden="true" /></span>}
      <strong>{title}</strong>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export function formatBytes(bytes) {
  if (bytes === null || bytes === undefined) return '—';
  const n = Number(bytes);
  if (!Number.isFinite(n)) return '—';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatDate(value, includeTime = false) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

export function statusLabel(status) {
  const map = {
    uploaded: 'Uploaded',
    legacy: 'Static file',
    missing: 'Not uploaded',
    ready: 'Connected',
    offline: 'Offline',
  };
  return map[status] || status || '—';
}
