// Default content for every editable section, mirroring the frontend's
// static config/data files. Icons are intentionally excluded — the React
// components map icon keys to lucide icons in code.

export const defaultContent = {
  profile: {
    name: 'VIJAYPRASANTH S',
    shortName: 'Vijayprasanth',
    role: 'MERN Stack Developer',
    headline: 'I build modern, responsive and user-focused web applications using the MERN stack.',
    intro:
      'Passionate BCA student and aspiring MERN Stack Developer with practical experience building full-stack web applications using React.js, Node.js, Express.js and MongoDB.',
    about: [
      'I am a passionate BCA student and aspiring MERN Stack Developer with hands-on experience building full-stack web applications. I enjoy creating responsive interfaces, developing REST APIs and working with MongoDB to build complete web solutions.',
      'My focus is on the MERN stack — React.js for interfaces, Node.js and Express.js for APIs, and MongoDB for data. I also practice authentication, CRUD operations and responsive design in every project I build.',
      'I am currently completing a one-month internship as a MERN Stack Development Intern at Imaginative Technology Pvt Ltd, and I keep learning by building real applications.',
    ],
    location: 'Tiruchengode, Tamil Nadu, India',
    availability: 'Open to internships and opportunities',
    resume: '/Vijayprasanth-Resume.pdf',
    education: {
      degree: 'Bachelor of Computer Applications (BCA)',
      short: 'BCA',
      institution: 'K.S. Rangasamy College of Arts and Science',
      location: 'Tiruchengode, Tamil Nadu, India',
      years: '2024 – 2027',
      status: 'Currently pursuing 3rd year',
      cgpa: 7.1,
    },
    internship: {
      role: 'MERN Stack Development Intern',
      company: 'Imaginative Technology Pvt Ltd',
      period: '01/2026 – 02/2026',
      duration: '1 month',
      tags: ['MongoDB', 'Express.js', 'REST APIs', 'API Integration'],
      points: [
        'Completed a one-month internship in Full Stack Development.',
        'Worked with MongoDB database management and API integration.',
        'Built and tested RESTful API endpoints using Express.js.',
        'Integrated REST APIs with MongoDB.',
        'Successfully completed assigned tasks within project timelines.',
      ],
    },
  },

  socials: {
    email: 'vijayprasanth242@gmail.com',
    phone: '+918220477466',
    phoneDisplay: '+91 82204 77466',
    github: 'https://github.com/vijayprasanthintro',
    githubUser: 'vijayprasanthintro',
    linkedin: 'https://www.linkedin.com/in/vijayprasanth-s-b0343431b',
    website: '',
  },

  nav: [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'contact', label: 'Contact' },
  ],

  skills: [
    {
      id: 'frontend',
      title: 'Frontend',
      description: 'Building responsive, accessible and modern user interfaces.',
      skills: [
        { name: 'HTML', desc: 'Semantic document structure', level: 5 },
        { name: 'CSS', desc: 'Modern layouts and styling', level: 4 },
        { name: 'JavaScript', desc: 'Interactivity and logic', level: 4 },
        { name: 'React.js', desc: 'Component-based UI library', level: 4 },
      ],
    },
    {
      id: 'backend',
      title: 'Backend',
      description: 'Designing APIs and server logic that power real applications.',
      skills: [
        { name: 'Node.js', desc: 'JavaScript runtime for servers', level: 4 },
        { name: 'Express.js', desc: 'Web framework for Node.js', level: 4 },
        { name: 'REST APIs', desc: 'Designing HTTP endpoints', level: 4 },
        { name: 'JWT Auth', desc: 'Secure stateless authentication', level: 3 },
      ],
    },
    {
      id: 'database',
      title: 'Database',
      description: 'Modeling and persisting data with NoSQL document stores.',
      skills: [
        { name: 'MongoDB', desc: 'NoSQL document database', level: 4 },
        { name: 'Mongoose', desc: 'MongoDB ODM for Node.js', level: 4 },
      ],
    },
    {
      id: 'programming',
      title: 'Programming',
      description: 'Core languages for logic and problem solving.',
      skills: [
        { name: 'Python', desc: 'Basics — scripting and logic', level: 3 },
        { name: 'Java', desc: 'Basics — OOP fundamentals', level: 3 },
      ],
    },
    {
      id: 'tools',
      title: 'Tools',
      description: 'The workflow and tools I use every day.',
      skills: [
        { name: 'Git', desc: 'Distributed version control', level: 4 },
        { name: 'GitHub', desc: 'Code hosting and collaboration', level: 4 },
        { name: 'VS Code', desc: 'My primary code editor', level: 5 },
        { name: 'Postman', desc: 'API testing client', level: 4 },
        { name: 'npm', desc: 'Node package manager', level: 4 },
      ],
    },
    {
      id: 'concepts',
      title: 'Concepts',
      description: 'Patterns I apply across the full stack.',
      skills: [
        { name: 'CRUD', desc: 'Create, read, update, delete', level: 4 },
        { name: 'Auth', desc: 'Secure user access', level: 4 },
        { name: 'Pagination', desc: 'Efficient data browsing', level: 3 },
        { name: 'Responsive', desc: 'Works on every screen', level: 5 },
      ],
    },
  ],

  projects: [
    {
      id: 'vijaycart',
      name: 'VijayCart',
      role: 'MERN Stack E-Commerce Platform',
      featured: true,
      short:
        'A full-stack MERN e-commerce platform with 30+ products, authentication, product search, filtering, sorting, pagination, shopping cart and admin functionality.',
      description:
        'VijayCart is a complete e-commerce web application built on the MERN stack. It includes product browsing with search, filtering, sorting and pagination, a shopping cart, user authentication with JWT, and an admin dashboard for managing products and orders.',
      stack: ['React.js', 'Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'JWT'],
      features: [
        'Full-stack MERN architecture',
        'Product browsing',
        'Product search',
        'Product filtering',
        'Product sorting',
        'Pagination',
        'Shopping cart',
        'User authentication',
        'JWT authentication',
        'REST APIs',
        'MongoDB database',
        'Mongoose',
        'Responsive design',
        'Admin dashboard',
        'Product management',
        'Order management',
      ],
      challenges: [
        'Implementing JWT-based authentication and protecting routes on both the client and the server.',
        'Making search, filtering and sorting work together without slowing down the UI.',
        'Designing Mongoose schemas that model products, users, orders and the shopping cart cleanly.',
      ],
      learned: [
        'How the MERN stack connects — React components talking to REST endpoints backed by MongoDB.',
        'Planning an admin dashboard for product and order management.',
        'Managing authentication state and shipping a responsive storefront.',
      ],
      image: '/projects/vijaycart-preview.svg',
      alt: 'UI concept preview of the VijayCart e-commerce storefront',
      github: 'https://github.com/vijayprasanthintro/vijaycart',
      demo: 'https://vijaycart-snowy.vercel.app',
    },
    {
      id: 'weather-app',
      name: 'Weather App',
      role: 'Weather Application',
      featured: false,
      short: 'A responsive weather application that provides weather information based on the searched city.',
      description:
        'A responsive weather application that fetches live weather data from a weather API based on the searched city and presents temperature and weather conditions through a clean, user-friendly interface.',
      stack: ['HTML', 'CSS', 'JavaScript', 'Weather API'],
      features: [
        'Search weather by city',
        'Temperature information',
        'Weather conditions',
        'API-based weather data',
        'Responsive design',
        'Clean user interface',
      ],
      challenges: [
        'Handling asynchronous API calls with clean loading and error states.',
        'Formatting live weather data and keeping the layout stable across screen sizes.',
      ],
      learned: [
        'Working with third-party APIs and asynchronous JavaScript.',
        'Building a polished single-page interface around live data.',
      ],
      image: '/projects/weather-app-preview.svg',
      alt: 'UI concept preview of the Weather App interface',
      github: 'https://github.com/vijayprasanthintro/weather',
      demo: '',
    },
  ],

  journey: [
    {
      id: 'bca',
      title: 'BCA Student',
      text: 'Started my Bachelor of Computer Applications at K.S. Rangasamy College of Arts and Science, Tiruchengode — my formal foundation in computer science.',
    },
    {
      id: 'html-css',
      title: 'HTML & CSS',
      text: 'Learned the building blocks of the web — structure with HTML and styling with CSS — and shaped my first layouts.',
    },
    {
      id: 'javascript',
      title: 'JavaScript',
      text: 'Added interactivity with JavaScript — logic, events and DOM manipulation — the language that powers modern web apps.',
    },
    {
      id: 'react',
      title: 'React.js',
      text: 'Learned to build component-based, reusable and state-driven user interfaces with React.js.',
    },
    {
      id: 'node',
      title: 'Node.js',
      text: 'Moved to the server side and learned to run JavaScript outside the browser with Node.js.',
    },
    {
      id: 'express',
      title: 'Express.js',
      text: 'Built REST APIs and server logic with Express.js — routes, middleware and request handling.',
    },
    {
      id: 'mongodb',
      title: 'MongoDB',
      text: 'Learned NoSQL data modeling with MongoDB and Mongoose to store and query application data.',
    },
    {
      id: 'mern-projects',
      title: 'MERN Projects',
      text: 'Connected the full stack and built real applications — including VijayCart, a complete MERN e-commerce platform.',
    },
    {
      id: 'internship',
      title: 'Internship',
      text: 'Completed a one-month MERN Stack Development internship at Imaginative Technology Pvt Ltd working with MongoDB, REST APIs and Express.js.',
    },
    {
      id: 'goal',
      title: 'MERN Stack Developer',
      text: 'Now focused on growing as a full-stack developer — building, learning and shipping every day.',
    },
  ],

  tech: [
    'React.js',
    'Node.js',
    'Express.js',
    'MongoDB',
    'JavaScript',
    'HTML5',
    'CSS3',
    'GitHub',
    'Mongoose',
    'REST APIs',
    'JWT Auth',
    'Git',
    'VS Code',
    'Postman',
  ],

  build: [
    {
      id: 'responsive',
      icon: 'monitor',
      title: 'Responsive Web Applications',
      desc: 'Websites and interfaces that adapt cleanly from mobile to desktop — fast, accessible and easy to use.',
    },
    {
      id: 'mern',
      icon: 'layers',
      title: 'MERN Stack Applications',
      desc: 'Complete full-stack products using React, Node.js, Express and MongoDB — from interface to database.',
    },
    {
      id: 'api',
      icon: 'plug',
      title: 'REST API Development',
      desc: 'Clean, tested RESTful endpoints with validation, error handling and secure authentication.',
    },
    {
      id: 'ecommerce',
      icon: 'cart',
      title: 'E-Commerce Applications',
      desc: 'Storefronts with product catalogs, search, cart, authentication and admin management.',
    },
  ],

  mern: [
    { id: 'react', name: 'React.js', role: 'Frontend', desc: 'Interactive user interfaces', color: '#61dafb' },
    { id: 'node', name: 'Node.js', role: 'Runtime', desc: 'JavaScript on the server', color: '#3b82f6' },
    { id: 'express', name: 'Express.js', role: 'Framework', desc: 'REST APIs & routing', color: '#a8b3cf' },
    { id: 'mongo', name: 'MongoDB', role: 'Database', desc: 'Flexible document storage', color: '#68a063' },
  ],

  about: {
    headline: [
      { text: 'I build scalable web' },
      { text: 'experiences with' },
      { text: 'modern technologies.', gradient: true },
    ],
    sub: 'My path from learning the web to building complete MERN applications.',
    cards: [
      { icon: 'graduation', title: 'BCA Student', text: 'Pursuing my Bachelor of Computer Applications at K.S. Rangasamy College of Arts and Science, Tiruchengode.' },
      { icon: 'code', title: 'Frontend Developer', text: 'Building responsive interfaces with HTML, CSS, JavaScript and React.js.' },
      { icon: 'server', title: 'Backend Developer', text: 'Developing REST APIs and server logic with Node.js and Express.js, backed by MongoDB.' },
      { icon: 'sparkles', title: 'Continuous Learner', text: 'Always improving my skills and exploring better ways to design, code and ship.' },
    ],
    stats: [
      { value: '2+', label: 'Real Projects' },
      { value: '1', label: 'Internship' },
      { value: 'MERN', label: 'Stack' },
      { value: 'All', label: 'Responsive Web Apps' },
    ],
  },

  design: {
    accent: '#3b82f6',
    accent2: '#38bdf8',
    accent3: '#34d399',
    gradientFrom: '#2563eb',
    gradientMid: '#3b82f6',
    gradientTo: '#38bdf8',
    fontDisplay: "'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontBody: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontMono: "'JetBrains Mono', 'SF Mono', 'Cascadia Code', Consolas, monospace",
    logoText: 'vijay.',
    radius: 16,
  },
};

export const sectionKeys = Object.keys(defaultContent);
