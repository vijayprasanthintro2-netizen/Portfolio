import {
  LayoutDashboard,
  User,
  Info,
  Share2,
  Menu,
  Wrench,
  FolderKanban,
  Route,
  Atom,
  Hammer,
  Monitor,
  Palette,
  Inbox,
  Settings,
} from 'lucide-react';

// Section editor types:
//  object  -> the data is an object rendered from a list of fields
//  records -> the data is an array of records (each rendered with its fields)
//  strings -> the data is a plain array of strings

// Field types (used inside object / records):
//  text, textarea, number, toggle, color, strings, image, list (nested records)

const text = (key, label, opts = {}) => ({ key, label, type: 'text', ...opts });
const area = (key, label, opts = {}) => ({ key, label, type: 'textarea', ...opts });
const number = (key, label, opts = {}) => ({ key, label, type: 'number', ...opts });
const toggle = (key, label, opts = {}) => ({ key, label, type: 'toggle', ...opts });
const color = (key, label, opts = {}) => ({ key, label, type: 'color', ...opts });
const stringsField = (key, label, opts = {}) => ({ key, label, type: 'strings', ...opts });
const imageField = (key, label, opts = {}) => ({ key, label, type: 'image', ...opts });
const recordList = (key, label, fields, opts = {}) => ({ key, label, type: 'list', fields, ...opts });
const object = (key, label, fields) => ({ key, label, type: 'object', fields });

export const sectionNav = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Overview and quick links' },
  {
    key: 'profile',
    label: 'Profile',
    icon: User,
    desc: 'Name, role, about paragraphs, education, internship',
    badge: 'core',
  },
  { key: 'about', label: 'About Section', icon: Info, desc: 'Headline, story cards and stats' },
  { key: 'socials', label: 'Social Links', icon: Share2, desc: 'Email, phone, GitHub, LinkedIn' },
  { key: 'nav', label: 'Navigation', icon: Menu, desc: 'Navbar and footer links' },
  { key: 'skills', label: 'Skills', icon: Wrench, desc: 'Skill groups and proficiency levels' },
  { key: 'projects', label: 'Projects', icon: FolderKanban, desc: 'Portfolio projects with details' },
  { key: 'journey', label: 'Journey', icon: Route, desc: 'Learning timeline steps' },
  { key: 'mern', label: 'MERN Stack', icon: Atom, desc: 'Stack flow cards' },
  { key: 'build', label: 'What I Build', icon: Hammer, desc: 'Service cards' },
  { key: 'tech', label: 'Tech Marquee', icon: Monitor, desc: 'Scrolling technology strip' },
  { key: 'design', label: 'Design', icon: Palette, desc: 'Colors, fonts and logo', badge: 'premium' },
  { key: 'messages', label: 'Messages', icon: Inbox, desc: 'Contact form submissions' },
  { key: 'account', label: 'Account', icon: Settings, desc: 'Change your admin password' },
];

export const sections = {
  profile: {
    title: 'Profile',
    description: 'The identity shown across the whole site.',
    type: 'object',
    schema: [
      text('name', 'Full name'),
      text('shortName', 'Short name'),
      text('role', 'Job title / role'),
      area('headline', 'Headline'),
      area('intro', 'Introduction'),
      stringsField('about', 'About paragraphs'),
      text('location', 'Location'),
      text('availability', 'Availability'),
      imageField('image', 'Profile photo', {
        hint: 'Shown in the hero. Press Save to publish — replace or remove it any time.',
      }),
      text('resume', 'Resume file path', { hint: 'Path inside frontend/public, e.g. /Vijayprasanth-Resume.pdf' }),
      object('education', 'Education', [
        text('degree', 'Degree'),
        text('short', 'Short code'),
        text('institution', 'Institution'),
        text('location', 'Location'),
        text('years', 'Years'),
        text('status', 'Status'),
        number('cgpa', 'CGPA', { step: '0.1' }),
      ]),
      object('internship', 'Internship / Experience', [
        text('role', 'Role'),
        text('company', 'Company'),
        text('period', 'Period'),
        text('duration', 'Duration'),
        stringsField('tags', 'Tag chips'),
        stringsField('points', 'Achievement points'),
      ]),
    ],
  },

  about: {
    title: 'About Section',
    description: 'The animated heading, intro cards and stat counters.',
    type: 'object',
    schema: [
      recordList('headline', 'Headline lines', [
        text('text', 'Line text'),
        toggle('gradient', 'Gradient accent'),
      ]),
      area('sub', 'Subtitle'),
      recordList('cards', 'Story cards', [
        text('icon', 'Icon key', { hint: 'graduation, code, server, sparkles' }),
        text('title', 'Title'),
        area('text', 'Text'),
      ]),
      recordList('stats', 'Stat counters', [
        text('value', 'Value'),
        text('label', 'Label'),
      ]),
    ],
  },

  socials: {
    title: 'Social Links',
    description: 'How visitors reach you.',
    type: 'object',
    schema: [
      text('email', 'Email'),
      text('phone', 'Phone (raw)'),
      text('phoneDisplay', 'Phone (display)'),
      text('github', 'GitHub profile URL'),
      text('githubUser', 'GitHub username'),
      text('linkedin', 'LinkedIn URL'),
      text('website', 'Website URL'),
    ],
  },

  nav: {
    title: 'Navigation',
    description: 'Links shown in the navbar and footer.',
    type: 'records',
    nameKey: 'label',
    addLabel: 'Add link',
    fields: [text('id', 'Section id'), text('label', 'Label')],
  },

  skills: {
    title: 'Skills',
    description: 'Skill groups. Each group has a title, description and individual skills.',
    type: 'records',
    nameKey: 'title',
    addLabel: 'Add group',
    fields: [
      text('id', 'Group id', { hint: 'frontend, backend, database, programming, tools, concepts' }),
      text('title', 'Group title'),
      area('description', 'Group description'),
      recordList('skills', 'Skills', [
        text('name', 'Skill name'),
        area('desc', 'Description'),
        number('level', 'Level (1–5)', { min: 1, max: 5 }),
      ]),
    ],
  },

  projects: {
    title: 'Projects',
    description: 'Portfolio projects. Mark one as featured for the large spotlight card.',
    type: 'records',
    nameKey: 'name',
    addLabel: 'Add project',
    fields: [
      text('id', 'Project id'),
      text('name', 'Name'),
      text('role', 'Role / subtitle'),
      toggle('featured', 'Featured (large card)'),
      area('short', 'Short description (card)'),
      area('description', 'Full description (modal)'),
      stringsField('stack', 'Technologies'),
      stringsField('features', 'Key features'),
      stringsField('challenges', 'Challenges'),
      stringsField('learned', 'What I learned'),
      imageField('image', 'Project image', {
        hint: 'Shown on the card and in View Details. Press Save to publish.',
      }),
      text('alt', 'Image alt text'),
      text('github', 'GitHub URL'),
      text('demo', 'Live demo URL', { hint: 'Leave blank if there is no live URL' }),
    ],
  },

  journey: {
    title: 'Journey',
    description: 'Steps in the learning timeline.',
    type: 'records',
    nameKey: 'title',
    addLabel: 'Add step',
    fields: [text('id', 'Step id'), text('title', 'Title'), area('text', 'Description')],
  },

  mern: {
    title: 'MERN Stack',
    description: 'Cards in the MERN architecture flow.',
    type: 'records',
    nameKey: 'name',
    addLabel: 'Add layer',
    fields: [
      text('id', 'Layer id', { hint: 'react, node, express, mongo' }),
      text('name', 'Name'),
      text('role', 'Role'),
      text('desc', 'Description'),
      color('color', 'Accent color'),
    ],
  },

  build: {
    title: 'What I Build',
    description: 'Service cards describing what you build.',
    type: 'records',
    nameKey: 'title',
    addLabel: 'Add card',
    fields: [
      text('id', 'Card id'),
      text('icon', 'Icon key', { hint: 'monitor, layers, plug, cart' }),
      text('title', 'Title'),
      area('desc', 'Description'),
    ],
  },

  tech: {
    title: 'Tech Marquee',
    description: 'Technologies shown in the scrolling strip.',
    type: 'strings',
    addLabel: 'Add technology',
  },

  design: {
    title: 'Design',
    description: 'Brand colors, gradients, fonts and logo — applied live to the whole site.',
    type: 'object',
    schema: [
      color('accent', 'Primary accent'),
      color('accent2', 'Secondary accent (cyan)'),
      color('accent3', 'Tertiary accent (green)'),
      color('gradientFrom', 'Gradient start'),
      color('gradientMid', 'Gradient middle'),
      color('gradientTo', 'Gradient end'),
      text('fontDisplay', 'Display font stack'),
      text('fontBody', 'Body font stack'),
      text('fontMono', 'Mono font stack'),
      text('logoText', 'Logo text', { hint: 'The “gradient part” is drawn from the final “.”' }),
      number('radius', 'Corner radius (px)', { min: 4, max: 32 }),
    ],
  },
};

export function getSectionMeta(key) {
  return sectionNav.find((s) => s.key === key);
}

// Flattens a nested field list into record fields for the "records" type.
export function getRecordFields(meta) {
  return meta.fields || [];
}