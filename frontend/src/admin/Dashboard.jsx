import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FolderKanban,
  Wrench,
  Briefcase,
  GraduationCap,
  Award,
  Mail,
  FileText,
  RefreshCw,
  ExternalLink,
  Eye,
  ArrowUpRight,
  Clock3,
  Upload,
} from 'lucide-react';
import { adminGetOverview } from '../content/api';
import { StatCard, EmptyState, formatBytes, formatDate, statusLabel } from './ui';

const QUICK_ACTIONS = [
  { key: 'projects', label: 'Add a project', icon: FolderKanban },
  { key: 'resume', label: 'Update resume', icon: Upload },
  { key: 'skills', label: 'Manage skills', icon: Wrench },
  { key: 'media', label: 'Upload media', icon: Eye },
];

export function Dashboard({ onOpen, toast }) {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const requestRef = useRef(0);

  const load = useCallback(async () => {
    const request = ++requestRef.current;
    setLoading(true);
    try {
      const res = await adminGetOverview();
      if (request !== requestRef.current) return;
      setOverview(res.data);
    } catch (err) {
      if (request === requestRef.current) toast(err.message || 'Could not load overview.', 'error');
    } finally {
      if (request === requestRef.current) setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
    return () => {
      requestRef.current += 1;
    };
  }, [load]);

  const stats = overview?.stats || {};
  const resume = overview?.resume || {};

  return (
    <div className="ad-dashboard">
      <section className="ad-welcome">
        <div>
          <span className="ad-eyebrow">Portfolio control centre</span>
          <h2>Good to see you, Vijay.</h2>
          <p>Everything on your public portfolio is managed here. Changes publish instantly.</p>
        </div>
        <div className="ad-welcome-actions">
          <button type="button" className="af-btn ghost" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? 'ad-spin' : ''} />
            Refresh
          </button>
          <a className="af-btn primary" href="/" target="_blank" rel="noreferrer">
            <ExternalLink size={15} />
            View live website
          </a>
        </div>
      </section>

      <section className="ad-stats" aria-label="Portfolio statistics">
        <StatCard icon={FolderKanban} label="Projects" value={stats.projects ?? '—'} onClick={() => onOpen('projects')} />
        <StatCard icon={Wrench} label="Skills" value={stats.skills ?? '—'} hint={stats.skillGroups ? `${stats.skillGroups} groups` : undefined} tone="cyan" onClick={() => onOpen('skills')} />
        <StatCard icon={Briefcase} label="Experience" value={stats.experience ?? '—'} tone="violet" onClick={() => onOpen('experience')} />
        <StatCard icon={GraduationCap} label="Education" value={stats.education ?? '—'} tone="green" onClick={() => onOpen('education')} />
        <StatCard icon={Award} label="Certificates" value={stats.certificates ?? '—'} tone="amber" onClick={() => onOpen('certificates')} />
        <StatCard icon={Mail} label="Messages" value={stats.messages ?? '—'} hint={stats.unread ? `${stats.unread} unread` : 'All read'} tone="rose" onClick={() => onOpen('messages')} />
      </section>

      <div className="ad-dashboard-grid">
        <section className="ad-card">
          <div className="ad-card-head">
            <div>
              <h3>Quick actions</h3>
              <p>Jump straight to the work you do most.</p>
            </div>
          </div>
          <div className="ad-quick-grid">
            {QUICK_ACTIONS.map(({ key, label, icon: Icon }) => (
              <button type="button" className="ad-quick" key={key} onClick={() => onOpen(key)}>
                <Icon size={19} aria-hidden="true" />
                <span>{label}</span>
                <ArrowUpRight size={15} aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>

        <section className="ad-card">
          <div className="ad-card-head">
            <div>
              <h3>Resume</h3>
              <p>Your public download button uses this file.</p>
            </div>
            <button type="button" className="af-btn ghost small" onClick={() => onOpen('resume')}>
              Manage
            </button>
          </div>
          <div className="ad-resume-summary">
            <span className="ad-resume-icon"><FileText size={22} aria-hidden="true" /></span>
            <div className="ad-resume-meta">
              <strong>{resume.filename || 'No resume uploaded'}</strong>
              <span>
                <span className={`ad-status-dot ${resume.status || 'missing'}`} />
                {statusLabel(resume.status)}
                {resume.size ? ` · ${formatBytes(resume.size)}` : ''}
              </span>
              <small>Uploaded {formatDate(resume.uploadedAt, true)}</small>
            </div>
            {resume.previewUrl && (
              <a className="af-btn ghost small" href={resume.previewUrl} target="_blank" rel="noreferrer">
                <Eye size={14} />
                Preview
              </a>
            )}
          </div>
        </section>

        <section className="ad-card">
          <div className="ad-card-head">
            <div>
              <h3>Recent activity</h3>
              <p>Latest content saved to the CMS.</p>
            </div>
          </div>
          {loading && !overview ? (
            <div className="ad-loading"><span className="admin-spinner" /> Loading…</div>
          ) : overview?.recentActivity?.length ? (
            <ul className="ad-activity">
              {overview.recentActivity.map((item) => (
                <li key={item.section}>
                  <span className="ad-activity-dot" />
                  <span className="ad-activity-label">{item.label}</span>
                  <span className="ad-activity-time">{formatDate(item.updatedAt, true)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Clock3} title="No saved changes yet" message="Edits you publish will appear here." />
          )}
          <div className="ad-card-foot">
            <Clock3 size={14} />
            Last content update: {formatDate(overview?.lastUpdate, true)}
          </div>
        </section>

        <section className="ad-card">
          <div className="ad-card-head">
            <div>
              <h3>Recent messages</h3>
              <p>Newest contact form submissions.</p>
            </div>
            <button type="button" className="af-btn ghost small" onClick={() => onOpen('messages')}>
              Open inbox
            </button>
          </div>
          {overview?.recentMessages?.length ? (
            <ul className="ad-messages-mini">
              {overview.recentMessages.map((m) => (
                <li key={m._id}>
                  <span className={`ad-unread-dot${m.read ? ' read' : ''}`} />
                  <div>
                    <strong>{m.name}</strong>
                    <p>{m.message}</p>
                  </div>
                  <time>{formatDate(m.createdAt)}</time>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon={Mail} title="Inbox is clear" message="Contact form submissions will appear here." />
          )}
        </section>
      </div>

      <section className="ad-preview-strip">
        <div>
          <Eye size={20} aria-hidden="true" />
          <div>
            <strong>See your changes live</strong>
            <span>The public portfolio reads directly from the same CMS.</span>
          </div>
        </div>
        <a className="af-btn ghost" href="/">
          <ExternalLink size={15} />
          Open portfolio
        </a>
      </section>
    </div>
  );
}
