import { Reveal } from './Reveal';

export function SectionHeading({ kicker, title, sub, center = false }) {
  return (
    <div className={`section-head${center ? ' center' : ''}`}>
      <Reveal>
        <span className="section-kicker">{kicker}</span>
        <h2 className="section-title">{title}</h2>
        {sub && <p className="section-sub">{sub}</p>}
      </Reveal>
    </div>
  );
}
