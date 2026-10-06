import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ImageOff } from 'lucide-react';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { ProjectImage } from './ProjectImage';

// fullscreen image view, opens from the Show Image button on a project card
// shows the sample box + a note when no image is uploaded yet
export function ProjectLightbox({ project, onClose }) {
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
        <div className="modal-layer lightbox-layer">
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.figure
            className="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`${project.name} image`}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <button type="button" className="modal-close" onClick={onClose} aria-label="Close image">
              <X size={22} aria-hidden="true" />
            </button>

            <div className="lightbox-media">
              <ProjectImage project={project} loading="eager" width={960} height={600} />
            </div>

            <figcaption className="lightbox-caption">
              <strong>{project.name}</strong>
              <span>{project.role}</span>
              {!project.image && (
                <p className="lightbox-note">
                  <ImageOff size={15} aria-hidden="true" />
                  No image uploaded yet — add one in Admin → Projects.
                </p>
              )}
            </figcaption>
          </motion.figure>
        </div>
      )}
    </AnimatePresence>
  );
}
