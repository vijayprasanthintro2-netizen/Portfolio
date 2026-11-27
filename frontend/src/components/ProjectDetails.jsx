import { useCallback, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  Braces,
  CheckCircle2,
  Code2,
  Database,
  ExternalLink,
  Github,
  Image as ImageIcon,
  Layers,
  Lightbulb,
  Rocket,
  Server,
  ShieldCheck,
  Target,
  Route as PathIcon,
  TriangleAlert,
} from 'lucide-react';
import { asArray } from '../content/shape';
import { isEmptyRich, listToHtml, stripHtml } from '../lib/richText';
import { findProjectBySlug } from '../lib/projectRoute';
import { useProjects } from '../hooks/useProjects';
import { Magnetic } from './Magnetic';
import { ProjectImage } from './ProjectImage';
import { RichContent } from './RichContent';
import { SpotlightCard } from './SpotlightCard';

// These are the exact technology strings already stored in the portfolio.
// Grouping never rewrites or invents a technology; anything unrecognised is
// still shown under "Other technologies".
const TECH_GROUPS = [
  {
    title: 'Frontend',
    icon: Code2,
    items: ['React 18', 'React.js', 'Redux Toolkit', 'React Router', 'Bootstrap', 'Axios', 'HTML', 'CSS'],
  },
  {
    title: 'Backend and APIs',
    icon: Server,
    items: ['Node.js', 'Express.js', 'REST APIs'],
  },
  {
    title: 'Database',
    icon: Database,
    items: ['MongoDB', 'Mongoose'],
  },
  {
    title: 'Authentication and integrations',
    icon: ShieldCheck,
    items: [
      'JWT Authentication',
      'Google OAuth',
      'Stripe Payments',
      'AI API Integration',
      'Weather API',
    ],
  },
  {
    title: 'Languages',
    icon: Braces,
    items: ['JavaScript'],
  },
];

function BackToProjects({ onClick }) {
  return (
    <button type="button" className="pd-back" onClick={onClick}>
      <ArrowLeft size={17} aria-hidden="true" />
      Back to Projects
    </button>
  );
}

function ProjectActions({ project }) {
  if (!project.demo && !project.github) {
    return <p className="pd-empty">No public links are available for this project.</p>;
  }

  return (
    <div className="pd-actions">
      {project.demo ? (
        <Magnetic strength={10}>
          <a className="btn btn-primary" href={project.demo} target="_blank" rel="noreferrer">
            <Rocket className="btn-icon" aria-hidden="true" />
            Live
            <ExternalLink className="btn-icon" aria-hidden="true" />
          </a>
        </Magnetic>
      ) : null}
      {project.github ? (
        <Magnetic strength={10}>
          <a className="btn btn-ghost" href={project.github} target="_blank" rel="noreferrer">
            <Github className="btn-icon" aria-hidden="true" />
            GitHub Repository
          </a>
        </Magnetic>
      ) : null}
    </div>
  );
}

function DetailBlock({ title, icon: Icon, children, empty = 'Not provided.', className = '' }) {
  const hasContent = children !== null && children !== undefined && children !== false;
  return (
    <section className={`pd-block ${className}`.trim()}>
      <h3>
        {Icon && <Icon size={18} aria-hidden="true" />}
        {title}
      </h3>
      {hasContent ? children : <p className="pd-empty">{empty}</p>}
    </section>
  );
}

function RichBlock({ title, icon, value, className }) {
  return (
    <DetailBlock title={title} icon={icon} empty="Not provided." className={className}>
      {isEmptyRich(value) ? null : (
        <RichContent html={value} className="pd-rich rich-content" />
      )}
    </DetailBlock>
  );
}

function RichList({ title, icon, value, empty, className }) {
  return (
    <DetailBlock title={title} icon={icon} empty={empty} className={className}>
      {isEmptyRich(value) ? null : (
        <RichContent html={listToHtml(value)} className="rich-content pd-list-field" />
      )}
    </DetailBlock>
  );
}

function TechCard({ title, icon: Icon, items }) {
  if (!items.length) return null;
  return (
    <div className="pd-tech-card">
      <h4>
        <Icon size={17} aria-hidden="true" />
        {title}
      </h4>
      <div className="project-stack">
        {items.map((tech, index) => (
          <span className="chip chip-sm" key={`${title}-${index}-${stripHtml(tech)}`}>
            <span className="chip-dot" aria-hidden="true" />
            {stripHtml(tech)}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ProjectNotFound() {
  const navigate = useNavigate();
  const back = useCallback(
    () => navigate({ pathname: '/', hash: '#projects' }, { state: { restoreHash: true } }),
    [navigate]
  );

  return (
    <main className="pd-page pd-not-found">
      <div className="container pd-container">
        <div className="pd-back-row">
          <BackToProjects onClick={back} />
        </div>
        <div className="pd-not-found-card">
          <span className="pd-eyebrow">404 — Project not found</span>
          <h1>That project page does not exist.</h1>
          <p>The link may be outdated. You can return to the Projects section and choose another project.</p>
          <button type="button" className="btn btn-primary" onClick={back}>
            Browse Projects
            <ArrowUpRight className="btn-icon" aria-hidden="true" />
          </button>
        </div>
      </div>
    </main>
  );
}

export function ProjectDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { projects } = useProjects();

  const project = useMemo(() => findProjectBySlug(projects, slug), [projects, slug]);

  const backToProjects = useCallback(() => {
    const savedY = location.state?.projectsScrollY;
    const state =
      typeof savedY === 'number'
        ? { restoreProjectsScrollY: savedY, restoreHash: true }
        : { restoreHash: true };
    navigate({ pathname: '/', search: location.search, hash: '#projects' }, { state });
  }, [location.search, location.state, navigate]);

  const stack = useMemo(() => asArray(project?.stack), [project?.stack]);
  const groupedTech = useMemo(() => {
    if (!project) return [];
    const claimed = new Set();
    const groups = TECH_GROUPS.map((group) => {
      const items = group.items.filter((tech) => {
        const matched = stack.includes(tech);
        if (matched) claimed.add(tech);
        return matched;
      });
      return { ...group, items };
    }).filter((group) => group.items.length);
    const others = stack.filter((tech) => !claimed.has(tech));
    if (others.length) {
      groups.push({ title: 'Other technologies', icon: Layers, items: others });
    }
    return groups;
  }, [project, stack]);

  if (!project) return <ProjectNotFound />;

  const screenshots = asArray(project.screenshots);
  const hasAdditionalFeatures = !isEmptyRich(project.additionalFeatures);

  return (
    <main className="pd-page">
      <div className="container pd-container">
        <div className="pd-back-row pd-back-row--top">
          <BackToProjects onClick={backToProjects} />
        </div>

        <SpotlightCard className="pd-media-card">
          <div className="pd-media">
            <ProjectImage project={project} loading="eager" width={960} height={540} />
          </div>
        </SpotlightCard>

        <header className="pd-intro">
          <div className="pd-badges">
            {project.featured && (
              <span className="featured-badge">
                <CheckCircle2 size={13} aria-hidden="true" />
                Featured
              </span>
            )}
            {project.category && (
              <span className="project-category">{stripHtml(project.category)}</span>
            )}
          </div>
          {project.role && <span className="pd-role">{stripHtml(project.role)}</span>}
          <h1>{project.name}</h1>
          {project.short && <p className="pd-lead">{stripHtml(project.short)}</p>}
        </header>

        <div className="pd-sections">
          <DetailBlock title="Technology stack" icon={Code2} empty="No technologies listed yet.">
            {groupedTech.length ? (
              <div className="pd-tech-grid">
                {groupedTech.map((group) => (
                  <TechCard key={group.title} {...group} />
                ))}
              </div>
            ) : null}
          </DetailBlock>

          <div className={`pd-grid ${hasAdditionalFeatures ? 'pd-grid--two' : 'pd-grid--one'}`}>
            <RichList
              title="Key features"
              icon={CheckCircle2}
              value={project.features}
              empty="No features listed yet."
            />
            {hasAdditionalFeatures && (
              <RichList title="Additional features" icon={Lightbulb} value={project.additionalFeatures} />
            )}
          </div>

          <div className="pd-grid pd-grid--two">
            <RichBlock title="Full description" icon={Layers} value={project.description} />
            <RichBlock title="Problem" icon={Target} value={project.problem} />
            <RichBlock title="Approach" icon={PathIcon} value={project.approach} />
            <RichBlock title="Outcome" icon={CheckCircle2} value={project.outcome} />
          </div>

          <div className="pd-grid pd-grid--two">
            <RichList
              title="Challenges I faced"
              icon={TriangleAlert}
              value={project.challenges}
              empty="No challenges listed yet."
            />
            <RichList
              title="What I learned"
              icon={Lightbulb}
              value={project.learned}
              empty="Nothing listed yet."
            />
          </div>

          {!isEmptyRich(project.tools) && (
            <DetailBlock title="Tools and frameworks" icon={Layers}>
              <RichContent html={listToHtml(project.tools)} className="rich-content pd-list-field" />
            </DetailBlock>
          )}

          {screenshots.length > 0 && (
            <DetailBlock title="Screenshots" icon={ImageIcon}>
              <div className="pd-screenshots">
                {screenshots.map((src, index) => (
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
            </DetailBlock>
          )}

          <DetailBlock title="Project links" icon={ExternalLink}>
            <ProjectActions project={project} />
          </DetailBlock>
        </div>

        <footer className="pd-footer">
          <div className="pd-back-row pd-back-row--bottom">
            <BackToProjects onClick={backToProjects} />
          </div>
        </footer>
      </div>
    </main>
  );
}
