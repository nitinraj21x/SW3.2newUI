/**
 * Seed events — mirrors the hardcoded events in sewingStatic-master EventsSection.jsx.
 * These are loaded into the portal Events tab on first run (when localStorage is empty).
 * Images reference the public-site image folder via relative paths resolved by Vite.
 *
 * In production, both apps would read/write from a shared MongoDB collection.
 */

// Import the same images used by the public site
import dec1   from '../../public-site/image/2025/December/dec1.jpg';
import dec2   from '../../public-site/image/2025/December/dec2.jpg';
import oct1   from '../../public-site/image/2025/October/oct1.png';
import oct2   from '../../public-site/image/2025/October/oct2.png';
import oct3   from '../../public-site/image/2025/October/oct3.png';
import april1 from '../../public-site/image/2025/April/april1.jpg';
import april2 from '../../public-site/image/2025/April/april2.jpg';
import april3 from '../../public-site/image/2025/April/april3.jpg';
import feb1   from '../../public-site/image/2025/February/feb1.jpg';
import feb2   from '../../public-site/image/2025/February/feb2.jpg';
import june1  from '../../public-site/image/2025/June/june1.jpg';
import june2  from '../../public-site/image/2025/June/june2.jpg';
import feb26  from '../../public-site/image/2026/Feb/feb26.jpg';

export const SEED_EVENTS = [
  // ── Upcoming ──────────────────────────────────────────────────────────────
  {
    id: 'seed-upcoming-1',
    type: 'upcoming',
    title: '☕ Sewing Circle Coffee Meetup – Bringing IT Professionals Together',
    date: 'April 25',
    time: '4:00 PM',
    location: 'Frisco, TX',
    venueUrl: 'https://share.google/ZeydqxaTM6jRCXA0f',
    theme: '',
    teaser: 'Join us for our next Sewing Circle Coffee Meetup in Frisco, TX.',
    description: `We're excited to host our next Sewing Circle Coffee Meetup on April 25th in Frisco, TX.

Sewing Circle is a growing community of IT professionals built on the idea of coming together to support one another—through knowledge sharing, meaningful conversations, and genuine connections.

This meetup is an opportunity to:
• Learn from each other's experiences
• Build a strong, supportive network
• Open doors for others in the IT community
• Enjoy an evening of authentic conversations`,
    participants: '',
    facilitator: 'Asha',
    duration: '2 hours',
    images: [],
    coverImageIndex: 0,
    createdBy: 'u1',
    createdAt: new Date('2026-03-01').toISOString(),
    updatedAt: new Date('2026-03-01').toISOString(),
  },

  // ── Past events (newest first) ────────────────────────────────────────────
  {
    id: 'seed-past-6',
    type: 'past',
    title: 'February 2026 Meetup',
    date: 'February 2026',
    time: '',
    location: 'Haraz Coffee House, Frisco',
    venueUrl: '',
    theme: 'Nine minds, one table, and AI',
    teaser: 'Nine minds, one table, and a deep dive into how AI is reshaping everything from code to careers.',
    description: `Kicked Off 2026 with Insightful Conversations!!!

We had an intimate group of nine professionals from across the IT ecosystem — hands-on data engineers, a technical project manager, an engineering manager overseeing cybersecurity programs, IoT specialists, and seasoned recruitment experts.

We explored:
• How companies are adapting to AI across the lifecycle — from sales to delivery
• The way AI tools are documenting client meetings and generating insights
• How AI agents are assisting developers in day-to-day coding and driving cost efficiencies
• Healthy debates on whether human-led coding will always remain essential
• The pace of AI adoption across industries, particularly in financial institutions
• How recruiting is being reshaped by AI — from candidate screening to ensuring authenticity`,
    participants: 9,
    facilitator: 'Asha',
    duration: '2 hours',
    images: [{ url: feb26, caption: 'February 2026 Meetup' }],
    coverImageIndex: 0,
    createdBy: 'u1',
    createdAt: new Date('2026-02-01').toISOString(),
    updatedAt: new Date('2026-02-01').toISOString(),
  },
  {
    id: 'seed-past-5',
    type: 'past',
    title: 'December 2025 Meetup',
    date: 'December 2025',
    time: '',
    location: 'Heritage Coffee, Frisco',
    venueUrl: '',
    theme: 'Celebrating Connections and Passions',
    teaser: 'Twelve participants connected over digital transformation, AI trends, and personal passions.',
    description: `The December Sewing Circle brought together 12 professionals for conversation, collaboration, and reflection. Discussions ranged from digital transformation in government and healthcare to AI trends including Physical AI and AGI, and emerging investment ideas.

Beyond technology, attendees shared personal passions—from music composition and DJing to crafts, app development, and fashion—creating genuine encouragement and support.`,
    participants: 12,
    facilitator: 'Asha',
    duration: '2 hours',
    images: [
      { url: dec1, caption: 'December 2025 — Group' },
      { url: dec2, caption: 'December 2025 — Discussion' },
    ],
    coverImageIndex: 0,
    createdBy: 'u1',
    createdAt: new Date('2025-12-01').toISOString(),
    updatedAt: new Date('2025-12-01').toISOString(),
  },
  {
    id: 'seed-past-4',
    type: 'past',
    title: 'October 2025 Meetup',
    date: 'October 2025',
    time: '',
    location: 'Haraz Coffee House, Plano',
    venueUrl: '',
    theme: 'Navigating AI, Education, and the Future of Work',
    teaser: 'Professionals examined AI\'s impact on work, Gen Alpha\'s education shifts, and fractional roles.',
    description: `The October Sewing Circle gathered professionals from technology, healthcare, HR, and other domains for a thought-provoking evening. Key topics included AI's impact on job markets, evolving organizational structures, Gen Alpha's approach to education, rising tuition costs, and the trend of fractional roles for senior professionals.`,
    participants: 8,
    facilitator: 'Asha',
    duration: '2 hours',
    images: [
      { url: oct1, caption: 'October 2025 — Group' },
      { url: oct2, caption: 'October 2025 — Discussion' },
      { url: oct3, caption: 'October 2025 — Networking' },
    ],
    coverImageIndex: 0,
    createdBy: 'u1',
    createdAt: new Date('2025-10-01').toISOString(),
    updatedAt: new Date('2025-10-01').toISOString(),
  },
  {
    id: 'seed-past-3',
    type: 'past',
    title: 'June 2025 Meetup',
    date: 'June 2025',
    time: '',
    location: 'La Souq, Richardson',
    venueUrl: '',
    theme: 'Exploring AI, Cybersecurity, and Industry Insights',
    teaser: 'Discussions spanned AI, cybersecurity, healthcare applications, virtual assistants, and legacy systems.',
    description: `The June Sewing Circle welcomed nine participants for an evening of engaging conversation and collaboration. Discussions included AI-driven exposure management, real-world AI use cases across cybersecurity, healthcare, manufacturing, and customer service, prompt engineering, virtual assistants in healthcare, and the enduring role of AS400 in enterprise systems.`,
    participants: 9,
    facilitator: 'Asha',
    duration: '2 hours',
    images: [
      { url: june1, caption: 'June 2025 — Group' },
      { url: june2, caption: 'June 2025 — Discussion' },
    ],
    coverImageIndex: 0,
    createdBy: 'u1',
    createdAt: new Date('2025-06-01').toISOString(),
    updatedAt: new Date('2025-06-01').toISOString(),
  },
  {
    id: 'seed-past-2',
    type: 'past',
    title: 'April 2025 Meetup',
    date: 'April 2025',
    time: '',
    location: 'Brass Tap, Allen',
    venueUrl: '',
    theme: 'Tech Insights and Industry Exchange',
    teaser: 'IT professionals shared insights on Oracle, NetSuite, SAP, and the intersection of reinsurance with technology.',
    description: `The April Sewing Circle marked the community's second gathering, bringing IT professionals together for focused, insight-driven conversations. Discussions covered rising Oracle costs, the evolving role of NetSuite, new SAP tools for data visibility, and an eye-opening exploration of reinsurance and its intersection with technology.`,
    participants: 12,
    facilitator: 'Asha',
    duration: '2 hours',
    images: [
      { url: april1, caption: 'April 2025 — Group' },
      { url: april2, caption: 'April 2025 — Discussion' },
      { url: april3, caption: 'April 2025 — Networking' },
    ],
    coverImageIndex: 0,
    createdBy: 'u1',
    createdAt: new Date('2025-04-01').toISOString(),
    updatedAt: new Date('2025-04-01').toISOString(),
  },
  {
    id: 'seed-past-1',
    type: 'past',
    title: 'February 2025 Meetup',
    date: 'February 2025',
    time: '',
    location: 'Brass Tap, Plano',
    venueUrl: '',
    theme: 'Thoughtful Conversations, Shared Perspectives',
    teaser: 'Eleven participants explored AI, testing, workplace culture, and learning mindsets.',
    description: `The February Sewing Circle brought together eleven individuals for an afternoon of open and engaging conversation. Participants explored topics including the evolving role of UI/UX and manual testing in an AI-driven world, workplace culture, identity beyond job titles, and learning mindsets.`,
    participants: 11,
    facilitator: 'Asha',
    duration: '2 hours',
    images: [
      { url: feb1, caption: 'February 2025 — Group' },
      { url: feb2, caption: 'February 2025 — Discussion' },
    ],
    coverImageIndex: 0,
    createdBy: 'u1',
    createdAt: new Date('2025-02-01').toISOString(),
    updatedAt: new Date('2025-02-01').toISOString(),
  },
];
