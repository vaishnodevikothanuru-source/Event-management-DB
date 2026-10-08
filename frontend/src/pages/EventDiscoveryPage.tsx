import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, Sparkles, Calendar, MapPin, 
  Layers, Video, Globe, X, SlidersHorizontal,
  Building2, GraduationCap, Terminal, PartyPopper, Flame,
  Ticket, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { eventsApi, ticketsApi } from '../services/api';
import { EventItem, EventType, Registration } from '../types';
import { EventCard } from '../components/EventCard';

export const EventDiscoveryPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';

  const [events, setEvents] = useState<EventItem[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Load user registrations
  const fetchRegistrations = async () => {
    if (!user) return;
    try {
      const regs = await ticketsApi.getMyRegistrations(user.id);
      setMyRegistrations(regs.filter(r => r.status !== 'CANCELLED'));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRegistrations();

    window.addEventListener('es_booking_cancelled', fetchRegistrations);
    return () => window.removeEventListener('es_booking_cancelled', fetchRegistrations);
  }, [user]);

  const bookedEventMap = new Map<string, Registration>();
  myRegistrations.forEach(r => {
    bookedEventMap.set(r.eventId, r);
    if (r.event?.id) bookedEventMap.set(r.event.id, r);
  });

  const categories = [
    { label: 'All Spheres', value: 'All', icon: Sparkles },
    { 
      label: `My Booked Events ${myRegistrations.length > 0 ? `(${myRegistrations.length})` : ''}`, 
      value: 'BOOKED', 
      icon: Ticket,
      isSpecial: true 
    },
    { label: 'Corporate Conferences', value: 'Corporate Conferences', icon: Building2 },
    { label: 'Education & Workshop', value: 'Education and Workshop', icon: GraduationCap },
    { label: 'Hackathons & Tech', value: 'Hackathons and Tech', icon: Terminal },
    { label: 'Festivals & Large Events', value: 'Festivals and Large Events', icon: PartyPopper },
    { label: 'Webinars & Virtual Events', value: 'Webinars and Virtual Events', icon: Video },
  ];

  const categoryMeta: Record<string, { title: string; subtitle: string; tag: string }> = {
    'All': {
      title: 'Explore All Global Event Spheres',
      subtitle: 'Browse executive conferences, live coding masterclasses, hackathons, mega festivals, and interactive webinars.',
      tag: 'Global Directory'
    },
    'BOOKED': {
      title: 'Your Booked Events & Confirmed Passes',
      subtitle: 'Quick access to all summits, hackathons, and webinars you have registered for with digital smart badges and entry OTPs.',
      tag: 'My Booked Events'
    },
    'Corporate Conferences': {
      title: 'Corporate Conferences & Executive Summits',
      subtitle: 'High-stakes C-suite gatherings, enterprise leadership keynotes, investor roundtables, and VIP networking.',
      tag: 'Executive & Enterprise'
    },
    'Education and Workshop': {
      title: 'Education, Masterclasses & Hands-On Labs',
      subtitle: 'Intensive engineering masterclasses, interactive coding sandboxes, accredited badges, and mentor-led sessions.',
      tag: 'Skills & Certifications'
    },
    'Hackathons and Tech': {
      title: 'Hackathons, Code Sprints & Tech Challenges',
      subtitle: '48-hour global builder sprints, $100K+ bounties, multi-agent AI challenges, and live investor demo days.',
      tag: 'Bounties & Innovation'
    },
    'Festivals and Large Events': {
      title: 'Festivals, Mega Expos & Cultural Gatherings',
      subtitle: '10,000+ attendee multi-stage festivals uniting electronic music, generative digital arts, and immersive experiences.',
      tag: 'Mega Gatherings'
    },
    'Webinars and Virtual Events': {
      title: 'Webinars & Interactive Virtual Summits',
      subtitle: 'Ultra HD 4K livestreams with sub-second polls, live question upvoting, virtual breakout rooms, and instant replays.',
      tag: 'Virtual & Livestream'
    }
  };

  const eventTypes: { label: string; value: string; icon?: any }[] = [
    { label: 'All Formats', value: 'ALL' },
    { label: 'Hybrid', value: 'HYBRID', icon: Globe },
    { label: 'In-Person', value: 'OFFLINE', icon: MapPin },
    { label: 'Virtual Only', value: 'ONLINE', icon: Video },
  ];

  // Sync state with URL params
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      setSelectedCategory(catParam);
    }
  }, [searchParams]);

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    const newParams = new URLSearchParams(searchParams);
    if (val === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', val);
    }
    setSearchParams(newParams);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        if (selectedCategory === 'BOOKED') {
          // Fetch all events then filter by user booked IDs
          const res = await eventsApi.getAll({
            type: selectedType,
            search: searchQuery
          });
          const bookedIds = new Set(myRegistrations.map(r => r.eventId));
          setEvents(res.filter(e => bookedIds.has(e.id)));
        } else {
          const res = await eventsApi.getAll({
            category: selectedCategory,
            type: selectedType,
            search: searchQuery
          });
          setEvents(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [selectedCategory, selectedType, searchQuery, myRegistrations]);

  const activeMeta = categoryMeta[selectedCategory] || categoryMeta['All'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{activeMeta.tag}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          {activeMeta.title}
        </h1>
        <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
          {activeMeta.subtitle}
        </p>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-800 bg-slate-900/70 space-y-5 shadow-2xl">
        
        {/* Top: Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by title, description, category, tags (e.g. AI, Kafka, Hackathon, Festival)..."
            className="w-full bg-slate-950/90 border border-slate-800 focus:border-brand-500 rounded-2xl pl-11 pr-11 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 shadow-inner"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-3.5 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills Bar */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Select Category Sphere
          </div>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory.toLowerCase() === cat.value.toLowerCase() || 
                                (cat.value === 'All' && selectedCategory === 'All');
              return (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryChange(cat.value)}
                  className={`flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-2xl font-bold transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-r from-brand-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-brand-500/30 scale-105' 
                      : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-700/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom: Format Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Format:</span>
            <div className="flex items-center gap-1.5 shrink-0 text-xs">
              {eventTypes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setSelectedType(t.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                    selectedType === t.value 
                      ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {t.icon && <t.icon className="w-3.5 h-3.5" />}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-400">
            Active Filter: <span className="text-brand-300 font-bold">{selectedCategory}</span>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Showing {events.length} Event{events.length === 1 ? '' : 's'}
          </span>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => handleCategoryChange('All')}
              className="text-xs text-brand-400 hover:text-brand-300 font-bold underline underline-offset-4"
            >
              Reset to All Spheres
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-80 rounded-3xl bg-slate-800/40 border border-slate-800" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 glass-card rounded-3xl border border-slate-800 space-y-3">
            <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No summits found in this category</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              We couldn't find any events matching your selected category and query. Try resetting filters.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedType('ALL');
                setSearchQuery('');
              }}
              className="mt-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-600/30 transition-all"
            >
              View All Events
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
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
      </div>

    </div>
  );
};
