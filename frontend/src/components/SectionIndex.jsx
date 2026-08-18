import { useEffect, useRef, useState } from 'react';

// Rolls 00 → target when it scrolls into view, then settles.
function RollingNumber({ value, start }) {
  const [display, setDisplay] = useState('00');

  useEffect(() => {
    if (!start) return undefined;
    const target = Number.parseInt(value, 10) || 0;
    if (target === 0) {
      setDisplay('00');
      return undefined;
    }
    let current = 0;
    let t = null;
    let finished = false;
    const frame = () => {
      if (finished) return;
      if (current < target) {
        current += 1;
        setDisplay(String(current).padStart(2, '0'));
        t = setTimeout(frame, 44);
      } else {
        setDisplay(String(target).padStart(2, '0'));
        finished = true;
      }
    };
    t = setTimeout(frame, 160);
    return () => {
      finished = true;
      if (t) clearTimeout(t);
    };
  }, [start, value]);

  return <span className="section-number-value">{display}</span>;
}

// `01 / KICKER` label with a divider line that draws left→right and a
// glowing point travelling along it. Matches .section-divider styles.
export function SectionIndex({ number, kicker, center = false, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35, rootMargin: '0px 0px -60px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`section-divider${visible ? ' is-visible' : ''}${center ? ' center' : ''} ${className}`.trim()}
      aria-hidden="true"
    >
      <span className="section-divider-line" />
      <span className="section-divider-glow" />
      <span className={`section-number${visible ? ' is-visible' : ''}`}>
        <RollingNumber value={number} start={visible} />
        <span>/</span>
      </span>
      <span className="section-kicker">{kicker}</span>
    </div>
  );
}
