import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Shield, Users, Building, Calendar, DollarSign, 
  Activity, Settings, ChevronRight, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, switchRole } = useAuth();

  return (
    <div className="min-h-screen flex bg-[#0B0F19] text-slate-100">
      
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-slate-800 bg-[#070A12]/95 flex flex-col justify-between hidden md:flex shrink-0">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-md shadow-red-500/30">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                ADMIN <span className="text-red-400">CONSOLE</span>
              </span>
            </Link>
          </div>

          <div className="mx-4 my-4 p-3 rounded-xl bg-red-950/30 border border-red-800/40">
            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider block">Super Admin Access</span>
            <span className="text-xs font-bold text-white">Platform Governance</span>
          </div>

          <nav className="px-3 space-y-1">
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-red-600 text-white shadow-md shadow-red-600/30"
            >
              <Activity className="w-4 h-4" />
              <span>Platform Health & Stats</span>
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <img 
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80'} 
              alt="" 
              className="w-9 h-9 rounded-xl object-cover border border-red-500/50"
            />
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-red-400 font-medium">Platform Admin</p>
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
        <header className="h-16 glass-panel border-b border-slate-800 px-6 flex items-center justify-between bg-[#0B0F19]/80 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Admin /</span>
            <span className="text-xs font-bold text-white">System Governance & Health</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Postgres + pgvector + Kafka + Redis Active
          </div>
        </header>

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
