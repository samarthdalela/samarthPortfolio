// All portfolio content lives here — edit this file to update the site.

export const profile = {
  name: 'Samarth Dalela',
  initials: 'SD',
  role: 'Software Developer',
  tagline: 'Full-Stack (MERN / PERN) & Microservices',
  roles: [
    'Full-Stack Developer',
    'MERN / PERN Engineer',
    'Microservices & Kafka',
    'PWA Builder',
    'DevOps & Hosting',
    'OWASP Security Auditor',
  ],
  location: 'New Delhi, India',
  email: 'samarthdalela@gmail.com',
  phone: '+91-7898618596',
  resume: '/Samarth_Dalela_Resume.pdf',
  summary:
    'Software Developer with 2 years of experience at NIELIT HQ, Delhi, building full-stack web applications, microservices with Apache Kafka, a PostgreSQL-based ticketing system, a CMS, an AI chatbot, payment-enabled conference websites and installable PWA apps.',
  about: [
    'I build production systems end to end — from the PostgreSQL schema and the Express API to the React dashboard, the Nginx server block and the CI/CD pipeline that ships it.',
    'At NIELIT HQ I have shipped 15+ projects: an AI chatbot for the main website, a custom Node.js + MySQL CMS, a task management system, a Kafka-backed microservice architecture, payment-enabled conference sites and a ticketing system. I also run the servers they live on and audit them against the OWASP Top 10.',
    'I care about software that stays up, stays fast and stays secure — and I enjoy the problem-solving it takes to get there.',
  ],
}

export const stats = [
  { value: 2, suffix: '+', label: 'Years at NIELIT HQ' },
  { value: 18, suffix: '+', label: 'Projects shipped' },
  { value: 4, suffix: '', label: 'OWASP Top 10 audits' },
  { value: 87.9, suffix: '%', label: 'B.Tech (CSE, Hons)', decimals: 1 },
]

export const skills = [
  { group: 'Frontend', icon: 'layout', items: ['React.js', 'Vite', 'PWA', 'HTML5', 'CSS3', 'Bootstrap', 'EJS'] },
  { group: 'Backend', icon: 'server', items: ['Node.js', 'Express.js', 'PHP', 'REST APIs'] },
  {
    group: 'Databases',
    icon: 'database',
    items: ['MySQL (query & index tuning)', 'PostgreSQL', 'MongoDB', 'Prisma ORM', 'Redis (caching)'],
  },
  {
    group: 'Architecture',
    icon: 'network',
    items: ['Microservices', 'Apache Kafka', 'Event streaming', 'Message buffering'],
  },
  {
    group: 'DevOps & Hosting',
    icon: 'cloud',
    items: ['CI/CD pipelines', 'Nginx', 'Windows Server', 'PM2', 'NSSM', 'Vercel', 'SSL/TLS'],
  },
  {
    group: 'Security',
    icon: 'shield',
    items: ['OWASP Top 10 audits', 'JWT', 'Input validation', 'Secure headers', 'Rate limiting'],
  },
  { group: 'Testing', icon: 'gauge', items: ['Postman', 'k6 load & stress testing'] },
  {
    group: 'Languages & Tools',
    icon: 'code',
    items: ['JavaScript', 'Python', 'C++', 'C# (learning)', 'ASP.NET', 'Git', 'GitHub'],
  },
  {
    group: 'Other',
    icon: 'puzzle',
    items: ['Progressive Web Apps', 'Service Workers', 'Web Notifications', 'IndexedDB', 'Chrome Extensions', 'Moodle LMS', 'WordPress', 'Nodemailer / SMTP', 'Python web scraping'],
  },
]

// Categories used by the project filter.
export const categories = ['All', 'PWA', 'AI', 'Full-Stack', 'Backend & Architecture', 'DevOps', 'Security', 'Web & CMS']

export const projects = [
  {
    title: 'NIELIT Main Website Chatbot',
    stack: ['Node.js', 'Express', 'React', 'MySQL'],
    categories: ['AI', 'Full-Stack'],
    featured: true,
    links: [{ label: 'nielit.gov.in', url: 'https://www.nielit.gov.in/' }],
    summary: 'AI-powered chatbot answering queries about NIELIT courses, admissions and services.',
    points: [
      'Designed and developed an AI-powered chatbot integrated into the NIELIT main website',
      'Node.js + Express backend with a REST API architecture, backed by MySQL',
      'Natural language understanding for questions on courses, admissions and services',
      'Chat widget built in React for seamless user interaction',
    ],
  },
  {
    title: 'Content Management System',
    stack: ['Node.js', 'Express', 'React', 'MySQL', 'PM2', 'Windows Server'],
    categories: ['Full-Stack', 'Security', 'DevOps', 'Web & CMS'],
    featured: true,
    links: [{ label: 'nielit.gov.in', url: 'https://www.nielit.gov.in/' }],
    summary: 'Custom Node.js + MySQL CMS with role-based access that runs the NIELIT main website content.',
    points: [
      'Manages website content, news, events and announcements with role-based access control',
      'MySQL database with a relational schema for pages, media, users and roles',
      'CRUD operations, media management and dynamic page generation',
      'Admin dashboard so non-technical staff can manage content without code',
      'Hosted on Windows Server 2025 with PM2 for production stability and auto-restart',
      'OWASP Top 10 audit: fixed SQLi, XSS, CSRF, broken access control and more; added input sanitization, JWT hardening, rate limiting and secure headers',
    ],
  },
  {
    title: 'Website Monitor — Server Uptime PWA',
    stack: ['React', 'Vite', 'PWA', 'Service Worker', 'Notifications'],
    categories: ['PWA', 'DevOps'],
    featured: true,
    links: [{ label: 'monitorwebsite.netlify.app', url: 'https://monitorwebsite.netlify.app/' }],
    summary: 'Installable mobile app that checks whether your servers and websites are up and alerts you when one goes down.',
    points: [
      'Progressive Web App that installs on a phone home screen and runs standalone like a native app',
      'Monitors multiple servers and websites, showing up / down status for each at a glance',
      'Runs periodic checks and sends a notification as soon as a site goes down',
      'Service worker for offline app shell; monitored sites saved on the device',
      'Built with React + Vite and deployed on Netlify',
    ],
  },
  {
    title: 'Special Dates — Birthday & Reminder PWA',
    stack: ['React', 'Vite', 'PWA', 'IndexedDB', 'Notifications'],
    categories: ['PWA'],
    featured: true,
    links: [{ label: 'impreminder.netlify.app', url: 'https://impreminder.netlify.app/' }],
    summary: 'Never miss a birthday, anniversary or special day for the people in your circles.',
    points: [
      'Installable PWA to save birthdays, anniversaries and other special dates, grouped by circles',
      'Reminder notifications so important days are never forgotten',
      'Data stored on the device with IndexedDB; works offline via a service worker (vite-plugin-pwa)',
      'Built with React + Vite and deployed on Netlify',
    ],
  },
  {
    title: 'Microservice Architecture with Apache Kafka',
    stack: ['Node.js', 'Kafka', 'Microservices'],
    categories: ['Backend & Architecture'],
    featured: true,
    summary: 'Event-driven architecture splitting NIELIT applications into independently deployable services.',
    points: [
      'Split NIELIT applications into independently deployable units',
      'Apache Kafka as the message broker for asynchronous, event-driven communication',
      'Kafka topics as a buffer to decouple producers and consumers, absorb traffic spikes and prevent message loss when a service is down',
    ],
  },
  {
    title: 'Ticketing System',
    stack: ['PostgreSQL', 'Express', 'React', 'Node.js'],
    categories: ['Full-Stack'],
    featured: true,
    summary: 'PERN ticketing platform with assignment, priority and resolution workflow.',
    points: [
      'Ticket creation, assignment, priority, status tracking and resolution workflow',
      'Designed the PostgreSQL schema and REST APIs in Node.js/Express',
      'React dashboard with role-based access',
    ],
  },
  {
    title: 'NIELIT Task Management System',
    stack: ['Node.js', 'Express', 'React', 'MySQL'],
    categories: ['Full-Stack'],
    summary: 'Task management system built for NIELIT teams to plan, assign and track work.',
    points: [
      'Create tasks, assign them to team members and track their progress to completion',
      'Node.js + Express REST API with a MySQL database',
      'React interface for managing and monitoring tasks',
    ],
  },
  {
    title: 'AI-Powered Automated PPT Generation',
    org: 'M37Labs',
    stack: ['AI', 'Automation'],
    categories: ['AI'],
    internal: 'Client project',
    summary: 'Software that turns user input into structured, ready-to-use PowerPoint decks.',
    points: [
      'Part-time consultant on software that automatically generates PowerPoint presentations using AI',
      'Contributed to turning user input into structured, ready-to-use slide decks, reducing manual presentation effort',
    ],
  },
  {
    title: 'UPWIECON Conference Websites',
    stack: ['PHP', 'Nginx', 'EaseBuzz'],
    categories: ['Web & CMS', 'Security', 'DevOps'],
    links: [
      { label: 'UPWIECON 2026', url: 'https://nielit.ac.in/upwiecon2026/' },
      { label: 'UPWIECON 2025', url: 'https://nielit.ac.in/upwiecon2025/' },
    ],
    summary: 'Official sites for UPWIECON 2025 & 2026 with online payments.',
    points: [
      'Paper submission, schedule, speakers, registration and committee pages',
      'PHP backend for forms, email notifications and database management',
      'EaseBuzz payment gateway: initiation, success/failure callbacks and transaction verification',
      'Hosted on Nginx with PHP-FPM, virtual hosts, SSL/TLS and clean-URL rewriting',
      'OWASP Top 10 audit incl. SQLi, XSS, CSRF and IDOR; prepared statements, output encoding and secure headers',
    ],
  },
  {
    title: 'NICEDT Conference Website',
    stack: ['WordPress', 'BillDesk'],
    categories: ['Web & CMS', 'Security'],
    links: [{ label: 'nicedt.org', url: 'https://nicedt.org/' }],
    summary: 'WordPress site for the International Conference on Emerging & Disruptive Technologies.',
    points: [
      'Customized WordPress themes and plugins for conference requirements',
      'BillDesk payment gateway with API credentials, webhook handlers and transaction verification',
      'OWASP Top 10 audit; hardened configuration, file permissions and HTTP headers',
      'SEO, security plugins and performance optimization for production',
    ],
  },
  {
    title: 'Moodle LMS',
    stack: ['Moodle', 'PHP'],
    categories: ['Web & CMS'],
    summary: "Customized Moodle deployment for NIELIT's online training programs.",
    points: [
      'Configured, customized and deployed Moodle LMS for e-learning programs',
      'Custom Moodle plugins and themes matching institutional branding',
      'Course creation, enrollment, assessment modules and reporting',
      "Integrated with NIELIT's internal systems for seamless data flow",
    ],
  },
  {
    title: 'Server, Hosting & Deployment',
    stack: ['Windows Server', 'NSSM', 'Nginx', 'Vercel', 'CI/CD'],
    categories: ['DevOps'],
    summary: 'Runs the servers and pipelines behind NIELIT applications.',
    points: [
      'Windows Server 2025, Nginx with PHP-FPM, virtual hosts, SSL/TLS and HTTPS',
      'NSSM to run Node.js apps as Windows services that start on boot and auto-restart',
      'CI/CD pipelines for automated build and deployment',
      'Frontend deployments on Vercel with environment configuration',
    ],
  },
  {
    title: 'Database & Caching Optimization',
    stack: ['MySQL', 'Redis'],
    categories: ['Backend & Architecture'],
    summary: 'Faster queries and lower database load through indexing and caching.',
    points: [
      'Optimized MySQL through indexing, query tuning and slow-query analysis',
      'Redis caching for hot data with TTL policies to cut database load and response times',
    ],
  },
  {
    title: 'API Testing & Load Testing',
    stack: ['k6', 'Postman'],
    categories: ['Backend & Architecture'],
    summary: 'Verifying API correctness and stability under load before release.',
    points: [
      'Postman collections, environments and test scripts for responses, status codes and auth',
      'k6 load and stress tests simulating concurrent virtual users',
      'Used results to find bottlenecks before production releases',
    ],
  },
  {
    title: 'NIC SMTP Relay Email Integration',
    stack: ['Node.js', 'Nodemailer', 'SMTP'],
    categories: ['Backend & Architecture'],
    summary: "Government mail and OTP delivery through NIC's SMTP relays.",
    points: [
      'Integrated NIC SMTP mail and OTP relays via Nodemailer with STARTTLS and authenticated login',
      'Diagnosed auth and sender-whitelisting issues with NIC Relay Support; verified delivery end to end',
    ],
  },
  {
    title: 'Auto-Translation Chrome Extension',
    stack: ['JavaScript', 'Chrome Extension'],
    categories: ['Web & CMS'],
    summary: 'Speeds up multilingual publishing in the NIELIT CMS.',
    points: ['Chrome extension for automatic translation, integrated with the NIELIT CMS'],
  },
  {
    title: 'Tender Scraper & CMS Auto-Uploader',
    stack: ['Python', 'BeautifulSoup', 'REST API'],
    categories: ['Backend & Architecture'],
    summary: 'Automates tender publishing from the NIELIT website to the CMS.',
    points: ['Scrapes tender notices and documents and uploads them to the CMS through its API'],
  },
  {
    title: 'BCAS Website Maintenance',
    stack: ['ASP.NET', 'C#', 'JavaScript'],
    categories: ['Web & CMS'],
    links: [{ label: 'bcas.nielit.gov.in', url: 'https://bcas.nielit.gov.in/' }],
    summary: 'Frontend and backend upkeep for a .NET website.',
    points: [
      'Frontend updates, UI fixes and content changes',
      'Worked in the C# codebase while learning C# and ASP.NET',
    ],
  },
]

export const experience = [
  {
    title: 'Software Developer',
    org: 'National Institute of Electronics and Information Technology (NIELIT HQ)',
    place: 'New Delhi',
    duration: '2 Years',
    highlights: [
      'Shipped an AI chatbot, CMS and task management system on Node.js + MySQL, a PERN ticketing system and Kafka-based microservices',
      'Integrated EaseBuzz and BillDesk payment gateways for conference registrations',
      'Managed Windows Server, Nginx, PM2, NSSM and Vercel hosting with CI/CD pipelines',
      'Ran OWASP Top 10 audits and remediation across Node, PHP and WordPress apps',
      'Tuned MySQL queries and Redis caching; load-tested APIs with k6',
    ],
  },
  {
    title: 'Consultant (Part-time)',
    org: 'M37Labs',
    place: 'AI-Powered Automated PPT Generation Software',
    duration: '2 Months',
    highlights: [
      'Worked on software that automatically generates PowerPoint presentations using AI',
      'Helped turn user input into structured, ready-to-use slide decks, reducing manual presentation effort',
    ],
  },
]

export const education = [
  {
    degree: 'B.Tech (CSE, Hons)',
    school: 'Maharana Pratap College of Technology, Gwalior',
    board: 'Rajiv Gandhi Proudyogiki Vishwavidyalaya',
    year: '2024',
    score: '87.9%',
  },
  { degree: 'Class XII', school: 'Kendriya Vidyalaya No.1, Gwalior', board: 'CBSE', year: '2020', score: '87%' },
  { degree: 'Class X', school: 'Kendriya Vidyalaya No.1, Gwalior', board: 'CBSE', year: '2018', score: '88%' },
]

export const achievements = [
  { title: 'First Position', detail: 'B.Tech', year: '2024' },
  { title: 'B.Tech Honours Degree', detail: 'Computer Science & Engineering', year: '2024' },
]

export const internships = [
  { name: 'MERN', org: 'NIELIT' },
  { name: 'Data Science', org: 'NIELIT' },
  { name: 'AICTE MERN', org: 'Shripriti Educational & IT Hub' },
  { name: 'Web Development', org: 'AD Infocom System, Pune' },
  { name: 'Web Development', org: 'BreachCurls, Gwalior' },
  { name: 'AICTE Cyber Security', org: 'IBM (Edunet Foundation)' },
]

export const certifications = [
  { name: 'MERN Full Stack', org: 'NIELIT' },
  { name: 'Data Analysis using Python', org: 'NIELIT' },
  { name: 'MERN Full Stack', org: 'Udemy' },
  { name: 'C++', org: 'Skill India (2020–21)' },
  { name: 'Python', org: 'Udemy' },
  { name: 'HTML5', org: 'Udemy' },
]

export const academicProjects = [
  'AskMe Web App (MERN)',
  'Virtual Personal Assistant (Python, NLP)',
  'Desktop Manager (C++)',
  'Resume Builder & QR Code Generator',
  'Educational websites for Shripriti & Coding Guruji',
  'RedCliff Hotel & Gym websites',
  'Rock Paper Scissors (Python)',
  'RGPV News Website (HTML5)',
]

export const interests = ['Travelling', 'Meeting new people', 'Photography', 'Animation', 'Painting', 'Reading & Writing']
