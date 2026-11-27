import { memo, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Github, Rocket, ExternalLink, Star, ArrowRight } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { SpotlightCard } from './SpotlightCard';
import { Magnetic } from './Magnetic';
import { asArray } from '../content/shape';
import { stripHtml } from '../lib/richText';
import { projectSlug } from '../lib/projectRoute';
import { useProjects } from '../hooks/useProjects';

// Cards are intentionally compact. The full data always lives on the detail
// page, so these limits only control the homepage preview.
const PREVIEW_STACK_LIMIT = 6;
const PREVIEW_FEATURE_LIMIT = 3;

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
      ) : null}
      {project.github ? (
        <Magnetic>
          <a className="btn btn-ghost btn-sm" href={project.github} target="_blank" rel="noreferrer">
            <Github className="btn-icon" aria-hidden="true" />
            GitHub
          </a>
        </Magnetic>
      ) : null}
      <Magnetic>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onDetails(project)}>
          View Details
          <ArrowRight className="btn-icon" aria-hidden="true" />
        </button>
      </Magnetic>
    </div>
  );
});

const ProjectHead = memo(function ProjectHead({ project }) {
  const category = project.category ? stripHtml(project.category) : '';
  const role = stripHtml(project.role);
  return (
    <div className="project-head">
      {project.featured && (
        <span className="featured-badge">
          <Star size={13} aria-hidden="true" />
          Featured
        </span>
      )}
      {role && <span className="project-role">{role}</span>}
      {category && <span className="project-category">{category}</span>}
    </div>
  );
});

const ProjectCard = memo(function ProjectCard({ project, featured = false, onDetails }) {
  const stack = asArray(project.stack).slice(0, PREVIEW_STACK_LIMIT);
  const features = asArray(project.features).slice(0, PREVIEW_FEATURE_LIMIT);

  const body = (
    <article className="project-body">
      <ProjectHead project={project} />
      <h3 className="project-title">{project.name}</h3>
      {project.short && <p className="project-desc project-desc--compact">{stripHtml(project.short)}</p>}

      {stack.length > 0 && (
        <div className="project-stack" aria-label="Main technologies">
          {stack.map((tech, index) => (
            <span className="chip chip-sm" key={`${index}-${stripHtml(tech)}`}>
              <span className="chip-dot" aria-hidden="true" />
              {stripHtml(tech)}
            </span>
          ))}
        </div>
      )}

      {features.length > 0 && (
        <div className="project-features" aria-label="Key features">
          {features.map((feature, index) => (
            <span key={`${index}-${stripHtml(feature)}`} className="feature-tick">
              ✓ {stripHtml(feature)}
            </span>
          ))}
        </div>
      )}

      <CardButtons project={project} onDetails={onDetails} />
    </article>
  );

  return (
    <SpotlightCard className={`project-card${featured ? ' project-featured' : ''}`}>
      {featured ? <div className="project-featured-inner">{body}</div> : body}
    </SpotlightCard>
  );
});

export function Projects() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, savedProjects, status } = useProjects();

  // The featured card keeps its badge and tint, but shares the same aligned
  // grid as every other card so no card is stretched across the whole page.
  const orderedProjects = useMemo(
    () =>
      projects.slice().sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured))),
    [projects]
  );

  const openDetails = useCallback(
    (project) => {
      // Remember where the visitor was so the detail page can return to that
      // exact point instead of the top of the homepage.
      navigate(
        { pathname: `/projects/${projectSlug(project)}`, search: location.search },
        { state: { projectsScrollY: window.scrollY } }
      );
    },
    [location.search, navigate]
  );

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
          <div className="projects-grid">
            {orderedProjects.map((project, i) => (
              <Reveal key={project.id || project.name || i} delay={(i % 3) + 1}>
                <ProjectCard
                  project={project}
                  featured={Boolean(project.featured)}
                  onDetails={openDetails}
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
