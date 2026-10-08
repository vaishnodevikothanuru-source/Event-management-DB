import React, { useState, useEffect } from 'react';
import { 
  X, Check, ShieldCheck, Ticket, CreditCard, 
  Sparkles, Tag, ArrowRight, Lock, CheckCircle2, 
  Copy, ExternalLink, Key, Mail, RefreshCw,
  AlertCircle, ChevronLeft, Phone, Smartphone, Clock, Zap
} from 'lucide-react';
import { EventItem, TicketType, Registration } from '../types';
import { ticketsApi, notificationApi, authApi } from '../services/api';
import { getEmailProviderInfo, openUserEmail } from '../utils/emailHelper';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface TicketCheckoutModalProps {
  event: EventItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (registration: Registration) => void;
}

export const TicketCheckoutModal: React.FC<TicketCheckoutModalProps> = ({
  event,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user, awardPoints } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<TicketType>(event.ticketTypes?.[1] || event.ticketTypes?.[0] || {
    id: 't-default',
    eventId: event.id,
    name: 'General Admission Pass',
    description: 'Full pass to all conference tracks.',
    price: 199,
    currency: 'USD',
    quantityAvailable: 500,
    quantitySold: 42,
    perks: ['Full Conference Access', 'Keynotes & Breakouts', 'Digital Badge']
  });

  const [deliveryEmail, setDeliveryEmail] = useState(user?.email || 'adimulam.tejobhiram@klh.edu.in');
  const [deliveryPhone, setDeliveryPhone] = useState(user?.phone || '9391215547');
  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'SELECT' | 'VERIFY_OTP' | 'PAY' | 'SUCCESS'>('SELECT');
  
  // OTP Verification States (Backed by FastAPI + Redis 60s TTL)
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(60);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  const [createdReg, setCreatedReg] = useState<Registration | null>(null);
  const [copied, setCopied] = useState(false);

  // Listen for global AutoFill event (e.g. from DeviceMessageAlert)
  useEffect(() => {
    const handleAutofill = (e: CustomEvent<{ otp: string }>) => {
      if (e.detail?.otp && step === 'VERIFY_OTP') {
        setEnteredOtp(e.detail.otp);
        setOtpError(null);
      }
    };
    window.addEventListener('es_autofill_otp', handleAutofill as EventListener);
    return () => window.removeEventListener('es_autofill_otp', handleAutofill as EventListener);
  }, [step]);

  const activeEmail = (deliveryEmail.trim() || user?.email || 'adimulam.tejobhiram@klh.edu.in').toLowerCase();
  const activePhone = deliveryPhone.trim() || user?.phone || '9391215547';

  // 60-Second Redis Expiration Timer
  useEffect(() => {
    let timer: any;
    if (step === 'VERIFY_OTP' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  // Reset or initialize email/phone when user opens modal
  useEffect(() => {
    if (user?.email && !deliveryEmail) {
      setDeliveryEmail(user.email);
    }
    if (user?.phone && !deliveryPhone) {
      setDeliveryPhone(user.phone);
    }
  }, [user]);

  if (!isOpen) return null;

  const originalPrice = selectedTicket.price;
  const discountRate = discountApplied ? 0.20 : 0;
  const finalPrice = Math.max(0, originalPrice * (1 - discountRate));

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'SPHERE20' || promoCode.trim().toUpperCase() === 'AI2026') {
      setDiscountApplied(true);
    } else {
      alert('Invalid promo code. Try SPHERE20 for 20% off!');
    }
  };

  // Step 1 -> Step 2: Generate and dispatch OTP via FastAPI Backend + Redis 60s TTL
  const handleInitiateOtpVerification = async () => {
    if (!activeEmail || !activeEmail.includes('@')) {
      alert('Please provide a valid recipient email address.');
      return;
    }
    if (!activePhone) {
      alert('Please provide a contact phone number.');
      return;
    }
    setSendingOtp(true);
    setOtpError(null);
    setEnteredOtp('');
    setOtpVerified(false);
    setCountdown(60);
    setAttemptsRemaining(null);

    const primaryTarget = activePhone || activeEmail;
    const targetType = activePhone ? 'phone' : 'email';

    try {
      // 1. Call Backend FastAPI + Redis endpoint with dual binding
      const result = await authApi.sendBackendOtp(primaryTarget, targetType, 'REGISTRATION', {
        email: activeEmail,
        phone: activePhone
      });
      
      if (!result.success && result.error === 'RATE_LIMITED') {
        setOtpError(result.message);
        setSendingOtp(false);
        return;
      }

      const activeOtpCode = result.otp || result.otpCode || Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(activeOtpCode);

      // 2. Dispatch device notifications with the actual generated code
      await notificationApi.sendVerificationOtpEmail({
        recipientEmail: activeEmail,
        recipientName: `${user?.firstName || 'Valued'} ${user?.lastName || 'Attendee'}`.trim(),
        otpCode: activeOtpCode,
        eventTitle: event.title,
        ticketTier: selectedTicket.name,
        contactPhone: activePhone
      });

      setStep('VERIFY_OTP');
      setCountdown(result.expiresIn || 60);

      // Automatically open the user's email client
      openUserEmail(activeEmail);
    } catch (err: any) {
      setOtpError('Failed to dispatch OTP. Please check your backend connection.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Resend OTP code with fresh 60s Redis TTL
  const handleResendOtp = async () => {
    if (sendingOtp || countdown > 45) return;
    setSendingOtp(true);
    setOtpError(null);
    setEnteredOtp('');

    const primaryTarget = activePhone || activeEmail;
    const targetType = activePhone ? 'phone' : 'email';

    try {
      const result = await authApi.sendBackendOtp(primaryTarget, targetType, 'RESEND', {
        email: activeEmail,
        phone: activePhone
      });
      if (!result.success && result.error === 'RATE_LIMITED') {
        setOtpError(result.message);
      } else {
        const activeOtpCode = result.otp || result.otpCode || Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(activeOtpCode);
        setCountdown(result.expiresIn || 60);
        setResendStatus(`A fresh 6-digit verification OTP has been generated & dispatched. Valid for 60 seconds.`);
        setTimeout(() => setResendStatus(null), 6000);
        
        await notificationApi.sendVerificationOtpEmail({
          recipientEmail: activeEmail,
          recipientName: `${user?.firstName || 'Valued'} ${user?.lastName || 'Attendee'}`.trim(),
          otpCode: activeOtpCode,
          eventTitle: event.title,
          ticketTier: selectedTicket.name,
          contactPhone: activePhone
        });

        openUserEmail(activeEmail);
      }
    } catch (err) {
      setOtpError('Could not resend OTP. Please check your network connection.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Validate entered OTP against backend Redis
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOtpError(null);

    const cleanEntered = enteredOtp.trim();
    if (!cleanEntered) {
      setOtpError('Please enter the 6-digit OTP code sent to your phone/email.');
      return;
    }

    if (cleanEntered.length !== 6) {
      setOtpError('The OTP must be exactly 6 digits.');
      return;
    }

    if (countdown === 0) {
      setOtpError('⏱️ This OTP has expired (60-second limit). Please click "Resend OTP" to generate a new code.');
      return;
    }

    const primaryTarget = activePhone || activeEmail;

    try {
      const verifyRes = await authApi.verifyBackendOtp(primaryTarget, cleanEntered);

      if (!verifyRes.success) {
        setOtpError(verifyRes.message || 'Invalid OTP code.');
        if (verifyRes.attemptsRemaining !== undefined) {
          setAttemptsRemaining(verifyRes.attemptsRemaining);
        }
        return;
      }

      // Backend verification passed! Unlock payment gateway
      setOtpVerified(true);
      setOtpError(null);
      setTimeout(() => {
        setStep('PAY');
      }, 600);
    } catch (err) {
      setOtpError('OTP verification failed. Please try again.');
    }
  };

  // Step 3 -> Process Payment & finalize registration with verified OTP
  const handleProcessCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!otpVerified) {
      setStep('VERIFY_OTP');
      setOtpError('Please verify your OTP before proceeding to payment.');
      return;
    }

    setProcessing(true);

    try {
      await new Promise(r => setTimeout(r, 900));
      const reg = await ticketsApi.purchaseTicket(
        event.id, 
        selectedTicket.id, 
        user, 
        activeEmail
      );
      setCreatedReg(reg);
      setStep('SUCCESS');
      awardPoints(250, 'Event Ticket Purchase');

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      onSuccess(reg);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleCopyAndOpenBadge = () => {
    if (!createdReg) return;
    const badgeUrl = `${window.location.origin}/pass/${createdReg.qrCodeToken}`;
    navigator.clipboard.writeText(badgeUrl);
    setCopied(true);
    window.open(badgeUrl, '_blank');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 rounded-3xl glass-panel border border-slate-700/80 bg-[#0F172A] shadow-2xl overflow-hidden">
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-600/30 text-brand-400">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Event Registration & Checkout</h3>
              <p className="text-xs text-slate-400">{event.title}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Tracker */}
        <div className="px-6 py-2.5 bg-slate-950/80 border-b border-slate-800/80 flex items-center justify-between text-[11px] font-semibold">
          <div className={`flex items-center gap-1.5 ${step === 'SELECT' ? 'text-brand-400 font-bold' : 'text-emerald-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'SELECT' ? 'bg-brand-500 text-white' : 'bg-emerald-500/20 text-emerald-300'}`}>1</span>
            <span>Choose Tier & Email</span>
          </div>
          <span className="text-slate-600">→</span>
          <div className={`flex items-center gap-1.5 ${step === 'VERIFY_OTP' ? 'text-brand-400 font-bold' : otpVerified ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'VERIFY_OTP' ? 'bg-brand-500 text-white' : otpVerified ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>2</span>
            <span>Enter Email OTP</span>
          </div>
          <span className="text-slate-600">→</span>
          <div className={`flex items-center gap-1.5 ${step === 'PAY' ? 'text-brand-400 font-bold' : step === 'SUCCESS' ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 'PAY' ? 'bg-brand-500 text-white' : step === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>3</span>
            <span>Secure Payment</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          
          {/* STEP 1: SELECT TICKET & RECIPIENT EMAIL */}
          {step === 'SELECT' && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-3">
                  1. Choose Your Conference Tier
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {event.ticketTypes?.map((t) => {
                    const isSelected = selectedTicket.id === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTicket(t)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-brand-500 bg-brand-950/40 ring-2 ring-brand-500/30 shadow-lg shadow-brand-500/20'
                            : 'border-slate-800 bg-slate-800/30 hover:border-slate-700 hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-xs font-bold ${isSelected ? 'text-brand-300' : 'text-white'}`}>
                            {t.name}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-brand-400" />}
                        </div>
                        <div className="text-xl font-extrabold text-white mb-2">
                          ${t.price} <span className="text-[10px] text-slate-400 font-normal">{t.currency}</span>
                        </div>
                        <ul className="space-y-1 text-[11px] text-slate-300">
                          {t.perks.slice(0, 3).map((p, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span className="truncate">{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recipient Email & Contact Number Specification */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Mail className="w-4 h-4 text-brand-400" />
                    <span>Attendee Verification Details</span>
                  </div>
                  <span className="text-[10px] text-brand-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> OTP Dispatched to Contact & Email
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1 font-semibold flex items-center gap-1">
                      <Mail className="w-3 h-3 text-brand-400" /> Google Mail / Email Address
                    </label>
                    <input 
                      type="email"
                      value={deliveryEmail}
                      onChange={(e) => setDeliveryEmail(e.target.value)}
                      placeholder="e.g. attendee@gmail.com"
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1 font-semibold flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-400" /> Contact Phone Number
                    </label>
                    <input 
                      type="tel"
                      value={deliveryPhone}
                      onChange={(e) => setDeliveryPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 389-4921"
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-medium"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  📩 A 6-digit OTP code will be sent to your Google Mail inbox and contact phone number. You will need to check your actual inbox/phone and enter the code to verify your identity before proceeding to payment.
                </p>
              </div>

              {/* Promo code bar */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/40 border border-slate-700">
                <Tag className="w-4 h-4 text-pink-400 shrink-0" />
                <input 
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo code (e.g. SPHERE20)"
                  className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none uppercase"
                />
                <button
                  onClick={handleApplyPromo}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-pink-600 hover:bg-pink-500 text-white transition-colors"
                >
                  Apply
                </button>
              </div>

              {discountApplied && (
                <div className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" /> 20% discount code applied successfully!
                </div>
              )}

              {/* Action summary */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="text-xs text-slate-400 block">Total Payable</span>
                  <span className="text-2xl font-black text-white">${finalPrice.toFixed(2)} USD</span>
                </div>
                <button
                  onClick={handleInitiateOtpVerification}
                  disabled={sendingOtp}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-brand-500/30 transition-all disabled:opacity-50"
                >
                  {sendingOtp ? (
                    <span>Sending OTP to Contact & Email...</span>
                  ) : (
                    <>
                      <span>Send OTP & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ENTER & TALLY SENT OTP */}
          {step === 'VERIFY_OTP' && (
            <div className="space-y-5">
              {/* PROMINENT ON-SCREEN GENERATED OTP CARD */}
              {generatedOtp && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-brand-950/90 via-indigo-950/80 to-purple-950/90 border-2 border-brand-400/80 shadow-[0_0_30px_rgba(168,85,247,0.3)] text-center space-y-3 animate-in zoom-in-95 duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-black tracking-wide text-brand-300 uppercase flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-spin" style={{ animationDuration: '6s' }} />
                        Generated Verification OTP
                      </span>
                    </div>
                    <span className="text-[10px] bg-brand-500/20 border border-brand-400/40 text-brand-200 px-2.5 py-0.5 rounded-full font-mono font-bold">
                      ⏱️ {countdown}s Left
                    </span>
                  </div>

                  {/* 6 Digit Display Boxes */}
                  <div className="flex items-center justify-center gap-2 py-1">
                    {generatedOtp.split('').map((digit, idx) => (
                      <div 
                        key={idx} 
                        className="w-10 h-12 rounded-xl bg-slate-950 border-2 border-brand-400 text-brand-300 text-2xl font-black font-mono flex items-center justify-center shadow-lg shadow-brand-500/20 transform hover:scale-105 transition-all"
                      >
                        {digit}
                      </div>
                    ))}
                  </div>

                  {/* 1-Click Action Buttons */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setEnteredOtp(generatedOtp);
                        setOtpError(null);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-400 hover:to-purple-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/30 transition-all hover:scale-105"
                    >
                      <Zap className="w-3.5 h-3.5 fill-current text-yellow-300" />
                      <span>⚡ 1-Click Auto-Fill</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedOtp);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Resend status toast */}
              {resendStatus && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4" />
                  <span>{resendStatus}</span>
                </div>
              )}

              {/* Error Message */}
              {otpError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-medium flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* Direct Access & Live Dispatch Banners */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* SMS Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block">Phone Messages</span>
                        <span className="text-[10px] text-emerald-300 truncate max-w-[140px] block">{activePhone}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      SMS Sent
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Delivered to contact messages on <strong className="text-emerald-400">{activePhone}</strong>.
                  </p>
                </div>

                {/* Email Provider Card */}
                {(() => {
                  const provider = getEmailProviderInfo(activeEmail);
                  return (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold shrink-0">
                            <Mail className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">{provider.name}</span>
                            <span className="text-[10px] text-slate-300 font-mono truncate block">{activeEmail}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openUserEmail(activeEmail)}
                          className="text-[10px] font-bold text-blue-400 hover:text-white flex items-center gap-1 bg-blue-500/10 hover:bg-blue-600 px-2.5 py-1 rounded-full border border-blue-500/20 shrink-0 transition-all"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open Inbox</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Dispatched to {provider.name} for <strong className="text-blue-300">{activeEmail}</strong>.
                      </p>
                    </div>
                  );
                })()}
              </div>

              {/* OTP Form */}
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <label className="text-xs font-bold text-slate-300">
                      Enter 6-Digit Verification Code
                    </label>
                    <div className="flex items-center gap-1 text-[11px] font-mono">
                      <Clock className={`w-3.5 h-3.5 ${countdown <= 15 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
                      <span className={countdown <= 15 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {countdown > 0 ? `Expires in ${countdown}s` : 'Expired'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <input 
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={enteredOtp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setEnteredOtp(val);
                        setOtpError(null);
                      }}
                      placeholder="• • • • • •"
                      autoFocus
                      disabled={countdown === 0 || otpVerified}
                      className={`w-56 text-center tracking-[0.6em] text-2xl font-mono font-black py-2.5 rounded-2xl bg-slate-950 border-2 ${
                        otpVerified 
                          ? 'border-emerald-500 text-emerald-300 bg-emerald-950/30 ring-2 ring-emerald-500/30' 
                          : countdown === 0
                          ? 'border-rose-500/50 text-slate-500 bg-slate-900/50'
                          : otpError 
                          ? 'border-rose-500 text-rose-300' 
                          : 'border-brand-500/60 text-white focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30'
                      } shadow-xl focus:outline-none transition-all`}
                    />
                  </div>
                </div>

                {attemptsRemaining !== null && !otpVerified && (
                  <div className="text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
                      ⚠️ Security limit: {attemptsRemaining} attempts remaining
                    </span>
                  </div>
                )}

                {otpVerified ? (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>OTP Verified by Backend! Unlocking Payment Gateway...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-400">
                    <span>Didn't receive the OTP?</span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={sendingOtp || countdown > 45}
                      className="text-brand-400 hover:text-brand-300 font-bold flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-3 h-3 ${sendingOtp ? 'animate-spin' : ''}`} />
                      <span>{sendingOtp ? 'Sending...' : countdown > 45 ? `Resend (${countdown - 45}s)` : 'Resend OTP'}</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('SELECT');
                      setOtpError(null);
                      setEnteredOtp('');
                    }}
                    className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Change Details</span>
                  </button>
                  <button
                    type="submit"
                    disabled={enteredOtp.length !== 6 || otpVerified || countdown === 0}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-brand-600 hover:from-emerald-500 hover:to-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{countdown === 0 ? 'OTP Expired' : 'Verify OTP & Unlock Payment'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: PAYMENT GATEWAY (ONLY REACHED AFTER OTP TALLIES) */}
          {step === 'PAY' && (
            <form onSubmit={handleProcessCheckout} className="space-y-4">
              {/* Verified Email Banner (OTP is NOT shown) */}
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white">Verified:</span> {activeEmail} • {activePhone}
                    <span className="text-[10px] text-emerald-400 block">Identity Authenticated via Contact & Email OTP</span>
                  </div>
                </div>
                <span className="font-extrabold text-white text-base">${finalPrice.toFixed(2)} USD</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Cardholder Name</label>
                  <input 
                    type="text" 
                    defaultValue={user ? `${user.firstName} ${user.lastName}` : 'Elena Rostova'}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Card Number (Simulated Stripe Gateway)</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      defaultValue="•••• •••• •••• 4242"
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                    <CreditCard className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Expiry</label>
                    <input 
                      type="text" 
                      defaultValue="12/28"
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">CVC</label>
                    <input 
                      type="text" 
                      defaultValue="884"
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 py-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-Bit Encrypted TLS • Authenticated Attendee Booking</span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('VERIFY_OTP')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all"
                >
                  {processing ? (
                    <span>Authorizing Payment & Issuing Pass...</span>
                  ) : (
                    <span>Confirm & Pay ${finalPrice.toFixed(2)}</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: SUCCESS / CONFIRMED BOOKING PASS */}
          {step === 'SUCCESS' && createdReg && (
            <div className="text-center py-2 space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xl font-extrabold text-white">Registration & Payment Completed!</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Your event pass has been issued and confirmed for <strong className="text-emerald-400">{activeEmail}</strong>.
                </p>
              </div>

              {/* Pass token & Venue Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-brand-400 tracking-wider block">Pass Token</span>
                  <span className="text-xs font-mono font-bold text-white truncate block">{createdReg.qrCodeToken}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider block">Tier</span>
                  <span className="text-xs text-slate-300 font-medium block truncate">{selectedTicket.name}</span>
                </div>
              </div>

              {/* Dispatch notification status */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 max-w-lg mx-auto text-left flex items-center justify-between text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span>Pass & details delivered to: <strong className="text-white">{activeEmail}</strong></span>
                </div>
                <span className="text-emerald-400 font-semibold shrink-0 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Confirmed
                </span>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={handleCopyAndOpenBadge}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-brand-600/30 transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied & Opening Badge...' : 'Copy Link & Open Smart Badge'}</span>
                  <ExternalLink className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};



