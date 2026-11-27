import { useMemo } from 'react';
import { ExternalLink, Github, Image as ImageIcon, Rocket } from 'lucide-react';
import { RichContent } from '../components/RichContent';
import { resolveAssetUrl } from '../content/assetUrl';
import { normalizeProject } from '../lib/normalizeProject';
import { isEmptyRich, listToHtml, stripHtml } from '../lib/richText';
import { Modal } from './ui';

function PreviewBlock({ title, children }) {
  return (
    <section className="pp-block">
      <h4>{title}</h4>
      {children}
    </section>
  );
}

function PreviewRich({ html, empty = 'Not provided.' }) {
  if (isEmptyRich(html)) return <p className="pp-empty">{empty}</p>;
  return <RichContent html={html} className="rich-content" />;
}

function PreviewList({ value, empty = 'Not provided.' }) {
  if (isEmptyRich(value)) return <p className="pp-empty">{empty}</p>;
  return <RichContent html={listToHtml(value)} className="rich-content pp-list" />;
}

export function ProjectPreview({ project: rawProject, onClose }) {
  const project = useMemo(() => normalizeProject(rawProject), [rawProject]);
  if (!project) return null;

  const name = stripHtml(project.name) || 'Untitled project';
  const image = resolveAssetUrl(project.image);
  const hasStory = !isEmptyRich(project.problem) || !isEmptyRich(project.approach) || !isEmptyRich(project.outcome);

  return (
    <Modal title={`Preview: ${name}`} onClose={onClose} wide>
      <div className="project-preview">
        <header className="pp-header">
          {image ? (
            <img src={image} alt={stripHtml(project.alt) || `${name} preview`} />
          ) : (
            <div className="pp-image-empty">
              <ImageIcon size={30} aria-hidden="true" />
              <span>No project image yet</span>
            </div>
          )}
          <div className="pp-heading">
            {(project.category || project.featured) && (
              <div className="pp-badges">
                {project.featured && <span className="pp-badge featured">Featured</span>}
                {project.category && <span className="pp-badge">{stripHtml(project.category)}</span>}
              </div>
            )}
            <h2>{name}</h2>
            {project.role && <p>{stripHtml(project.role)}</p>}
          </div>
        </header>

        <PreviewBlock title="Overview">
          <PreviewRich html={project.short} />
        </PreviewBlock>

        <PreviewBlock title="Full description">
          <PreviewRich html={project.description} />
        </PreviewBlock>

        <PreviewBlock title="Key features">
          <PreviewList value={project.features} />
        </PreviewBlock>

        {!isEmptyRich(project.additionalFeatures) && (
          <PreviewBlock title="Additional features">
            <PreviewList value={project.additionalFeatures} />
          </PreviewBlock>
        )}

        {hasStory && (
          <div className="pp-story-grid">
            <PreviewBlock title="Problem"><PreviewRich html={project.problem} /></PreviewBlock>
            <PreviewBlock title="Approach"><PreviewRich html={project.approach} /></PreviewBlock>
            <PreviewBlock title="Outcome"><PreviewRich html={project.outcome} /></PreviewBlock>
          </div>
        )}

        <PreviewBlock title="Technologies">
          <PreviewList value={project.stack} empty="No technologies listed yet." />
        </PreviewBlock>

        {!isEmptyRich(project.tools) && (
          <PreviewBlock title="Tools and frameworks">
            <PreviewList value={project.tools} />
          </PreviewBlock>
        )}

        {(!isEmptyRich(project.challenges) || !isEmptyRich(project.learned)) && (
          <div className="pp-story-grid">
            {!isEmptyRich(project.challenges) && (
              <PreviewBlock title="Challenges"><PreviewList value={project.challenges} /></PreviewBlock>
            )}
            {!isEmptyRich(project.learned) && (
              <PreviewBlock title="What I learned"><PreviewList value={project.learned} /></PreviewBlock>
            )}
          </div>
        )}

        <div className="pp-actions">
          {project.demo ? (
            <span className="af-btn primary">
              <Rocket size={15} aria-hidden="true" /> Live <ExternalLink size={14} aria-hidden="true" />
            </span>
          ) : (
            <span className="af-btn ghost pp-disabled">No live URL</span>
          )}
          {project.github && (
            <span className="af-btn ghost">
              <Github size={15} aria-hidden="true" /> GitHub <ExternalLink size={14} aria-hidden="true" />
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
}
