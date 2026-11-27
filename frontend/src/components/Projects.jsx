import { lazy, memo, Suspense, useCallback, useMemo, useState } from 'react';
import { Github, Rocket, ExternalLink, Star, Info } from 'lucide-react';
import { projects as defaultProjects } from '../data/projects';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { SpotlightCard } from './SpotlightCard';
import { Magnetic } from './Magnetic';
import { useContent } from '../content/ContentContext';
import { asArray, normalizeList } from '../content/shape';
import { stripHtml } from '../lib/richText';
import { normalizeProjects } from '../lib/normalizeProject';

// Dialogs are only needed after a user action, so keep them out of the initial bundle.
const ProjectModal = lazy(() =>
  import('./ProjectModal').then((module) => ({ default: module.ProjectModal }))
);

const CardButtons = memo(function CardButtons({ project, onDetails }) {
  return (
    <div className="project-actions">
      {project.demo ? (
        <Magnetic>
          <a className="btn btn-primary btn-sm" href={project.demo} target="_blank" rel="noreferrer">
            <Rocket className="btn-icon" aria-hidden="true" />
            Live
            <ExternalLink className="btn-icon" aria-hidden="true" />
          </a>
        </Magnetic>
      ) : (
        <span
          className="btn btn-primary btn-sm btn-disabled"
          role="note"
          title="No live URL available for this project"
        >
          <Rocket className="btn-icon" aria-hidden="true" />
          Live
          <span className="sr-only">(not available)</span>
        </span>
      )}
      <Magnetic>
        <a className="btn btn-ghost btn-sm" href={project.github} target="_blank" rel="noreferrer">
          <Github className="btn-icon" aria-hidden="true" />
          GitHub
        </a>
      </Magnetic>
      <Magnetic>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onDetails(project)}>
          <Info className="btn-icon" aria-hidden="true" />
          View Details
        </button>
      </Magnetic>
    </div>
  );
});

const ProjectHead = memo(function ProjectHead({ project }) {
  return (
    <div className="project-head">
      {project.featured && (
        <span className="featured-badge">
          <Star size={13} aria-hidden="true" />
          Featured
        </span>
      )}
      <span className="project-role">{stripHtml(project.role)}</span>
      {project.category && <span className="project-category">{stripHtml(project.category)}</span>}
    </div>
  );
});

export function Projects() {
  const [selected, setSelected] = useState(null);
  const { content, status } = useContent();
  const savedProjects = useMemo(
    () => normalizeProjects(normalizeList(content.projects)),
    [content.projects]
  );
  const saved = useMemo(
    () => savedProjects || normalizeProjects(defaultProjects),
    [savedProjects]
  );

  const projects = useMemo(
    () => [...saved].sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)),
    [saved]
  );

  const { featured, rest } = useMemo(
    () => ({
      featured: projects.filter((p) => p.featured),
      rest: projects.filter((p) => !p.featured),
    }),
    [projects]
  );

  const closeDetails = useCallback(() => setSelected(null), []);

  return (
    <section id="projects" aria-label="Projects">
      <div className="container">
        <SectionHeading
          number={4}
          kicker="Featured Projects"
          title="Some of the applications I've built using modern web technologies."
          sub="Real projects built while learning full-stack development — from idea to working application."
        />

        {status === 'error' && !savedProjects ? (
          <p className="projects-message">Projects are temporarily unavailable. Please try again shortly.</p>
        ) : savedProjects && savedProjects.length === 0 ? (
          <p className="projects-message">No projects have been published yet.</p>
        ) : (
          <>
            {featured.map((project) => (
              <Reveal key={project.id || project.name}>
                <SpotlightCard className="project-card project-featured">
                  <article className="project-featured-inner">
                    <div className="project-body">
                      <ProjectHead project={project} />
                      <h3 className="project-title">{project.name}</h3>
                      <p className="project-desc">{stripHtml(project.short)}</p>

                      <div className="project-stack" aria-label="Technologies used">
                        {asArray(project.stack).map((tech, index) => (
                          <span className="chip" key={`${index}-${stripHtml(tech)}`}>
                            <span className="chip-dot" aria-hidden="true" />
                            {stripHtml(tech)}
                          </span>
                        ))}
                      </div>

                      <div className="project-features" aria-label="Key features">
                        {asArray(project.features).map((feature, index) => (
                          <span key={`${index}-${stripHtml(feature)}`} className="feature-tick">
                            ✓ {stripHtml(feature)}
                          </span>
                        ))}
                      </div>

                      <CardButtons project={project} onDetails={setSelected} />
                    </div>
                  </article>
                </SpotlightCard>
              </Reveal>
            ))}

            <div className="projects-grid">
              {rest.map((project, i) => (
                <Reveal key={project.id || project.name || i} delay={(i % 2) + 1}>
                  <SpotlightCard className="project-card">
                    <article>
                      <div className="project-body">
                        <ProjectHead project={project} />
                        <h3 className="project-title">{project.name}</h3>
                        <p className="project-desc">{stripHtml(project.short)}</p>

                        <div className="project-stack" aria-label="Technologies used">
                          {asArray(project.stack).map((tech, index) => (
                            <span className="chip" key={`${index}-${stripHtml(tech)}`}>
                              <span className="chip-dot" aria-hidden="true" />
                              {stripHtml(tech)}
                            </span>
                          ))}
                        </div>

                        <CardButtons project={project} onDetails={setSelected} />
                      </div>
                    </article>
                  </SpotlightCard>
                </Reveal>
              ))}
            </div>
          </>
        )}
      </div>

      {selected && (
        <Suspense fallback={null}>
          <ProjectModal project={selected} onClose={closeDetails} />
        </Suspense>
      )}
    </section>
  );
}
