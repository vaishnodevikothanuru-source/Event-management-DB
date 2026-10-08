-- ====================================================================
-- EVENT SPHERE DATABASE SCHEMA & INITIALIZATION
-- Multi-Tenant, High-Performance PostgreSQL with pgvector
-- ====================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Enum Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'ORGANIZER', 'ATTENDEE', 'SPEAKER', 'SPONSOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_type AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE event_status AS ENUM ('DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE registration_status AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'WAITLISTED', 'CHECKED_IN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE sponsor_tier AS ENUM ('PLATINUM', 'GOLD', 'SILVER', 'BRONZE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- --------------------------------------------------------------------
-- 1. USERS & AUTHENTICATION
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'ATTENDEE',
    avatar_url TEXT,
    bio TEXT,
    job_title VARCHAR(150),
    company VARCHAR(150),
    industry VARCHAR(100),
    skills TEXT[],
    interests TEXT[],
    linkedin_url TEXT,
    twitter_url TEXT,
    github_url TEXT,
    phone VARCHAR(30),
    is_email_verified BOOLEAN DEFAULT FALSE,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- --------------------------------------------------------------------
-- 2. ORGANIZATIONS (MULTI-TENANCY)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    banner_url TEXT,
    website_url TEXT,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'MEMBER', -- OWNER, ADMIN, MEMBER
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, user_id)
);

-- --------------------------------------------------------------------
-- 3. EVENTS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    short_description VARCHAR(500),
    category VARCHAR(100) NOT NULL,
    tags TEXT[],
    event_type event_type NOT NULL DEFAULT 'HYBRID',
    status event_status NOT NULL DEFAULT 'DRAFT',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone VARCHAR(50) DEFAULT 'UTC',
    venue_name VARCHAR(255),
    venue_address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    online_meeting_url TEXT,
    capacity INTEGER DEFAULT 500,
    banner_image_url TEXT,
    logo_image_url TEXT,
    faqs JSONB DEFAULT '[]'::jsonb,
    policies TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
CREATE INDEX IF NOT EXISTS idx_events_org ON events(organization_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);

-- --------------------------------------------------------------------
-- 4. TICKET TYPES & TICKETS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USD',
    quantity_available INTEGER NOT NULL,
    quantity_sold INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    sales_start TIMESTAMP WITH TIME ZONE,
    sales_end TIMESTAMP WITH TIME ZONE,
    perks TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    discount_percentage NUMERIC(5,2),
    discount_amount NUMERIC(10,2),
    max_uses INTEGER DEFAULT 100,
    used_count INTEGER DEFAULT 0,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(event_id, code)
);

-- --------------------------------------------------------------------
-- 5. PAYMENTS & REGISTRATIONS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    event_id UUID NOT NULL REFERENCES events(id),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status payment_status NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    transaction_reference VARCHAR(255) UNIQUE,
    provider_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ticket_type_id UUID REFERENCES ticket_types(id),
    payment_id UUID REFERENCES payments(id),
    qr_code_token VARCHAR(255) UNIQUE NOT NULL,
    otp_code VARCHAR(10),
    otp_expires_at TIMESTAMP WITH TIME ZONE,
    status registration_status NOT NULL DEFAULT 'CONFIRMED',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    checked_in_at TIMESTAMP WITH TIME ZONE,
    custom_responses JSONB DEFAULT '{}'::jsonb,
    UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_qr ON registrations(qr_code_token);
CREATE INDEX IF NOT EXISTS idx_registrations_otp ON registrations(otp_code);

-- --------------------------------------------------------------------
-- 6. SESSIONS & AGENDA
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    session_type VARCHAR(50) DEFAULT 'KEYNOTE', -- KEYNOTE, WORKSHOP, PANEL, BREAKOUT
    track VARCHAR(100) DEFAULT 'Main Stage',
    room VARCHAR(100),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    capacity INTEGER DEFAULT 200,
    banner_url TEXT,
    meeting_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 7. SPEAKERS & SPONSORS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    job_title VARCHAR(150),
    company VARCHAR(150),
    bio TEXT,
    avatar_url TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS session_speakers (
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    speaker_id UUID NOT NULL REFERENCES speakers(id) ON DELETE CASCADE,
    PRIMARY KEY(session_id, speaker_id)
);

CREATE TABLE IF NOT EXISTS sponsors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    tier sponsor_tier NOT NULL DEFAULT 'SILVER',
    logo_url TEXT NOT NULL,
    website_url TEXT,
    booth_location VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 8. LIVE ENGAGEMENT (POLLS, Q&A, SURVEYS)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    question TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS poll_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    vote_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS poll_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(poll_id, user_id)
);

CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    is_answered BOOLEAN DEFAULT FALSE,
    is_highlighted BOOLEAN DEFAULT FALSE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS question_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(question_id, user_id)
);

-- --------------------------------------------------------------------
-- 9. NETWORKING & MESSAGING
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS networking_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, ACCEPTED, DECLINED
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, sender_id, receiver_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 10. AI DOCUMENTS & VECTOR EMBEDDINGS (RAG)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS event_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_url TEXT,
    summary TEXT,
    key_points TEXT[],
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES event_documents(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(384), -- Standard miniLM 384-dim or OpenAI 1536-dim vector
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chunks_event ON document_chunks(event_id);

-- --------------------------------------------------------------------
-- 11. AUDIT LOGS & NOTIFICATIONS
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id),
    event_id UUID REFERENCES events(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'INFO', -- INFO, ALERT, SUCCESS, NETWORKING, POLL
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- SEED INITIAL DEMO DATA
-- ====================================================================

-- 1. Demo Users (Password: Password123! hashed with bcrypt)
-- $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi
INSERT INTO users (id, email, password_hash, first_name, last_name, role, avatar_url, job_title, company, industry, skills, interests, points, is_email_verified)
VALUES 
('11111111-1111-1111-1111-111111111111', 'admin@eventsphere.io', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Sarah', 'Vance', 'ADMIN', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', 'Platform Director', 'Event Sphere HQ', 'Technology', ARRAY['System Architecture', 'Governance', 'Event Ops'], ARRAY['AI', 'Cloud', 'Networking'], 2500, TRUE),

('22222222-2222-2222-2222-222222222222', 'organizer@techcorp.io', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Marcus', 'Sterling', 'ORGANIZER', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', 'VP of Developer Relations', 'TechCorp Global', 'Software', ARRAY['Community Building', 'Developer Experience', 'Product Strategy'], ARRAY['GenAI', 'Fintech', 'Microservices'], 1800, TRUE),

('33333333-3333-3333-3333-333333333333', 'attendee@nexus.io', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Elena', 'Rostova', 'ATTENDEE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', 'Lead AI Engineer', 'Nexus Robotics', 'Artificial Intelligence', ARRAY['PyTorch', 'LLMs', 'Distributed Systems'], ARRAY['Agents', 'RAG', 'Robotics'], 650, TRUE),

('44444444-4444-4444-4444-444444444444', 'speaker@synthetix.ai', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Dr. Aris', 'Thorne', 'SPEAKER', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', 'Chief AI Scientist', 'Synthetix Lab', 'Deep Learning', ARRAY['Autonomous Agents', 'Neural Architecture', 'Reinforcement Learning'], ARRAY['Frontier Models', 'AI Alignment'], 1400, TRUE),

('55555555-5555-5555-5555-555555555555', 'sponsor@hypercloud.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Victoria', 'Chen', 'SPONSOR', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', 'Head of Ecosystem Partnerships', 'HyperCloud Inc.', 'Cloud Infrastructure', ARRAY['Enterprise Sales', 'Cloud Native', 'Venture Capital'], ARRAY['Serverless', 'SaaS Growth'], 920, TRUE)
ON CONFLICT (email) DO NOTHING;

-- 2. Demo Organizations
INSERT INTO organizations (id, name, slug, description, logo_url, banner_url, website_url, contact_email, created_by)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Apex Innovation Group', 'apex-innovation', 'Leading global tech conference producer hosting frontier engineering summits and executive roundtables.', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80', 'https://apex-innovation.io', 'contact@apex-innovation.io', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (slug) DO NOTHING;

-- 3. Demo Events
INSERT INTO events (id, organization_id, title, slug, description, short_description, category, tags, event_type, status, start_date, end_date, start_time, end_time, timezone, venue_name, venue_address, city, country, online_meeting_url, capacity, banner_image_url, logo_image_url, created_by)
VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Global AI & Autonomous Agents Summit 2026', 'global-ai-summit-2026', 'The premiere worldwide conference gathering 3,000+ AI researchers, ML engineers, founders, and enterprise architects exploring Autonomous Agents, Frontier Models, and Scalable Vector Infrastructure.', 'The premiere worldwide conference for autonomous agents, LLM architectures, and RAG systems.', 'Artificial Intelligence', ARRAY['AI', 'Autonomous Agents', 'LLM', 'Python', 'Vector DB', 'Cloud'], 'HYBRID', 'PUBLISHED', '2026-11-15', '2026-11-17', '09:00:00', '18:00:00', 'America/San_Francisco', 'Moscone Center & Virtual Stream', '747 Howard St', 'San Francisco', 'United States', 'https://stream.eventsphere.io/ai-summit-2026', 3500, 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80', '22222222-2222-2222-2222-222222222222'),

('cccccccc-cccc-cccc-cccc-cccccccccccc', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'CloudNative & Microservices World Expo', 'cloudnative-world-expo', 'Deep dive into Kubernetes, distributed caching, Kafka event streaming, and resilient microservices architectures.', 'Empowering modern software teams to build zero-downtime distributed cloud systems.', 'Software Architecture', ARRAY['Kubernetes', 'Microservices', 'Kafka', 'Spring Boot', 'DevOps'], 'OFFLINE', 'PUBLISHED', '2026-12-05', '2026-12-07', '08:30:00', '17:30:00', 'America/New_York', 'Javits Convention Center', '429 11th Ave', 'New York', 'United States', NULL, 2000, 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop&q=80', '22222222-2222-2222-2222-222222222222'),

('dddddddd-dddd-dddd-dddd-dddddddddddd', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'NextGen Design & UX Systems Symposium', 'nextgen-ux-symposium', 'Crafting world-class SaaS interfaces, accessible component systems, dynamic micro-interactions, and AI-assisted UX.', 'Master the future of modern software interfaces, typography, and micro-interactions.', 'Design & UX', ARRAY['UI/UX', 'Figma', 'Design Systems', 'Tailwind', 'Accessibility'], 'ONLINE', 'PUBLISHED', '2026-10-28', '2026-10-29', '10:00:00', '16:00:00', 'Europe/London', 'Virtual Live Stage', 'Online Livestream', 'London', 'United Kingdom', 'https://stream.eventsphere.io/nextgen-ux', 5000, 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&auto=format&fit=crop&q=80', 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=200&auto=format&fit=crop&q=80', '22222222-2222-2222-2222-222222222222')
ON CONFLICT (slug) DO NOTHING;

-- 4. Demo Ticket Types
INSERT INTO ticket_types (id, event_id, name, description, price, quantity_available, quantity_sold, perks)
VALUES
('t1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Virtual Pass', 'Access to all live streams, AI Sphere assistant, virtual networking, and session recordings.', 99.00, 2000, 480, ARRAY['Live Stream Access', 'Sphere AI Assistant', 'Virtual Networking', 'Session VODs']),

('t2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Standard In-Person Pass', 'Full in-person floor access, keynote halls, expo floor, catering, and evening mixer.', 499.00, 1000, 620, ARRAY['All Keynotes & Breakouts', 'Expo Floor & Booths', 'Breakfast & Lunch Buffet', 'Networking Mixer', 'Digital Badge']),

('t3333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'All-Access VIP Pass', 'VIP Lounge, 1-on-1 Speaker meet & greet, exclusive dinner, workshop fast-pass, and luxury swag kit.', 999.00, 250, 185, ARRAY['VIP Lounge Access', 'Private Speaker Dinner', 'Priority Seating', 'Executive Swag Box', 'Hands-on Workshops'])
ON CONFLICT DO NOTHING;

-- 5. Demo Speakers
INSERT INTO speakers (id, event_id, name, job_title, company, bio, avatar_url, featured)
VALUES
('s1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Dr. Aris Thorne', 'Chief AI Scientist', 'Synthetix Lab', 'Pioneering research in autonomous agent reasoning loops, multi-agent coordination, and real-time planning frameworks.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', TRUE),

('s2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Aria Patel', 'VP of Distributed Systems', 'HyperScale Cloud', 'Architect behind massive low-latency event streaming platforms handling 50M+ events/sec.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', TRUE),

('s3333333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Kenji Takahashi', 'Founder & CEO', 'VectorGraph', 'Pioneer in graph neural networks and high-dimensional semantic search engines.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80', FALSE)
ON CONFLICT DO NOTHING;

-- 6. Demo Sponsors
INSERT INTO sponsors (id, event_id, name, tier, logo_url, website_url, booth_location, description)
VALUES
('sp111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'HyperCloud Inc.', 'PLATINUM', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=80', 'https://hypercloud.io', 'Hall A - Booth #101', 'Enterprise Cloud & Vector Acceleration Infrastructure.'),

('sp222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'DataStream Labs', 'GOLD', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=120&auto=format&fit=crop&q=80', 'https://datastream.io', 'Hall B - Booth #204', 'Real-time Kafka event streaming & stream analytics.')
ON CONFLICT DO NOTHING;

-- 7. Demo Sessions
INSERT INTO sessions (id, event_id, title, description, session_type, track, room, start_time, end_time, capacity)
VALUES
('sess1111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Opening Keynote: The Dawn of Multi-Agent Systems', 'Exploration of how autonomous LLM agents will reshape engineering, customer workflows, and distributed computing in 2026 and beyond.', 'KEYNOTE', 'Grand Stage A', 'Hall 100', '2026-11-15 09:30:00+00', '2026-11-15 10:45:00+00', 1500),

('sess2222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Architecting Production RAG with Vector Caching & Hybrid Search', 'Hands-on breakdown of embedding generation, chunking strategies, pgvector tuning, and precision context filtering under heavy loads.', 'WORKSHOP', 'Technical Track', 'Workshop Room 2B', '2026-11-15 11:15:00+00', '2026-11-15 12:45:00+00', 300),

('sess3333-3333-3333-3333-333333333333', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Panel: High-Throughput Event-Driven Microservices with Kafka', 'Industry leaders debate event-sourcing vs CQRS, consumer group fault-tolerance, and schema evolution.', 'PANEL', 'Backend Architecture Stage', 'Auditorium C', '2026-11-15 14:00:00+00', '2026-11-15 15:15:00+00', 500)
ON CONFLICT DO NOTHING;

-- Map Session Speakers
INSERT INTO session_speakers (session_id, speaker_id)
VALUES 
('sess1111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111'),
('sess2222-2222-2222-2222-222222222222', 's3333333-3333-3333-3333-333333333333'),
('sess3333-3333-3333-3333-333333333333', 's2222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;

-- 8. Demo Poll
INSERT INTO polls (id, event_id, session_id, question, is_active)
VALUES
('p1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sess1111-1111-1111-1111-111111111111', 'Which AI architecture is your organization deploying most aggressively in 2026?', TRUE)
ON CONFLICT DO NOTHING;

INSERT INTO poll_options (id, poll_id, option_text, vote_count)
VALUES
('po111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'Autonomous Multi-Agent Swarms', 342),
('po222222-2222-2222-2222-222222222222', 'p1111111-1111-1111-1111-111111111111', 'Enterprise RAG & Hybrid Vector Search', 512),
('po333333-3333-3333-3333-333333333333', 'p1111111-1111-1111-1111-111111111111', 'Fine-Tuned Domain Specific SLMs', 189),
('po444444-4444-4444-4444-444444444444', 'p1111111-1111-1111-1111-111111111111', 'Multimodal Vision & Audio Pipelines', 124)
ON CONFLICT DO NOTHING;

-- 9. Demo Questions
INSERT INTO questions (id, event_id, session_id, user_id, question_text, upvotes, is_answered, is_highlighted)
VALUES
('q1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sess1111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'How do you handle loop detection and recursive token traps when orchestrating multiple autonomous agents?', 84, FALSE, TRUE),
('q2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sess1111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'What are the recommended benchmarks for embedding latency in sub-50ms conversational RAG?', 47, TRUE, FALSE)
ON CONFLICT DO NOTHING;

-- 10. Demo Registration
INSERT INTO registrations (id, event_id, user_id, ticket_type_id, qr_code_token, otp_code, otp_expires_at, status, checked_in_at)
VALUES
('r1111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333', 't2222222-2222-2222-2222-222222222222', 'ES-SUMMIT2026-VIP-ELENA-9942', '849204', CURRENT_TIMESTAMP + INTERVAL '7 days', 'CHECKED_IN', CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
