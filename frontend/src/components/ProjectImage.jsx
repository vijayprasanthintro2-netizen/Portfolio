import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

// shows the saved image if there is one, otherwise the sample box
// falls back to the sample box too if the image url is broken
export function ProjectImage({ project, loading = 'lazy', width = 720, height = 450 }) {
  const [failed, setFailed] = useState(false);
  const src = project?.image;

  if (!src || failed) {
    return (
      <div
        className="project-media-placeholder"
        role="img"
        aria-label={`${project?.name || 'Project'} preview placeholder`}
      >
        <span className="project-media-placeholder-icon">
          <ImageIcon size={26} strokeWidth={1.6} aria-hidden="true" />
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={project?.alt || `${project?.name || 'Project'} preview`}
      loading={loading}
      width={width}
      height={height}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
