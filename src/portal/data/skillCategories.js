/**
 * Categorized skill library for the scoring skill picker.
 * Each category has an icon, color, and list of skills.
 */
export const SKILL_CATEGORIES = [
  {
    id: 'frontend',
    label: 'Frontend',
    icon: '🎨',
    color: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.3)', text: '#a5b4fc', dot: '#6366f1' },
    skills: [
      'React', 'Next.js', 'Vue', 'Nuxt.js', 'Angular', 'Svelte',
      'TypeScript', 'JavaScript', 'HTML', 'CSS', 'SCSS',
      'Tailwind CSS', 'Bootstrap', 'Redux', 'Zustand', 'MobX',
      'GraphQL', 'React Native', 'Webpack', 'Vite', 'Jest', 'Cypress',
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    icon: '⚙️',
    color: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#34d399', dot: '#10b981' },
    skills: [
      'Node.js', 'Express', 'NestJS', 'Fastify',
      'Python', 'Django', 'FastAPI', 'Flask',
      'Java', 'Spring Boot', 'Kotlin',
      'Go', 'Rust', 'C#', '.NET', 'PHP', 'Laravel',
      'REST API', 'gRPC', 'GraphQL', 'Microservices', 'Kafka', 'RabbitMQ',
    ],
  },
  {
    id: 'database',
    label: 'Database',
    icon: '🗄️',
    color: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24', dot: '#f59e0b' },
    skills: [
      'PostgreSQL', 'MySQL', 'SQLite', 'SQL', 'MariaDB',
      'MongoDB', 'Redis', 'DynamoDB', 'Cassandra', 'Elasticsearch',
      'Supabase', 'Firebase', 'Prisma', 'TypeORM', 'Mongoose',
    ],
  },
  {
    id: 'devops',
    label: 'DevOps & Cloud',
    icon: '☁️',
    color: { bg: 'rgba(14,165,233,0.12)', border: 'rgba(14,165,233,0.3)', text: '#38bdf8', dot: '#0ea5e9' },
    skills: [
      'Docker', 'Kubernetes', 'Helm',
      'AWS', 'GCP', 'Azure', 'Vercel', 'Netlify',
      'Terraform', 'Ansible', 'Pulumi',
      'CI/CD', 'GitHub Actions', 'Jenkins', 'GitLab CI',
      'Linux', 'Nginx', 'Prometheus', 'Grafana',
    ],
  },
  {
    id: 'ml',
    label: 'ML & Data',
    icon: '🧠',
    color: { bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.3)', text: '#c084fc', dot: '#a855f7' },
    skills: [
      'Python', 'Machine Learning', 'Deep Learning', 'AI',
      'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn',
      'Data Science', 'Pandas', 'NumPy', 'Matplotlib',
      'SQL', 'Spark', 'Hadoop', 'Airflow', 'dbt',
      'LLM', 'NLP', 'Computer Vision',
    ],
  },
  {
    id: 'mobile',
    label: 'Mobile',
    icon: '📱',
    color: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171', dot: '#ef4444' },
    skills: [
      'React Native', 'Flutter', 'Swift', 'Kotlin',
      'iOS', 'Android', 'Expo', 'Firebase',
      'Xcode', 'Android Studio',
    ],
  },
  {
    id: 'tools',
    label: 'Tools & Practices',
    icon: '🔧',
    color: { bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.3)', text: '#9ca3af', dot: '#6b7280' },
    skills: [
      'Git', 'GitHub', 'GitLab', 'Jira', 'Confluence',
      'Agile', 'Scrum', 'Kanban', 'TDD', 'BDD',
      'Figma', 'Storybook', 'Postman', 'Swagger',
      'WebSockets', 'OAuth', 'JWT', 'Security',
    ],
  },
];

// Flat list of all known skills (for search)
export const ALL_SKILLS = [...new Set(SKILL_CATEGORIES.flatMap((c) => c.skills))];

// Find which category a skill belongs to
export function getCategoryForSkill(skill) {
  return SKILL_CATEGORIES.find((c) =>
    c.skills.some((s) => s.toLowerCase() === skill.toLowerCase())
  ) || null;
}
