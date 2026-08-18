import { useState } from 'react';
import { Github, Rocket, ExternalLink, Star, Info } from 'lucide-react';
import { projects as defaultProjects } from '../data/projects';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { SpotlightCard } from './SpotlightCard';
import { ProjectModal } from './ProjectModal';
import { Magnetic } from './Magnetic';
import { TiltCard } from './TiltCard';
import { useContent } from '../content/ContentContext';

function CardButtons({ project, onDetails }) {
  return (
    <div className="project-actions">
      {project.demo ? (
        <Magnetic>
          <a className="btn btn-primary btn-sm" href={project.demo} target="_blank" rel="noreferrer">
            <Rocket className="btn-icon" aria-hidden="true" />
            Live Demo
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
          Live Demo
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
}

export function Projects() {
  const [selected, setSelected] = useState(null);
  const { content } = useContent();
  const projects = content.projects || defaultProjects;

  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <section id="projects" aria-label="Projects">
      <div className="container">
        <SectionHeading
          number={4}
          kicker="Featured Projects"
          title="Some of the applications I've built using modern web technologies."
          sub="Real projects built while learning full-stack development — from idea to working application."
        />

        {featured.map((project) => (
          <Reveal key={project.id}>
            <SpotlightCard className="project-card project-featured">
              <article className="project-featured-inner">
                <TiltCard className="project-media" max={3} lift={4}>
                  <span className="project-media-tag">{project.role}</span>
                  <span className="featured-badge">
                    <Star size={13} aria-hidden="true" />
                    Featured
                  </span>
                  <img src={project.image} alt={project.alt} loading="eager" width={720} height={450} />
                </TiltCard>

                <div className="project-body">
                  <h3 className="project-title">{project.name}</h3>
                  <p className="project-desc">{project.short}</p>

                  <div className="project-stack" aria-label="Technologies used">
                    {project.stack.map((tech) => (
                      <span className="chip" key={tech}>
                        <span className="chip-dot" aria-hidden="true" />
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="project-features" aria-label="Key features">
                    {project.features.slice(0, 6).map((feature) => (
                      <span key={feature} className="feature-tick">
                        ✓ {feature}
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
            <Reveal key={project.id} delay={(i % 2) + 1}>
              <SpotlightCard className="project-card">
                <article>
                  <TiltCard className="project-media" max={3} lift={4}>
                    <span className="project-media-tag">{project.role}</span>
                    <img
                      src={project.image}
                      alt={project.alt}
                      loading="lazy"
                      width={720}
                      height={450}
                    />
                  </TiltCard>

                  <div className="project-body">
                    <h3 className="project-title">{project.name}</h3>
                    <p className="project-desc">{project.short}</p>

                    <div className="project-stack" aria-label="Technologies used">
                      {project.stack.map((tech) => (
                        <span className="chip" key={tech}>
                          <span className="chip-dot" aria-hidden="true" />
                          {tech}
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
      </div>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
