import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FileText,
  Upload,
  Eye,
  Download,
  Trash2,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import {
  adminGetResume,
  adminUploadResume,
  adminDeleteResume,
} from '../content/api';
import { ConfirmDialog, Modal, EmptyState, formatBytes, formatDate, statusLabel } from './ui';

const MAX_BYTES = 10 * 1024 * 1024;

async function validatePdf(file) {
  if (!file) throw new Error('Choose a PDF from your device.');
  if (!/\.pdf$/i.test(file.name)) throw new Error('Only .pdf files are allowed.');
  if (file.size > MAX_BYTES) throw new Error('That PDF is larger than 10 MB.');
  if (file.type && file.type !== 'application/pdf' && file.type !== 'application/octet-stream') {
    throw new Error('That file is not a PDF.');
  }
  const header = await file.slice(0, 5).text();
  if (!header.startsWith('%PDF-')) throw new Error('That file is not a valid PDF.');
}

export function ResumePage({ toast, onError, onOpen }) {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pending, setPending] = useState(null);
  const [preview, setPreview] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef(null);
  const requestRef = useRef(0);

  const load = useCallback(async () => {
    const request = ++requestRef.current;
    setLoading(true);
    try {
      const res = await adminGetResume();
      if (request !== requestRef.current) return;
      setInfo(res.data);
    } catch (err) {
      if (request !== requestRef.current) return;
      if (err.status === 401) onError(err);
      else toast(err.message || 'Could not load resume details.', 'error');
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

  const startUpload = async (file) => {
    setBusy(true);
    setProgress(0);
    setValidationError('');
    try {
      await adminUploadResume(file, setProgress);
      toast(info?.status === 'uploaded' ? 'Resume replaced and published.' : 'Resume uploaded and published.');
      await load();
    } catch (err) {
      if (err.status === 401) onError(err);
      else toast(err.message || 'Upload failed.', 'error');
    } finally {
      setBusy(false);
      setPending(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onPick = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setValidationError('');
    try {
      await validatePdf(file);
    } catch (err) {
      setValidationError(err.message);
      toast(err.message, 'error');
      return;
    }
    if (info?.status === 'uploaded') setPending(file);
    else await startUpload(file);
  };

  const remove = async () => {
    setBusy(true);
    try {
      await adminDeleteResume();
      toast('Resume removed from the portfolio.');
      await load();
    } catch (err) {
      if (err.status === 401) onError(err);
      else toast(err.message || 'Could not delete resume.', 'error');
    } finally {
      setBusy(false);
      setConfirmDelete(false);
    }
  };

  const status = info?.status || 'missing';

  return (
    <div className="ad-resume-page">
      <section className="ad-card ad-resume-hero">
        <div className="ad-resume-visual">
          <span className="ad-resume-big-icon"><FileText size={40} aria-hidden="true" /></span>
          <span className={`ad-pill ${status}`}>{statusLabel(status)}</span>
        </div>

        <div className="ad-resume-info">
          <span className="ad-eyebrow">Resume management</span>
          <h3>{info?.filename || 'No resume uploaded yet'}</h3>
          <div className="ad-resume-facts">
            <div><span>File size</span><strong>{formatBytes(info?.size)}</strong></div>
            <div><span>Uploaded</span><strong>{formatDate(info?.uploadedAt, true)}</strong></div>
            <div><span>Storage</span><strong>{info?.storage === 'gridfs' ? 'MongoDB GridFS' : info?.storage === 'static' ? 'Static file' : '—'}</strong></div>
          </div>
          <p className="ad-resume-note">
            The public <strong>Download Resume</strong> button updates automatically when you upload or replace this file.
          </p>
        </div>

        <div className="ad-resume-actions">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            hidden
            onChange={onPick}
            aria-label="Choose resume PDF"
          />
          <button
            type="button"
            className="af-btn primary"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            <Upload size={16} />
            {status === 'uploaded' ? 'Replace resume' : 'Upload resume'}
          </button>
          <div className="ad-resume-action-row">
            {info?.previewUrl && (
              <button type="button" className="af-btn ghost" onClick={() => setPreview(true)}>
                <Eye size={15} />
                Preview
              </button>
            )}
            {info?.downloadUrl && (
              <a className="af-btn ghost" href={info.downloadUrl} target="_blank" rel="noreferrer">
                <Download size={15} />
                Download
              </a>
            )}
            {status === 'uploaded' && (
              <button
                type="button"
                className="af-btn danger-ghost"
                disabled={busy}
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={15} />
                Delete
              </button>
            )}
          </div>
          <button type="button" className="af-btn ghost small" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'ad-spin' : ''} />
            Refresh status
          </button>
        </div>
      </section>

      {busy && (
        <section className="ad-card ad-upload-progress" aria-live="polite">
          <div className="ad-progress-label"><span>Uploading PDF…</span><strong>{progress}%</strong></div>
          <div className="ad-progress-track"><span style={{ width: `${progress}%` }} /></div>
          <p>Keep this tab open until the upload completes.</p>
        </section>
      )}

      {validationError && (
        <div className="ad-inline-error"><AlertCircle size={17} /> {validationError}</div>
      )}

      {loading && !info && (
        <div className="ad-loading"><span className="admin-spinner" /> Loading resume details…</div>
      )}

      <section className="ad-card ad-guidance">
        <div className="ad-guidance-head">
          <ShieldCheck size={20} aria-hidden="true" />
          <div>
            <h3>Upload rules</h3>
            <p>Checked in your browser and again on the server.</p>
          </div>
        </div>
        <ul>
          <li><CheckCircle2 size={16} /> PDF files only — extension, MIME type and file signature are validated.</li>
          <li><CheckCircle2 size={16} /> Maximum file size: 10 MB.</li>
          <li><CheckCircle2 size={16} /> Replacing keeps the same public URL, so old links keep working.</li>
          <li><CheckCircle2 size={16} /> Confirmation is required before replacing or deleting.</li>
        </ul>
        <div className="ad-storage-note">
          <AlertCircle size={17} />
          <p>
            Files are stored in MongoDB GridFS, not on the server disk. This is persistent in production when the
            backend uses a hosted MongoDB (e.g. Atlas). Local server storage would disappear on a Vercel redeploy.
          </p>
        </div>
      </section>

      <section className="ad-card ad-resume-cta">
        <div>
          <h3>Want to see it on the live site?</h3>
          <p>Open the public portfolio and use the Download Resume button in the hero.</p>
        </div>
        <button type="button" className="af-btn ghost" onClick={() => onOpen('dashboard')}>
          <ExternalLink size={15} />
          Back to overview
        </button>
      </section>

      {pending && (
        <ConfirmDialog
          title="Replace current resume?"
          message={`“${pending.name}” will replace your current resume. The public download link will keep working.`}
          confirmLabel="Replace resume"
          onCancel={() => {
            setPending(null);
            if (inputRef.current) inputRef.current.value = '';
          }}
          onConfirm={() => startUpload(pending)}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete resume?"
          message="The PDF will be removed and the Download Resume button will disappear from the public portfolio."
          confirmLabel="Delete resume"
          onCancel={() => setConfirmDelete(false)}
          onConfirm={remove}
        />
      )}

      {preview && info?.previewUrl && (
        <Modal title={`Preview — ${info.filename}`} wide onClose={() => setPreview(false)}>
          <iframe className="ad-pdf-frame" src={info.previewUrl} title="Resume preview" />
          <div className="ad-preview-actions">
            <a className="af-btn primary" href={info.previewUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={15} /> Open in new tab
            </a>
            <a className="af-btn ghost" href={info.downloadUrl} target="_blank" rel="noreferrer">
              <Download size={15} /> Download
            </a>
          </div>
        </Modal>
      )}

      {!loading && status === 'missing' && (
        <EmptyState icon={FileText} title="No resume found" message="Upload a PDF to add a download button to your hero section." />
      )}
    </div>
  );
}
