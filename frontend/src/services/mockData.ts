import { User, EventItem, Registration, Poll, Question, NetworkingConnection, PlatformStats } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'admin@eventsphere.io',
    firstName: 'Sarah',
    lastName: 'Vance',
    role: 'ADMIN',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    jobTitle: 'Platform Director',
    company: 'Event Sphere HQ',
    industry: 'Technology',
    phone: '+1 (555) 234-8901',
    skills: ['System Architecture', 'Governance', 'Event Ops'],
    interests: ['AI', 'Cloud', 'Networking'],
    points: 2500,
    isEmailVerified: true
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'organizer@techcorp.io',
    firstName: 'Marcus',
    lastName: 'Sterling',
    role: 'ORGANIZER',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    jobTitle: 'VP of Developer Relations',
    company: 'TechCorp Global',
    industry: 'Software',
    phone: '+1 (555) 912-4433',
    skills: ['Community Building', 'Developer Experience', 'Product Strategy'],
    interests: ['GenAI', 'Fintech', 'Microservices'],
    points: 1800,
    isEmailVerified: true
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'attendee@nexus.io',
    firstName: 'Elena',
    lastName: 'Rostova',
    role: 'ATTENDEE',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    jobTitle: 'Lead AI Engineer',
    company: 'Nexus Robotics',
    industry: 'Artificial Intelligence',
    phone: '+1 (555) 389-4921',
    skills: ['PyTorch', 'LLMs', 'Distributed Systems'],
    interests: ['Agents', 'RAG', 'Robotics'],
    points: 850,
    isEmailVerified: true
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'speaker@synthetix.ai',
    firstName: 'Dr. Aris',
    lastName: 'Thorne',
    role: 'SPEAKER',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    jobTitle: 'Chief AI Scientist',
    company: 'Synthetix Lab',
    industry: 'Deep Learning',
    phone: '+1 (555) 762-9011',
    skills: ['Autonomous Agents', 'Neural Architecture', 'Reinforcement Learning'],
    interests: ['Frontier Models', 'AI Alignment'],
    points: 1400,
    isEmailVerified: true
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    email: 'sponsor@hypercloud.com',
    firstName: 'Victoria',
    lastName: 'Chen',
    role: 'SPONSOR',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    jobTitle: 'Head of Ecosystem Partnerships',
    company: 'HyperCloud Inc.',
    industry: 'Cloud Infrastructure',
    phone: '+1 (555) 843-1290',
    skills: ['Enterprise Sales', 'Cloud Native', 'Venture Capital'],
    interests: ['Serverless', 'SaaS Growth'],
    points: 920,
    isEmailVerified: true
  }
];

export const INITIAL_EVENTS: EventItem[] = [
  // 1. CORPORATE CONFERENCES
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    organizationId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    organizationName: 'Apex Innovation Group',
    title: 'Global Enterprise AI & Leadership Summit 2026',
    slug: 'global-ai-summit-2026',
    description: 'The premier corporate conference gathering 3,500+ Fortune 500 executives, AI researchers, enterprise architects, and venture leaders exploring Autonomous Agents, Enterprise Governance, Real-time RAG, and Scalable Cloud Infrastructure. Features exclusive C-suite roundtables, VIP networking dinners, and keynote reveals.',
    shortDescription: 'The premier worldwide corporate conference for enterprise AI transformation, executive strategy, and scalable systems.',
    category: 'Corporate Conferences',
    tags: ['Executive', 'Enterprise', 'AI Strategy', 'Leadership', 'B2B Networking', 'Governance'],
    eventType: 'HYBRID',
    status: 'PUBLISHED',
    startDate: '2026-11-15',
    endDate: '2026-11-17',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    timezone: 'America/San_Francisco (PST)',
    venueName: 'Moscone Convention Center & Virtual Stream',
    venueAddress: '747 Howard St, San Francisco, CA 94103',
    city: 'San Francisco',
    country: 'United States',
    onlineMeetingUrl: 'https://stream.eventsphere.io/ai-summit-2026',
    capacity: 3500,
    bannerImageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&auto=format&fit=crop&q=80',
    logoImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80',
    ticketTypes: [
      {
        id: 't1111111-1111-1111-1111-111111111111',
        eventId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'Virtual Executive Pass',
        description: 'Access to all livestream stages, interactive live polls, AI Sphere assistant, and executive session recordings.',
        price: 99,
        currency: 'USD',
        quantityAvailable: 2000,
        quantitySold: 480,
        perks: ['HD Live Stream Access', 'Sphere AI Assistant', 'Virtual Networking Lobby', 'On-Demand Recordings for 1 Year']
      },
      {
        id: 't2222222-2222-2222-2222-222222222222',
        eventId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'Standard Corporate Pass',
        description: 'Full in-person access to Moscone keynote halls, expo pavilion, catering, digital badge, and evening mixer.',
        price: 499,
        currency: 'USD',
        quantityAvailable: 1000,
        quantitySold: 620,
        perks: ['In-Person Hall Access', 'Expo Floor & 100+ Booths', 'Breakfast & Gourmet Lunch', 'Official Networking Mixer', 'Digital RFID Smart Badge']
      },
      {
        id: 't3333333-3333-3333-3333-333333333333',
        eventId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'C-Suite All-Access VIP Pass',
        description: 'VIP Executive Lounge, private speaker roundtables, exclusive dinner, workshop priority seating, and luxury swag kit.',
        price: 999,
        currency: 'USD',
        quantityAvailable: 250,
        quantitySold: 185,
        perks: ['Private VIP Lounge & Open Bar', 'Exclusive Speaker Dinner', 'Front-Row Keynote Seating', 'Executive Swag Box ($300 value)', 'Hands-on AI Lab Priority Access']
      }
    ],
    speakers: [
      {
        id: 's1111111-1111-1111-1111-111111111111',
        eventId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'Dr. Aris Thorne',
        jobTitle: 'Chief AI Scientist',
        company: 'Synthetix Lab',
        bio: 'Pioneering research in autonomous agent reasoning loops, multi-agent coordination, and real-time planning frameworks.',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
        featured: true
      },
      {
        id: 's2222222-2222-2222-2222-222222222222',
        eventId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'Aria Patel',
        jobTitle: 'VP of Distributed Systems',
        company: 'HyperScale Cloud',
        bio: 'Architect behind massive low-latency event streaming platforms handling 50M+ events/sec.',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
        featured: true
      },
      {
        id: 's3333333-3333-3333-3333-333333333333',
        eventId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'Kenji Takahashi',
        jobTitle: 'Founder & CEO',
        company: 'VectorGraph',
        bio: 'Pioneer in graph neural networks and high-dimensional semantic search engines.',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
        featured: false
      }
    ],
    sponsors: [
      {
        id: 'sp111111-1111-1111-1111-111111111111',
        eventId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'HyperCloud Inc.',
        tier: 'PLATINUM',
        logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80',
        websiteUrl: 'https://hypercloud.io',
        boothLocation: 'Hall A - Booth #101',
        description: 'Enterprise Cloud & Vector Acceleration Infrastructure.'
      },
      {
        id: 'sp222222-2222-2222-2222-222222222222',
        eventId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        name: 'DataStream Labs',
        tier: 'GOLD',
        logoUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=120&auto=format&fit=crop&q=80',
        websiteUrl: 'https://datastream.io',
        boothLocation: 'Hall B - Booth #204',
        description: 'Real-time Kafka event streaming & stream analytics.'
      }
    ],
    sessions: [
      {
        id: 'sess1111-1111-1111-1111-111111111111',
        eventId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        title: 'Opening Keynote: The Dawn of Enterprise Multi-Agent Systems',
        description: 'Exploration of how autonomous LLM agents will reshape engineering, customer workflows, and distributed computing in 2026 and beyond.',
        sessionType: 'KEYNOTE',
        track: 'Grand Stage A',
        room: 'Hall 100',
        startTime: '09:30 AM',
        endTime: '10:45 AM',
        capacity: 1500,
        speakerIds: ['s1111111-1111-1111-1111-111111111111']
      },
      {
        id: 'sess2222-2222-2222-2222-222222222222',
        eventId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        title: 'Executive Panel: Scaling AI Governance & Enterprise Risk',
        description: 'Fortune 500 CTOs and Chief AI Officers discuss compliance, security boundaries, and reliable production deployment.',
        sessionType: 'PANEL',
        track: 'Executive Boardroom',
        room: 'Room 302',
        startTime: '11:15 AM',
        endTime: '12:30 PM',
        capacity: 250,
        speakerIds: ['s2222222-2222-2222-2222-222222222222']
      }
    ],
    faqs: [
      {
        question: 'Will sessions be recorded for virtual pass holders?',
        answer: 'Yes! All keynote sessions, technical tracks, and panel discussions are recorded in full 4K and uploaded within 2 hours of session conclusion.'
      },
      {
        question: 'Is parking available at the Moscone Center venue?',
        answer: 'Yes, validated garage parking is available at the Fifth & Mission Garage (833 Mission St) adjacent to the venue.'
      }
    ],
    policies: 'All attendees must adhere to the Event Sphere Code of Conduct. Cancellations requested before October 31, 2026 receive a 100% refund.'
  },

  // 2. EDUCATION AND WORKSHOP
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    organizationId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    organizationName: 'Sphere Academy & Labs',
    title: 'Full-Stack AI Engineering & Real-Time RAG Masterclass',
    slug: 'ai-engineering-rag-masterclass',
    description: 'An intensive, hands-on 2-day engineering masterclass designed for senior engineers and software architects. Build production-grade RAG systems from scratch using FastAPI, pgvector, hybrid semantic search, token optimization, and multi-agent coordination. Includes verified digital accreditation upon lab completion.',
    shortDescription: 'Master hands-on production RAG, vector database tuning, and autonomous agents in this intensive interactive workshop.',
    category: 'Education and Workshop',
    tags: ['Masterclass', 'Hands-on Lab', 'Python', 'FastAPI', 'pgvector', 'Certification'],
    eventType: 'HYBRID',
    status: 'PUBLISHED',
    startDate: '2026-11-28',
    endDate: '2026-11-29',
    startTime: '10:00 AM',
    endTime: '05:00 PM',
    timezone: 'America/New_York (EST)',
    venueName: 'TechHub Innovation Center & Cloud Sandbox',
    venueAddress: '100 Broadway, New York, NY 10005',
    city: 'New York',
    country: 'United States',
    onlineMeetingUrl: 'https://lab.eventsphere.io/rag-masterclass',
    capacity: 800,
    bannerImageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1400&auto=format&fit=crop&q=80',
    logoImageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&auto=format&fit=crop&q=80',
    ticketTypes: [
      {
        id: 't-edu-1',
        eventId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        name: 'Interactive Workshop Pass',
        description: 'Includes full lab cloud environment, starter code repositories, live 1-on-1 instructor Q&A, and verified certificate.',
        price: 249,
        currency: 'USD',
        quantityAvailable: 600,
        quantitySold: 420,
        perks: ['Pre-Configured Cloud GPU Sandbox', 'Live Hands-On Code Along', 'Verified Digital Badge & Certificate', '1-Year Lab Repository Access']
      },
      {
        id: 't-edu-2',
        eventId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        name: 'Student & Academic Pass',
        description: 'Subsidized pass for students and verified university researchers.',
        price: 79,
        currency: 'USD',
        quantityAvailable: 200,
        quantitySold: 180,
        perks: ['Full Virtual Workshop Access', 'Code Repositories', 'Community Study Group Access']
      }
    ],
    speakers: [
      {
        id: 's-edu-1',
        eventId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        name: 'Prof. Maya Lin',
        jobTitle: 'Lead AI Instructor',
        company: 'Sphere Engineering Academy',
        bio: 'Educator and author of High Performance Vector Databases and Real-Time AI Systems.',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
        featured: true
      }
    ],
    sessions: [
      {
        id: 'sess-edu-1',
        eventId: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
        title: 'Module 1: Vector Embeddings & Hybrid Search at Scale',
        description: 'Deep dive into embedding generation, chunking strategies, pgvector indexing (HNSW vs IVFFLAT), and precision filtering.',
        sessionType: 'WORKSHOP',
        track: 'Lab Hall 1',
        room: 'Lab Alpha',
        startTime: '10:00 AM',
        endTime: '01:00 PM',
        capacity: 400
      }
    ]
  },

  // 3. HACKATHONS AND TECH
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    organizationId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    organizationName: 'DevForge Global Network',
    title: 'SphereHacks 2026: Worldwide GenAI & Autonomous Systems Hackathon',
    slug: 'spherehacks-2026',
    description: 'Join 2,000+ developers, builders, and AI hackers for 48 hours of intense coding, innovation, and rapid prototyping. Compete for $100,000 in cash prizes, venture capital incubation grants, direct sponsor API bounties, and pitch before Silicon Valley investors during the live global demo day.',
    shortDescription: '48-hour global builder hackathon with $100K+ in bounties, direct VC mentorship, and live stage demo day.',
    category: 'Hackathons and Tech',
    tags: ['Hackathon', '$100K Prizes', 'Code Sprint', 'Open Source', 'Mentorship', 'Venture Capital'],
    eventType: 'HYBRID',
    status: 'PUBLISHED',
    startDate: '2026-12-04',
    endDate: '2026-12-06',
    startTime: '06:00 PM',
    endTime: '08:00 PM',
    timezone: 'America/Los_Angeles (PST)',
    venueName: 'The Innovation Depot & Global Discord Arena',
    venueAddress: '500 Tech Blvd, Austin, TX 78701',
    city: 'Austin',
    country: 'United States',
    onlineMeetingUrl: 'https://hack.eventsphere.io/spherehacks-2026',
    capacity: 2500,
    bannerImageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1400&auto=format&fit=crop&q=80',
    logoImageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=200&auto=format&fit=crop&q=80',
    ticketTypes: [
      {
        id: 't-hack-1',
        eventId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        name: 'Hacker / Builder Pass (Free)',
        description: 'Complete registration for individuals or teams of up to 4. Includes API credits, mentor matching, meal vouchers, and swag box.',
        price: 0,
        currency: 'USD',
        quantityAvailable: 2500,
        quantitySold: 1680,
        perks: ['Free $500 Cloud & LLM API Credits', '24/7 Hacker Lounge & Catering', '1-on-1 Mentor Office Hours', 'Official SphereHacks 2026 Swag Kit']
      }
    ],
    speakers: [
      {
        id: 's-hack-1',
        eventId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        name: 'Elena Vance',
        jobTitle: 'Head of Developer Ecosystem',
        company: 'VentureForge Capital',
        bio: 'Lead judge and accelerator scout funding early-stage AI, web3, and developer tooling startups.',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        featured: true
      }
    ],
    sessions: [
      {
        id: 'sess-hack-1',
        eventId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
        title: 'SphereHacks Kickoff & Bounty Announcement',
        description: 'Reveal of secret challenge tracks, sponsor bounty guidelines ($100K prize pool), and team formation sprint.',
        sessionType: 'KEYNOTE',
        track: 'Main Hack Stage',
        room: 'Arena Hall',
        startTime: '06:00 PM',
        endTime: '07:30 PM',
        capacity: 2000
      }
    ]
  },

  // 4. FESTIVALS AND LARGE EVENTS
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    organizationId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    organizationName: 'Sphere Mega Productions',
    title: 'CyberSound & Digital Arts Mega Festival 2026',
    slug: 'cybersound-festival-2026',
    description: 'An electrifying multi-day celebration at the intersection of electronic music, generative digital art installations, immersive holographic stages, creator meetups, and food & cultural experiences. Featuring over 40 global artists, 6 dynamic stages, laser projections, and 12,000+ festival goers from around the world.',
    shortDescription: 'The ultimate 3-day mega festival uniting electronic music, generative visual art, and interactive immersive tech.',
    category: 'Festivals and Large Events',
    tags: ['Mega Festival', 'Music & Tech', 'Digital Art', '12K+ Attendees', 'Immersive Audio', 'Food Expo'],
    eventType: 'OFFLINE',
    status: 'PUBLISHED',
    startDate: '2026-10-23',
    endDate: '2026-10-25',
    startTime: '02:00 PM',
    endTime: '02:00 AM',
    timezone: 'Europe/Berlin (CET)',
    venueName: 'Berlin Arena & Waterfront Park',
    venueAddress: 'Eichenstraße 4, 12435 Berlin',
    city: 'Berlin',
    country: 'Germany',
    capacity: 12000,
    bannerImageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1400&auto=format&fit=crop&q=80',
    logoImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&auto=format&fit=crop&q=80',
    ticketTypes: [
      {
        id: 't-fest-1',
        eventId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        name: '3-Day General Admission Festival Pass',
        description: 'Full access to all 6 stages, art domes, interactive game zones, and food court.',
        price: 189,
        currency: 'EUR',
        quantityAvailable: 10000,
        quantitySold: 8400,
        perks: ['6 Music & Art Stages', 'Digital Art Dome Experience', 'Commemorative Festival Wristband', 'Food & Beverage Village Access']
      },
      {
        id: 't-fest-2',
        eventId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        name: 'VIP Backstage & Sky Deck Pass',
        description: 'Elevated viewing sky deck, private artist lounge access, complimentary craft cocktails, and express entrance.',
        price: 450,
        currency: 'EUR',
        quantityAvailable: 1500,
        quantitySold: 1280,
        perks: ['VIP Sky Deck Viewing', 'Artist Lounge Access & Open Bar', 'Fast-Track VIP Entrance', 'Exclusive Merch Package']
      }
    ],
    speakers: [
      {
        id: 's-fest-1',
        eventId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        name: 'KAIROS (Live)',
        jobTitle: 'Headlining Audiovisual Artist',
        company: 'Synthetix Beats',
        bio: 'World-renowned electronic composer known for synchronized spatial audio and generative AI visuals.',
        avatarUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&auto=format&fit=crop&q=80',
        featured: true
      }
    ],
    sessions: [
      {
        id: 'sess-fest-1',
        eventId: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        title: 'Main Stage Opening Ceremony: Neon Horizon Odyssey',
        description: 'Spectacular audiovisual laser projection kickoff featuring live orchestra and electronic synthesizers.',
        sessionType: 'KEYNOTE',
        track: 'Main Stage Alpha',
        room: 'Outdoor Arena',
        startTime: '06:00 PM',
        endTime: '08:30 PM',
        capacity: 10000
      }
    ]
  },

  // 5. WEBINARS AND VIRTUAL EVENTS
  {
    id: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
    organizationId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    organizationName: 'CloudStream Global',
    title: 'Distributed Cloud & Real-Time Kafka Streaming Global Webinar',
    slug: 'cloud-kafka-streaming-webinar',
    description: 'A global high-production virtual summit focusing on high-throughput Kafka streaming, fault-tolerant microservices, sub-second event architectures, and multi-region failover. Includes interactive live polls, live audience Q&A with real-time upvoting, virtual breakout networking rooms, and instant 4K VOD replay.',
    shortDescription: 'Free global interactive virtual webinar on ultra-scalable Kafka streaming, distributed state, and cloud microservices.',
    category: 'Webinars and Virtual Events',
    tags: ['Webinar', 'Virtual Event', 'Kafka', 'Microservices', 'Spring Boot', 'Live Q&A', 'Free Pass'],
    eventType: 'ONLINE',
    status: 'PUBLISHED',
    startDate: '2026-11-05',
    endDate: '2026-11-05',
    startTime: '11:00 AM',
    endTime: '03:30 PM',
    timezone: 'America/New_York (EST)',
    venueName: 'Virtual Interactive Studio',
    onlineMeetingUrl: 'https://stream.eventsphere.io/kafka-webinar-2026',
    capacity: 10000,
    bannerImageUrl: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=1400&auto=format&fit=crop&q=80',
    logoImageUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=200&auto=format&fit=crop&q=80',
    ticketTypes: [
      {
        id: 't-web-1',
        eventId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        name: 'Free Virtual Access Pass',
        description: 'Complete livestream access, interactive Q&A upvoting, downloadable slide decks, and instant replay link.',
        price: 0,
        currency: 'USD',
        quantityAvailable: 10000,
        quantitySold: 4650,
        perks: ['Ultra HD 4K Live Broadcast', 'Interactive Live Polls & Upvoting', 'Downloadable Architecture Blueprint PDF', 'Instant Replay & Transcripts']
      }
    ],
    speakers: [
      {
        id: 's-web-1',
        eventId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        name: 'Marcus Sterling',
        jobTitle: 'VP of Distributed Infrastructure',
        company: 'CloudStream Global',
        bio: 'Pioneer in event-driven systems handling billions of real-time transactions with zero data loss.',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        featured: true
      }
    ],
    sessions: [
      {
        id: 'sess-web-1',
        eventId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
        title: 'Keynote: Engineering Sub-Second Event Streams at Global Scale',
        description: 'How to build multi-tenant, high-throughput event processing pipelines with Kafka, Spring Boot, and Redis.',
        sessionType: 'KEYNOTE',
        track: 'Virtual Stage 1',
        room: 'Broadcast Live Studio',
        startTime: '11:00 AM',
        endTime: '12:15 PM',
        capacity: 10000
      }
    ]
  }
];

export const INITIAL_POLLS: Poll[] = [
  {
    id: 'p1111111-1111-1111-1111-111111111111',
    eventId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    sessionId: 'sess1111-1111-1111-1111-111111111111',
    question: 'Which AI architecture is your team deploying most aggressively in 2026?',
    isActive: true,
    options: [
      { id: 'po1', pollId: 'p1111111-1111-1111-1111-111111111111', optionText: 'Autonomous Multi-Agent Swarms', voteCount: 342 },
      { id: 'po2', pollId: 'p1111111-1111-1111-1111-111111111111', optionText: 'Enterprise RAG & Hybrid Vector Search', voteCount: 512 },
      { id: 'po3', pollId: 'p1111111-1111-1111-1111-111111111111', optionText: 'Fine-Tuned Domain Specific SLMs', voteCount: 189 },
      { id: 'po4', pollId: 'p1111111-1111-1111-1111-111111111111', optionText: 'Multimodal Vision & Audio Pipelines', voteCount: 124 }
    ]
  }
];

export const INITIAL_QUESTIONS: Question[] = [
  {
    id: 'q1111111-1111-1111-1111-111111111111',
    eventId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    sessionId: 'sess1111-1111-1111-1111-111111111111',
    userId: '33333333-3333-3333-3333-333333333333',
    userName: 'Elena Rostova',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    questionText: 'How do you handle loop detection and recursive token traps when orchestrating multiple autonomous agents in high-stakes environments?',
    upvotes: 84,
    isAnswered: false,
    isHighlighted: true,
    isAnonymous: false,
    createdAt: '10 mins ago',
    hasUpvoted: false
  },
  {
    id: 'q2222222-2222-2222-2222-222222222222',
    eventId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    sessionId: 'sess1111-1111-1111-1111-111111111111',
    userId: '55555555-5555-5555-5555-555555555555',
    userName: 'Victoria Chen',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    questionText: 'What are the recommended production benchmarks for embedding generation latency in sub-50ms conversational RAG pipelines?',
    upvotes: 47,
    isAnswered: true,
    isHighlighted: false,
    isAnonymous: false,
    createdAt: '25 mins ago',
    hasUpvoted: false
  },
  {
    id: 'q3333333-3333-3333-3333-333333333333',
    eventId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    sessionId: 'sess1111-1111-1111-1111-111111111111',
    userId: 'anon-1',
    userName: 'Anonymous Attendee',
    questionText: 'Are there open source evaluation benchmarks available for the multi-agent framework showcased today?',
    upvotes: 29,
    isAnswered: false,
    isHighlighted: false,
    isAnonymous: true,
    createdAt: '35 mins ago',
    hasUpvoted: false
  }
];

export const INITIAL_NETWORKING: NetworkingConnection[] = [
  {
    id: 'net-1',
    user: {
      id: 'net-user-1',
      email: 'alex.m@cognitech.ai',
      firstName: 'Alex',
      lastName: 'Mercer',
      role: 'ATTENDEE',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      jobTitle: 'Principal Research Scientist',
      company: 'Cognitech AI',
      industry: 'Artificial Intelligence',
      skills: ['LLMs', 'RAG', 'Agent Swarms', 'Python'],
      interests: ['Autonomous Agents', 'Vector DBs', 'Ethics in AI'],
      points: 1100
    },
    matchScore: 98,
    status: 'NONE',
    commonInterests: ['Autonomous Agents', 'RAG', 'Vector DBs']
  },
  {
    id: 'net-2',
    user: {
      id: 'net-user-2',
      email: 'sarah.k@cloudwave.io',
      firstName: 'Sarah',
      lastName: 'Kim',
      role: 'ATTENDEE',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
      jobTitle: 'VP of Engineering',
      company: 'CloudWave Systems',
      industry: 'Cloud Infrastructure',
      skills: ['Kubernetes', 'Microservices', 'Distributed Systems'],
      interests: ['Microservices', 'Kafka', 'Cloud'],
      points: 950
    },
    matchScore: 92,
    status: 'ACCEPTED',
    commonInterests: ['Distributed Systems', 'Cloud']
  },
  {
    id: 'net-3',
    user: {
      id: 'net-user-3',
      email: 'david.zhang@quantumenterprise.com',
      firstName: 'David',
      lastName: 'Zhang',
      role: 'ATTENDEE',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
      jobTitle: 'Founding Partner',
      company: 'Apex Seed Ventures',
      industry: 'Venture Capital',
      skills: ['Seed Investing', 'SaaS Growth', 'Fundraising'],
      interests: ['GenAI', 'Fintech', 'Enterprise SaaS'],
      points: 740
    },
    matchScore: 86,
    status: 'PENDING',
    commonInterests: ['GenAI', 'Enterprise SaaS']
  }
];

export const INITIAL_PLATFORM_STATS: PlatformStats = {
  totalUsers: 14280,
  totalOrganizations: 184,
  totalEvents: 420,
  totalRegistrations: 38940,
  totalRevenue: 2489500,
  activeEventsCount: 28,
  platformEngagementRate: 88.4
};

export const INITIAL_REGISTRATIONS: Registration[] = [
  {
    id: 'reg-demo-1',
    eventId: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    userId: '33333333-3333-3333-3333-333333333333',
    event: INITIAL_EVENTS[0],
    ticketTypeId: 't2222222-2222-2222-2222-222222222222',
    ticketType: INITIAL_EVENTS[0].ticketTypes?.[1],
    qrCodeToken: 'ES-AI2026-CORP-ELENA-9942',
    otpCode: '849204',
    otpExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'CONFIRMED',
    registeredAt: '2026-10-01T14:30:00Z'
  },
  {
    id: 'reg-demo-2',
    eventId: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    userId: '33333333-3333-3333-3333-333333333333',
    event: INITIAL_EVENTS[2],
    ticketTypeId: 't-hack-1',
    ticketType: INITIAL_EVENTS[2].ticketTypes?.[0],
    qrCodeToken: 'ES-HACK2026-BUILDER-ELENA-7183',
    otpCode: '592184',
    otpExpiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'CONFIRMED',
    registeredAt: '2026-10-04T09:15:00Z'
  }
];
