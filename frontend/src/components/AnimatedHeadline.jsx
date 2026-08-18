import { useEffect, useRef, useState } from 'react';

// Large heading revealed line-by-line while scrolling:
// each line starts slightly blurred, moves up and sharpens.
// lines: [{ text, gradient }]
export function AnimatedHeadline({ lines, className = '' }) {
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
      { threshold: 0.35, rootMargin: '0px 0px -80px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <h2 ref={ref} className={`animated-headline ${className}${visible ? ' is-visible' : ''}`.trim()}>
      {lines.map((line, i) => (
        <span className="ah-line" key={i}>
          {line.gradient ? <span className="ah-gradient">{line.text}</span> : line.text}
        </span>
      ))}
    </h2>
  );
}
