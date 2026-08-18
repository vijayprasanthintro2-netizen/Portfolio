import { Reveal } from './Reveal';
import { SectionIndex } from './SectionIndex';

// Renders a section number + kicker (via SectionIndex), the title and an
// optional sub. `index` (or `num`) is the section number shown as "01/…".
// `highlight` is an array of words in the title that get a gradient accent.
function TitleWithHighlight({ text, highlight = [] }) {
  if (!highlight.length) return text;
  return text.split(/\s+/).map((word, i) => {
    const clean = word.replace(/[^\w]/g, '');
    const isHl = highlight.includes(clean);
    return (
      <span key={i}>
        {isHl ? <span className="gradient-text">{word}</span> : word}
        {i < text.split(/\s+/).length - 1 ? ' ' : ''}
      </span>
    );
  });
}

export function SectionHeading({
  index,
  num,
  number,
  kicker,
  title,
  sub,
  center = false,
  animate = true,
  highlight = [],
}) {
  const numberValue = index ?? num ?? number ?? '';
  const hasIndex = numberValue !== '';

  return (
    <div className={`section-head${center ? ' center' : ''}`}>
      {hasIndex && kicker ? (
        <SectionIndex number={String(numberValue).padStart(2, '0')} kicker={kicker} center={center} />
      ) : kicker ? (
        <Reveal>
          <span className="section-kicker">{kicker}</span>
        </Reveal>
      ) : null}

      <Reveal>
        <h2 className="section-title">
          <TitleWithHighlight text={title} highlight={highlight} />
        </h2>
        {sub && <p className="section-sub">{sub}</p>}
      </Reveal>
    </div>
  );
}
