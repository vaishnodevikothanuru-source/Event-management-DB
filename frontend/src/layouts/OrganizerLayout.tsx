import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, PlusCircle, Calendar, Users, 
  Ticket, BarChart3, MessageSquare, Award, 
  FileText, Bot, Settings, ChevronRight, Sparkles, LogOut 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SphereAIWidget } from '../components/SphereAIWidget';

export const OrganizerLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, switchRole } = useAuth();

  const navItems = [
    { label: 'Overview Dashboard', path: '/organizer/dashboard', icon: LayoutDashboard },
    { label: '12-Step Event Wizard', path: '/organizer/events/create', icon: PlusCircle, badge: 'Wizard' },
    { label: 'Attendees & Check-In', path: '/organizer/attendees', icon: Users },
    { label: 'Live Engagement Hub', path: '/organizer/engagement', icon: MessageSquare },
    { label: 'Live Analytics & KPIs', path: '/organizer/analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex bg-[#0B0F19] text-slate-100">
      
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-slate-800 bg-[#070A12]/95 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shadow-md shadow-purple-500/30">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                ORGANIZER <span className="text-purple-400">HUB</span>
              </span>
            </Link>
          </div>

          {/* Org context pill */}
          <div className="mx-4 my-4 p-3 rounded-xl bg-purple-950/30 border border-purple-800/40">
            <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">Organization</span>
            <span className="text-xs font-bold text-white">Apex Innovation Group</span>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-purple-900/60 text-purple-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User footer & Back to Attendee button */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <img 
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'} 
              alt="" 
              className="w-9 h-9 rounded-xl object-cover border border-purple-500/50"
            />
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-purple-400 font-medium">Event Organizer</p>
            </div>
          </div>

          <button
            onClick={() => {
              switchRole('ATTENDEE');
              navigate('/dashboard');
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <span>Exit to Attendee View</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top bar */}
        <header className="h-16 glass-panel border-b border-slate-800 px-6 flex items-center justify-between bg-[#0B0F19]/80 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Portal /</span>
            <span className="text-xs font-bold text-white capitalize">
              {location.pathname.split('/').pop() || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              to="/organizer/events/create" 
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New Event</span>
            </Link>
          </div>
        </header>

        {/* Page Outlet */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <SphereAIWidget />
    </div>
  );
};
