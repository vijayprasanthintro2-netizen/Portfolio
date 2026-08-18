import { techStack as defaultTechStack } from '../data/tech';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useContent } from '../content/ContentContext';

// Infinite, seamless marquee of real technologies. Pauses on hover.
// Reduced-motion: renders a single static pass instead of the loop.
export function TechMarquee() {
  const reduced = usePrefersReducedMotion();
  const { content } = useContent();
  const techStack = content.tech || defaultTechStack;
  const items = reduced ? techStack : [...techStack, ...techStack];

  return (
    <div className="tech-marquee" aria-hidden="true">
      <div
        className="tech-marquee-track"
        style={reduced ? { animation: 'none' } : undefined}
      >
        {items.map((item, i) => (
          <span className="tech-marquee-item" key={`${item}-${i}`}>
            {item}
            <span className="tech-marquee-star">✦</span>
          </span>
        ))}
      </div>
      <span className="tech-marquee-edge tech-marquee-edge-left" />
      <span className="tech-marquee-edge tech-marquee-edge-right" />
    </div>
  );
}
