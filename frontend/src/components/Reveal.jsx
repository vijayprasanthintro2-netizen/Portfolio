import { useReveal } from '../hooks/useReveal';

// Wraps children and reveals them on scroll via IntersectionObserver.
export function Reveal({ children, delay = 0, as: Tag = 'div', className = '' }) {
  const ref = useReveal();

  const delayClass =
    delay === 1 ? 'reveal-delay-1' : delay === 2 ? 'reveal-delay-2' : delay === 3 ? 'reveal-delay-3' : '';

  return (
    <Tag ref={ref} className={`reveal ${delayClass} ${className}`.trim()}>
      {children}
    </Tag>
  );
}
