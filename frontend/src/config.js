// Central place for personal details and external links.
// Only real information — no invented URLs, roles or statistics.

export const profile = {
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
  // profile photo for the hero — '' means no photo yet,
  // or upload one from Admin > Profile (it's stored in MongoDB)
  image: '',
  // Set this to a file placed in frontend/public (e.g. '/Vijayprasanth-Resume.pdf')
  // to enable the "Download Resume" button in the hero.
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
    points: [
      'Completed a one-month internship in Full Stack Development.',
      'Worked with MongoDB database management and API integration.',
      'Built and tested RESTful API endpoints using Express.js.',
      'Integrated REST APIs with MongoDB.',
      'Successfully completed assigned tasks within project timelines.',
    ],
  },
};

export const socials = {
  email: 'vijayprasanth242@gmail.com',
  phone: '+918220477466',
  phoneDisplay: '+91 82204 77466',
  github: 'https://github.com/vijayprasanthintro',
  githubUser: 'vijayprasanthintro',
  linkedin: 'https://www.linkedin.com/in/vijayprasanth-s-b0343431b',
  website: '', // Set to your deployed portfolio URL when available
};

export const navLinks = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
];

export const api = {
  // In development the Vite proxy forwards /api to http://localhost:5000,
  // so no base URL is needed. Override with VITE_API_URL if you deploy separately.
  baseUrl: import.meta.env.VITE_API_URL || '/api',
};
