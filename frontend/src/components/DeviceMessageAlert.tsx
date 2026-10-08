import React, { useState, useEffect } from 'react';
import { 
  Smartphone, Mail, Check, Copy, ExternalLink, 
  X, ShieldCheck, Sparkles, Bell, Zap, KeyRound
} from 'lucide-react';
import { getEmailProviderInfo, openUserEmail } from '../utils/emailHelper';

export interface DispatchedAlert {
  id: string;
  phone?: string;
  email?: string;
  otpCode: string;
  text?: string;
  subject?: string;
  sender?: string;
  sentAt: string;
}

export const DeviceMessageAlert: React.FC = () => {
  const [activeAlert, setActiveAlert] = useState<DispatchedAlert | null>(null);
  const [activeTab, setActiveTab] = useState<'SMS' | 'GMAIL'>('SMS');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const handleSmsEvent = (e: CustomEvent<any>) => {
      const data = e.detail;
      const code = data.otpCode || data.otp || '';
      setActiveAlert({
        id: data.id || 'sms_' + Date.now(),
        phone: data.phone,
        otpCode: code,
        text: `[Event Sphere] 🔐 Verification OTP sent to your phone messages. Valid for 60 seconds.`,
        sentAt: data.sentAt || new Date().toISOString()
      });
      setActiveTab('SMS');
    };

    const handleEmailEvent = (e: CustomEvent<any>) => {
      const data = e.detail;
      const recipientEmail = data.recipientEmail || '';
      const code = data.otpCode || data.otp || '';
      setActiveAlert(prev => ({
        id: data.id || 'email_' + Date.now(),
        phone: prev?.phone,
        email: recipientEmail,
        otpCode: code || prev?.otpCode || '',
        subject: `🔐 Event Sphere Verification Security Code`,
        text: `[Event Sphere] 🔐 Verification OTP sent to your inbox. Valid for 60 seconds.`,
        sentAt: data.sentAt || new Date().toISOString()
      }));

      // Automatically open email if recipient email exists
      if (recipientEmail) {
        openUserEmail(recipientEmail);
      }
    };

    window.addEventListener('es_sms_message_received', handleSmsEvent as EventListener);
    window.addEventListener('es_new_email_received', handleEmailEvent as EventListener);

    return () => {
      window.removeEventListener('es_sms_message_received', handleSmsEvent as EventListener);
      window.removeEventListener('es_new_email_received', handleEmailEvent as EventListener);
    };
  }, []);

  if (!activeAlert) return null;

  const provider = activeAlert.email ? getEmailProviderInfo(activeAlert.email) : null;
  const otpDigits = activeAlert.otpCode ? activeAlert.otpCode.split('') : [];

  const handleCopyOtp = () => {
    if (!activeAlert.otpCode) return;
    navigator.clipboard.writeText(activeAlert.otpCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAutofillOtp = () => {
    if (!activeAlert.otpCode) return;
    window.dispatchEvent(new CustomEvent('es_autofill_otp', {
      detail: { otp: activeAlert.otpCode }
    }));
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] w-full max-w-md animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="rounded-3xl glass-panel bg-[#0B132B]/95 border-2 border-emerald-500/60 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.35)] overflow-hidden backdrop-blur-xl">
        
        {/* Top Header Bar */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5" /> Security OTP Dispatched
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {activeAlert.phone && (
              <button
                onClick={() => setActiveTab('SMS')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  activeTab === 'SMS' 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white bg-slate-800/60'
                }`}
              >
                💬 SMS Messages
              </button>
            )}

            {activeAlert.email && (
              <button
                onClick={() => setActiveTab('GMAIL')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  activeTab === 'GMAIL' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-white bg-slate-800/60'
                }`}
              >
                ✉️ {provider?.name || 'Email Inbox'}
              </button>
            )}

            <button
              onClick={() => setActiveAlert(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* TAB 1: SMS / CONTACT MESSAGES */}
        {activeTab === 'SMS' && (
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">Phone Messages (SMS)</span>
                    <span className="text-[9px] font-semibold text-slate-400">• Just now</span>
                  </div>
                  <p className="text-[11px] text-emerald-400 font-mono font-medium">
                    Delivered to: {activeAlert.phone || 'Your Contact Phone'}
                  </p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] text-emerald-300 font-bold">
                SMS Delivered
              </span>
            </div>

            {/* Visual OTP Display Badge */}
            {activeAlert.otpCode ? (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-950 to-blue-950/70 border border-emerald-500/40 text-center space-y-2">
                <div className="flex items-center justify-between text-[11px] text-emerald-300 font-semibold px-1">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Your 6-Digit OTP Code</span>
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono font-bold">
                    60s TTL
                  </span>
                </div>

                <div className="flex items-center justify-center gap-1.5 py-1">
                  {otpDigits.map((d, i) => (
                    <div 
                      key={i} 
                      className="w-8 h-10 rounded-xl bg-slate-900 border-2 border-emerald-400/80 text-emerald-300 text-xl font-mono font-black flex items-center justify-center shadow-md shadow-emerald-500/20"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAutofillOtp}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/30 transition-all hover:scale-105"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Auto-Fill Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyOtp}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-emerald-500/30 text-xs text-slate-300 leading-relaxed font-sans shadow-inner">
                <p>
                  📲 A secure 6-digit verification code has been dispatched to your contact messages on <strong className="text-emerald-400 font-mono">{activeAlert.phone || 'your phone'}</strong>. Valid for 60 seconds.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EMAIL PROVIDER INBOX */}
        {activeTab === 'GMAIL' && (
          <div className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white">{provider?.name || 'Email Inbox'}</span>
                    <span className="text-[9px] font-semibold text-slate-400">• Just now</span>
                  </div>
                  <p className="text-[11px] text-blue-300 font-medium truncate max-w-[200px]">
                    To: {activeAlert.email || 'your-email@domain.com'}
                  </p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-[10px] text-blue-300 font-bold">
                Delivered
              </span>
            </div>

            {/* Visual OTP Display Badge in Email Tab */}
            {activeAlert.otpCode ? (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-950 to-indigo-950/70 border border-blue-500/40 text-center space-y-2">
                <div className="flex items-center justify-between text-[11px] text-blue-300 font-semibold px-1">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-400" />
                    <span>Your Verification OTP</span>
                  </span>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono font-bold">
                    Email Code
                  </span>
                </div>

                <div className="flex items-center justify-center gap-1.5 py-1">
                  {otpDigits.map((d, i) => (
                    <div 
                      key={i} 
                      className="w-8 h-10 rounded-xl bg-slate-900 border-2 border-blue-400/80 text-blue-300 text-xl font-mono font-black flex items-center justify-center shadow-md shadow-blue-500/20"
                    >
                      {d}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAutofillOtp}
                    className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/30 transition-all hover:scale-105"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>Auto-Fill Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyOtp}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-blue-500/30 text-xs text-slate-300 space-y-1.5">
                <p>
                  ✉️ A 6-digit security code has been sent to your email inbox. Click the button below to open your inbox directly.
                </p>
              </div>
            )}

            <div className="pt-1">
              <button
                type="button"
                onClick={() => activeAlert.email && openUserEmail(activeAlert.email)}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open {provider?.name || 'Email'} ({activeAlert.email})</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
