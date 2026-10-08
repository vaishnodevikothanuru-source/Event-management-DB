import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, Ticket, ArrowRight, 
  Sparkles, Video, Globe, CheckCircle2 
} from 'lucide-react';
import { EventItem } from '../types';

interface EventCardProps {
  event: EventItem;
  isBooked?: boolean;
  bookedPassTier?: string;
}

export const EventCard: React.FC<EventCardProps> = ({ event, isBooked, bookedPassTier }) => {
  const lowestPrice = event.ticketTypes && event.ticketTypes.length > 0 
    ? Math.min(...event.ticketTypes.map(t => t.price))
    : 0;

  return (
    <div className={`glass-card rounded-2xl overflow-hidden border bg-slate-900/60 flex flex-col group transition-all duration-300 ${
      isBooked 
        ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10' 
        : 'border-slate-800/80 hover:border-brand-500/40'
    }`}>
      
      {/* Banner Image with Badges */}
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={event.bannerImageUrl} 
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {isBooked && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 border border-emerald-300 shadow-lg shadow-emerald-500/30 flex items-center gap-1 animate-pulse">
              <CheckCircle2 className="w-3 h-3 text-slate-950" />
              <span>Booked Pass</span>
            </span>
          )}

          {(() => {
            const cat = (event.category || '').toLowerCase();
            let catStyle = 'bg-slate-900/80 text-slate-200 border-slate-700/60';
            if (cat.includes('corporate')) catStyle = 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40 shadow-indigo-500/20';
            else if (cat.includes('education') || cat.includes('workshop')) catStyle = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20';
            else if (cat.includes('hackathon') || cat.includes('tech')) catStyle = 'bg-amber-950/80 text-amber-300 border-amber-500/40 shadow-amber-500/20';
            else if (cat.includes('festival')) catStyle = 'bg-pink-950/80 text-pink-300 border-pink-500/40 shadow-pink-500/20';
            else if (cat.includes('webinar') || cat.includes('virtual')) catStyle = 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 shadow-cyan-500/20';

            return (
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md border shadow-sm ${catStyle}`}>
                {event.category}
              </span>
            );
          })()}

          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md flex items-center gap-1 ${
            event.eventType === 'HYBRID' 
              ? 'bg-purple-900/80 text-purple-300 border border-purple-500/30'
              : event.eventType === 'ONLINE'
                ? 'bg-cyan-900/80 text-cyan-300 border border-cyan-500/30'
                : 'bg-emerald-900/80 text-emerald-300 border border-emerald-500/30'
          }`}>
            {event.eventType === 'HYBRID' && <Globe className="w-3 h-3" />}
            {event.eventType === 'ONLINE' && <Video className="w-3 h-3" />}
            {event.eventType === 'OFFLINE' && <MapPin className="w-3 h-3" />}
            {event.eventType}
          </span>
        </div>

        {/* Capacity */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-semibold bg-black/60 text-slate-300 border border-white/10 flex items-center gap-1">
          <Users className="w-3 h-3" />
          <span>{event.capacity} seats</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-brand-400 font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>{event.startDate} • {event.startTime}</span>
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-brand-300 transition-colors line-clamp-1">
            {event.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {event.shortDescription || event.description}
          </p>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate">{event.venueName || event.city || 'Virtual Main Stage'}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {event.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] bg-slate-800/80 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700/60">
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer info & CTA */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              {isBooked ? 'Your Booking' : 'Tickets From'}
            </span>
            <span className={`text-sm font-extrabold ${isBooked ? 'text-emerald-400' : 'text-white'}`}>
              {isBooked ? (bookedPassTier || 'Pass Confirmed') : (lowestPrice === 0 ? 'Free' : `$${lowestPrice} USD`)}
            </span>
          </div>

          <Link
            to={`/events/${event.slug}`}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-md ${
              isBooked
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                : 'bg-brand-600 hover:bg-brand-500 shadow-brand-600/30'
            }`}
          >
            <span>{isBooked ? 'View Pass & Hub' : 'View Event'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

      </div>

    </div>
  );
};
