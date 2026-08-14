import { useRef } from 'react';

// Card with a soft spotlight that follows the cursor (pointer-only).
export function SpotlightCard({ children, className = '' }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse') return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <div ref={ref} onPointerMove={onMove} className={`spotlight-card ${className}`.trim()}>
      {children}
    </div>
  );
}
