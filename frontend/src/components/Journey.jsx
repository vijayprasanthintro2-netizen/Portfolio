import { journey } from '../data/journey';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';

export function Journey() {
  return (
    <section id="journey" aria-label="My learning journey">
      <div className="container">
        <SectionHeading
          kicker="My Journey"
          title="My learning journey"
          sub="How I went from writing my first HTML tags to building full MERN applications."
        />

        <div className="journey">
          {journey.map((step, i) => (
            <Reveal key={step.id} delay={(i % 2) + 1}>
              <div className="card journey-item">
                <div className="journey-index" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
