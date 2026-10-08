import React from 'react';
import { 
  BarChart3, TrendingUp, Users, DollarSign, 
  Sparkles, Download, PieChart as PieIcon, Layers 
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, BarChart, 
  Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell 
} from 'recharts';

export const OrganizerAnalyticsPage: React.FC = () => {
  const tierData = [
    { name: 'Virtual Pass', value: 480, color: '#38bdf8' },
    { name: 'Standard Pass', value: 620, color: '#8b5cf6' },
    { name: 'VIP All-Access', value: 185, color: '#ec4899' },
  ];

  const checkinHourly = [
    { time: '08:00', count: 120 },
    { time: '08:30', count: 340 },
    { time: '09:00', count: 480 },
    { time: '09:30', count: 180 },
    { time: '10:00', count: 55 },
  ];

  const sessionOccupancy = [
    { session: 'Opening Keynote', occupancy: 94 },
    { session: 'RAG Workshop', occupancy: 88 },
    { session: 'Kafka Microservices', occupancy: 82 },
    { session: 'AI Networking Mixer', occupancy: 96 },
  ];

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
            <BarChart3 className="w-4 h-4" />
            <span>Deep-Dive Telemetry</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">
            Summit Analytics & Engagement Intelligence
          </h1>
        </div>

        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Executive Report</span>
        </button>
      </div>

      {/* Row 1: Ticket Tiers & Hourly Check-In */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Ticket Tier Breakdown */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="text-base font-bold text-white">Ticket Registrations by Tier</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {tierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 text-xs">
            {tierData.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                <span className="text-slate-300">{t.name} ({t.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Check-In Velocity */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="text-base font-bold text-white">Morning Gate Check-In Velocity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={checkinHourly}>
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-400 text-center">Peak arrival recorded between 08:30 AM and 09:15 AM</p>
        </div>

      </div>

      {/* Row 2: Session Room Occupancy Rates */}
      <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-4">
        <h3 className="text-base font-bold text-white">Stage & Workshop Room Occupancy (%)</h3>
        <div className="space-y-3 pt-2">
          {sessionOccupancy.map((s, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white font-bold">{s.session}</span>
                <span className="text-purple-400 font-bold">{s.occupancy}% capacity</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-500 to-pink-500 rounded-full"
                  style={{ width: `${s.occupancy}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
