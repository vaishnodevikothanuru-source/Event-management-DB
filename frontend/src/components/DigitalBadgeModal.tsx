import React, { useState } from 'react';
import { 
  X, Download, Share2, Sparkles, ShieldCheck, 
  Copy, Check, ExternalLink, QrCode, CheckCircle2, 
  Link as LinkIcon, Key
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Registration } from '../types';
import confetti from 'canvas-confetti';

interface DigitalBadgeModalProps {
  registration: Registration;
  isOpen: boolean;
  onClose: () => void;
}

export const DigitalBadgeModal: React.FC<DigitalBadgeModalProps> = ({
  registration,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

  if (!isOpen) return null;

  const eventTitle = registration.event?.title || 'Global AI & Autonomous Agents Summit 2026';
  const attendeeName = registration.user 
    ? `${registration.user.firstName} ${registration.user.lastName}` 
    : 'Elena Rostova';
  const role = registration.user?.role || 'ATTENDEE';
  const company = registration.user?.company || 'Nexus Robotics';
  const jobTitle = registration.user?.jobTitle || 'Lead AI Engineer';
  const ticketTier = registration.ticketType?.name || 'All-Access VIP Pass';
  const qrToken = registration.qrCodeToken || 'ES-SUMMIT2026-VIP-ELENA-9942';
  const otpCode = registration.otpCode || '849204';

  const badgeUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/pass/${qrToken}` 
    : `http://localhost:3000/pass/${qrToken}`;

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(otpCode);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2500);
  };

  const handleCopyAndOpenLink = () => {
    navigator.clipboard.writeText(badgeUrl);
    setCopied(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });
    window.open(badgeUrl, '_blank');
    setTimeout(() => setCopied(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl glass-panel border border-blue-500/40 bg-[#0F172A] p-6 shadow-2xl shadow-blue-500/10 my-8">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge Card Container */}
        <div className="gradient-border p-1 bg-gradient-to-b from-blue-500 via-brand-500 to-purple-600 rounded-3xl shadow-2xl">
          <div className="bg-[#0B0F19] rounded-[22px] p-6 text-center relative overflow-hidden space-y-4">
            
            {/* Lanyard Hole Visual */}
            <div className="w-16 h-2 rounded-full bg-slate-800 mx-auto border border-slate-700 shadow-inner" />

            {/* Event Brand */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-xs font-black tracking-widest uppercase text-white">
                EVENT SPHERE PASS
              </span>
            </div>

            {/* Attendee Avatar */}
            <div className="relative w-24 h-24 mx-auto">
              <img 
                src={registration.user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'} 
                alt={attendeeName}
                className="w-full h-full rounded-2xl object-cover border-2 border-blue-500 shadow-xl"
              />
              <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-md">
                {role}
              </span>
            </div>

            {/* Attendee Name & Details */}
            <div>
              <h3 className="text-lg font-black text-white">{attendeeName}</h3>
              <p className="text-xs text-blue-300 font-semibold">{jobTitle}</p>
              <p className="text-xs text-slate-400">{company}</p>
            </div>

            {/* Ticket Tier Pill */}
            <div className="inline-block px-3 py-1 rounded-full bg-slate-800 text-[11px] font-bold text-slate-200 border border-slate-700">
              Tier: {ticketTier}
            </div>

            {/* Real Scannable High-Res QR Code */}
            <a 
              href={badgeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              title="Click QR Code to Open Badge Link"
              className="p-3 bg-white rounded-2xl inline-block shadow-2xl border-2 border-blue-500/50 hover:scale-105 transition-transform cursor-pointer group"
            >
              <QRCodeSVG 
                value={badgeUrl} 
                size={140}
                level="H"
                includeMargin={false}
                fgColor="#0B0F19"
                bgColor="#ffffff"
              />
              <span className="text-[9px] font-mono font-bold text-slate-950 block mt-1.5 tracking-tighter group-hover:text-blue-600">
                {qrToken} ↗
              </span>
            </a>

            {/* Entry OTP Verification Code Card */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-brand-500/40 text-left space-y-1.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-brand-400 flex items-center gap-1">
                  <Key className="w-3 h-3 text-brand-400" />
                  <span>Fast Entry OTP</span>
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
                <span className="text-base font-mono font-black tracking-widest text-white">{otpCode}</span>
                <span className="text-[10px] text-slate-400">Valid at Gate / Kiosks</span>
              </div>
            </div>

            {/* HIGHLIGHTED BLUE DIRECT BADGE LINK */}
            <div className="pt-2 text-left space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-extrabold text-blue-400 tracking-wider flex items-center gap-1">
                  <LinkIcon className="w-3 h-3 text-blue-400" />
                  <span>Badge Pass Link</span>
                </span>
                <span className="text-[9px] font-bold text-blue-300 bg-blue-500/20 px-1.5 py-0.5 rounded border border-blue-500/30">
                  Direct Access
                </span>
              </div>
              <a
                href={badgeUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Click to Open Badge Link"
                className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-blue-950/80 border-2 border-blue-400 text-blue-200 hover:text-white hover:bg-blue-900/90 shadow-[0_0_20px_rgba(59,130,246,0.35)] ring-2 ring-blue-500/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
                  <span className="font-mono text-[11px] font-bold truncate underline decoration-blue-400 decoration-2 group-hover:decoration-white">
                    {badgeUrl}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-white bg-blue-600 hover:bg-blue-500 px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1 shadow-md shadow-blue-600/30">
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
              </a>
            </div>

          </div>
        </div>

        {/* Action buttons: Copy & Open Link */}
        <div className="mt-5 space-y-2.5">
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
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-xl shadow-blue-600/30 hover:scale-[1.02] transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied & Opening Badge Tab...' : 'Copy Link & Open Badge'}</span>
            <ExternalLink className="w-4 h-4 ml-1" />
          </button>

          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Save / Print Badge</span>
          </button>
        </div>

      </div>
    </div>
  );
};
