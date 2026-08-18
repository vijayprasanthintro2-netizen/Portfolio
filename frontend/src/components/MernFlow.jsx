import { motion } from 'framer-motion';
import { Atom, Server, Route, Database } from 'lucide-react';
import { SectionHeading } from './SectionHeading';
import { Reveal } from './Reveal';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';
import { useContent } from '../content/ContentContext';
import { mernIcon } from '../content/iconMap';

const defaultLayers = [
  {
    icon: Atom,
    name: 'React.js',
    role: 'Frontend',
    desc: 'Interactive user interfaces',
    color: '#61dafb',
  },
  {
    icon: Server,
    name: 'Node.js',
    role: 'Runtime',
    desc: 'JavaScript on the server',
    color: '#3b82f6',
  },
  {
    icon: Route,
    name: 'Express.js',
    role: 'Framework',
    desc: 'REST APIs & routing',
    color: '#a8b3cf',
  },
  {
    icon: Database,
    name: 'MongoDB',
    role: 'Database',
    desc: 'Flexible document storage',
    color: '#68a063',
  },
];

export function MernFlow() {
  const reduced = usePrefersReducedMotion();
  const { content } = useContent();
  const layers = content.mern || defaultLayers;

  return (
    <section id="stack" aria-label="MERN stack architecture">
      <div className="container">
        <SectionHeading
          number={3}
          kicker="MERN Stack"
          title="The stack I build with"
          sub="From interface to database — how a request flows through my stack."
        />

        <Reveal>
          <div className="mern-flow">
            <div className="mern-layer-row">
              {layers.map((layer, i) => {
                const Icon = layer.icon || mernIcon(layer.id);
                return (
                <div className="mern-node-wrap" key={layer.id || layer.name}>
                  <motion.div
                    className="mern-node"
                    initial={reduced ? false : { opacity: 0, y: 24, scale: 0.94 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div
                      className="mern-node-icon"
                      style={{ color: layer.color, borderColor: `${layer.color}55` }}
                    >
                      <Icon aria-hidden="true" />
                    </div>
                    <div className="mern-node-name">{layer.name}</div>
                    <div className="mern-node-role">{layer.role}</div>
                    <div className="mern-node-desc">{layer.desc}</div>
                  </motion.div>
                </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
