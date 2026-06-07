import { v4 as uuidv4 } from 'uuid';

// ─── Users ────────────────────────────────────────────────────────────────────
export const USERS = [
  { id: 'u1', name: 'Alice Admin',    email: 'alice@portal.io',   role: 't-1', avatar: 'AA' },
  { id: 'u2', name: 'Bob Recruiter',  email: 'bob@portal.io',     role: 't-2', avatar: 'BR' },
  { id: 'u3', name: 'Carol Recruiter',email: 'carol@portal.io',   role: 't-2', avatar: 'CR' },
  { id: 'u4', name: 'Dave Client',    email: 'dave@client.com',   role: 't-3', avatar: 'DC' },
  { id: 'u5', name: 'Eve Client',     email: 'eve@client.com',    role: 't-3', avatar: 'EC' },
];

// ─── Skill Ecosystem Map (for semantic scoring) ───────────────────────────────
export const SKILL_ECOSYSTEM = {
  // Frontend
  'React':       { related: ['Next.js', 'Redux', 'React Native', 'TypeScript', 'JavaScript', 'Vue', 'Angular'], weight: 1.0 },
  'Next.js':     { related: ['React', 'TypeScript', 'JavaScript', 'Vercel'], weight: 0.9 },
  'Vue':         { related: ['Nuxt.js', 'JavaScript', 'TypeScript', 'React'], weight: 0.8 },
  'Angular':     { related: ['TypeScript', 'RxJS', 'JavaScript', 'React'], weight: 0.8 },
  'TypeScript':  { related: ['JavaScript', 'React', 'Node.js', 'Angular'], weight: 0.85 },
  'JavaScript':  { related: ['TypeScript', 'React', 'Vue', 'Node.js'], weight: 0.8 },
  'Redux':       { related: ['React', 'Zustand', 'MobX', 'TypeScript'], weight: 0.75 },
  'Tailwind CSS':{ related: ['CSS', 'SCSS', 'Bootstrap', 'HTML'], weight: 0.85 },
  // Backend
  'Node.js':     { related: ['Express', 'NestJS', 'JavaScript', 'TypeScript', 'Fastify'], weight: 1.0 },
  'Express':     { related: ['Node.js', 'Fastify', 'NestJS', 'JavaScript'], weight: 0.85 },
  'NestJS':      { related: ['Node.js', 'TypeScript', 'Express'], weight: 0.9 },
  'Python':      { related: ['Django', 'FastAPI', 'Flask', 'Machine Learning', 'Data Science'], weight: 1.0 },
  'Django':      { related: ['Python', 'Flask', 'FastAPI', 'REST API'], weight: 0.9 },
  'FastAPI':     { related: ['Python', 'Django', 'Flask'], weight: 0.85 },
  'Java':        { related: ['Spring Boot', 'Kotlin', 'Maven', 'Gradle'], weight: 1.0 },
  'Spring Boot': { related: ['Java', 'Kotlin', 'Microservices', 'REST API'], weight: 0.9 },
  'Go':          { related: ['Microservices', 'Docker', 'Kubernetes', 'gRPC'], weight: 1.0 },
  // Database
  'PostgreSQL':  { related: ['MySQL', 'SQL', 'Supabase', 'Prisma', 'TypeORM'], weight: 1.0 },
  'MySQL':       { related: ['PostgreSQL', 'SQL', 'MariaDB'], weight: 0.9 },
  'MongoDB':     { related: ['NoSQL', 'Mongoose', 'Redis', 'DynamoDB'], weight: 1.0 },
  'Redis':       { related: ['MongoDB', 'Caching', 'Pub/Sub'], weight: 0.85 },
  // DevOps / Cloud
  'Docker':      { related: ['Kubernetes', 'CI/CD', 'DevOps', 'AWS', 'Linux'], weight: 1.0 },
  'Kubernetes':  { related: ['Docker', 'Helm', 'DevOps', 'AWS', 'GCP'], weight: 1.0 },
  'AWS':         { related: ['GCP', 'Azure', 'Cloud', 'Docker', 'Kubernetes', 'Terraform'], weight: 1.0 },
  'GCP':         { related: ['AWS', 'Azure', 'Cloud', 'Kubernetes'], weight: 0.9 },
  'Azure':       { related: ['AWS', 'GCP', 'Cloud', '.NET'], weight: 0.9 },
  'Terraform':   { related: ['AWS', 'GCP', 'Azure', 'DevOps', 'Ansible'], weight: 0.9 },
  // Data / ML
  'Machine Learning': { related: ['Python', 'TensorFlow', 'PyTorch', 'Data Science', 'AI'], weight: 1.0 },
  'TensorFlow':  { related: ['Machine Learning', 'Python', 'PyTorch', 'Keras'], weight: 0.9 },
  'PyTorch':     { related: ['Machine Learning', 'Python', 'TensorFlow'], weight: 0.9 },
  'Data Science':{ related: ['Python', 'Machine Learning', 'SQL', 'Pandas', 'NumPy'], weight: 0.9 },
};

// ─── Candidates ───────────────────────────────────────────────────────────────
export const INITIAL_CANDIDATES = [
  {
    id: uuidv4(),
    firstName: 'Priya', lastName: 'Sharma',
    email: 'priya.sharma@email.com', phone: '+1-555-0101',
    location: 'San Francisco, CA', noticePeriod: '2 weeks',
    currentRole: 'Senior Frontend Engineer', currentCompany: 'TechCorp Inc.',
    totalExperience: 6,
    skills: ['React', 'TypeScript', 'Next.js', 'Redux', 'Tailwind CSS', 'GraphQL', 'Jest'],
    education: [{ degree: 'B.Tech Computer Science', institution: 'IIT Delhi', year: 2018 }],
    workHistory: [
      { company: 'TechCorp Inc.', role: 'Senior Frontend Engineer', from: '2021', to: 'Present', description: 'Led frontend architecture for SaaS platform.' },
      { company: 'StartupXYZ', role: 'Frontend Developer', from: '2018', to: '2021', description: 'Built React-based dashboards.' },
    ],
    status: 'Active',
    addedBy: 'u2',
    sharedWith: ['u4'],
    scoreCache: {},
    notes: 'Strong React ecosystem expertise. Available immediately.',
    linkedIn: 'https://linkedin.com/in/priyasharma',
    createdAt: new Date('2025-03-10').toISOString(),
    updatedAt: new Date('2025-05-01').toISOString(),
  },
  {
    id: uuidv4(),
    firstName: 'Marcus', lastName: 'Johnson',
    email: 'marcus.j@email.com', phone: '+1-555-0202',
    location: 'Austin, TX', noticePeriod: '1 month',
    currentRole: 'Full Stack Developer', currentCompany: 'DataFlow Systems',
    totalExperience: 4,
    skills: ['Node.js', 'Express', 'React', 'PostgreSQL', 'Docker', 'AWS', 'TypeScript'],
    education: [{ degree: 'B.S. Software Engineering', institution: 'UT Austin', year: 2021 }],
    workHistory: [
      { company: 'DataFlow Systems', role: 'Full Stack Developer', from: '2022', to: 'Present', description: 'Microservices architecture on AWS.' },
      { company: 'Freelance', role: 'Web Developer', from: '2021', to: '2022', description: 'Various client projects.' },
    ],
    status: 'Active',
    addedBy: 'u2',
    sharedWith: [],
    scoreCache: {},
    notes: 'Solid full-stack profile. Open to remote.',
    linkedIn: 'https://linkedin.com/in/marcusjohnson',
    createdAt: new Date('2025-03-15').toISOString(),
    updatedAt: new Date('2025-04-20').toISOString(),
  },
  {
    id: uuidv4(),
    firstName: 'Aisha', lastName: 'Patel',
    email: 'aisha.patel@email.com', phone: '+1-555-0303',
    location: 'New York, NY', noticePeriod: 'Immediate',
    currentRole: 'Data Scientist', currentCompany: 'AnalyticsHub',
    totalExperience: 5,
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'SQL', 'Data Science', 'Pandas', 'NumPy', 'Scikit-learn'],
    education: [
      { degree: 'M.S. Data Science', institution: 'Columbia University', year: 2020 },
      { degree: 'B.S. Mathematics', institution: 'NYU', year: 2018 },
    ],
    workHistory: [
      { company: 'AnalyticsHub', role: 'Data Scientist', from: '2020', to: 'Present', description: 'ML model development for financial forecasting.' },
    ],
    status: 'Interviewing',
    addedBy: 'u3',
    sharedWith: ['u4', 'u5'],
    scoreCache: {},
    notes: 'Exceptional ML background. PhD-level research experience.',
    linkedIn: 'https://linkedin.com/in/aishapatel',
    createdAt: new Date('2025-04-01').toISOString(),
    updatedAt: new Date('2025-05-10').toISOString(),
  },
  {
    id: uuidv4(),
    firstName: 'Liam', lastName: 'O\'Brien',
    email: 'liam.obrien@email.com', phone: '+1-555-0404',
    location: 'Chicago, IL', noticePeriod: '3 months',
    currentRole: 'DevOps Engineer', currentCompany: 'CloudNative Co.',
    totalExperience: 7,
    skills: ['Kubernetes', 'Docker', 'Terraform', 'AWS', 'GCP', 'CI/CD', 'Ansible', 'Linux', 'Python'],
    education: [{ degree: 'B.S. Computer Science', institution: 'University of Illinois', year: 2018 }],
    workHistory: [
      { company: 'CloudNative Co.', role: 'Senior DevOps Engineer', from: '2020', to: 'Present', description: 'Managed multi-cloud Kubernetes clusters.' },
      { company: 'SysOps Ltd.', role: 'DevOps Engineer', from: '2018', to: '2020', description: 'CI/CD pipeline automation.' },
    ],
    status: 'Active',
    addedBy: 'u3',
    sharedWith: ['u5'],
    scoreCache: {},
    notes: 'CKA certified. Strong IaC background.',
    linkedIn: 'https://linkedin.com/in/liamobrien',
    createdAt: new Date('2025-04-05').toISOString(),
    updatedAt: new Date('2025-04-25').toISOString(),
  },
  {
    id: uuidv4(),
    firstName: 'Sofia', lastName: 'Reyes',
    email: 'sofia.reyes@email.com', phone: '+1-555-0505',
    location: 'Miami, FL', noticePeriod: '2 weeks',
    currentRole: 'Backend Engineer', currentCompany: 'FinTech Solutions',
    totalExperience: 3,
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Microservices', 'REST API', 'Kafka', 'Redis'],
    education: [{ degree: 'B.S. Computer Engineering', institution: 'University of Miami', year: 2022 }],
    workHistory: [
      { company: 'FinTech Solutions', role: 'Backend Engineer', from: '2022', to: 'Present', description: 'Payment processing microservices.' },
    ],
    status: 'Placed',
    addedBy: 'u2',
    sharedWith: [],
    scoreCache: {},
    notes: 'Strong Java/Spring profile. Placed at client.',
    linkedIn: 'https://linkedin.com/in/sofiareyes',
    createdAt: new Date('2025-02-20').toISOString(),
    updatedAt: new Date('2025-03-15').toISOString(),
  },
  {
    id: uuidv4(),
    firstName: 'Kenji', lastName: 'Tanaka',
    email: 'kenji.tanaka@email.com', phone: '+1-555-0606',
    location: 'Seattle, WA', noticePeriod: '1 month',
    currentRole: 'Mobile Developer', currentCompany: 'AppWorks Studio',
    totalExperience: 5,
    skills: ['React Native', 'React', 'TypeScript', 'JavaScript', 'Redux', 'iOS', 'Android', 'Firebase'],
    education: [{ degree: 'B.S. Computer Science', institution: 'University of Washington', year: 2020 }],
    workHistory: [
      { company: 'AppWorks Studio', role: 'Senior Mobile Developer', from: '2021', to: 'Present', description: 'Cross-platform mobile apps.' },
      { company: 'MobileFirst Inc.', role: 'Mobile Developer', from: '2020', to: '2021', description: 'iOS/Android development.' },
    ],
    status: 'Active',
    addedBy: 'u3',
    sharedWith: ['u4'],
    scoreCache: {},
    notes: 'Strong React Native + native experience.',
    linkedIn: 'https://linkedin.com/in/kenjitanaka',
    createdAt: new Date('2025-05-01').toISOString(),
    updatedAt: new Date('2025-05-15').toISOString(),
  },
];

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const INITIAL_AUDIT_LOGS = [
  { id: uuidv4(), action: 'CANDIDATE_ADDED',   userId: 'u2', userName: 'Bob Recruiter',   targetId: INITIAL_CANDIDATES[0].id, targetName: 'Priya Sharma',   detail: 'Candidate profile created via resume upload.',  timestamp: new Date('2025-03-10T09:15:00').toISOString() },
  { id: uuidv4(), action: 'CANDIDATE_ADDED',   userId: 'u2', userName: 'Bob Recruiter',   targetId: INITIAL_CANDIDATES[1].id, targetName: 'Marcus Johnson', detail: 'Candidate profile created manually.',            timestamp: new Date('2025-03-15T11:30:00').toISOString() },
  { id: uuidv4(), action: 'CANDIDATE_ADDED',   userId: 'u3', userName: 'Carol Recruiter', targetId: INITIAL_CANDIDATES[2].id, targetName: 'Aisha Patel',    detail: 'Candidate profile created via resume upload.',  timestamp: new Date('2025-04-01T14:00:00').toISOString() },
  { id: uuidv4(), action: 'CANDIDATE_EDITED',  userId: 'u2', userName: 'Bob Recruiter',   targetId: INITIAL_CANDIDATES[0].id, targetName: 'Priya Sharma',   detail: 'Updated skills and notice period.',             timestamp: new Date('2025-05-01T10:00:00').toISOString() },
  { id: uuidv4(), action: 'RESUME_UPLOADED',   userId: 'u3', userName: 'Carol Recruiter', targetId: INITIAL_CANDIDATES[2].id, targetName: 'Aisha Patel',    detail: 'Resume parsed: aisha_patel_cv.pdf',             timestamp: new Date('2025-04-01T13:55:00').toISOString() },
  { id: uuidv4(), action: 'PROFILE_SHARED',    userId: 'u2', userName: 'Bob Recruiter',   targetId: INITIAL_CANDIDATES[0].id, targetName: 'Priya Sharma',   detail: 'Profile shared with Dave Client (u4).',         timestamp: new Date('2025-04-10T16:20:00').toISOString() },
  { id: uuidv4(), action: 'CANDIDATE_ADDED',   userId: 'u3', userName: 'Carol Recruiter', targetId: INITIAL_CANDIDATES[3].id, targetName: 'Liam O\'Brien',  detail: 'Candidate profile created manually.',           timestamp: new Date('2025-04-05T09:00:00').toISOString() },
  { id: uuidv4(), action: 'BULK_EMAIL_SENT',   userId: 'u1', userName: 'Alice Admin',     targetId: null,                     targetName: '3 candidates',   detail: 'Bulk email sent: "New Opportunities" template.', timestamp: new Date('2025-05-20T15:00:00').toISOString() },
  { id: uuidv4(), action: 'ACCESS_CHANGED',    userId: 'u1', userName: 'Alice Admin',     targetId: 'u4',                     targetName: 'Dave Client',    detail: 'Shared Aisha Patel profile with Dave Client.',  timestamp: new Date('2025-05-10T11:00:00').toISOString() },
  { id: uuidv4(), action: 'DATA_EXPORTED',     userId: 'u1', userName: 'Alice Admin',     targetId: null,                     targetName: 'All Candidates', detail: 'Exported candidate list to CSV.',               timestamp: new Date('2025-05-22T09:30:00').toISOString() },
];

// ─── Job Orders ───────────────────────────────────────────────────────────────
export const INITIAL_JOB_ORDERS = [
  {
    id: uuidv4(), title: 'Senior React Developer', client: 'Acme Corp',
    description: 'Looking for a senior frontend engineer to lead our React-based SaaS platform. Must have strong TypeScript and Next.js experience.',
    location: 'San Francisco, CA', type: 'Full-time', remote: 'Hybrid',
    salaryMin: 130000, salaryMax: 160000,
    requiredSkills: ['React', 'TypeScript', 'Next.js', 'Redux', 'GraphQL'],
    emphasisSkill: 'React', minExperience: 5,
    noticePeriod: '1 month', status: 'Active',
    scoringConfig: null,
    createdAt: new Date('2025-04-01').toISOString(), updatedAt: new Date('2025-04-01').toISOString(),
  },
  {
    id: uuidv4(), title: 'DevOps Engineer', client: 'CloudBase Ltd',
    description: 'Seeking a DevOps engineer to manage our Kubernetes infrastructure on AWS and GCP. Terraform and CI/CD experience required.',
    location: 'Austin, TX', type: 'Full-time', remote: 'Remote',
    salaryMin: 120000, salaryMax: 150000,
    requiredSkills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'CI/CD', 'Linux'],
    emphasisSkill: 'Kubernetes', minExperience: 4,
    noticePeriod: '2 weeks', status: 'Active',
    scoringConfig: null,
    createdAt: new Date('2025-04-10').toISOString(), updatedAt: new Date('2025-04-10').toISOString(),
  },
  {
    id: uuidv4(), title: 'ML Engineer', client: 'DataVision Inc',
    description: 'Join our AI team to build production ML pipelines. Strong Python and deep learning framework experience essential.',
    location: 'New York, NY', type: 'Full-time', remote: 'On-site',
    salaryMin: 140000, salaryMax: 180000,
    requiredSkills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Science', 'SQL'],
    emphasisSkill: 'Machine Learning', minExperience: 3,
    noticePeriod: 'Any', status: 'Active',
    scoringConfig: null,
    createdAt: new Date('2025-05-01').toISOString(), updatedAt: new Date('2025-05-01').toISOString(),
  },
  {
    id: uuidv4(), title: 'Full Stack Node Developer', client: 'StartupHub',
    description: 'Full stack role building our core product. Node.js backend with React frontend, PostgreSQL database.',
    location: 'Chicago, IL', type: 'Full-time', remote: 'Hybrid',
    salaryMin: 100000, salaryMax: 130000,
    requiredSkills: ['Node.js', 'React', 'PostgreSQL', 'TypeScript', 'Docker'],
    emphasisSkill: 'Node.js', minExperience: 3,
    noticePeriod: '2 weeks', status: 'Filled',
    scoringConfig: null,
    createdAt: new Date('2025-03-01').toISOString(), updatedAt: new Date('2025-03-01').toISOString(),
  },
];

// ─── Email Templates ──────────────────────────────────────────────────────────
export const EMAIL_TEMPLATES = [
  {
    id: 't1',
    name: 'New Opportunity',
    subject: 'Exciting New Role – We Think You\'d Be a Great Fit',
    body: `Hi {{firstName}},

I hope this message finds you well. I'm reaching out because we have an exciting new opportunity that aligns closely with your background in {{primarySkill}}.

We'd love to discuss this role with you. Please let me know your availability for a quick call.

Best regards,
The Recruitment Team`,
  },
  {
    id: 't2',
    name: 'Interview Invitation',
    subject: 'Interview Invitation – {{role}}',
    body: `Dear {{firstName}},

Congratulations! We'd like to invite you for an interview for the {{role}} position.

Please reply with your preferred time slots for the coming week.

Looking forward to speaking with you.

Best,
The Recruitment Team`,
  },
  {
    id: 't3',
    name: 'Follow-Up',
    subject: 'Following Up on Your Application',
    body: `Hi {{firstName}},

I wanted to follow up on your recent application. We're still reviewing profiles and will be in touch shortly.

Thank you for your patience.

Best regards,
The Recruitment Team`,
  },
];
