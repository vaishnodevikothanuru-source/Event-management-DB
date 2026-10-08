import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Sparkles, CheckCircle2, Copy, Check, ExternalLink, 
  MapPin, Calendar, Users, ShieldCheck, Download, 
  Share2, ArrowLeft, Clock, Ticket, Link as LinkIcon, Key
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { INITIAL_USERS, INITIAL_EVENTS } from '../services/mockData';
import confetti from 'canvas-confetti';

export const PublicBadgePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [copied, setCopied] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(true);

  const event = INITIAL_EVENTS[0];
  const user = INITIAL_USERS[2]; // Elena Rostova
  const badgeToken = token || 'ES-SUMMIT2026-VIP-ELENA-9942';
  const otpCode = '849204';
  const badgeUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/pass/${badgeToken}` 
    : `http://localhost:3000/pass/${badgeToken}`;

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(otpCode);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2500);
  };

  const handleCopyAndOpenLink = () => {
    navigator.clipboard.writeText(badgeUrl);
    setCopied(true);
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.7 }
    });
    window.open(badgeUrl, '_blank');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleToggleCheckIn = () => {
    setIsCheckedIn(!isCheckedIn);
    if (!isCheckedIn) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 py-12 px-4 flex flex-col items-center justify-center">
      
      {/* Top Breadcrumb */}
      <div className="w-full max-w-md flex items-center justify-between mb-6">
        <Link 
          to="/dashboard"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Cryptographically Verified
        </span>
      </div>

      {/* Main Smart Badge Card */}
      <div className="w-full max-w-md rounded-3xl gradient-border p-1 bg-gradient-to-b from-blue-500 via-brand-500 to-purple-600 shadow-2xl">
        <div className="bg-[#0B0F19] rounded-[22px] p-6 sm:p-8 text-center relative overflow-hidden space-y-5">
          
          {/* Lanyard Hole Visual */}
          <div className="w-20 h-2.5 rounded-full bg-slate-800 mx-auto border border-slate-700 shadow-inner" />

          {/* Verification Status Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black tracking-wider uppercase">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isCheckedIn ? 'ACCESS GRANTED • CHECKED IN' : 'VALIDATED PASS • PENDING ENTRY'}</span>
          </div>

          {/* Attendee Avatar */}
          <div className="relative w-28 h-28 mx-auto">
            <img 
              src={user.avatarUrl} 
              alt={user.firstName}
              className="w-full h-full rounded-2xl object-cover border-2 border-blue-500 shadow-2xl"
            />
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-lg">
              {user.role}
            </span>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-2xl font-black text-white">{user.firstName} {user.lastName}</h1>
            <p className="text-xs font-bold text-blue-300">{user.jobTitle}</p>
            <p className="text-xs text-slate-400">{user.company} • {user.industry}</p>
          </div>

          {/* Summit Info Box */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-blue-400">Conference</span>
              <span className="text-[10px] font-bold text-purple-300">All-Access VIP</span>
            </div>
            <p className="text-xs font-bold text-white leading-tight">{event.title}</p>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                {event.startDate}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                Moscone Center, SF
              </span>
            </div>
          </div>

          {/* Scannable High-Res QR Code Box */}
          <a
            href={badgeUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Click QR Code to Open"
            className="p-4 bg-white rounded-2xl inline-block shadow-2xl border-4 border-blue-500 hover:scale-105 transition-transform cursor-pointer"
          >
            <QRCodeSVG 
              value={badgeUrl} 
              size={180}
              level="H"
              includeMargin={false}
              fgColor="#0B0F19"
              bgColor="#ffffff"
            />
            <span className="text-[10px] font-mono font-bold text-slate-950 block mt-2 tracking-tighter">
              {badgeToken} ↗
            </span>
          </a>

          {/* Entry OTP Passcode Card */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-brand-500/40 text-left space-y-1.5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-brand-400 flex items-center gap-1">
                <Key className="w-3.5 h-3.5 text-brand-400" />
                <span>Fast Entry OTP Passcode</span>
              </span>
              <button
                type="button"
                onClick={handleCopyOtp}
                className="flex items-center gap-1 text-[10px] font-bold text-brand-300 hover:text-white bg-brand-600/30 hover:bg-brand-600/50 px-2 py-0.5 rounded-lg border border-brand-500/30 transition-colors"
              >
                {copiedOtp ? <Check className="w-2.5 h-2.5 text-emerald-300" /> : <Copy className="w-2.5 h-2.5" />}
                <span>{copiedOtp ? 'Copied' : 'Copy OTP'}</span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-mono font-black tracking-widest text-white">{otpCode}</span>
              <span className="text-[10px] text-slate-400">Valid for Gate / Kiosk Verification</span>
            </div>
          </div>

          {/* HIGHLIGHTED BLUE SHARED LINK */}
          <div className="text-left space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-extrabold text-blue-400 tracking-wider flex items-center gap-1">
                <LinkIcon className="w-3 h-3 text-blue-400" />
                <span>Shared Link (Highlighted in Blue)</span>
              </span>
              <span className="text-[9px] font-bold text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded border border-blue-500/30">
                Verified URL
              </span>
            </div>
            <a
              href={badgeUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Click to Open Shared Link"
              className="flex items-center justify-between gap-2 p-3.5 rounded-2xl bg-blue-950/80 border-2 border-blue-400 text-blue-200 hover:text-white hover:bg-blue-900/90 shadow-[0_0_25px_rgba(59,130,246,0.35)] ring-2 ring-blue-500/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping shrink-0" />
                <span className="font-mono text-xs font-bold truncate underline decoration-blue-400 decoration-2 group-hover:decoration-white">
                  {badgeUrl}
                </span>
              </div>
              <span className="flex items-center gap-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-xl shrink-0 shadow-md shadow-blue-600/30 group-hover:scale-105 transition-all">
                <span>Open</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </span>
            </a>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(badgeUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2500);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>

              <a
                href={badgeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 hover:scale-[1.02] transition-all text-center"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open Link Now</span>
              </a>
            </div>

            <button
              onClick={handleCopyAndOpenLink}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xl shadow-blue-500/30 hover:scale-[1.02] transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4 text-blue-200" />}
              <span>Copy Link & Open Badge</span>
              <ExternalLink className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={handleToggleCheckIn}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                isCheckedIn 
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
              }`}
            >
              {isCheckedIn ? 'Status: Check-In Confirmed ✓' : 'Simulate Live Gate Check-In'}
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};
