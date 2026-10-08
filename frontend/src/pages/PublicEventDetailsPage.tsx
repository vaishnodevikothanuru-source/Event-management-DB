import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, Ticket, ArrowRight, 
  Globe, CheckCircle2, Clock, Share2, HelpCircle, 
  ChevronDown, ChevronUp, Copy, Check, ExternalLink, QrCode, Key,
  RotateCcw, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { eventsApi, ticketsApi } from '../services/api';
import { EventItem, Registration } from '../types';
import { TicketCheckoutModal } from '../components/TicketCheckoutModal';
import { DigitalBadgeModal } from '../components/DigitalBadgeModal';
import { CancelRefundModal } from '../components/CancelRefundModal';
import { LivePollWidget } from '../components/LivePollWidget';
import { LiveQnAWidget } from '../components/LiveQnAWidget';
import { ShareModal } from '../components/ShareModal';
import { QRScannerModal } from '../components/QRScannerModal';
import { INITIAL_POLLS, INITIAL_QUESTIONS } from '../services/mockData';

export const PublicEventDetailsPage: React.FC = () => {
  const { user } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [myRegistration, setMyRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [badgeModalOpen, setBadgeModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'AGENDA' | 'SPEAKERS' | 'ENGAGE' | 'SPONSORS'>('OVERVIEW');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleCancelled = (e: any) => {
      if (e.detail?.registration?.eventId === event?.id || e.detail?.registration?.id === myRegistration?.id) {
        setMyRegistration(null);
      }
    };
    window.addEventListener('es_booking_cancelled', handleCancelled);
    return () => window.removeEventListener('es_booking_cancelled', handleCancelled);
  }, [event, myRegistration]);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const found = await eventsApi.getBySlug(slug || 'global-ai-summit-2026');
        if (found) {
          setEvent(found);
          if (user) {
            const regs = await ticketsApi.getMyRegistrations(user.id);
            const matching = regs.find(r => (r.eventId === found.id || r.event?.slug === found.slug) && r.status !== 'CANCELLED');
            if (matching) setMyRegistration(matching);
            else setMyRegistration(null);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [slug, user]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-pulse">
        <div className="h-64 rounded-3xl bg-slate-800/40 max-w-4xl mx-auto mb-6" />
        <div className="h-8 w-64 bg-slate-800/60 rounded-xl mx-auto" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
        <p className="text-slate-400 mb-6">The requested summit could not be located or may have ended.</p>
        <Link to="/events" className="px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold">
          Return to Discovery
        </Link>
      </div>
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : `http://localhost:3000/events/${event.slug}`;

  return (
    <div className="space-y-12 pb-20">
      
      {/* 1. HERO BANNER */}
      <section className="relative w-full border-b border-slate-800 bg-slate-950 overflow-hidden">
        
        {/* Background Banner with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={event.bannerImageUrl} 
            alt={event.title}
            className="w-full h-full object-cover opacity-25 filter blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F19] via-[#0B0F19]/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
          <div className="max-w-4xl space-y-6">
            
            {/* Format & Category Tag */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-600/30 text-brand-300 border border-brand-500/40">
                {event.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-900/60 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                {event.eventType} Experience
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800/80 text-slate-300 border border-slate-700">
                Org: {event.organizationName || 'Apex Innovation'}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              {event.title}
            </h1>

            {/* Sub description */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
              {event.shortDescription}
            </p>

            {/* Booked VIP Confirmation Alert */}
            {myRegistration && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 shadow-2xl shadow-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-emerald-400">You Are Registered!</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950">
                        {myRegistration.ticketType?.name || 'Confirmed Pass'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Your digital badge and access permissions are active for this event.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const otp = myRegistration.otpCode || '849204';
                      navigator.clipboard.writeText(otp);
                      setCopiedOtp(true);
                      setTimeout(() => setCopiedOtp(false), 2500);
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950 border border-emerald-500/40 font-mono text-xs font-bold text-emerald-300 hover:bg-emerald-900/60 transition-colors"
                    title="Copy Check-In OTP"
                  >
                    <Key className="w-3.5 h-3.5 text-emerald-400" />
                    <span>OTP: {myRegistration.otpCode || '849204'}</span>
                    {copiedOtp ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                  </button>

                  <button
                    onClick={() => setBadgeModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Smart Badge</span>
                  </button>

                  <button
                    onClick={() => setCancelModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900/90 text-rose-300 border border-rose-500/40 text-xs font-bold transition-all"
                    title="Cancel Registration & Money Refund"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                    <span>Cancel & Refund</span>
                  </button>
                </div>
              </div>
            )}

            {/* Date, Location, Capacity Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800/80 text-brand-400 border border-slate-700">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block">Date & Time</span>
                  <span className="font-bold text-white">{event.startDate} • {event.startTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800/80 text-purple-400 border border-slate-700">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block">Venue Location</span>
                  <span className="font-bold text-white truncate max-w-[200px] block">{event.venueName || event.city}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-800/80 text-pink-400 border border-slate-700">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-slate-400 block">Capacity</span>
                  <span className="font-bold text-white">{event.capacity} Attendees Expected</span>
                </div>
              </div>
            </div>

            {/* CTA Register Actions */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setCheckoutModalOpen(true)}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl text-white font-bold text-sm shadow-xl transition-all ${
                  myRegistration 
                    ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700' 
                    : 'bg-gradient-to-r from-brand-600 via-purple-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 shadow-brand-500/30 hover:scale-105'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>{myRegistration ? 'Book Additional Pass' : `Get Passes (From $${event.ticketTypes?.[0]?.price || 99})`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button 
                onClick={() => setShareModalOpen(true)}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-md"
              >
                <Share2 className="w-4 h-4 text-brand-400" />
                <span>Share & QR Code</span>
              </button>

              <button 
                onClick={() => setScannerModalOpen(true)}
                className="flex items-center gap-2 px-4 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-purple-300 text-xs font-semibold border border-purple-800/60 transition-colors"
              >
                <QrCode className="w-4 h-4" />
                <span>Scan Badge</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Digital Badge Modal for this event */}
      {myRegistration && (
        <>
          <DigitalBadgeModal
            isOpen={badgeModalOpen}
            onClose={() => setBadgeModalOpen(false)}
            registration={myRegistration}
          />

          <CancelRefundModal
            isOpen={cancelModalOpen}
            onClose={() => setCancelModalOpen(false)}
            registration={myRegistration}
            onCancellationSuccess={() => {
              setMyRegistration(null);
              setCancelModalOpen(false);
            }}
          />
        </>
      )}

      {/* 2. NAVIGATION TABS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'OVERVIEW', label: 'Overview & Passes' },
            { id: 'AGENDA', label: 'Live Agenda & Schedule' },
            { id: 'SPEAKERS', label: `Keynote Speakers (${event.speakers?.length || 0})` },
            { id: 'ENGAGE', label: 'Live Stage Engagement' },
            { id: 'SPONSORS', label: 'Sponsors & Expo' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === t.id 
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. TAB CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'OVERVIEW' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Col: Description & FAQs */}
            <div className="lg:col-span-2 space-y-8">
              
              <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-xl font-bold text-white">About the Summit</h3>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {event.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-slate-800 text-brand-300 px-3 py-1 rounded-lg border border-slate-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* FAQs Accordion */}
              {event.faqs && event.faqs.length > 0 && (
                <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-brand-400" />
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-3">
                    {event.faqs.map((faq, index) => (
                      <div 
                        key={index}
                        className="rounded-2xl border border-slate-800 bg-slate-800/30 overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                          className="w-full p-4 text-left flex items-center justify-between text-xs font-bold text-white hover:bg-slate-800/60 transition-colors"
                        >
                          <span>{faq.question}</span>
                          {expandedFaq === index ? <ChevronUp className="w-4 h-4 text-brand-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </button>
                        {expandedFaq === index && (
                          <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                            {faq.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Col: Ticket Options */}
            <div className="space-y-6" id="tickets">
              <div className="glass-card p-6 rounded-3xl border border-brand-500/30 bg-slate-900/80 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Conference Passes</h3>
                  <span className="text-[10px] bg-brand-500/20 text-brand-300 px-2 py-0.5 rounded-full font-bold">
                    Official Tickets
                  </span>
                </div>

                <div className="space-y-3">
                  {event.ticketTypes?.map((t) => {
                    const isPurchased = myRegistration?.ticketTypeId === t.id;
                    return (
                      <div 
                        key={t.id}
                        className={`p-4 rounded-2xl border transition-all space-y-3 ${
                          isPurchased 
                            ? 'border-emerald-500/80 bg-emerald-950/30 shadow-lg shadow-emerald-500/10' 
                            : 'border-slate-700/80 bg-slate-800/40 hover:border-brand-500/50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white">{t.name}</h4>
                              {isPurchased && (
                                <span className="text-[9px] font-black uppercase bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full shadow-sm">
                                  ✓ Your Booked Pass
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{t.description}</p>
                          </div>
                          <span className="text-lg font-black text-brand-400">${t.price}</span>
                        </div>

                        <ul className="space-y-1 text-[11px] text-slate-300">
                          {t.perks.map((p, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => {
                            if (isPurchased) {
                              setBadgeModalOpen(true);
                            } else {
                              setCheckoutModalOpen(true);
                            }
                          }}
                          className={`w-full py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                            isPurchased 
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30' 
                              : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-600/30'
                          }`}
                        >
                          {isPurchased ? 'View Your Smart Badge' : 'Select Tier'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* AGENDA TAB */}
        {activeTab === 'AGENDA' && (
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-6">Summit Schedule & Tracks</h3>

              <div className="space-y-4">
                {event.sessions?.map((s) => (
                  <div 
                    key={s.id}
                    className="p-5 rounded-2xl border border-slate-800 bg-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-brand-500/40 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase">
                          {s.sessionType}
                        </span>
                        <span className="text-xs text-slate-400">{s.track} • Room: {s.room}</span>
                      </div>
                      <h4 className="text-base font-bold text-white">{s.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">{s.description}</p>
                    </div>

                    <div className="shrink-0 flex items-center md:flex-col md:items-end gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-bold bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700">
                        <Clock className="w-3.5 h-3.5 text-brand-400" />
                        <span>{s.startTime} - {s.endTime}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SPEAKERS TAB */}
        {activeTab === 'SPEAKERS' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {event.speakers?.map((spk) => (
              <div 
                key={spk.id}
                className="glass-card rounded-3xl p-6 border border-slate-800 bg-slate-900/60 text-center space-y-4"
              >
                <img 
                  src={spk.avatarUrl} 
                  alt={spk.name}
                  className="w-24 h-24 rounded-2xl object-cover mx-auto border-2 border-brand-500/40 shadow-xl"
                />
                <div>
                  <h4 className="text-base font-bold text-white">{spk.name}</h4>
                  <p className="text-xs text-brand-400 font-semibold">{spk.jobTitle}</p>
                  <p className="text-xs text-slate-400">{spk.company}</p>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {spk.bio}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ENGAGEMENT TAB */}
        {activeTab === 'ENGAGE' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <LivePollWidget poll={INITIAL_POLLS[0]} />
            <LiveQnAWidget eventId={event.id} initialQuestions={INITIAL_QUESTIONS} />
          </div>
        )}

        {/* SPONSORS TAB */}
        {activeTab === 'SPONSORS' && (
          <div className="glass-card p-8 rounded-3xl border border-slate-800 space-y-8 text-center">
            <h3 className="text-2xl font-black text-white">Event Sponsors & Expo Partners</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {event.sponsors?.map((s) => (
                <div key={s.id} className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-3">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {s.tier} Sponsor
                  </span>
                  <h4 className="text-lg font-bold text-white">{s.name}</h4>
                  <p className="text-xs text-slate-400">{s.description}</p>
                  <p className="text-xs text-brand-400 font-semibold">{s.boothLocation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Ticket Checkout Modal */}
      <TicketCheckoutModal
        event={event}
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* Share & QR Code Modal */}
      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        title={event.title}
        url={currentUrl}
        description={`Join me at ${event.title}!`}
      />

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={scannerModalOpen}
        onClose={() => setScannerModalOpen(false)}
        title="Scan Summit or Badge QR"
      />

    </div>
  );
};
