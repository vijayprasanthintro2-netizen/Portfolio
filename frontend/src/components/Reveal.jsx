import { useReveal } from '../hooks/useReveal';

// Wraps children and reveals them on scroll via IntersectionObserver.
// variant: 'up' (default fade-up + blur + scale) | 'left' | 'right' | 'none'
export function Reveal({ children, delay = 0, variant = 'up', as: Tag = 'div', className = '' }) {
  const ref = useReveal();

  const delayClass =
    delay === 1 ? 'reveal-delay-1' : delay === 2 ? 'reveal-delay-2' : delay === 3 ? 'reveal-delay-3' : '';

  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${variant} ${delayClass} ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
