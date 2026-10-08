import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, Calendar, Compass, Users, MessageSquare, 
  Layers, Shield, LogOut, ChevronDown, Bell, Search, 
  Menu, X, Award, QrCode, LogIn, User as UserIcon, 
  CheckCircle2, ArrowRight, KeyRound, Ticket
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { QRScannerModal } from './QRScannerModal';
import { LoginModal } from './LoginModal';
import { OtpGeneratorModal } from './OtpGeneratorModal';
import { ticketsApi } from '../services/api';

export const Navbar: React.FC = () => {
  const { user, role, switchRole, logout } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [otpGeneratorOpen, setOtpGeneratorOpen] = useState(false);
  const [bookedCount, setBookedCount] = useState<number>(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchBookings = async () => {
      if (user) {
        try {
          const regs = await ticketsApi.getMyRegistrations(user.id);
          const activeRegs = regs.filter(r => r.status !== 'CANCELLED');
          setBookedCount(activeRegs.length);
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchBookings();

    // Listen for storage and custom cancellation events
    window.addEventListener('storage', fetchBookings);
    window.addEventListener('es_booking_cancelled', fetchBookings);
    return () => {
      window.removeEventListener('storage', fetchBookings);
      window.removeEventListener('es_booking_cancelled', fetchBookings);
    };
  }, [user, location.pathname]);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'ATTENDEE', label: 'Attendee View', desc: 'Discover, ticket wallet, agenda, networking' },
    { role: 'ORGANIZER', label: 'Organizer Portal', desc: 'Create events, tickets, live analytics, check-in' },
    { role: 'ADMIN', label: 'Admin Console', desc: 'Platform health, orgs, audit logs & revenue' },
    { role: 'SPEAKER', label: 'Speaker Hub', desc: 'Assigned sessions, attendee questions, slides' },
    { role: 'SPONSOR', label: 'Sponsor Portal', desc: 'Booth stats, lead capture, tier analytics' },
  ];

  const handleRoleSwitch = (newRole: UserRole) => {
    switchRole(newRole);
    setRoleDropdownOpen(false);
    setUserDropdownOpen(false);
    if (newRole === 'ORGANIZER') navigate('/organizer/dashboard');
    else if (newRole === 'ADMIN') navigate('/admin/dashboard');
    else navigate('/dashboard');
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 bg-[#0B0F19]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
                  EVENT <span className="text-blue-400">SPHERE</span>
                </span>
                <span className="text-[10px] text-slate-400 tracking-wider font-medium -mt-1 hidden sm:inline">
                  CONNECT • ENGAGE • EXPERIENCE
                </span>
              </div>
            </Link>

            {/* Center Navigation Links */}
            <div className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-full border border-slate-800">
              <Link 
                to="/events" 
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive('/events') 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Compass className="w-4 h-4" />
                Discover Events
              </Link>

              {/* My Booked Events Link */}
              <Link 
                to="/dashboard" 
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive('/dashboard') 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 font-bold' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Ticket className="w-4 h-4 text-emerald-400" />
                <span>My Booked Events</span>
                {bookedCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                    {bookedCount}
                  </span>
                )}
              </Link>

              <Link 
                to="/agenda" 
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive('/agenda') 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Live Agenda
              </Link>

              <Link 
                to="/networking" 
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive('/networking') 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-4 h-4" />
                Networking
              </Link>

              {role === 'ORGANIZER' && (
                <Link 
                  to="/organizer/dashboard" 
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    location.pathname.startsWith('/organizer') 
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30' 
                      : 'text-purple-300 hover:text-white hover:bg-purple-900/40'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  Organizer Portal
                </Link>
              )}

              {role === 'ADMIN' && (
                <Link 
                  to="/admin/dashboard" 
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    location.pathname.startsWith('/admin') 
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30' 
                      : 'text-red-300 hover:text-white hover:bg-red-900/40'
                  }`}
                >
                  <Shield className="w-4 h-4" />
                  Admin Console
                </Link>
              )}
            </div>

            {/* Right Controls: Scan QR, Role Switcher, Gamification, User / Login */}
            <div className="flex items-center gap-2.5">
              
              {/* Generate OTP Button */}
              <button
                onClick={() => setOtpGeneratorOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600/30 to-indigo-600/30 hover:from-blue-600/50 hover:to-indigo-600/50 text-blue-300 hover:text-white border border-blue-500/40 text-xs font-bold transition-all shadow-sm"
                title="Generate and view OTP code directly on screen"
              >
                <KeyRound className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Generate OTP</span>
              </button>

              {/* Scan QR Button */}
              <button
                onClick={() => setQrScannerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-all shadow-sm"
                title="Scan QR Code to open respective page"
              >
                <QrCode className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">Scan QR</span>
              </button>

              {/* Gamification Points Badge */}
              {user && (
                <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>{user.points || 0} XP</span>
                </div>
              )}

              {/* Live Role Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
                  title="Switch Active Persona for Demo Testing"
                >
                  <span className={`w-2 h-2 rounded-full ${
                    role === 'ADMIN' ? 'bg-red-400' :
                    role === 'ORGANIZER' ? 'bg-purple-400' :
                    role === 'SPEAKER' ? 'bg-cyan-400' :
                    role === 'SPONSOR' ? 'bg-yellow-400' : 'bg-emerald-400'
                  }`} />
                  <span className="uppercase">{role}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel shadow-2xl py-2 z-50 border border-slate-700 bg-[#0F172A] backdrop-blur-xl">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                      Switch Active Persona
                    </div>
                    {roles.map((r) => (
                      <button
                        key={r.role}
                        onClick={() => handleRoleSwitch(r.role)}
                        className={`w-full text-left px-3 py-2.5 flex flex-col hover:bg-slate-800/80 transition-colors ${
                          role === r.role ? 'bg-blue-900/40 text-blue-300' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{r.label}</span>
                          {role === r.role && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Active</span>}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-0.5">{r.desc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notifications Trigger */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 relative transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-pink-500" />
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl shadow-2xl p-3 z-50 border border-slate-700 bg-[#0F172A]">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="text-xs font-bold text-white">Live Event Notifications</span>
                      <span className="text-[10px] text-blue-400 cursor-pointer">Mark all read</span>
                    </div>
                    <div className="space-y-2 mt-2 max-h-60 overflow-y-auto">
                      <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 text-xs">
                        <p className="font-semibold text-white">Opening Keynote starting in 15m</p>
                        <p className="text-slate-400 text-[11px]">Dr. Aris Thorne is taking the stage in Grand Hall A.</p>
                        <span className="text-[10px] text-slate-500">2 mins ago</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700 text-xs">
                        <p className="font-semibold text-blue-300">New Networking Match! (98%)</p>
                        <p className="text-slate-400 text-[11px]">Alex Mercer wants to connect based on shared AI skills.</p>
                        <span className="text-[10px] text-slate-500">12 mins ago</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Account / Profile Dropdown & Login Button */}
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-2 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 transition-all group"
                  >
                    <span className="text-xs font-bold text-white hidden md:inline group-hover:text-blue-300">
                      {user.firstName}
                    </span>
                    <img 
                      src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'} 
                      alt={user.firstName}
                      className="w-7 h-7 rounded-xl object-cover border border-blue-500/50"
                    />
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel shadow-2xl p-3 z-50 border border-blue-500/30 bg-[#0F172A] space-y-3">
                      {/* User Info Header */}
                      <div className="flex items-center gap-3 pb-2.5 border-b border-slate-800">
                        <img 
                          src={user.avatarUrl} 
                          alt="" 
                          className="w-10 h-10 rounded-xl object-cover border-2 border-blue-500 shadow-md"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-black text-white truncate">{user.firstName} {user.lastName}</h4>
                          <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                          <span className="text-[9px] uppercase font-bold text-blue-400 bg-blue-500/20 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                            {user.role}
                          </span>
                        </div>
                      </div>

                      {/* Navigation links */}
                      <div className="space-y-1 text-xs">
                        <Link
                          to="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-950/40 font-semibold transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Ticket className="w-3.5 h-3.5 text-emerald-400" />
                            <span>My Booked Events & Passes</span>
                          </div>
                          {bookedCount > 0 && (
                            <span className="text-[10px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                              {bookedCount}
                            </span>
                          )}
                        </Link>

                        <Link
                          to={role === 'ORGANIZER' ? '/organizer/dashboard' : role === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800 font-semibold transition-colors"
                        >
                          <span>Go to My Dashboard</span>
                          <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
                        </Link>

                        <button
                          onClick={() => { setUserDropdownOpen(false); setLoginModalOpen(true); }}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-blue-300 hover:text-white hover:bg-blue-900/40 font-semibold transition-colors text-left"
                        >
                          <span>Switch Account (1-Click)</span>
                          <LogIn className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Log Out */}
                      <div className="pt-1 border-t border-slate-800">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/40 text-xs font-bold transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setLoginModalOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition-all"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>

                  <Link 
                    to="/register" 
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                  >
                    <span>Register</span>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-2">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-left py-2 text-sm text-emerald-400 font-bold flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                <span>My Booked Events</span>
              </div>
              {bookedCount > 0 && (
                <span className="text-xs bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  {bookedCount} Passes
                </span>
              )}
            </Link>
            <button 
              onClick={() => { setMobileMenuOpen(false); setLoginModalOpen(true); }}
              className="w-full text-left py-2 text-sm text-blue-400 font-bold flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Switch Account</span>
            </button>
            <button 
              onClick={() => { setMobileMenuOpen(false); setQrScannerOpen(true); }}
              className="w-full text-left py-2 text-sm text-purple-400 font-bold flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan Any Event QR Code</span>
            </button>
            <Link to="/events" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-slate-200">Discover Events</Link>
            <Link to="/agenda" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-slate-200">Live Agenda</Link>
            <Link to="/networking" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-slate-200">Networking Lobby</Link>
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-slate-200">Attendee Dashboard</Link>
            <Link to="/organizer/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-purple-300">Organizer Dashboard</Link>
            <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-red-300">Admin Console</Link>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm text-blue-400 font-bold">Dedicated Login Page</Link>
          </div>
        )}
      </nav>

      {/* Universal QR Scanner Modal */}
      <QRScannerModal
        isOpen={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        title="Event Sphere QR Scanner"
      />

      {/* Universal Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
      />

      {/* Universal On-Screen OTP Generator Modal */}
      <OtpGeneratorModal
        isOpen={otpGeneratorOpen}
        onClose={() => setOtpGeneratorOpen(false)}
      />
    </>
  );
};
