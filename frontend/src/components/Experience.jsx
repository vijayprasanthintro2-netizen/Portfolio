import { Briefcase, Calendar, Building2, CheckCircle2 } from 'lucide-react';
import { profile as defaultProfile } from '../config';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { useContent } from '../content/ContentContext';

const defaultTags = ['MongoDB', 'Express.js', 'REST APIs', 'API Integration'];

export function Experience() {
  const { content } = useContent();
  const { internship } = content.profile || defaultProfile;
  const tags = internship.tags || defaultTags;

  return (
    <section id="experience" aria-label="Experience">
      <div className="container">
        <SectionHeading
          number={5}
          kicker="Experience"
          title="Where I've applied my skills"
          sub="Real-world experience building and testing full-stack applications."
        />

        <div className="timeline">
          <Reveal>
            <article className="timeline-item">
              <div className="timeline-dot" aria-hidden="true">
                <Briefcase size={18} />
              </div>
              <div className="card timeline-card">
                <div className="timeline-head">
                  <div>
                    <h3 className="timeline-role">{internship.role}</h3>
                    <div className="timeline-company">
                      <Building2 size={15} aria-hidden="true" />
                      {internship.company}
                    </div>
                  </div>
                  <span className="chip timeline-chip">
                    <Calendar size={13} aria-hidden="true" />
                    {internship.period}
                  </span>
                </div>

                <div className="timeline-points">
                  {internship.points.map((point) => (
                    <div className="timeline-point" key={point}>
                      <CheckCircle2 size={16} aria-hidden="true" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>

                <div className="timeline-tags" aria-label="Technologies used during the internship">
                  {tags.map((tag) => (
                    <span className="chip" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
