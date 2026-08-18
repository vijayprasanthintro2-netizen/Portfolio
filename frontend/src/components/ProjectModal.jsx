import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Github,
  ExternalLink,
  CheckCircle2,
  Lightbulb,
  TriangleAlert,
  Rocket,
} from 'lucide-react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { Magnetic } from './Magnetic';

export function ProjectModal({ project, onClose }) {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!project) return;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [project, onClose]);

  return (
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
            <button type="button" className="modal-close" onClick={onClose} aria-label="Close details">
              <X size={22} aria-hidden="true" />
            </button>

            <div className="modal-hero">
              <span className="project-media-tag">{project.role}</span>
              <img src={project.image} alt={project.alt} width={720} height={450} />
            </div>

            <div className="modal-body">
              <h3 className="modal-title">{project.name}</h3>
              <p className="modal-desc">{project.description}</p>

              <div className="modal-block">
                <h4>Technologies</h4>
                <div className="project-stack">
                  {project.stack.map((tech) => (
                    <span className="chip" key={tech}>
                      <span className="chip-dot" aria-hidden="true" />
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="modal-block">
                <h4>
                  <CheckCircle2 size={17} aria-hidden="true" /> Key features
                </h4>
                <ul className="modal-list">
                  {project.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>

              <div className="modal-block">
                <h4>
                  <TriangleAlert size={17} aria-hidden="true" /> Challenges I faced
                </h4>
                <ul className="modal-list">
                  {project.challenges.map((challenge) => (
                    <li key={challenge}>{challenge}</li>
                  ))}
                </ul>
              </div>

              <div className="modal-block">
                <h4>
                  <Lightbulb size={17} aria-hidden="true" /> What I learned
                </h4>
                <ul className="modal-list">
                  {project.learned.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="modal-actions">
                {project.demo ? (
                  <Magnetic>
                    <a className="btn btn-primary" href={project.demo} target="_blank" rel="noreferrer">
                      <Rocket className="btn-icon" aria-hidden="true" />
                      Live Demo
                    </a>
                  </Magnetic>
                ) : (
                  <span className="btn btn-primary btn-disabled" role="note">
                    <Rocket className="btn-icon" aria-hidden="true" />
                    Live Demo
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
    </AnimatePresence>
  );
}
