import {
  Braces,
  Palette,
  Atom,
  FileCode2,
  Coffee,
  Terminal,
  Server,
  Route,
  Network,
  KeyRound,
  Database,
  Boxes,
  GitBranch,
  Github,
  CodeXml,
  FlaskConical,
  Package,
  Lightbulb,
  DatabaseZap,
  ShieldCheck,
  Rows3,
  Smartphone,
  Layout,
  ServerCog,
  Wrench,
} from 'lucide-react';

// Skills grouped by category. Honest presentation only — no fake percentages.
export const skillGroups = [
  {
    id: 'frontend',
    title: 'Frontend',
    description: 'Building responsive, accessible and modern user interfaces.',
    skills: [
      { name: 'HTML', desc: 'Semantic document structure', icon: FileCode2 },
      { name: 'CSS', desc: 'Modern layouts and styling', icon: Palette },
      { name: 'JavaScript', desc: 'Interactivity and logic', icon: Braces },
      { name: 'React.js', desc: 'Component-based UI library', icon: Atom },
    ],
  },
  {
    id: 'backend',
    title: 'Backend',
    description: 'Designing APIs and server logic that power real applications.',
    skills: [
      { name: 'Node.js', desc: 'JavaScript runtime for servers', icon: Server },
      { name: 'Express.js', desc: 'Web framework for Node.js', icon: Route },
      { name: 'REST APIs', desc: 'Designing HTTP endpoints', icon: Network },
      { name: 'JWT Auth', desc: 'Secure stateless authentication', icon: KeyRound },
    ],
  },
  {
    id: 'database',
    title: 'Database',
    description: 'Modeling and persisting data with NoSQL document stores.',
    skills: [
      { name: 'MongoDB', desc: 'NoSQL document database', icon: Database },
      { name: 'Mongoose', desc: 'MongoDB ODM for Node.js', icon: Boxes },
    ],
  },
  {
    id: 'programming',
    title: 'Programming',
    description: 'Core languages for logic and problem solving.',
    skills: [
      { name: 'Python', desc: 'Basics — scripting and logic', icon: Terminal },
      { name: 'Java', desc: 'Basics — OOP fundamentals', icon: Coffee },
    ],
  },
  {
    id: 'tools',
    title: 'Tools',
    description: 'The workflow and tools I use every day.',
    skills: [
      { name: 'Git', desc: 'Distributed version control', icon: GitBranch },
      { name: 'GitHub', desc: 'Code hosting and collaboration', icon: Github },
      { name: 'VS Code', desc: 'My primary code editor', icon: CodeXml },
      { name: 'Postman', desc: 'API testing client', icon: FlaskConical },
      { name: 'npm', desc: 'Node package manager', icon: Package },
    ],
  },
  {
    id: 'concepts',
    title: 'Concepts',
    description: 'Patterns I apply across the full stack.',
    skills: [
      { name: 'CRUD', desc: 'Create, read, update, delete', icon: DatabaseZap },
      { name: 'Auth', desc: 'Secure user access', icon: ShieldCheck },
      { name: 'Pagination', desc: 'Efficient data browsing', icon: Rows3 },
      { name: 'Responsive', desc: 'Works on every screen', icon: Smartphone },
    ],
  },
];

export const groupIcons = {
  frontend: Layout,
  backend: ServerCog,
  database: Database,
  programming: Terminal,
  tools: Wrench,
  concepts: Lightbulb,
};
