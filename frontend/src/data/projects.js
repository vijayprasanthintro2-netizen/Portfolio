// Only real projects with verified URLs.
// VijayCart is the featured project; Weather App is the second real project.
export const projects = [
  {
    id: 'vijaycart',
    name: 'VijayCart',
    role: 'MERN Stack E-Commerce Platform',
    featured: true,
    short: 'A full-stack MERN e-commerce platform with 30+ products, authentication, product search, filtering, sorting, pagination, shopping cart and admin functionality.',
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
    demo: null, // No confirmed live URL for the Weather App — kept honest.
  },
];

export const resumeNote =
  'Add a resume file to frontend/public and set profile.resume in src/config.js to enable the download button.';
