import { GraduationCap, Calendar, MapPin } from 'lucide-react';
import { profile } from '../config';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';

export function Education() {
  const edu = profile.education;

  return (
    <section id="education" aria-label="Education">
      <div className="container">
        <SectionHeading kicker="Education" title="Academic background" />

        <Reveal>
          <div className="card education-card">
            <div className="education-icon">
              <GraduationCap aria-hidden="true" />
            </div>
            <div>
              <div className="edu-tags">
                <span className="edu-tag">Currently Pursuing</span>
                <span className="edu-tag chip">{edu.years}</span>
              </div>
              <h3>{edu.degree}</h3>
              <p className="edu-institution">{edu.institution}</p>
              <p className="edu-location">
                <MapPin size={14} aria-hidden="true" />
                {edu.location}
              </p>
              <div className="edu-facts">
                <span className="chip">
                  <Calendar size={13} aria-hidden="true" />
                  {edu.status}
                </span>
                <span className="chip">CGPA: {edu.cgpa}</span>
              </div>
              <p className="edu-note">
                Building my foundation in computer science while developing hands-on full-stack
                development skills with the MERN stack.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
