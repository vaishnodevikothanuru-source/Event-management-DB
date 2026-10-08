import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Ticket, Calendar, Award, Sparkles, QrCode, 
  ArrowRight, CheckCircle2, Clock, MapPin, Users, Bot, 
  Share2, Copy, ExternalLink, Key, Check, Mail, 
  Phone, Building, Briefcase, Tag, Edit3, X, Save, 
  ShieldCheck, Zap, UserCheck, RotateCcw, DollarSign,
  Receipt, Download, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ticketsApi } from '../services/api';
import { Registration, CancellationRefund } from '../types';
import { DigitalBadgeModal } from '../components/DigitalBadgeModal';
import { CancelRefundModal } from '../components/CancelRefundModal';
import { ShareModal } from '../components/ShareModal';
import { QRScannerModal } from '../components/QRScannerModal';
import confetti from 'canvas-confetti';

export const AttendeeDashboard: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copiedOtpId, setCopiedOtpId] = useState<string | null>(null);
  const [dashboardTab, setDashboardTab] = useState<'ACTIVE' | 'REFUNDS'>('ACTIVE');
  const [selectedCancelReg, setSelectedCancelReg] = useState<Registration | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [refundsHistory, setRefundsHistory] = useState<CancellationRefund[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile Form state
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    jobTitle: '',
    company: '',
    industry: '',
    phone: '',
    bio: '',
    skills: '',
    interests: ''
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        jobTitle: user.jobTitle || 'Lead AI Engineer',
        company: user.company || 'Nexus Robotics',
        industry: user.industry || 'Artificial Intelligence',
        phone: user.phone || '+1 (555) 234-5678',
        bio: user.bio || 'Exploring Autonomous Agents, Frontier Models, and High-Throughput RAG Architectures.',
        skills: (user.skills || ['PyTorch', 'LLMs', 'Distributed Systems', 'pgvector']).join(', '),
        interests: (user.interests || ['Agents Swarms', 'RAG', 'Microservices']).join(', ')
      });
    }
  }, [user]);

  const fetchMyData = async () => {
    if (!user) return;
    try {
      const [regs, refunds] = await Promise.all([
        ticketsApi.getMyRegistrations(user.id),
        ticketsApi.getRefundHistory(user.id)
      ]);
      setRegistrations(regs);
      setRefundsHistory(refunds);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyData();

    const handleCancelled = () => {
      fetchMyData();
    };
    window.addEventListener('es_booking_cancelled', handleCancelled);
    return () => window.removeEventListener('es_booking_cancelled', handleCancelled);
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateProfile({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        jobTitle: editForm.jobTitle,
        company: editForm.company,
        industry: editForm.industry,
        phone: editForm.phone,
        bio: editForm.bio,
        skills: editForm.skills.split(',').map(s => s.trim()).filter(Boolean),
        interests: editForm.interests.split(',').map(s => s.trim()).filter(Boolean)
      });
      setEditProfileOpen(false);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  const achievements = [
    { title: 'Early Pioneer', desc: 'Registered for Global AI Summit 2026', xp: '+100 XP', icon: Sparkles, unlocked: true },
    { title: 'Live Pollster', desc: 'Voted in stage engagement polls', xp: '+50 XP', icon: Award, unlocked: true },
    { title: 'Pro Networker', desc: 'Connected with 3+ attendees via AI Match', xp: '+150 XP', icon: Users, unlocked: true },
    { title: 'Inquisitive Mind', desc: 'Submitted a question during Keynote Q&A', xp: '+40 XP', icon: Bot, unlocked: false }
  ];

  const handleOpenShare = (reg: Registration) => {
    const url = `${window.location.origin}/pass/${reg.qrCodeToken}`;
    setShareUrl(url);
    setShareModalOpen(true);
  };

  const handleDownloadRefundReceipt = (refItem: CancellationRefund) => {
    const receiptText = `
=====================================================
          EVENT SPHERE - OFFICIAL REFUND RECEIPT
=====================================================
Refund ID:        ${refItem.id}
Transaction Ref:  ${refItem.transactionRef}
Date & Time:      ${new Date(refItem.cancelledAt).toLocaleString()}
Status:           ${refItem.status}

EVENT DETAILS
-----------------------------------------------------
Event:            ${refItem.eventTitle}
Pass Tier:        ${refItem.ticketTypeName}
Ticket Price:     ${refItem.currency} $${refItem.amount.toFixed(2)}
Processing Fee:   $0.00 (100% Money-Back Guarantee)
Net Refund:       ${refItem.currency} $${refItem.amount.toFixed(2)}

WITHDRAWAL DESTINATION
-----------------------------------------------------
Method:           ${refItem.refundMethod}
Account Details:  ${refItem.accountDetails}
Cancellation Rsn: ${refItem.reason}

=====================================================
Thank you for using EventSphere. If you have questions,
please contact support@eventsphere.io
=====================================================
    `.trim();

    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EventSphere_Refund_${refItem.transactionRef}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const displayName = user ? `${user.firstName} ${user.lastName}` : 'Elena Rostova';
  const displayTitle = user?.jobTitle || 'Lead AI Engineer';
  const displayCompany = user?.company || 'Nexus Robotics';
  const displayIndustry = user?.industry || 'Artificial Intelligence';
  const displayEmail = user?.email || 'attendee@nexus.io';
  const displayPhone = user?.phone || '+1 (555) 234-5678';
  const displaySkills = user?.skills && user.skills.length > 0 
    ? user.skills 
    : ['PyTorch', 'LLMs', 'Distributed Systems', 'pgvector'];
  const displayInterests = user?.interests && user.interests.length > 0 
    ? user.interests 
    : ['Agents Swarms', 'RAG', 'Microservices'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Attendee Welcome & Identity Header */}
      <div className="relative overflow-hidden glass-panel rounded-3xl border border-blue-500/30 bg-gradient-to-r from-[#0F172A] via-slate-900 to-[#0F172A] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Avatar & Details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img 
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'} 
                alt={displayName} 
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-blue-500 shadow-2xl shadow-blue-500/20"
              />
              <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-md flex items-center gap-1 border border-blue-400">
                <UserCheck className="w-3 h-3" />
                <span>ATTENDEE</span>
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {displayName}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Attendee</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-blue-300 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1 text-white">
                  <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                  {displayTitle}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Building className="w-3.5 h-3.5 text-purple-400" />
                  {displayCompany}
                </span>
                <span>•</span>
                <span className="text-slate-400">{displayIndustry}</span>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-brand-400" />
                  {displayEmail}
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-cyan-400" />
                  {displayPhone}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons & XP Card */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setEditProfileOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all shadow-md hover:border-blue-500"
            >
              <Edit3 className="w-4 h-4 text-blue-400" />
              <span>Edit Details</span>
            </button>

            <button
              onClick={() => setScannerModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all shadow-md hover:border-purple-500"
            >
              <QrCode className="w-4 h-4 text-purple-400" />
              <span>Scan QR / OTP</span>
            </button>

            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <Award className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-black text-amber-300 tracking-wider block">Attendee XP</span>
                <span className="text-sm font-black text-white">{user?.points || 850} XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendee Profile Details & Skills Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Bio & Contact Details */}
        <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span>Attendee Profile Summary</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Active Session</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {user?.bio || 'Exploring Autonomous Agents, Frontier Models, and High-Throughput RAG Architectures at Event Sphere 2026.'}
          </p>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Account ID:</span>
              <span className="font-mono text-slate-300 truncate max-w-[150px]">{user?.id || 'usr_attendee_default'}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-emerald-400 font-semibold">Registered & Authenticated</span>
            </div>
          </div>
        </div>

        {/* Technical Skills */}
        <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-purple-400" />
            <span>Attendee Skills & Specialties</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {displaySkills.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 text-[11px] font-bold">
                {skill}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 pt-1">Used by Sphere AI for matchmaking & agenda curation.</p>
        </div>

        {/* Interests & Networking */}
        <div className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/60 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span>Conference Interests & Match</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {displayInterests.map((interest, i) => (
              <span key={i} className="px-2.5 py-1 rounded-xl bg-pink-950/60 border border-pink-500/30 text-pink-300 text-[11px] font-bold">
                {interest}
              </span>
            ))}
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Match Compatibility:</span>
            <span className="text-emerald-400 font-bold">98% High Precision</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Passes & Wallet / Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: My Registered Passes & Refunds */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDashboardTab('ACTIVE')}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  dashboardTab === 'ACTIVE'
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>Active Passes ({registrations.filter(r => r.status !== 'CANCELLED').length})</span>
              </button>

              <button
                onClick={() => setDashboardTab('REFUNDS')}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  dashboardTab === 'REFUNDS'
                    ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-600/30'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                <span>Refunds & Withdrawals ({refundsHistory.length})</span>
              </button>
            </div>

            <Link to="/events" className="text-xs text-blue-400 font-bold hover:text-blue-300 flex items-center gap-1">
              <span>Browse Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* ACTIVE PASSES VIEW */}
          {dashboardTab === 'ACTIVE' && (
            <>
              {registrations.filter(r => r.status !== 'CANCELLED').length === 0 ? (
                <div className="p-8 text-center glass-card rounded-3xl border border-slate-800 space-y-3">
                  <Ticket className="w-10 h-10 text-slate-600 mx-auto" />
                  <h3 className="text-sm font-bold text-white">No active passes currently</h3>
                  <p className="text-xs text-slate-400">Discover upcoming summits and secure your pass with instant OTP verification.</p>
                  <Link to="/events" className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md">
                    Discover Summits & Passes
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {registrations.filter(r => r.status !== 'CANCELLED').map((reg) => (
                    <div 
                      key={reg.id}
                      className="glass-card p-5 rounded-3xl border border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-500/40 transition-all shadow-lg"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {reg.status}
                          </span>
                          <span className="text-xs text-slate-400">Pass Tier: <strong className="text-white">{reg.ticketType?.name || 'All-Access Pass'}</strong></span>
                        </div>

                        <h3 className="text-base font-bold text-white">
                          {reg.event?.title || 'Global AI & Autonomous Agents Summit 2026'}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-blue-400" />
                            {reg.event?.startDate || 'Nov 15, 2026'}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-purple-400" />
                            {reg.event?.venueName || 'Moscone Center'}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const otp = reg.otpCode || '849204';
                              navigator.clipboard.writeText(otp);
                              setCopiedOtpId(reg.id);
                              setTimeout(() => setCopiedOtpId(null), 2500);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/70 border border-blue-500/40 text-[11px] font-mono font-bold text-blue-300 hover:bg-blue-900/60 transition-colors"
                            title="Click to copy entry OTP passcode"
                          >
                            <Key className="w-3 h-3 text-blue-400" />
                            <span>OTP: {reg.otpCode || '849204'}</span>
                            {copiedOtpId === reg.id ? (
                              <Check className="w-3 h-3 text-emerald-400 ml-0.5" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-500 ml-0.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setSelectedReg(reg);
                            setBadgeModalOpen(true);
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
                        >
                          <QrCode className="w-4 h-4" />
                          <span>Smart Badge</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedCancelReg(reg);
                            setCancelModalOpen(true);
                          }}
                          className="flex items-center gap-1 px-3 py-2.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all shadow-sm"
                          title="Cancel Booking & Money Withdrawal"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                          <span className="hidden sm:inline">Cancel & Refund</span>
                        </button>

                        <button
                          onClick={() => handleOpenShare(reg)}
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-white transition-colors"
                          title="Share & Scan Badge"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        <Link
                          to={`/events/${reg.event?.slug || 'global-ai-summit-2026'}`}
                          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Go to Event Hub"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* REFUNDS & WITHDRAWALS VIEW */}
          {dashboardTab === 'REFUNDS' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Guarantee Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">100% Refund & Money Withdrawal Protection</h4>
                    <p className="text-[11px] text-slate-300">All cancellations receive immediate payout with zero processing deductions.</p>
                  </div>
                </div>
                <span className="hidden sm:inline-block px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                  INSTANT PAYOUTS
                </span>
              </div>

              {refundsHistory.length === 0 ? (
                <div className="p-8 text-center glass-card rounded-3xl border border-slate-800 space-y-2">
                  <RotateCcw className="w-9 h-9 text-slate-600 mx-auto" />
                  <h4 className="text-sm font-bold text-white">No refund transactions</h4>
                  <p className="text-xs text-slate-400">You haven't cancelled any event bookings. All active registrations are valid.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {refundsHistory.map((item) => (
                    <div 
                      key={item.id}
                      className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                        <div>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {item.status} • 100% REFUNDED
                          </span>
                          <h4 className="text-base font-bold text-white mt-1">{item.eventTitle}</h4>
                          <p className="text-xs text-slate-400">Tier: <strong className="text-slate-200">{item.ticketTypeName}</strong></p>
                        </div>

                        <div className="sm:text-right">
                          <span className="text-[10px] text-slate-400 block">Refund Paid</span>
                          <span className="text-lg font-black text-emerald-400 block">
                            {item.currency} ${item.amount.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-400">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Payout Destination</span>
                          <span className="font-semibold text-slate-300 truncate block">{item.accountDetails}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Cancellation Reason</span>
                          <span className="font-semibold text-slate-300 truncate block">{item.reason}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Transaction Reference</span>
                          <span className="font-mono text-emerald-300 font-bold block">{item.transactionRef}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500">
                          Cancelled on {new Date(item.cancelledAt).toLocaleDateString()}
                        </span>

                        <button
                          onClick={() => handleDownloadRefundReceipt(item)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Receipt (.TXT)</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* AI Personalized Recommendations Box */}
          <div className="glass-card p-6 rounded-3xl border border-purple-500/30 bg-purple-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Sphere AI Personalized Agenda Recommendations</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tailored for <strong className="text-purple-300">{displayTitle}</strong> with expertise in <strong className="text-blue-300">{displaySkills[0] || 'AI'} & {displaySkills[1] || 'Cloud'}</strong>:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] text-blue-400 font-bold block">11:15 AM • Workshop Room 2B</span>
                <p className="font-bold text-white">Architecting Production RAG with pgvector</p>
                <Link to="/agenda" className="text-[11px] text-purple-400 font-semibold hover:underline block pt-1">Add to Agenda →</Link>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] text-cyan-400 font-bold block">02:00 PM • Auditorium C</span>
                <p className="font-bold text-white">High-Throughput Microservices with Kafka</p>
                <Link to="/agenda" className="text-[11px] text-purple-400 font-semibold hover:underline block pt-1">Add to Agenda →</Link>
              </div>
            </div>
          </div>

        </div>

        {/* Right Col: Achievements & Gamification Badges */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 bg-slate-900/80 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Achievements & Badges
              </h3>
              <span className="text-[10px] text-amber-400 font-bold">Level 4 Innovator</span>
            </div>

            <div className="space-y-3">
              {achievements.map((ach, i) => {
                const Icon = ach.icon;
                return (
                  <div 
                    key={i}
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 ${
                      ach.unlocked 
                        ? 'border-amber-500/30 bg-amber-950/20' 
                        : 'border-slate-800 bg-slate-800/20 opacity-50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      ach.unlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white truncate">{ach.title}</h4>
                        <span className="text-[10px] font-bold text-amber-400">{ach.xp}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{ach.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Edit Profile Modal */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-blue-500/40 bg-[#0F172A] shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Edit Attendee Profile</h3>
              </div>
              <button 
                onClick={() => setEditProfileOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-semibold">First Name</label>
                  <input 
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-semibold">Last Name</label>
                  <input 
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-semibold">Job Title</label>
                  <input 
                    type="text"
                    value={editForm.jobTitle}
                    onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-semibold">Company</label>
                  <input 
                    type="text"
                    value={editForm.company}
                    onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-semibold">Industry</label>
                  <input 
                    type="text"
                    value={editForm.industry}
                    onChange={(e) => setEditForm({ ...editForm, industry: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-semibold">Phone (for SMS OTP)</label>
                  <input 
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">Bio</label>
                <textarea 
                  rows={2}
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1 font-semibold">Skills (comma separated)</label>
                <input 
                  type="text"
                  value={editForm.skills}
                  onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                  placeholder="e.g. PyTorch, LLMs, Distributed Systems"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Badge Modal */}
      {selectedReg && (
        <DigitalBadgeModal
          registration={selectedReg}
          isOpen={badgeModalOpen}
          onClose={() => setBadgeModalOpen(false)}
        />
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={selectedReg?.event?.title || 'Event Sphere Smart Badge'}
        url={shareUrl}
      />

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={scannerModalOpen}
        onClose={() => setScannerModalOpen(false)}
      />

      {/* Cancel & Refund Modal */}
      <CancelRefundModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedCancelReg(null);
        }}
        registration={selectedCancelReg}
        onCancellationSuccess={() => {
          fetchMyData();
          setCancelModalOpen(false);
          setSelectedCancelReg(null);
        }}
      />

    </div>
  );
};
