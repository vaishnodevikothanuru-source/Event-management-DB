import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, DollarSign, Ticket, TrendingUp, 
  Calendar, PlusCircle, ArrowRight, BarChart3, 
  CheckCircle2, Sparkles, MessageSquare, QrCode 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, BarChart, Bar 
} from 'recharts';
import { eventsApi } from '../services/api';
import { EventItem } from '../types';

export const OrganizerDashboard: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await eventsApi.getAll();
      setEvents(data);
    };
    fetchEvents();
  }, []);

  const salesTrendData = [
    { day: 'Mon', revenue: 12400, registrations: 34 },
    { day: 'Tue', revenue: 18900, registrations: 52 },
    { day: 'Wed', revenue: 24500, registrations: 68 },
    { day: 'Thu', revenue: 31200, registrations: 89 },
    { day: 'Fri', revenue: 48900, registrations: 142 },
    { day: 'Sat', revenue: 54200, registrations: 165 },
    { day: 'Sun', revenue: 68400, registrations: 210 },
  ];

  const channelData = [
    { channel: 'Direct / AI Assistant', count: 480 },
    { channel: 'Community Referral', count: 320 },
    { channel: 'Social / LinkedIn', count: 250 },
    { channel: 'Sponsor Invites', count: 180 },
  ];

  return (
    <div className="space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 glass-panel rounded-3xl border border-purple-500/30 bg-slate-900/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
            <Sparkles className="w-4 h-4" />
            <span>Apex Innovation Group • Multi-Tenant Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            Organizer Operations Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor real-time ticket velocity, live stage check-ins, and audience engagement telemetry.
          </p>
        </div>

        <Link
          to="/organizer/events/create"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-brand-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 hover:scale-105 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Launch 12-Step Event Wizard</span>
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">$482,900</div>
          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+24.8% vs last summit</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Registrations</span>
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">1,285</div>
          <div className="text-[11px] text-brand-400 font-semibold">
            Capacity: 3,500 (36.7% booked)
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Live Check-In Rate</span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">91.4%</div>
          <div className="text-[11px] text-purple-400 font-semibold">
            1,175 / 1,285 Smart Badges Scanned
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold uppercase">Audience NPS Score</span>
            <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">+84 NPS</div>
          <div className="text-[11px] text-pink-400 font-semibold">
            Based on 640 survey responses
          </div>
        </div>

      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ticket Velocity Chart */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">7-Day Ticket Revenue Velocity ($)</h3>
              <p className="text-xs text-slate-400">Simulated real-time payment gateway streaming</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              Live Stream
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Breakdown */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
          <div>
            <h3 className="text-base font-bold text-white">Acquisition Channel</h3>
            <p className="text-xs text-slate-400">Registrations by source</p>
          </div>

          <div className="space-y-3 pt-2">
            {channelData.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">{item.channel}</span>
                  <span className="text-white font-bold">{item.count}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${(item.count / 480) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Active Events Table */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white">Active Hosted Conferences</h3>
          <Link to="/organizer/events/create" className="text-xs text-purple-400 font-bold hover:underline">
            + Create Another Event
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="pb-3 font-semibold">Event Name</th>
                <th className="pb-3 font-semibold">Format</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {events.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 pr-4 font-bold text-white flex items-center gap-3">
                    <img src={evt.logoImageUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                    <span>{evt.title}</span>
                  </td>
                  <td className="py-3.5 text-slate-300">
                    <span className="px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-300 border border-purple-800 text-[10px] font-bold">
                      {evt.eventType}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-400">{evt.startDate}</td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      {evt.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right space-x-2">
                    <Link 
                      to={`/events/${evt.slug}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
                    >
                      Public Page
                    </Link>
                    <Link 
                      to="/organizer/attendees"
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold"
                    >
                      Manage Attendees
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
