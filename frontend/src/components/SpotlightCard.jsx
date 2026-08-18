import { useRef } from 'react';

// Card with a soft spotlight that follows the cursor (pointer-only).
// Exposes both pixel (--mouse-x/--mouse-y) and percent (--mx/--my) coordinates.
export function SpotlightCard({ children, className = '' }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el || e.pointerType !== 'mouse') return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--mouse-x', `${x}px`);
    el.style.setProperty('--mouse-y', `${y}px`);
    el.style.setProperty('--mx', `${x}px`);
    el.style.setProperty('--my', `${y}px`);
  };

  return (
    <div ref={ref} onPointerMove={onMove} className={`spotlight-card ${className}`.trim()}>
      {children}
    </div>
  );
}
