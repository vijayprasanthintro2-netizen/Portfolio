import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Images,
  Upload,
  Trash2,
  RefreshCw,
  Eye,
  Copy,
  Search,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  adminListAssets,
  adminUploadAsset,
  adminReplaceAsset,
  adminDeleteAsset,
} from '../content/api';
import { ConfirmDialog, Modal, EmptyState, formatBytes, formatDate } from './ui';

const MAX_BYTES = 10 * 1024 * 1024;
const ACCEPTED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml'];

function validateImage(file) {
  if (!file) throw new Error('Choose an image.');
  if (file.size > MAX_BYTES) throw new Error('Images must be 10 MB or smaller.');
  if (!ACCEPTED.includes(file.type)) throw new Error('Choose a PNG, JPG, WebP, GIF or SVG image.');
}

export function MediaPage({ toast, onError }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [preview, setPreview] = useState(null);
  const [pendingReplace, setPendingReplace] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const replaceRef = useRef(null);
  const replaceTarget = useRef(null);
  const requestRef = useRef(0);

  const load = useCallback(async () => {
    const request = ++requestRef.current;
    setLoading(true);
    try {
      const res = await adminListAssets();
      if (request !== requestRef.current) return;
      setItems(res.data || []);
    } catch (err) {
      if (request !== requestRef.current) return;
      if (err.status === 401) onError(err);
      else toast(err.message || 'Could not load media.', 'error');
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }, [onError, toast]);

  useEffect(() => {
    load();
    return () => {
      requestRef.current += 1;
    };
  }, [load]);

  const runUpload = async (file, kind, replaceKey) => {
    setBusy(true);
    setProgress(0);
    setError('');
    try {
      if (replaceKey) await adminReplaceAsset(replaceKey, file, setProgress);
      else await adminUploadAsset(file, { kind, onProgress: setProgress });
      toast(replaceKey ? 'File replaced — the URL is unchanged.' : 'File uploaded to your media library.');
      await load();
    } catch (err) {
      if (err.status === 401) onError(err);
      else toast(err.message || 'Upload failed.', 'error');
    } finally {
      setBusy(false);
      setPendingReplace(null);
      if (inputRef.current) inputRef.current.value = '';
      if (replaceRef.current) replaceRef.current.value = '';
    }
  };

  const pick = async (event, kind, replaceKey) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      validateImage(file);
    } catch (err) {
      setError(err.message);
      toast(err.message, 'error');
      return;
    }
    if (replaceKey) setPendingReplace({ file, key: replaceKey });
    else runUpload(file, kind);
  };

  const copyUrl = async (url) => {
    const full = new URL(url, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(full);
      toast('URL copied — paste it into a project or certificate field.');
    } catch {
      setError('Copy failed. Long-press the URL to copy it manually.');
    }
  };

  const remove = async () => {
    if (!confirmDelete) return;
    setBusy(true);
    try {
      await adminDeleteAsset(confirmDelete.key);
      toast('File deleted.');
      await load();
    } catch (err) {
      if (err.status === 401) onError(err);
      else toast(err.message || 'Could not delete file.', 'error');
    } finally {
      setBusy(false);
      setConfirmDelete(null);
    }
  };

  const visible = items.filter((item) => {
    const kindOk = filter === 'all' || item.kind === filter;
    const textOk = !query.trim() || `${item.filename} ${item.key}`.toLowerCase().includes(query.toLowerCase());
    return kindOk && textOk;
  });

  return (
    <div className="ad-media-page">
      <section className="ad-card">
        <div className="ad-card-head">
          <div>
            <h3>Media library</h3>
            <p>Upload images once, then reuse their stable URLs anywhere in the CMS.</p>
          </div>
          <button type="button" className="af-btn ghost" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'ad-spin' : ''} />
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
              placeholder="Search files…"
              aria-label="Search media files"
            />
          </div>
          <select className="af-input ad-filter" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by type">
            <option value="all">All files</option>
            <option value="image">Images</option>
            <option value="certificate">Certificates</option>
            <option value="other">Other</option>
          </select>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          hidden
          onChange={(e) => pick(e, filter === 'certificate' ? 'certificate' : 'image')}
        />
        <input
          ref={replaceRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          hidden
          onChange={(e) => pick(e, replaceTarget.current?.kind || 'image', replaceTarget.current?.key)}
        />
        <button type="button" className="ad-dropzone" onClick={() => inputRef.current?.click()} disabled={busy}>
          <span className="ad-drop-icon"><Upload size={22} aria-hidden="true" /></span>
          <strong>Tap to upload an image</strong>
          <span>PNG, JPG, WebP, GIF or SVG · up to 10 MB</span>
          <span className="ad-drop-note">Works with your phone's file picker</span>
        </button>

        {busy && (
          <div className="ad-upload-progress-inline" aria-live="polite">
            <div className="ad-progress-label"><span>Uploading…</span><strong>{progress}%</strong></div>
            <div className="ad-progress-track"><span style={{ width: `${progress}%` }} /></div>
          </div>
        )}

        {error && <div className="ad-inline-error"><AlertCircle size={16} /> {error}</div>}

        <div className="ad-guidance-badges">
          <span><CheckCircle2 size={15} /> Replacing a file keeps its URL</span>
          <span><CheckCircle2 size={15} /> Stored in MongoDB GridFS</span>
        </div>
      </section>

      <section className="ad-card">
        <div className="ad-card-head">
          <div>
            <h3>Your files</h3>
            <p>{loading ? 'Loading…' : `${visible.length} of ${items.length} files`}</p>
          </div>
        </div>

        {loading ? (
          <div className="ad-loading"><span className="admin-spinner" /> Loading media…</div>
        ) : items.length === 0 ? (
          <EmptyState icon={Images} title="Nothing uploaded yet" message="Add a photo, screenshot or certificate above." />
        ) : visible.length === 0 ? (
          <EmptyState icon={Search} title="No matching files" message="Try a different search or filter." />
        ) : (
          <div className="ad-media-grid">
            {visible.map((item) => (
              <article className="ad-media-item" key={item.key}>
                <button
                  type="button"
                  className="ad-media-thumb"
                  onClick={() => setPreview(item)}
                  aria-label={`Preview ${item.filename}`}
                >
                  <img src={item.url} alt={item.filename} loading="lazy" decoding="async" />
                </button>
                <div className="ad-media-details">
                  <strong title={item.filename}>{item.filename}</strong>
                  <span>{formatBytes(item.size)} · {formatDate(item.uploadedAt)}</span>
                  <code title={item.url}>{item.url}</code>
                </div>
                <div className="ad-media-actions">
                  <button type="button" className="af-btn ghost small" onClick={() => copyUrl(item.url)}>
                    <Copy size={14} /> Copy URL
                  </button>
                  <button type="button" className="af-btn ghost small" onClick={() => setPreview(item)}>
                    <Eye size={14} /> Preview
                  </button>
                  <button
                    type="button"
                    className="af-btn ghost small"
                    onClick={() => {
                      replaceTarget.current = { key: item.key, kind: item.kind };
                      replaceRef.current?.click();
                    }}
                  >
                    <Upload size={14} /> Replace
                  </button>
                  <button type="button" className="af-btn danger-ghost small" onClick={() => setConfirmDelete(item)}>
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {preview && (
        <Modal title={preview.filename} wide onClose={() => setPreview(null)}>
          <img className="ad-preview-image" src={preview.url} alt={preview.filename} decoding="async" />
          <div className="ad-preview-actions">
            <button type="button" className="af-btn primary" onClick={() => copyUrl(preview.url)}>
              <Copy size={15} /> Copy URL
            </button>
            <a className="af-btn ghost" href={preview.url} target="_blank" rel="noreferrer">
              <Eye size={15} /> Open file
            </a>
          </div>
        </Modal>
      )}

      {pendingReplace && (
        <ConfirmDialog
          title="Replace this file?"
          message={`“${pendingReplace.file.name}” will replace this file. Its public URL will stay the same.`}
          confirmLabel="Replace file"
          onCancel={() => setPendingReplace(null)}
          onConfirm={() => runUpload(pendingReplace.file, 'image', pendingReplace.key)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete this file?"
          message={`“${confirmDelete.filename}” will be removed. Any content still using its URL will show a broken image.`}
          confirmLabel="Delete file"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}
