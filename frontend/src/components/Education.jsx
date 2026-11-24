import { Award, Calendar, ExternalLink, GraduationCap, MapPin } from 'lucide-react';
import { profile as defaultProfile } from '../config';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { useContent } from '../content/ContentContext';

function EducationCard({ item }) {
  return (
    <Reveal>
      <article className="card education-card">
        <div className="education-icon">
          <GraduationCap aria-hidden="true" />
        </div>
        <div>
          <div className="edu-tags">
            <span className="edu-tag">{item.status || 'Education'}</span>
            {item.years && <span className="edu-tag chip">{item.years}</span>}
          </div>
          <h3>{item.degree}</h3>
          {item.department && <p className="edu-department">{item.department}</p>}
          <p className="edu-institution">{item.institution}</p>
          {item.location && (
            <p className="edu-location">
              <MapPin size={14} aria-hidden="true" />
              {item.location}
            </p>
          )}
          <div className="edu-facts">
            {item.years && (
              <span className="chip">
                <Calendar size={13} aria-hidden="true" />
                {item.years}
              </span>
            )}
            {item.cgpa !== undefined && item.cgpa !== '' && (
              <span className="chip">CGPA: {item.cgpa}</span>
            )}
          </div>
          {item.description && <p className="edu-note">{item.description}</p>}
        </div>
      </article>
    </Reveal>
  );
}

function CertificateCard({ certificate }) {
  const content = (
    <>
      {certificate.image ? (
        <img
          className="certificate-image"
          src={certificate.image}
          alt={certificate.title}
          width={52}
          height={52}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span className="certificate-icon"><Award size={26} aria-hidden="true" /></span>
      )}
      <div className="certificate-copy">
        <strong>{certificate.title}</strong>
        {certificate.issuer && <span>{certificate.issuer}</span>}
        {certificate.date && <small>{certificate.date}</small>}
        {certificate.description && <p>{certificate.description}</p>}
      </div>
      {certificate.url && <ExternalLink size={16} className="certificate-link-icon" aria-hidden="true" />}
    </>
  );

  const className = `card certificate-card${certificate.url ? ' linked' : ''}`;
  if (certificate.url) {
    return (
      <Reveal>
        <a
          className={className}
          href={certificate.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${certificate.title}`}
        >
          {content}
        </a>
      </Reveal>
    );
  }
  return (
    <Reveal>
      <div className={className}>{content}</div>
    </Reveal>
  );
}

const byOrder = (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0);

export function Education() {
  const { content } = useContent();
  const saved = Array.isArray(content.education) ? content.education : [];
  const fallbackProfile = content.profile || defaultProfile;
  const fallback = fallbackProfile.education
    ? [
        {
          id: 'bca',
          degree: fallbackProfile.education.degree,
          institution: fallbackProfile.education.institution,
          location: fallbackProfile.education.location,
          years: fallbackProfile.education.years,
          status: fallbackProfile.education.status,
          cgpa: fallbackProfile.education.cgpa,
        },
      ]
    : [];
  const items = [...(saved.length ? saved : fallback)].sort(byOrder);
  const certificates = Array.isArray(content.certificates)
    ? [...content.certificates].sort(byOrder)
    : [];

  return (
    <section id="education" aria-label="Education">
      <div className="container">
        <SectionHeading number={7} kicker="Education" title="Academic background" />

        <div className="education-list">
          {items.map((item, index) => (
            <EducationCard item={item} key={item.id || index} />
          ))}
        </div>

        {certificates.length > 0 && (
          <div className="certificates-block">
            <Reveal>
              <div className="certificates-heading">
                <Award size={20} aria-hidden="true" />
                <div>
                  <h3>Certificates &amp; credentials</h3>
                  <p>Courses and certifications completed along the way.</p>
                </div>
              </div>
            </Reveal>
            <div className="certificates-grid">
              {certificates.map((certificate, index) => (
                <CertificateCard certificate={certificate} key={certificate.id || index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
