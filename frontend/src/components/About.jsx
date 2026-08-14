import { GraduationCap, Code2, Server, Sparkles } from 'lucide-react';
import { profile } from '../config';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';

const aboutCards = [
  {
    icon: GraduationCap,
    title: 'BCA Student',
    text: 'Pursuing my Bachelor of Computer Applications at K.S. Rangasamy College of Arts and Science, Tiruchengode.',
  },
  {
    icon: Code2,
    title: 'Frontend Developer',
    text: 'Building responsive interfaces with HTML, CSS, JavaScript and React.js.',
  },
  {
    icon: Server,
    title: 'Backend Developer',
    text: 'Developing REST APIs and server logic with Node.js and Express.js, backed by MongoDB.',
  },
  {
    icon: Sparkles,
    title: 'Continuous Learner',
    text: 'Always improving my skills and exploring better ways to design, code and ship.',
  },
];

const stats = [
  { value: '2+', label: 'Real Projects' },
  { value: '1', label: 'Internship' },
  { value: 'MERN', label: 'Stack' },
  { value: 'All', label: 'Responsive Web Apps' },
];

const terminalLines = [
  { key: 'name', text: `name: "${profile.shortName}"` },
  { key: 'role', text: `role: "${profile.role.toLowerCase()}"` },
  { key: 'focus', text: `focus: "full-stack web development"` },
  { key: 'education', text: `education: "${profile.education.short}"` },
  { key: 'stack', text: `stack: [mongodb, express, react, node]` },
  { key: 'projects', text: `projects: [vijaycart, weather-app]` },
];

export function About() {
  return (
    <section id="about" aria-label="About me">
      <div className="container">
        <SectionHeading
          kicker="About Me"
          title="A student turning ideas into full-stack products"
          sub="My path from learning the web to building complete MERN applications."
        />

        <div className="about-grid">
          <Reveal>
            <div className="about-visual">
              <div className="about-terminal">
                {terminalLines.map((line, i) => (
                  <div key={line.key} className="term-line" style={{ animationDelay: `${0.4 + i * 0.35}s` }}>
                    <span className="t-prompt">$ </span>
                    <span className="t-const">vijay</span>
                    <span>.profile</span>
                    <span className="t-key">.{line.key}</span> = {line.text}
                  </div>
                ))}
                <div className="term-line" style={{ animationDelay: `${0.4 + terminalLines.length * 0.35}s` }}>
                  <span className="t-prompt">$ </span>
                  <span className="t-const">status</span>
                  <span>: </span>
                  <span className="t-str">"open to internships and opportunities"</span>
                </div>
              </div>
            </div>
          </Reveal>

          <div>
            <Reveal>
              <div className="about-body">
                {profile.about.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </Reveal>

            <div className="about-stats">
              {stats.map((stat, i) => (
                <Reveal key={stat.label} delay={(i % 4) + 1}>
                  <div className="card stat-card">
                    <span className="stat-value">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                </Reveal>
              ))}
            </div>

            <div className="about-cards">
              {aboutCards.map((card, i) => (
                <Reveal key={card.title} delay={(i % 2) + 1}>
                  <div className="card about-card">
                    <div className="about-icon">
                      <card.icon aria-hidden="true" />
                    </div>
                    <h3>{card.title}</h3>
                    <p>{card.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
