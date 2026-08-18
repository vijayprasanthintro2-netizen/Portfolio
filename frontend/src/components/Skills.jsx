import { skillGroups as defaultGroups, groupIcons } from '../data/skills';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { TiltCard } from './TiltCard';
import { useContent } from '../content/ContentContext';
import { groupIcons as contentGroupIcons, skillIcon } from '../content/iconMap';

// Bento layout spans: larger cards take two columns on desktop/tablet.
const SPANS = {
  frontend: 'span-2',
  backend: 'span-2',
};

function SkillBar({ level }) {
  // level is a relative 1–5 visual proficiency indicator (no fake percentages).
  return (
    <span className="skill-bar" aria-hidden="true">
      <span className="skill-bar-fill" style={{ '--lvl': `${(level / 5) * 100}%` }} />
    </span>
  );
}

export function Skills() {
  const { content } = useContent();
  const skillGroups = content.skills || defaultGroups;

  return (
    <section id="skills" aria-label="Skills">
      <div className="container">
        <SectionHeading
          number={2}
          kicker="Skills"
          title="Technologies I work with"
          sub="The tools and languages I use to design, build and ship web applications."
        />

        <div className="skills-bento">
          {skillGroups.map((group, i) => {
            const Icon = contentGroupIcons[group.id] || groupIcons[group.id];
            const span = SPANS[group.id] || '';
            return (
              <Reveal key={group.id} delay={(i % 3) + 1} className={span}>
                <TiltCard className="skill-card" data-cat={group.id}>
                  <div className="skill-card-head">
                    <div className="skill-icon">
                      <Icon aria-hidden="true" />
                    </div>
                    <div>
                      <h3>{group.title}</h3>
                      <p className="skill-desc">{group.description}</p>
                    </div>
                  </div>

                  <div className="skill-list">
                    {group.skills.map((skill) => {
                      const SkillIcon = skill.icon || skillIcon(skill.name);
                      return (
                        <span className="skill-name" key={skill.name} title={skill.desc}>
                          <span className="skill-name-row">
                            <SkillIcon className="skill-name-icon" size={15} aria-hidden="true" />
                            <span className="skill-name-label">{skill.name}</span>
                          </span>
                          <SkillBar level={skill.level} />
                        </span>
                      );
                    })}
                  </div>
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
