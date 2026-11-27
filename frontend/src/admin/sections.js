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
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Images,
} from 'lucide-react';

// Section editor types:
//  object  -> the data is an object rendered from a list of fields
//  records -> the data is an array of records (each rendered with its fields)
//  strings -> the data is a plain array of strings
//
// Field types: text, textarea, number, toggle, color, strings, image, list, object, rich

const text = (key, label, opts = {}) => ({ key, label, type: 'text', ...opts });
const area = (key, label, opts = {}) => ({ key, label, type: 'textarea', ...opts });
const number = (key, label, opts = {}) => ({ key, label, type: 'number', ...opts });
const toggle = (key, label, opts = {}) => ({ key, label, type: 'toggle', ...opts });
const color = (key, label, opts = {}) => ({ key, label, type: 'color', ...opts });
const stringsField = (key, label, opts = {}) => ({ key, label, type: 'strings', ...opts });
const rich = (key, label, opts = {}) => ({ key, label, type: 'rich', mode: 'document', ...opts });
const richList = (key, label, opts = {}) => rich(key, label, { mode: 'list', ...opts });
const imageField = (key, label, opts = {}) => ({ key, label, type: 'image', ...opts });
const recordList = (key, label, fields, opts = {}) => ({ key, label, type: 'list', fields, ...opts });
const object = (key, label, fields) => ({ key, label, type: 'object', fields });

export const navGroups = [
  { key: 'overview', label: 'Overview' },
  { key: 'content', label: 'Portfolio content' },
  { key: 'management', label: 'Management' },
  { key: 'system', label: 'System' },
];

export const sectionNav = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, desc: 'Overview and quick links', group: 'overview' },
  {
    key: 'profile',
    label: 'Home / Hero',
    icon: User,
    desc: 'Name, title, introduction, photo and hero buttons',
    badge: 'core',
    group: 'content',
  },
  { key: 'about', label: 'About Me', icon: Info, desc: 'Headline, story cards and stats', group: 'content' },
  { key: 'skills', label: 'Technical Skills', icon: Wrench, desc: 'Groups, icons and ordering', group: 'content' },
  { key: 'experience', label: 'Experience', icon: Briefcase, desc: 'Roles, companies and achievements', group: 'content' },
  { key: 'projects', label: 'Projects', icon: FolderKanban, desc: 'Project details, media and links', group: 'content' },
  { key: 'education', label: 'Education', icon: GraduationCap, desc: 'Institutions and qualifications', group: 'content' },
  { key: 'certificates', label: 'Certificates', icon: Award, desc: 'Credentials and badge images', group: 'content' },
  { key: 'socials', label: 'Contact Information', icon: Share2, desc: 'Email, phone, GitHub, LinkedIn and more', group: 'content' },
  { key: 'build', label: 'Development Approach', icon: Hammer, desc: 'Workflow and service cards', group: 'content' },
  { key: 'mern', label: 'Engineering Focus', icon: Atom, desc: 'Stack focus areas and ordering', group: 'content' },
  { key: 'journey', label: 'Learning Journey', icon: Route, desc: 'Learning timeline steps', group: 'content' },
  { key: 'tech', label: 'Tech Marquee', icon: Monitor, desc: 'Scrolling technology strip', group: 'content' },
  { key: 'nav', label: 'Navigation', icon: Menu, desc: 'Navbar and footer links', group: 'content' },
  { key: 'design', label: 'Design System', icon: Palette, desc: 'Colors, fonts and logo', badge: 'premium', group: 'content' },
  { key: 'resume', label: 'Resume', icon: FileText, desc: 'Upload, replace and share your PDF', group: 'management' },
  { key: 'media', label: 'Media Library', icon: Images, desc: 'Images, screenshots and documents', group: 'management' },
  { key: 'messages', label: 'Messages', icon: Inbox, desc: 'Contact form inbox', group: 'management' },
  { key: 'settings', label: 'Settings', icon: Settings, desc: 'Account, theme and session', group: 'system' },
];

export const sections = {
  profile: {
    title: 'Home / Hero',
    description: 'The identity shown across the whole site.',
    type: 'object',
    schema: [
      text('name', 'Full name', { required: true, placeholder: 'Your full name' }),
      text('shortName', 'Short name'),
      text('role', 'Job title / role', { required: true }),
      area('headline', 'Headline'),
      area('intro', 'Introduction'),
      stringsField('about', 'About paragraphs'),
      text('location', 'Location'),
      text('availability', 'Availability'),
      imageField('image', 'Profile photo', {
        hint: 'Shown in the hero. Press Save to publish — replace or remove it any time.',
      }),
      recordList(
        'heroButtons',
        'Extra hero buttons',
        [text('label', 'Button label', { required: true }), text('href', 'Link / URL', { required: true }), text('style', 'Style', { hint: 'primary or ghost' })],
        { addLabel: 'Add button' }
      ),
      object('education', 'Education summary', [
        text('degree', 'Degree'),
        text('short', 'Short code'),
        text('institution', 'Institution'),
        text('location', 'Location'),
        text('years', 'Years'),
        text('status', 'Status'),
        number('cgpa', 'CGPA', { step: '0.1' }),
      ]),
      object('internship', 'Internship / Experience summary', [
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
    title: 'About Me',
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
    title: 'Contact Information',
    description: 'How visitors reach you.',
    type: 'object',
    schema: [
      text('email', 'Email'),
      text('phone', 'Phone (raw)'),
      text('phoneDisplay', 'Phone (display)'),
      text('github', 'GitHub profile URL'),
      text('githubUser', 'GitHub username'),
      text('linkedin', 'LinkedIn URL'),
      text('instagram', 'Instagram URL'),
      text('website', 'Portfolio URL'),
    ],
  },

  nav: {
    title: 'Navigation',
    description: 'Links shown in the navbar and footer.',
    type: 'records',
    nameKey: 'label',
    addLabel: 'Add link',
    fields: [text('id', 'Section id', { required: true }), text('label', 'Label', { required: true })],
  },

  skills: {
    title: 'Technical Skills',
    description: 'Skill groups — add, edit, delete and reorder individual skills.',
    type: 'records',
    nameKey: 'title',
    addLabel: 'Add group',
    fields: [
      text('id', 'Group id', { hint: 'frontend, backend, database, programming, tools, concepts' }),
      text('title', 'Group title', { required: true }),
      area('description', 'Group description'),
      number('order', 'Display order', { min: 0 }),
      recordList('skills', 'Skills', [
        text('name', 'Skill name', { required: true }),
        area('desc', 'Description'),
        number('level', 'Level (1–5)', { min: 1, max: 5 }),
        text('icon', 'Icon key', { hint: 'Optional: react, node, mongo, github…' }),
      ], { addLabel: 'Add skill' }),
    ],
  },

  experience: {
    title: 'Experience',
    description: 'Roles, internships and achievements.',
    type: 'records',
    nameKey: 'role',
    addLabel: 'Add experience',
    fields: [
      text('id', 'Record id'),
      text('role', 'Role / position', { required: true }),
      text('company', 'Company', { required: true }),
      text('period', 'Duration / period'),
      text('duration', 'Short duration'),
      area('description', 'Description'),
      stringsField('points', 'Achievement points'),
      stringsField('tags', 'Technologies'),
      number('order', 'Display order', { min: 0 }),
    ],
  },

  projects: {
    title: 'Projects',
    description: 'Portfolio projects. Write each record like a document — formatting is saved and shown in View Details.',
    type: 'records',
    nameKey: 'name',
    addLabel: 'Add project',
    fields: [
      text('id', 'Project ID', { hint: 'Used as the stable record key' }),
      text('name', 'Project name', { required: true }),
      text('category', 'Project category', { placeholder: 'e.g. E-Commerce, Portfolio, Tools' }),
      text('role', 'Project subtitle / role'),
      toggle('featured', 'Featured (large card)'),
      imageField('image', 'Project image', {
        hint: 'Uploaded to the media library with a stable URL. Shown only in View Details.',
        asset: true,
      }),
      text('alt', 'Image alt text'),
      number('order', 'Display order', { min: 0 }),

      rich('short', 'Card overview', {
        required: true,
        hint: 'A short summary shown on the project card',
        placeholder: 'Write a concise overview of the project…',
      }),
      rich('description', 'Full description', {
        hint: 'Use headings, paragraphs and bold text to structure the story',
        placeholder: 'Describe what the project is and what it does…',
      }),

      richList('features', 'Key features', {
        hint: 'Click the bullet button, then press Enter for the next feature',
        placeholder: 'User authentication and authorization…',
      }),
      richList('additionalFeatures', 'Additional features', {
        hint: 'Optional extra highlights',
        placeholder: 'Responsive user interface…',
      }),

      rich('problem', 'Problem', {
        placeholder: 'What problem were you solving?',
      }),
      rich('approach', 'Approach', {
        placeholder: 'How did you build and structure the solution?',
      }),
      rich('outcome', 'Outcome', {
        placeholder: 'What was the result or impact?',
      }),

      richList('stack', 'Technology stack', {
        hint: 'Each item becomes a technology chip on the card',
        placeholder: 'React.js',
      }),
      richList('tools', 'Tools and frameworks', {
        placeholder: 'Vite, Git, Postman…',
      }),

      text('demo', 'Live Demo URL', { hint: 'Leave blank if there is no live URL' }),
      text('github', 'GitHub URL'),
      stringsField('screenshots', 'Screenshot URLs', {
        hint: 'Copy stable URLs from the Media Library.',
      }),

      richList('challenges', 'Challenges', {
        placeholder: 'Describe a challenge you overcome…',
      }),
      richList('learned', 'What I learned', {
        placeholder: 'Describe something you learned…',
      }),
    ],
    groups: [
      {
        title: '1. Basic project information',
        description: 'Identity, category, image and ordering.',
        fields: ['id', 'name', 'category', 'role', 'featured', 'image', 'alt', 'order'],
      },
      {
        title: '2. Project description',
        description: 'The card summary and the full formatted description.',
        fields: ['short', 'description'],
      },
      {
        title: '3. Project features',
        description: 'Use bullet lists so each feature is easy to add, edit and reorder.',
        fields: ['features', 'additionalFeatures'],
      },
      {
        title: '4. Project explanation',
        description: 'Tell the story behind the project.',
        fields: ['problem', 'approach', 'outcome'],
      },
      {
        title: '5. Technologies',
        description: 'Technologies, tools and frameworks used.',
        fields: ['stack', 'tools'],
      },
      {
        title: '6. Project links & details',
        description: 'Live links, media and supporting details.',
        fields: ['demo', 'github', 'screenshots', 'challenges', 'learned'],
      },
    ],
  },

  education: {
    title: 'Education',
    description: 'Academic qualifications.',
    type: 'records',
    nameKey: 'degree',
    addLabel: 'Add education',
    fields: [
      text('id', 'Record id'),
      text('degree', 'Degree', { required: true }),
      text('department', 'Department'),
      text('institution', 'Institution', { required: true }),
      text('location', 'Location'),
      text('years', 'Duration'),
      text('status', 'Status'),
      number('cgpa', 'CGPA', { step: '0.1' }),
      area('description', 'Description'),
      number('order', 'Display order', { min: 0 }),
    ],
  },

  certificates: {
    title: 'Certificates',
    description: 'Credentials shown in the Education section.',
    type: 'records',
    nameKey: 'title',
    addLabel: 'Add certificate',
    fields: [
      text('id', 'Record id'),
      text('title', 'Certificate title', { required: true }),
      text('issuer', 'Issuing organisation'),
      text('date', 'Issue date'),
      area('description', 'Description'),
      text('url', 'Certificate URL', { hint: 'A PDF or verification link (optional)' }),
      imageField('image', 'Certificate image'),
      number('order', 'Display order', { min: 0 }),
    ],
  },

  journey: {
    title: 'Learning Journey',
    description: 'Steps in the learning timeline.',
    type: 'records',
    nameKey: 'title',
    addLabel: 'Add step',
    fields: [text('id', 'Step id'), text('title', 'Title'), area('text', 'Description')],
  },

  mern: {
    title: 'Engineering Focus',
    description: 'Focus areas in the MERN architecture flow.',
    type: 'records',
    nameKey: 'name',
    addLabel: 'Add focus area',
    fields: [
      text('id', 'Area id', { hint: 'react, node, express, mongo' }),
      text('name', 'Name', { required: true }),
      text('role', 'Role'),
      text('desc', 'Description'),
      color('color', 'Accent color'),
      number('order', 'Display order', { min: 0 }),
    ],
  },

  build: {
    title: 'Development Approach',
    description: 'Workflow steps and service cards.',
    type: 'records',
    nameKey: 'title',
    addLabel: 'Add step',
    fields: [
      text('id', 'Step id'),
      text('icon', 'Icon key', { hint: 'monitor, layers, plug, cart' }),
      text('title', 'Title', { required: true }),
      area('desc', 'Description'),
      number('order', 'Display order', { min: 0 }),
    ],
  },

  tech: {
    title: 'Tech Marquee',
    description: 'Technologies shown in the scrolling strip.',
    type: 'strings',
    addLabel: 'Add technology',
  },

  design: {
    title: 'Design System',
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
      text('logoText', 'Logo text', { hint: 'The gradient part is drawn from the final "."' }),
      number('radius', 'Corner radius (px)', { min: 4, max: 32 }),
    ],
  },
};

export function getSectionMeta(key) {
  return sectionNav.find((s) => s.key === key);
}
