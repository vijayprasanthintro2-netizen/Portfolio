import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Github,
  ExternalLink,
  CheckCircle2,
  Lightbulb,
  TriangleAlert,
  Rocket,
  Image as ImageIcon,
  Lightbulb as Insight,
  Target,
  Route as PathIcon,
} from 'lucide-react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { isEmptyRich, listToHtml, stripHtml } from '../lib/richText';
import { normalizeProject } from '../lib/normalizeProject';
import { Magnetic } from './Magnetic';
import { ProjectImage } from './ProjectImage';
import { RichContent } from './RichContent';

const list = (value) => (Array.isArray(value) ? value : []);

function StoryBlock({ icon: Icon, title, html }) {
  const empty = isEmptyRich(html);
  return (
    <div className="modal-block project-story-block">
      <h4><Icon size={17} aria-hidden="true" /> {title}</h4>
      {empty ? (
        <p className="modal-desc story-empty">Not provided.</p>
      ) : (
        <RichContent html={html} className="modal-desc rich-content" />
      )}
    </div>
  );
}

function RichList({ value, empty = 'Not provided.' }) {
  if (isEmptyRich(value)) return <p className="modal-desc story-empty">{empty}</p>;
  return <RichContent html={listToHtml(value)} className="rich-content rich-list-field" />;
}

export function ProjectModal({ project: rawProject, onClose }) {
  const project = useMemo(() => normalizeProject(rawProject), [rawProject]);
  const reduced = usePrefersReducedMotion();
  const bodyRef = useRef(null);
  const closeRef = useRef(null);

  useBodyScrollLock(Boolean(project));

  // Each project starts at the top, including when one project is swapped for
  // another without unmounting the dialog.
  useLayoutEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [project?.id, project?.name]);

  // Keep keyboard focus inside the dialog without scrolling the page to it.
  useEffect(() => {
    const previous = document.activeElement;
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      if (previous instanceof HTMLElement) previous.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    if (!project) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [project, onClose]);

  if (typeof document === 'undefined') return null;

  // Render into body: .portfolio-main keeps its entrance animation, and a
  // transformed ancestor would otherwise become the containing block for this
  // fixed overlay and push it down the page.
  return createPortal(
    <AnimatePresence>
      {project && (
        <div className="modal-layer">
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={`${project.name} details`}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 36, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              type="button"
              className="modal-close"
              ref={closeRef}
              onClick={onClose}
              aria-label="Close details"
            >
              <X size={22} aria-hidden="true" />
            </button>

            <div className="modal-body" ref={bodyRef}>
              <div className="modal-image-box">
                <ProjectImage project={project} loading="eager" width={960} height={540} />
              </div>

              <div className="modal-heading">
                <h3 className="modal-title">{project.name}</h3>
                {project.category && <span className="modal-category">{stripHtml(project.category)}</span>}
                <p className="modal-role">{stripHtml(project.role)}</p>
              </div>
              {isEmptyRich(project.description) ? (
                <p className="modal-desc story-empty">Not provided.</p>
              ) : (
                <RichContent html={project.description} className="modal-desc rich-content" />
              )}

              <div className="modal-block">
                <h4>Technologies</h4>
                <div className="project-stack">
                  {list(project.stack).map((tech, index) => (
                    <span className="chip" key={`${index}-${stripHtml(tech)}`}>
                      <span className="chip-dot" aria-hidden="true" />
                      {stripHtml(tech)}
                    </span>
                  ))}
                </div>
              </div>

              {!isEmptyRich(project.tools) && (
                <div className="modal-block">
                  <h4>Tools and frameworks</h4>
                  <div className="project-stack">
                    {list(project.tools).map((tool, index) => (
                      <span className="chip" key={`${index}-${stripHtml(tool)}`}>
                        <span className="chip-dot" aria-hidden="true" />
                        {stripHtml(tool)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(!isEmptyRich(project.problem) || !isEmptyRich(project.approach) || !isEmptyRich(project.outcome)) && (
                <div className="project-story-grid">
                  <StoryBlock icon={Target} title="Problem" html={project.problem} />
                  <StoryBlock icon={PathIcon} title="Approach" html={project.approach} />
                  <StoryBlock icon={Insight} title="Outcome" html={project.outcome} />
                </div>
              )}

              {list(project.screenshots).length > 0 && (
                <div className="modal-block">
                  <h4><ImageIcon size={17} aria-hidden="true" /> Screenshots</h4>
                  <div className="project-screenshots">
                    {list(project.screenshots).map((src, index) => (
                      <a href={src} target="_blank" rel="noreferrer" key={`${src}-${index}`}>
                        <img
                          src={src}
                          alt={`${project.name} screenshot ${index + 1}`}
                          loading="lazy"
                          decoding="async"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="modal-block">
                <h4>
                  <CheckCircle2 size={17} aria-hidden="true" /> Key features
                </h4>
                <RichList value={project.features} empty="No features listed yet." />
              </div>

              {!isEmptyRich(project.additionalFeatures) && (
                <div className="modal-block">
                  <h4>
                    <Lightbulb size={17} aria-hidden="true" /> Additional features
                  </h4>
                  <RichList value={project.additionalFeatures} />
                </div>
              )}

              <div className="modal-block">
                <h4>
                  <TriangleAlert size={17} aria-hidden="true" /> Challenges I faced
                </h4>
                <RichList value={project.challenges} empty="No challenges listed yet." />
              </div>

              <div className="modal-block">
                <h4>
                  <Lightbulb size={17} aria-hidden="true" /> What I learned
                </h4>
                <RichList value={project.learned} empty="Nothing listed yet." />
              </div>

              <div className="modal-actions">
                {project.demo ? (
                  <Magnetic>
                    <a className="btn btn-primary" href={project.demo} target="_blank" rel="noreferrer">
                      <Rocket className="btn-icon" aria-hidden="true" />
                      Live
                    </a>
                  </Magnetic>
                ) : (
                  <span className="btn btn-primary btn-disabled" role="note">
                    <Rocket className="btn-icon" aria-hidden="true" />
                    Live
                    <span className="sr-only">(not available)</span>
                  </span>
                )}
                <Magnetic>
                  <a className="btn btn-ghost" href={project.github} target="_blank" rel="noreferrer">
                    <Github className="btn-icon" aria-hidden="true" />
                    GitHub
                    <ExternalLink className="btn-icon" aria-hidden="true" />
                  </a>
                </Magnetic>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
