import React, { useState } from 'react';
import { 
  Calendar, Clock, MapPin, Users, Bookmark, 
  BookmarkCheck, Sparkles, Filter, Bot 
} from 'lucide-react';
import { INITIAL_EVENTS } from '../services/mockData';
import { Session } from '../types';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export const AgendaPage: React.FC = () => {
  const [selectedTrack, setSelectedTrack] = useState<string>('ALL');
  const [savedSessionIds, setSavedSessionIds] = useState<string[]>(['sess1111-1111-1111-1111-111111111111']);
  const { awardPoints } = useAuth();

  const event = INITIAL_EVENTS[0];
  const sessions = event.sessions || [];

  const tracks = ['ALL', 'Grand Stage A', 'Technical Track', 'Backend Architecture Stage'];

  const toggleBookmark = (sessionId: string) => {
    if (savedSessionIds.includes(sessionId)) {
      setSavedSessionIds(savedSessionIds.filter(id => id !== sessionId));
    } else {
      setSavedSessionIds([...savedSessionIds, sessionId]);
      awardPoints(25, 'Session Bookmarked');
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 }
      });
    }
  };

  const filteredSessions = sessions.filter(s => 
    selectedTrack === 'ALL' || s.track === selectedTrack
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-400">
            <Calendar className="w-4 h-4" />
            <span>Interactive Schedule</span>
          </div>
          <h1 className="text-3xl font-black text-white">Conference Agenda & Masterclasses</h1>
          <p className="text-xs text-slate-400 mt-1">
            Global AI & Autonomous Agents Summit 2026 • Filter by stage track or bookmark sessions to your personal schedule.
          </p>
        </div>

        {/* Track Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          {tracks.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTrack(t)}
              className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                selectedTrack === t 
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Timeline */}
      <div className="space-y-4">
        {filteredSessions.map((session) => {
          const isSaved = savedSessionIds.includes(session.id);
          return (
            <div 
              key={session.id}
              className={`glass-card p-6 rounded-3xl border transition-all ${
                isSaved 
                  ? 'border-brand-500/60 bg-brand-950/20 ring-1 ring-brand-500/30' 
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                
                {/* Time & Stage Col */}
                <div className="md:w-48 shrink-0 space-y-2 border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Clock className="w-4 h-4 text-brand-400" />
                    <span>{session.startTime} - {session.endTime}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span className="truncate">{session.room}</span>
                  </div>
                  <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-brand-300 border border-slate-700 uppercase">
                    {session.sessionType}
                  </span>
                </div>

                {/* Session Main Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-purple-400">{session.track}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white leading-snug">
                    {session.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {session.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{session.capacity} capacity</span>
                    </span>
                    <span className="text-emerald-400 font-medium">Live Q&A Enabled</span>
                  </div>
                </div>

                {/* Bookmark Action */}
                <div className="shrink-0 flex items-center md:flex-col justify-end">
                  <button
                    onClick={() => toggleBookmark(session.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSaved
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    <span>{isSaved ? 'Saved to Calendar' : 'Save Session'}</span>
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
