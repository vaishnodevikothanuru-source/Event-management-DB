import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, Calendar, Compass, Users, MessageSquare, 
  Layers, ShieldCheck, ArrowRight, Bot, Zap, 
  QrCode, Globe, CheckCircle2, Star, TrendingUp,
  Building2, GraduationCap, Terminal, PartyPopper, Video,
  ChevronRight, Award, Radio, Flame, Cpu, BookOpen,
  Ticket, Key, ExternalLink, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EventCard } from '../components/EventCard';
import { eventsApi, analyticsApi, ticketsApi } from '../services/api';
import { EventItem, PlatformStats, Registration } from '../types';
import { DigitalBadgeModal } from '../components/DigitalBadgeModal';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('All');
  const [selectedBadgeReg, setSelectedBadgeReg] = useState<Registration | null>(null);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);

  const CATEGORIES_DATA = [
    {
      id: 'corporate',
      query: 'Corporate Conferences',
      title: 'Corporate Conferences',
      tagline: 'Executive Summits & B2B Strategy',
      description: 'Flagship leadership forums, C-suite roundtables, enterprise keynotes, and high-stakes executive networking.',
      icon: Building2,
      badge: '120+ Summits',
      accentColor: 'indigo',
      gradient: 'from-blue-600 via-indigo-600 to-violet-600',
      borderGlow: 'hover:border-indigo-500/50 hover:shadow-indigo-500/20',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      perks: ['C-Suite Roundtables', 'VIP Executive Lounges', 'Enterprise Matchmaking', 'Industry Keynotes']
    },
    {
      id: 'education',
      query: 'Education and Workshop',
      title: 'Education & Workshops',
      tagline: 'Hands-on Masterclasses & Labs',
      description: 'Interactive code sandboxes, deep architecture labs, mentor office hours, and verified skill certifications.',
      icon: GraduationCap,
      badge: '85+ Masterclasses',
      accentColor: 'emerald',
      gradient: 'from-emerald-500 via-teal-600 to-cyan-600',
      borderGlow: 'hover:border-emerald-500/50 hover:shadow-emerald-500/20',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80',
      perks: ['Live Code Sandboxes', 'Instructor Office Hours', 'Accredited Badges', 'Architect Code-Alongs']
    },
    {
      id: 'hackathons',
      query: 'Hackathons and Tech',
      title: 'Hackathons & Tech',
      tagline: '48-Hour Sprints & AI Challenges',
      description: 'High-velocity code sprints, $100K+ bounties, multi-agent builds, live pitch demo days, and VC mentorship.',
      icon: Terminal,
      badge: '$150K+ Prize Pools',
      accentColor: 'amber',
      gradient: 'from-amber-500 via-orange-600 to-red-600',
      borderGlow: 'hover:border-amber-500/50 hover:shadow-amber-500/20',
      image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
      perks: ['48h Rapid Prototyping', 'Sponsor API Grants', 'Live VC Pitch Stage', 'Venture Mentors']
    },
    {
      id: 'festivals',
      query: 'Festivals and Large Events',
      title: 'Festivals & Large Events',
      tagline: 'Mega Music, Tech & Digital Art Expos',
      description: 'Electrifying spectacles uniting electronic music, generative visual art installations, and 10,000+ attendee arenas.',
      icon: PartyPopper,
      badge: '10K+ Attendees',
      accentColor: 'pink',
      gradient: 'from-pink-500 via-rose-600 to-purple-600',
      borderGlow: 'hover:border-pink-500/50 hover:shadow-pink-500/20',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
      perks: ['Multi-Stage Productions', 'Digital Art Pavilions', 'VIP Backstage Passes', 'Interactive Arenas']
    },
    {
      id: 'webinars',
      query: 'Webinars and Virtual Events',
      title: 'Webinars & Virtual Events',
      tagline: 'Interactive 4K Broadcasts & Panels',
      description: 'Global livestream summits with sub-second polls, live question upvoting, virtual breakout rooms, and instant 4K VOD.',
      icon: Video,
      badge: '300+ Virtual Streams',
      accentColor: 'cyan',
      gradient: 'from-cyan-500 via-blue-600 to-indigo-600',
      borderGlow: 'hover:border-cyan-500/50 hover:shadow-cyan-500/20',
      image: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800&auto=format&fit=crop&q=80',
      perks: ['Ultra HD 4K Broadcasts', 'Sub-Second Live Polls', 'Virtual Breakouts', 'Instant On-Demand VOD']
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      const evts = await eventsApi.getAll();
      const st = await analyticsApi.getPlatformStats();
      setEvents(evts);
      setStats(st);

      if (user) {
        try {
          const regs = await ticketsApi.getMyRegistrations(user.id);
          setMyRegistrations(regs.filter(r => r.status !== 'CANCELLED'));
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchData();

    window.addEventListener('es_booking_cancelled', fetchData);
    return () => window.removeEventListener('es_booking_cancelled', fetchData);
  }, [user]);

  const bookedEventMap = new Map<string, Registration>();
  myRegistrations.forEach(r => {
    bookedEventMap.set(r.eventId, r);
    if (r.event?.id) bookedEventMap.set(r.event.id, r);
  });

  const filteredEvents = activeCategoryTab === 'All' 
    ? events 
    : activeCategoryTab === 'BOOKED'
      ? events.filter(e => bookedEventMap.has(e.id))
      : events.filter(e => e.category.toLowerCase() === activeCategoryTab.toLowerCase());

  return (
    <div className="space-y-24 pb-12 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 lg:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Ambient background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-brand-600/20 via-purple-600/20 to-pink-600/10 blur-[130px] rounded-full pointer-events-none" />

        {/* Pill Tag */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-brand-500/30 text-brand-300 text-xs font-semibold mb-6 shadow-lg shadow-brand-500/10 animate-float">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <span>Next-Generation Full-Stack Event Platform</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-6">
          Connect. Engage. Experience.{' '}
          <span className="gradient-text block mt-2">
            The Future of Hybrid & Live Summits.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          Empowering organizers and attendees worldwide across corporate summits, hands-on masterclasses, hackathons, mega festivals, and global interactive webinars.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            to="/events"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 via-purple-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-white font-bold text-sm shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 transition-all duration-300"
          >
            <Compass className="w-4 h-4" />
            <span>Explore All Spheres</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {myRegistrations.length > 0 ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-500/30 hover:scale-105 transition-all duration-300"
            >
              <Ticket className="w-4 h-4" />
              <span>View My Booked Events ({myRegistrations.length})</span>
            </Link>
          ) : (
            <Link
              to="/organizer/events/create"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-bold text-sm border border-slate-700 shadow-lg hover:border-brand-500/40 transition-all duration-300"
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Launch Your Event (12-Step Wizard)</span>
            </Link>
          )}
        </div>

        {/* Platform KPI Stats Ribbon */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto glass-panel p-6 rounded-3xl border border-slate-800 shadow-2xl">
            <div className="text-center p-2">
              <div className="text-2xl sm:text-3xl font-black text-white">{stats.totalUsers.toLocaleString()}+</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Active Attendees & Speakers</div>
            </div>
            <div className="text-center p-2 border-l border-slate-800/80">
              <div className="text-2xl sm:text-3xl font-black text-brand-400">{stats.totalEvents}+</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Conferences & Summits</div>
            </div>
            <div className="text-center p-2 border-l border-slate-800/80">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">${(stats.totalRevenue / 1000000).toFixed(2)}M</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Ticket Revenue Processed</div>
            </div>
            <div className="text-center p-2 border-l border-slate-800/80">
              <div className="text-2xl sm:text-3xl font-black text-pink-400">{stats.platformEngagementRate}%</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Live Audience Engagement</div>
            </div>
          </div>
        )}
      </section>

      {/* 2. USER'S BOOKED EVENTS SHOWCASE RIBBON (If user has registrations) */}
      {myRegistrations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/30 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Confirmed Passes</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                      {myRegistrations.length} Active
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">Your Booked Events & Passes</h2>
                </div>
              </div>

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md self-start sm:self-auto"
              >
                <span>Open Attendee Wallet</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myRegistrations.slice(0, 2).map((reg) => (
                <div 
                  key={reg.id}
                  className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-emerald-500/40 transition-all shadow-lg"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {reg.ticketType?.name || 'Confirmed Pass'}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1">
                        {reg.event?.title || 'Global AI & Autonomous Agents Summit 2026'}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{reg.event?.startDate || 'Nov 15, 2026'}</span>
                        <span>•</span>
                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        <span className="truncate max-w-[150px]">{reg.event?.venueName || 'Moscone Center'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      <Key className="w-3 h-3 text-emerald-400" />
                      <span>OTP: {reg.otpCode || '849204'}</span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedBadgeReg(reg);
                        setBadgeModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700"
                    >
                      <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Smart Badge</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. DYNAMIC CATEGORY SHOWCASE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider mb-3">
            <Flame className="w-3.5 h-3.5 text-brand-400" />
            <span>Event Spheres & Formats</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Tailored Experiences For Every Gathering
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-3 max-w-2xl mx-auto">
            From high-stakes executive boardroom summits and 48-hour builder hackathons to 10,000+ mega festivals and interactive 4K webinars.
          </p>
        </div>

        {/* 5 Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES_DATA.map((cat, index) => {
            const IconComponent = cat.icon;
            const isLargeSpan = index === 3 || index === 4; // make bottom 2 cards stylishly balanced in 3-col grid
            return (
              <div 
                key={cat.id}
                className={`group relative glass-card rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-900/50 p-6 flex flex-col justify-between transition-all duration-500 hover:-translate-y-1.5 shadow-xl ${cat.borderGlow} ${
                  isLargeSpan && index === 3 ? 'lg:col-span-1 md:col-span-1' : ''
                } ${isLargeSpan && index === 4 ? 'lg:col-span-2 md:col-span-2' : ''}`}
              >
                {/* Background Image with Ambient Tint */}
                <div className="absolute inset-0 z-0 overflow-hidden opacity-25 group-hover:opacity-35 group-hover:scale-105 transition-all duration-700">
                  <img 
                    src={cat.image} 
                    alt={cat.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/80 to-transparent" />
                </div>

                {/* Card Header & Badge */}
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.gradient} p-0.5 shadow-lg`}>
                      <div className="w-full h-full bg-slate-950/80 rounded-[14px] flex items-center justify-center text-white">
                        <IconComponent className="w-6 h-6" />
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-slate-800/90 text-slate-300 border border-slate-700/80 backdrop-blur-md shadow-md">
                      {cat.badge}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-brand-400 mb-1">
                      {cat.tagline}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-brand-300 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                {/* Feature Pills */}
                <div className="relative z-10 pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {cat.perks.map((perk, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium bg-slate-950/60 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-slate-800/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                        <span className="truncate">{perk}</span>
                      </div>
                    ))}
                  </div>

                  {/* Explore Action Button */}
                  <Link
                    to={`/events?category=${encodeURIComponent(cat.query)}`}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-slate-800/80 hover:bg-gradient-to-r ${cat.gradient} text-white text-xs font-bold border border-slate-700/80 transition-all duration-300 shadow-md group-hover:shadow-lg`}
                  >
                    <span>Explore {cat.title}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. INTERACTIVE FEATURED EVENTS SECTION WITH TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span>Live & Upcoming Schedules</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Featured Global Summits</h2>
          </div>

          {/* Quick Category Filter Switcher Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
            {[
              { id: 'All', label: 'All Spheres' },
              ...(myRegistrations.length > 0 ? [{ id: 'BOOKED', label: `My Booked Events (${myRegistrations.length})` }] : []),
              { id: 'Corporate Conferences', label: 'Corporate Conferences' },
              { id: 'Education and Workshop', label: 'Education & Workshops' },
              { id: 'Hackathons and Tech', label: 'Hackathons & Tech' },
              { id: 'Festivals and Large Events', label: 'Festivals & Large Events' },
              { id: 'Webinars and Virtual Events', label: 'Webinars & Virtual Events' },
            ].map((tab) => {
              const isActive = activeCategoryTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveCategoryTab(tab.id)}
                  className={`whitespace-nowrap px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
                    isActive 
                      ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-lg shadow-brand-500/25 scale-105'
                      : tab.id === 'BOOKED'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab.id === 'BOOKED' && <Ticket className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 glass-card rounded-3xl border border-slate-800 space-y-3">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No summits found in this selection</h3>
            <p className="text-xs text-slate-400 mt-1">Check back soon or explore all scheduled spheres.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.slice(0, 6).map((event) => {
              const reg = bookedEventMap.get(event.id);
              return (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  isBooked={!!reg}
                  bookedPassTier={reg?.ticketType?.name || (reg ? 'Confirmed Pass' : undefined)}
                />
              );
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to={activeCategoryTab === 'All' ? '/events' : activeCategoryTab === 'BOOKED' ? '/events?category=BOOKED' : `/events?category=${encodeURIComponent(activeCategoryTab)}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all hover:scale-105 shadow-lg"
          >
            <span>Browse all {events.length} summits in directory</span>
            <ArrowRight className="w-4 h-4 text-brand-400" />
          </Link>
        </div>
      </section>

      {/* Digital Badge Modal */}
      {selectedBadgeReg && (
        <DigitalBadgeModal
          isOpen={badgeModalOpen}
          onClose={() => setBadgeModalOpen(false)}
          registration={selectedBadgeReg}
        />
      )}
      {/* 5. PLATFORM CAPABILITIES / ARCHITECTURE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-pink-400 mb-2">Built for Scale & Engagement</h2>
          <h3 className="text-3xl sm:text-4xl font-black text-white">
            Everything Required to Produce World-Class Summits
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Sphere AI RAG */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-lg">
              <Bot className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Sphere AI RAG Assistant</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              FastAPI-backed semantic retrieval with pgvector. Attendees can query speaker bios, agenda schedules, document summaries, and receive tailored session recommendations.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> Vector chunking & pgvector search</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> Multi-tenant organization isolation</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-400" /> Floating conversational assistant</li>
            </ul>
          </div>

          {/* Card 2: Live Engagement & Gamification */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Real-Time Engagement & XP</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Kafka event streaming powers instant live polls, audience Q&A with upvoting, interactive quizzes, session reaction bursts, and dynamic XP leaderboards.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Sub-second live poll updates</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Moderated question upvoting queue</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Gamification points & digital badges</li>
            </ul>
          </div>

          {/* Card 3: Microservices & Multi-Tenancy */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/40 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-lg">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">Spring Boot Microservices</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Modular Java 21 architecture with Spring Security, JWT authentication, Payment Abstraction, Redis OTP/caching, and multi-tenant organization boundaries.
            </p>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Zero-trust RBAC & token isolation</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> 12-step event creation wizard</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> QR code check-in & digital pass wallet</li>
            </ul>
          </div>

        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="gradient-border p-1 bg-gradient-to-r from-brand-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl">
          <div className="bg-[#0F172A] rounded-[22px] p-8 sm:p-12 text-center relative overflow-hidden">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to elevate your next conference?
            </h3>
            <p className="text-sm text-slate-400 max-w-xl mx-auto mb-8">
              Join thousands of organizers and attendees using Event Sphere to create unforgettable live, virtual, and hybrid experiences.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/organizer/events/create"
                className="px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all"
              >
                Create an Event
              </Link>
              <Link
                to="/events"
                className="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
              >
                Browse All Summits
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
