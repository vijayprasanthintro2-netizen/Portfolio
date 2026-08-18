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
// `level` (1–5) is a relative visual proficiency indicator rendered as a meter.
export const skillGroups = [
  {
    id: 'frontend',
    title: 'Frontend',
    description: 'Building responsive, accessible and modern user interfaces.',
    skills: [
      { name: 'HTML', desc: 'Semantic document structure', icon: FileCode2, level: 5 },
      { name: 'CSS', desc: 'Modern layouts and styling', icon: Palette, level: 4 },
      { name: 'JavaScript', desc: 'Interactivity and logic', icon: Braces, level: 4 },
      { name: 'React.js', desc: 'Component-based UI library', icon: Atom, level: 4 },
    ],
  },
  {
    id: 'backend',
    title: 'Backend',
    description: 'Designing APIs and server logic that power real applications.',
    skills: [
      { name: 'Node.js', desc: 'JavaScript runtime for servers', icon: Server, level: 4 },
      { name: 'Express.js', desc: 'Web framework for Node.js', icon: Route, level: 4 },
      { name: 'REST APIs', desc: 'Designing HTTP endpoints', icon: Network, level: 4 },
      { name: 'JWT Auth', desc: 'Secure stateless authentication', icon: KeyRound, level: 3 },
    ],
  },
  {
    id: 'database',
    title: 'Database',
    description: 'Modeling and persisting data with NoSQL document stores.',
    skills: [
      { name: 'MongoDB', desc: 'NoSQL document database', icon: Database, level: 4 },
      { name: 'Mongoose', desc: 'MongoDB ODM for Node.js', icon: Boxes, level: 4 },
    ],
  },
  {
    id: 'programming',
    title: 'Programming',
    description: 'Core languages for logic and problem solving.',
    skills: [
      { name: 'Python', desc: 'Basics — scripting and logic', icon: Terminal, level: 3 },
      { name: 'Java', desc: 'Basics — OOP fundamentals', icon: Coffee, level: 3 },
    ],
  },
  {
    id: 'tools',
    title: 'Tools',
    description: 'The workflow and tools I use every day.',
    skills: [
      { name: 'Git', desc: 'Distributed version control', icon: GitBranch, level: 4 },
      { name: 'GitHub', desc: 'Code hosting and collaboration', icon: Github, level: 4 },
      { name: 'VS Code', desc: 'My primary code editor', icon: CodeXml, level: 5 },
      { name: 'Postman', desc: 'API testing client', icon: FlaskConical, level: 4 },
      { name: 'npm', desc: 'Node package manager', icon: Package, level: 4 },
    ],
  },
  {
    id: 'concepts',
    title: 'Concepts',
    description: 'Patterns I apply across the full stack.',
    skills: [
      { name: 'CRUD', desc: 'Create, read, update, delete', icon: DatabaseZap, level: 4 },
      { name: 'Auth', desc: 'Secure user access', icon: ShieldCheck, level: 4 },
      { name: 'Pagination', desc: 'Efficient data browsing', icon: Rows3, level: 3 },
      { name: 'Responsive', desc: 'Works on every screen', icon: Smartphone, level: 5 },
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
