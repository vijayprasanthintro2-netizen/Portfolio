import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Inbox,
  Search,
  RefreshCw,
  Mail,
  MailOpen,
  Trash2,
  MailCheck,
  MailX,
} from 'lucide-react';
import {
  adminGetMessages,
  adminSetMessageRead,
  adminDeleteMessage,
} from '../content/api';
import { ConfirmDialog, EmptyState, formatDate } from './ui';

export function InboxPage({ toast, onError }) {
  const [items, setItems] = useState(null);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const requestRef = useRef(0);

  const load = useCallback(async () => {
    const request = ++requestRef.current;
    try {
      const res = await adminGetMessages();
      if (request === requestRef.current) setItems(res.data || []);
    } catch (err) {
      if (request !== requestRef.current) return;
      if (err.status === 401) onError(err);
      else {
        setItems([]);
        toast(err.message || 'Could not load messages.', 'error');
      }
    }
  }, [onError, toast]);

  useEffect(() => {
    load();
    return () => {
      requestRef.current += 1;
    };
  }, [load]);

  const visible = useMemo(() => {
    const list = items || [];
    const q = query.trim().toLowerCase();
    return list.filter((m) => {
      const byState = filter === 'all' || (filter === 'unread' ? !m.read : Boolean(m.read));
      const byText = !q || `${m.name} ${m.email} ${m.message}`.toLowerCase().includes(q);
      return byState && byText;
    });
  }, [items, query, filter]);

  const toggleRead = async (message) => {
    const next = !message.read;
    // Optimistic update keeps the inbox feeling instant on mobile.
    setItems((prev) => prev?.map((m) => (m._id === message._id ? { ...m, read: next } : m)));
    setSelected((prev) => (prev?._id === message._id ? { ...prev, read: next } : prev));
    try {
      await adminSetMessageRead(message._id, next);
    } catch (err) {
      setItems((prev) => prev?.map((m) => (m._id === message._id ? { ...m, read: message.read } : m)));
      setSelected((prev) => (prev?._id === message._id ? { ...prev, read: message.read } : prev));
      if (err.status === 401) onError(err);
      else toast(err.message || 'Could not update message.', 'error');
    }
  };

  const remove = async () => {
    if (!confirmDelete) return;
    try {
      await adminDeleteMessage(confirmDelete._id);
      setItems((prev) => prev?.filter((m) => m._id !== confirmDelete._id));
      setSelected((prev) => (prev?._id === confirmDelete._id ? null : prev));
      toast('Message deleted.');
    } catch (err) {
      if (err.status === 401) onError(err);
      else toast(err.message || 'Could not delete message.', 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  const unread = (items || []).filter((m) => !m.read).length;

  return (
    <div className="ad-inbox">
      <section className="ad-card">
        <div className="ad-card-head">
          <div>
            <h3>Contact inbox</h3>
            <p>
              {items === null
                ? 'Loading messages…'
                : `${items.length} message${items.length === 1 ? '' : 's'} · ${unread} unread`}
            </p>
          </div>
          <button type="button" className="af-btn ghost" onClick={load} disabled={items === null}>
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        <div className="ad-media-toolbar">
          <div className="ad-search-field">
            <Search size={16} aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email or message…"
              aria-label="Search messages"
            />
          </div>
          <select className="af-input ad-filter" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter messages">
            <option value="all">All messages</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>

        {items === null ? (
          <div className="ad-loading"><span className="admin-spinner" /> Loading messages…</div>
        ) : items.length === 0 ? (
          <EmptyState icon={Inbox} title="No messages yet" message="Submissions from your contact form will appear here." />
        ) : visible.length === 0 ? (
          <EmptyState icon={Search} title="No matching messages" message="Try a different search or filter." />
        ) : (
          <div className="ad-message-list">
            {visible.map((m) => (
              <article className={`ad-message${m.read ? ' read' : ''}`} key={m._id}>
                <button type="button" className="ad-message-open" onClick={() => setSelected(m)}>
                  <span className={`ad-message-avatar${m.read ? ' read' : ''}`}>
                    {m.name?.slice(0, 1).toUpperCase() || '?'}
                  </span>
                  <span className="ad-message-main">
                    <span className="ad-message-top">
                      <strong>{m.name}</strong>
                      <time>{formatDate(m.createdAt, true)}</time>
                    </span>
                    <span className="ad-message-email">{m.email}</span>
                    <span className="ad-message-preview">{m.message}</span>
                  </span>
                </button>
                <div className="ad-message-actions">
                  <button
                    type="button"
                    className="af-icon-btn"
                    onClick={() => toggleRead(m)}
                    title={m.read ? 'Mark as unread' : 'Mark as read'}
                    aria-label={m.read ? 'Mark as unread' : 'Mark as read'}
                  >
                    {m.read ? <MailX size={16} /> : <MailCheck size={16} />}
                  </button>
                  <button
                    type="button"
                    className="af-icon-btn danger"
                    onClick={() => setConfirmDelete(m)}
                    title="Delete message"
                    aria-label="Delete message"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selected && (
        <div className="ad-modal-layer" onMouseDown={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="ad-modal" role="dialog" aria-modal="true" aria-label={`Message from ${selected.name}`}>
            <div className="ad-modal-head">
              <h3>Message from {selected.name}</h3>
              <button type="button" className="ad-icon-btn" onClick={() => setSelected(null)} aria-label="Close">×</button>
            </div>
            <div className="ad-modal-body">
              <div className="ad-message-detail-meta">
                <a href={`mailto:${selected.email}`}>{selected.email}</a>
                <time>{formatDate(selected.createdAt, true)}</time>
              </div>
              <p className="ad-message-detail-body">{selected.message}</p>
              <div className="ad-confirm-actions">
                <button type="button" className="af-btn ghost" onClick={() => toggleRead(selected)}>
                  {selected.read ? <Mail size={15} /> : <MailOpen size={15} />}
                  {selected.read ? 'Mark unread' : 'Mark read'}
                </button>
                <button type="button" className="af-btn ghost" onClick={() => setConfirmDelete(selected)}>
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this message?"
          message={`The message from “${confirmDelete.name}” will be permanently removed.`}
          confirmLabel="Delete message"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}
