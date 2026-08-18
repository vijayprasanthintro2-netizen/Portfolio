import { MonitorSmartphone, Layers, Plug2, ShoppingCart } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { SpotlightCard } from './SpotlightCard';
import { useContent } from '../content/ContentContext';
import { buildIcon } from '../content/iconMap';

const defaultBuilds = [
  {
    icon: MonitorSmartphone,
    title: 'Responsive Web Applications',
    desc: 'Websites and interfaces that adapt cleanly from mobile to desktop — fast, accessible and easy to use.',
  },
  {
    icon: Layers,
    title: 'MERN Stack Applications',
    desc: 'Complete full-stack products using React, Node.js, Express and MongoDB — from interface to database.',
  },
  {
    icon: Plug2,
    title: 'REST API Development',
    desc: 'Clean, tested RESTful endpoints with validation, error handling and secure authentication.',
  },
  {
    icon: ShoppingCart,
    title: 'E-Commerce Applications',
    desc: 'Storefronts with product catalogs, search, cart, authentication and admin management.',
  },
];

export function BuildSection() {
  const { content } = useContent();
  const builds = content.build || defaultBuilds;

  return (
    <section id="build" aria-label="What I can build">
      <div className="container">
        <SectionHeading
          number={8}
          kicker="What I Can Build"
          title="Things I can build for you"
          sub="Practical, real skills — applied to projects that solve problems."
        />

        <div className="build-grid">
          {builds.map((item, i) => {
            const Icon = typeof item.icon === 'string' ? buildIcon(item.icon) : item.icon;
            return (
              <Reveal key={item.title || i} delay={(i % 2) + 1}>
                <SpotlightCard className="card build-card">
                  <div className="build-icon">
                    <Icon aria-hidden="true" />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
