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
  MonitorSmartphone,
  Layers,
  Plug2,
  ShoppingCart,
  GraduationCap,
  Code2,
  Sparkles,
  FileJson2,
} from 'lucide-react';

export const groupIcons = {
  frontend: Layout,
  backend: ServerCog,
  database: Database,
  programming: Terminal,
  tools: Wrench,
  concepts: Lightbulb,
};

const skillIconMap = {
  HTML: FileCode2,
  CSS: Palette,
  JavaScript: Braces,
  'React.js': Atom,
  'Node.js': Server,
  'Express.js': Route,
  'REST APIs': Network,
  'JWT Auth': KeyRound,
  MongoDB: Database,
  Mongoose: Boxes,
  Python: Terminal,
  Java: Coffee,
  Git: GitBranch,
  GitHub: Github,
  'VS Code': CodeXml,
  Postman: FlaskConical,
  npm: Package,
  CRUD: DatabaseZap,
  Auth: ShieldCheck,
  Pagination: Rows3,
  Responsive: Smartphone,
};

export function skillIcon(name) {
  return skillIconMap[name] || Code2;
}

export const buildIcons = {
  monitor: MonitorSmartphone,
  layers: Layers,
  plug: Plug2,
  cart: ShoppingCart,
};

export function buildIcon(key) {
  return buildIcons[key] || Layers;
}

export const mernIcons = {
  react: Atom,
  node: Server,
  express: Route,
  mongo: Database,
};

export function mernIcon(id) {
  return mernIcons[id] || Atom;
}

export const aboutIcons = {
  graduation: GraduationCap,
  code: Code2,
  server: Server,
  sparkles: Sparkles,
};

export function aboutIcon(key) {
  return aboutIcons[key] || FileJson2;
}
