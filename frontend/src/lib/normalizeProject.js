// Safely turns packed CMS strings into individual list items.
//
// Older admin saves stored technologies and features as one concatenated
// string. The deployed records still use that shape for three projects. We
// split only on phrases that already exist in the portfolio content — no text
// is rewritten, added, or removed. Unknown strings are left intact rather than
// guessed.

const TECH_OPTIONS = [
  'React 18',
  'Redux Toolkit',
  'React Router',
  'JWT Authentication',
  'Google OAuth',
  'Stripe Payments',
  'REST APIs',
  'AI API Integration',
  'React.js',
  'Node.js',
  'Express.js',
  'MongoDB',
  'Mongoose',
  'JavaScript',
  'Bootstrap',
  'Axios',
  'HTML',
  'CSS',
  'Weather API',
];

const FEATURE_OPTIONS = [
  'AI-powered codebase understanding',
  'Entire project analysis',
  'Repository exploration',
  'Source code analysis',
  'Natural-language code queries',
  'AI-generated code explanations',
  'Project structure understanding',
  'Context-aware AI responses',
  'Backend REST APIs',
  'Responsive user interface',
  'Customer shopping interface',
  'Advanced product filtering',
  'Shopping cart management',
  'Buy Now functionality',
  'Address management',
  'MongoDB database',
  'Responsive design',
  'Admin dashboard',
  'Product management',
  'Product browsing',
  'Product search',
  'Product sorting',
  'Order management',
  'Pagination',
  'Mongoose',
  'REST APIs',
  'AI integration',
  'Developer dashboard',
  'Centralized admin dashboard',
  'Poultry set management',
  'Bird inventory management',
  'Total and live hen tracking',
  'Daily mortality management',
  'Per-set mortality tracking',
  'Daily egg production tracking',
  'Daily egg production',
  'Single and double egg tracking',
  'Broken egg management',
  'Egg stock management',
  'Egg price management',
  'Feed inventory management',
  'Feed management',
  'Daily feed usage tracking',
  'Farm expense management',
  'Labour expense tracking',
  'Labour management',
  'Customer management',
  'Local egg sales',
  'Wholesale sales management',
  'Customer payment tracking',
  'Pending payment monitoring',
  'Financial reports and analytics',
  'Revenue and profit summaries',
  'Profile and system settings',
  'Multi-language interface',
  'Responsive admin dashboard',
  'Audit logs',
];

const TECH_TOKENS = [...TECH_OPTIONS].sort((a, b) => b.length - a.length);
const FEATURE_TOKENS = [...FEATURE_OPTIONS].sort((a, b) => b.length - a.length);

function splitWithDictionary(value, tokens) {
  const text = String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return [];

  const items = [];
  let position = 0;

  while (position < text.length) {
    if (text[position] === ' ') {
      position += 1;
      continue;
    }

    const match = tokens.find((token) => text.startsWith(token, position));
    if (!match) {
      // Never invent a boundary. Keep the untouched remainder as one item.
      items.push(text.slice(position));
      break;
    }
    items.push(match);
    position += match.length;
  }

  return items;
}

function splitSentences(value) {
  return String(value || '')
    .trim()
    .split(/(?<=\.)\s+(?=[A-Z])/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeItems(value, splitter) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) {
    return value.flatMap((item) => (typeof item === 'string' ? splitter(item) : [item]));
  }
  if (typeof value === 'string') return splitter(value);
  return value;
}

export function normalizeProject(project) {
  if (!project || typeof project !== 'object') return project;
  return {
    ...project,
    stack: normalizeItems(project.stack, (value) => splitWithDictionary(value, TECH_TOKENS)),
    tools: normalizeItems(project.tools, (value) => splitWithDictionary(value, TECH_TOKENS)),
    features: normalizeItems(project.features, (value) => splitWithDictionary(value, FEATURE_TOKENS)),
    additionalFeatures: normalizeItems(project.additionalFeatures, (value) =>
      splitWithDictionary(value, FEATURE_TOKENS)
    ),
    challenges: normalizeItems(project.challenges, splitSentences),
    learned: normalizeItems(project.learned, splitSentences),
  };
}

export function normalizeProjects(value) {
  if (Array.isArray(value)) return value.map(normalizeProject);
  if (!value || typeof value !== 'object') return value;

  // Legacy numeric-key maps.
  const keys = Object.keys(value);
  if (keys.length && keys.every((key) => /^\d+$/.test(key))) {
    return keys.sort((a, b) => Number(a) - Number(b)).map((key) => normalizeProject(value[key]));
  }
  return value;
}
