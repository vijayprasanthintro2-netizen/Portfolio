import { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

// Shows the saved project image with a loading state, or a labelled fallback
// when there is no image / the saved URL fails. State resets when the URL
// changes so image replacement is reflected immediately.
export function ProjectImage({ project, loading = 'lazy', width = 720, height = 450 }) {
  const src = project?.image;
  const imgRef = useRef(null);
  const [failedSrc, setFailedSrc] = useState(null);
  const [loadedSrc, setLoadedSrc] = useState(null);

  useEffect(() => {
    setFailedSrc(null);
    setLoadedSrc(null);
  }, [src]);

  // Cached images can finish before React attaches the load handler.
  useEffect(() => {
    const img = imgRef.current;
    if (!src || !img || !img.complete) return;
    if (img.naturalWidth > 0) setLoadedSrc(src);
    else setFailedSrc(src);
  }, [src]);

  const failed = Boolean(src) && failedSrc === src;
  const loaded = Boolean(src) && loadedSrc === src && !failed;

  if (!src || failed) {
    return (
      <div
        className="project-media-placeholder"
        role="img"
        aria-label={`${project?.name || 'Project'} preview ${failed ? 'could not be loaded' : 'is not available'}`}
      >
        <span className="project-media-placeholder-icon">
          <ImageIcon size={26} strokeWidth={1.6} aria-hidden="true" />
        </span>
        <span className={failed ? 'project-media-error' : 'project-media-label'}>
          {failed ? 'Image could not be loaded' : 'No project image uploaded'}
        </span>
      </div>
    );
  }

  return (
    <>
      <img
        ref={imgRef}
        className={loaded ? 'project-media-image is-loaded' : 'project-media-image'}
        src={src}
        alt={project?.alt || `${project?.name || 'Project'} preview`}
        loading={loading}
        width={width}
        height={height}
        decoding="async"
        onLoad={() => setLoadedSrc(src)}
        onError={() => setFailedSrc(src)}
      />
      {!loaded && (
        <span className="project-media-loading" role="status" aria-label="Loading project image">
          <span className="project-media-spinner" aria-hidden="true" />
        </span>
      )}
    </>
  );
}
