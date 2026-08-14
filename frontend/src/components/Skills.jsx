import { skillGroups, groupIcons } from '../data/skills';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { TiltCard } from './TiltCard';

// Bento layout spans: larger cards take two columns on desktop/tablet.
const SPANS = {
  frontend: 'span-2',
  backend: 'span-2',
};

export function Skills() {
  return (
    <section id="skills" aria-label="Skills">
      <div className="container">
        <SectionHeading
          kicker="Skills"
          title="Technologies I work with"
          sub="The tools and languages I use to design, build and ship web applications."
        />

        <div className="skills-bento">
          {skillGroups.map((group, i) => {
            const Icon = groupIcons[group.id];
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
                      const SkillIcon = skill.icon;
                      return (
                        <span className="skill-name" key={skill.name} title={skill.desc}>
                          <SkillIcon className="skill-name-icon" size={15} aria-hidden="true" />
                          <span className="skill-name-label">{skill.name}</span>
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
