import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

// Fixed ambient background: grid, gradient blobs, film grain and a slow
// scanline. Respects reduced motion.
export function Backdrop() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-grid" />
      <div
        className="backdrop-blob b1"
        style={reduced ? undefined : { animation: 'blob-drift-1 22s ease-in-out infinite' }}
      />
      <div
        className="backdrop-blob b2"
        style={reduced ? undefined : { animation: 'blob-drift-2 26s ease-in-out infinite' }}
      />
      <div className="backdrop-blob b3" />
      <div
        className="backdrop-scanline"
        style={reduced ? { animation: 'none' } : undefined}
      />
      <div className="backdrop-noise" />
    </div>
  );
}
