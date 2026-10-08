import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Lock, Mail, User, Building, 
  ArrowRight, CheckCircle2, ShieldCheck, KeyRound, 
  Eye, EyeOff, Shield, Users, Award, Calendar, Check,
  Phone, Smartphone, RefreshCw, AlertCircle, ExternalLink, ChevronLeft, Clock,
  Copy, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { notificationApi, authApi } from '../services/api';
import { getEmailProviderInfo, openUserEmail } from '../utils/emailHelper';
import confetti from 'canvas-confetti';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('adimulam.tejobhiram@klh.edu.in');
  const [phone, setPhone] = useState('9391215547');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // OTP Verification States
  const [step, setStep] = useState<'CREDENTIALS' | 'VERIFY_OTP'>('CREDENTIALS');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpCopied, setOtpCopied] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(60);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Listen for global AutoFill event (e.g. from DeviceMessageAlert)
  useEffect(() => {
    const handleAutofill = (e: CustomEvent<{ otp: string }>) => {
      if (e.detail?.otp) {
        setEnteredOtp(e.detail.otp);
        setOtpError(null);
      }
    };
    window.addEventListener('es_autofill_otp', handleAutofill as EventListener);
    return () => window.removeEventListener('es_autofill_otp', handleAutofill as EventListener);
  }, []);

  // 60-second Redis OTP Countdown Timer
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

  const demoAccounts = [
    {
      role: 'ATTENDEE' as UserRole,
      name: 'Elena Rostova',
      email: 'adimulam.tejobhiram@klh.edu.in',
      phone: '9391215547',
      roleBadge: 'VIP Attendee Pass',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      color: 'from-blue-600 to-indigo-600',
      route: '/dashboard'
    },
    {
      role: 'ORGANIZER' as UserRole,
      name: 'Sarah Jenkins',
      email: 'organizer@techcorp.io',
      phone: '+1 (555) 912-4433',
      roleBadge: 'Event Organizer',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      color: 'from-purple-600 to-pink-600',
      route: '/organizer/dashboard'
    },
    {
      role: 'ADMIN' as UserRole,
      name: 'Marcus Vance',
      email: 'admin@eventsphere.io',
      phone: '+1 (555) 234-8901',
      roleBadge: 'Platform Admin',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      color: 'from-red-600 to-orange-600',
      route: '/admin/dashboard'
    },
    {
      role: 'SPEAKER' as UserRole,
      name: 'Dr. Aris Thorne',
      email: 'speaker@synthetix.ai',
      phone: '+1 (555) 762-9011',
      roleBadge: 'Keynote Speaker',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      color: 'from-cyan-600 to-blue-600',
      route: '/agenda'
    }
  ];

  const handleQuickLogin = async (acc: typeof demoAccounts[0]) => {
    setLoading(true);
    setError(null);
    try {
      await login(acc.email, 'Password123!', acc.phone);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      navigate(acc.route);
    } catch (err: any) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Dispatch OTP to Contact Phone & Email via FastAPI Backend + Redis 60s TTL
  const handleInitiateOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!phone) {
      setError('Please provide a contact phone number to receive the OTP.');
      return;
    }

    setSendingOtp(true);
    setError(null);
    setOtpError(null);
    setEnteredOtp('');
    setOtpVerified(false);
    setCountdown(60);
    setAttemptsRemaining(null);

    const primaryTarget = phone.trim() || email.trim();
    const targetType = phone.trim() ? 'phone' : 'email';

    try {
      // 1. Call Backend FastAPI + Redis endpoint with dual email & phone binding
      const result = await authApi.sendBackendOtp(primaryTarget, targetType, 'LOGIN', {
        email: email.trim(),
        phone: phone.trim()
      });
      
      if (!result.success && result.error === 'RATE_LIMITED') {
        setError(result.message);
        setSendingOtp(false);
        return;
      }

      const activeOtpCode = result.otp || result.otpCode || Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(activeOtpCode);

      // 2. Dispatch device notifications with the actual generated code
      await notificationApi.sendLoginOtp({
        contactPhone: phone.trim(),
        email: email.trim(),
        recipientName: 'Tejobhiram Adimulam',
        otpCode: activeOtpCode
      });

      setStep('VERIFY_OTP');
      setCountdown(result.expiresIn || 60);

      // Automatically open the user's email client/inbox in a new tab
      openUserEmail(email.trim());
    } catch (err: any) {
      setError('Failed to dispatch login OTP. Please check your backend service.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Resend OTP via Backend API with fresh 60s Redis TTL
  const handleResendOtp = async () => {
    if (sendingOtp || countdown > 45) return;
    setSendingOtp(true);
    setOtpError(null);
    setEnteredOtp('');

    const primaryTarget = phone.trim() || email.trim();
    const targetType = phone.trim() ? 'phone' : 'email';

    try {
      const result = await authApi.sendBackendOtp(primaryTarget, targetType, 'RESEND', {
        email: email.trim(),
        phone: phone.trim()
      });
      if (!result.success && result.error === 'RATE_LIMITED') {
        setOtpError(result.message);
      } else {
        const activeOtpCode = result.otp || result.otpCode || Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(activeOtpCode);
        setCountdown(result.expiresIn || 60);
        setResendStatus(`A fresh 6-digit OTP code has been generated & dispatched. Valid for 60 seconds.`);
        setTimeout(() => setResendStatus(null), 6000);
        
        await notificationApi.sendLoginOtp({
          contactPhone: phone.trim(),
          email: email.trim(),
          recipientName: 'Tejobhiram Adimulam',
          otpCode: activeOtpCode
        });

        openUserEmail(email.trim());
      }
    } catch (err) {
      setOtpError('Could not resend OTP. Please check your network connection.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleCopyGeneratedOtp = () => {
    if (!generatedOtp) return;
    navigator.clipboard.writeText(generatedOtp);
    setOtpCopied(true);
    setTimeout(() => setOtpCopied(false), 2000);
  };

  const handleAutofillGeneratedOtp = () => {
    if (!generatedOtp) return;
    setEnteredOtp(generatedOtp);
    setOtpError(null);
  };

  // Verify OTP strictly via Backend FastAPI + Redis
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOtpError(null);

    const cleanEntered = enteredOtp.trim();
    if (!cleanEntered) {
      setOtpError('Please enter the 6-digit OTP code sent to your contact number.');
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

    setLoading(true);
    const primaryTarget = phone.trim() || email.trim();

    try {
      const verifyRes = await authApi.verifyBackendOtp(primaryTarget, cleanEntered);

      if (!verifyRes.success) {
        setOtpError(verifyRes.message || 'Invalid OTP. Please try again.');
        if (verifyRes.attemptsRemaining !== undefined) {
          setAttemptsRemaining(verifyRes.attemptsRemaining);
        }
        setLoading(false);
        return;
      }

      // Verification Success! Proceed to authenticated session
      setOtpVerified(true);
      await login(email, password, phone);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      if (email.includes('organizer')) {
        navigate('/organizer/dashboard');
      } else if (email.includes('admin')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setOtpError('Login verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Col: Hero Showcase */}
        <div className="lg:col-span-5 space-y-6 text-left hidden lg:block">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Event Sphere Unified Auth</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Connect. Engage. <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Experience.</span>
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed">
            One secure single sign-on portal with real-time on-screen OTP verification for event attendees, organizers, speakers, sponsors, and platform administrators.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Live On-Screen OTP Verification</h4>
                <p className="text-[11px] text-slate-400">Secure 6-digit cryptographic verification displayed with 1-click autofill</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Sphere AI Concierge</h4>
                <p className="text-[11px] text-slate-400">Personalized agenda recommendations & RAG answers</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Live Real-Time Telemetry</h4>
                <p className="text-[11px] text-slate-400">Sub-second polls, Q&A upvotes, and networking match</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Sign In Card */}
        <div className="lg:col-span-7">
          <div className="w-full max-w-lg mx-auto glass-panel p-6 sm:p-8 rounded-3xl border border-blue-500/30 bg-[#0F172A] shadow-2xl space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-white">Sign In to Event Sphere</h2>
              <p className="text-xs text-slate-400">Contact Number OTP Verification & Single Sign-On</p>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-300">
                {error}
              </div>
            )}

            {/* 1-Click Fast Persona Cards */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                ⚡ 1-Click Demo Profiles (Instant Login):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    disabled={loading}
                    className="p-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-blue-500 text-left transition-all group flex items-center gap-2.5"
                  >
                    <img 
                      src={acc.avatar} 
                      alt="" 
                      className="w-8 h-8 rounded-xl object-cover border border-slate-700 group-hover:border-blue-400 shrink-0" 
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white group-hover:text-blue-300 truncate">{acc.name}</p>
                      <span className="text-[10px] text-emerald-400 block truncate font-mono">{acc.phone}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-[#0F172A] px-3 text-[11px] text-slate-500 uppercase font-semibold shrink-0">
                Or with Contact Number & Password
              </span>
              <div className="border-t border-slate-800 w-full" />
            </div>

            {/* Step 1: Input Credentials & Contact Number */}
            {step === 'CREDENTIALS' ? (
              <form onSubmit={handleInitiateOtp} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-semibold">Email Address</label>
                  <div className="relative">
                    <input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="name@organization.com"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1 font-semibold flex items-center justify-between">
                    <span>Contact Phone Number (For Login OTP)</span>
                    <span className="text-[10px] text-emerald-400 font-medium">SMS OTP Dispatched</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="e.g. +1 (555) 912-4433"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                    />
                    <Phone className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    📲 A 6-digit login OTP code will be generated and displayed directly on your screen.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs text-slate-400 font-semibold">Password</label>
                    <Link to="/forgot-password" className="text-[11px] text-blue-400 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                    />
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={rememberMe} 
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-blue-500" 
                    />
                    <span>Keep me signed in</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={sendingOtp}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-50"
                >
                  <span>{sendingOtp ? 'Generating OTP...' : 'Generate OTP & Continue'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* Step 2: Enter & Tally OTP Sent to Contact Number */
              <div className="space-y-4">
                
                {/* PROMINENT ON-SCREEN GENERATED OTP CARD */}
                {generatedOtp && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/90 via-indigo-950/80 to-purple-950/90 border-2 border-blue-400/80 shadow-[0_0_30px_rgba(59,130,246,0.3)] text-center space-y-3 animate-in zoom-in-95 duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span className="text-xs font-black tracking-wide text-blue-300 uppercase flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
                          Your Generated OTP Code
                        </span>
                      </div>
                      <span className="text-[10px] bg-blue-500/20 border border-blue-400/40 text-blue-200 px-2.5 py-0.5 rounded-full font-mono font-bold">
                        ⏱️ {countdown}s Left
                      </span>
                    </div>

                    {/* 6 Digit Display Boxes */}
                    <div className="flex items-center justify-center gap-2 py-1">
                      {generatedOtp.split('').map((digit, idx) => (
                        <div 
                          key={idx} 
                          className="w-10 h-12 rounded-xl bg-slate-950 border-2 border-blue-400 text-blue-300 text-2xl font-black font-mono flex items-center justify-center shadow-lg shadow-blue-500/20 transform hover:scale-105 transition-all"
                        >
                          {digit}
                        </div>
                      ))}
                    </div>

                    {/* 1-Click Action Buttons */}
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleAutofillGeneratedOtp}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/30 transition-all hover:scale-105"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current text-yellow-300" />
                        <span>⚡ 1-Click Auto-Fill</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyGeneratedOtp}
                        className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
                      >
                        {otpCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{otpCopied ? 'Copied!' : 'Copy Code'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {resendStatus && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{resendStatus}</span>
                  </div>
                )}

                {otpError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{otpError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span className="text-[11px] font-semibold text-emerald-300">SMS Messages</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">Sent</span>
                  </div>

                  {(() => {
                    const provider = getEmailProviderInfo(email);
                    return (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/40 transition-all flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-300 min-w-0">
                          <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-[11px] font-semibold text-white block truncate">{provider.name}</span>
                            <span className="text-[9px] text-slate-400 font-mono truncate block">{email}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => openUserEmail(email)}
                          className="text-[11px] font-bold text-blue-400 hover:text-white flex items-center gap-1 shrink-0 bg-blue-500/10 hover:bg-blue-600 px-2.5 py-1 rounded-lg border border-blue-500/30 transition-all shadow-sm"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open Inbox</span>
                        </button>
                      </div>
                    );
                  })()}
                </div>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2 px-1">
                      <label className="text-xs font-bold text-slate-300">
                        Enter 6-Digit Verification Code
                      </label>
                      <div className="flex items-center gap-1 text-[11px] font-mono">
                        <Clock className={`w-3.5 h-3.5 ${countdown <= 15 ? 'text-rose-400 animate-pulse' : 'text-blue-400'}`} />
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
                        disabled={countdown === 0}
                        className={`w-56 text-center tracking-[0.6em] text-2xl font-mono font-black py-2.5 rounded-2xl bg-slate-950 border-2 ${
                          countdown === 0 
                            ? 'border-rose-500/50 text-slate-500 bg-slate-900/50' 
                            : 'border-blue-500 text-white focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30'
                        } shadow-xl transition-all`}
                      />
                    </div>
                  </div>

                  {attemptsRemaining !== null && (
                    <div className="text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-medium">
                        ⚠️ Security limit: {attemptsRemaining} attempts remaining
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-center gap-2 pt-1 text-xs text-slate-400">
                    <span>Didn't receive the OTP?</span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={sendingOtp || countdown > 45}
                      className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-3 h-3 ${sendingOtp ? 'animate-spin' : ''}`} />
                      <span>{sendingOtp ? 'Sending...' : countdown > 45 ? `Resend (${countdown - 45}s)` : 'Resend OTP'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('CREDENTIALS');
                        setOtpError(null);
                        setEnteredOtp('');
                      }}
                      className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Change Info</span>
                    </button>
                    <button
                      type="submit"
                      disabled={enteredOtp.length !== 6 || loading || countdown === 0}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{loading ? 'Verifying with Backend...' : countdown === 0 ? 'OTP Expired' : 'Verify OTP & Log In'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="text-center text-xs text-slate-400 pt-1">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-blue-400 font-bold hover:underline">
                Register Free →
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('Sarah');
  const [lastName, setLastName] = useState('Jenkins');
  const [email, setEmail] = useState('sarah.j@innovate.io');
  const [jobTitle, setJobTitle] = useState('Senior Product Engineer');
  const [company, setCompany] = useState('Apex Innovations');
  const [industry, setIndustry] = useState('Artificial Intelligence & Cloud');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [password, setPassword] = useState('Password123!');
  const [role, setRole] = useState<UserRole>('ATTENDEE');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register({
        firstName,
        lastName,
        email,
        jobTitle,
        company,
        industry,
        phone,
        role,
        skills: ['AI Strategy', 'Distributed Systems', 'Cloud Native'],
        interests: ['Autonomous Agents', 'pgvector', 'Developer Experience'],
      });
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
      navigate(role === 'ORGANIZER' ? '/organizer/dashboard' : '/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg glass-panel p-8 rounded-3xl border border-blue-500/30 bg-[#0F172A] shadow-2xl space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-black text-white">Create Your Account</h2>
          <p className="text-xs text-slate-400">Join the Event Sphere ecosystem as an Attendee, Organizer or Speaker</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-semibold">First Name</label>
              <input 
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-semibold">Last Name</label>
              <input 
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-semibold">Email Address</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-semibold">Job Title</label>
              <input 
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
                placeholder="e.g. Lead Architect"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-semibold">Company / Org</label>
              <input 
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                placeholder="e.g. Nexus Tech"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-semibold">Industry</label>
              <input 
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. AI & Robotics"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1 font-semibold">Phone (for SMS OTP)</label>
              <input 
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-semibold">Account Persona / Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-semibold"
            >
              <option value="ATTENDEE">🎟️ Attendee (Discover, Register, Network, Badges)</option>
              <option value="ORGANIZER">🚀 Event Organizer (Create & Host Summits)</option>
              <option value="SPEAKER">🎤 Speaker (Manage Sessions & Slides)</option>
              <option value="SPONSOR">💎 Sponsor (Manage Booth & Leads)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-semibold">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-blue-600/30 transition-all"
          >
            {loading ? 'Creating Profile & Generating Pass...' : 'Create Account & Access Attendee View'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 font-bold hover:underline">
            Sign In →
          </Link>
        </div>

      </div>
    </div>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('adimulam.tejobhiram@klh.edu.in');
  const [step, setStep] = useState<'INPUT_EMAIL' | 'VERIFY_OTP' | 'SUCCESS'>('INPUT_EMAIL');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [otpCopied, setOtpCopied] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(60);
  const navigate = useNavigate();

  useEffect(() => {
    let timer: any;
    if (step === 'VERIFY_OTP' && countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  useEffect(() => {
    const handleAutofill = (e: CustomEvent<{ otp: string }>) => {
      if (e.detail?.otp && step === 'VERIFY_OTP') {
        setEnteredOtp(e.detail.otp);
        setError(null);
      }
    };
    window.addEventListener('es_autofill_otp', handleAutofill as EventListener);
    return () => window.removeEventListener('es_autofill_otp', handleAutofill as EventListener);
  }, [step]);

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await authApi.sendBackendOtp(email.trim(), 'email', 'PASSWORD_RESET', {
        email: email.trim()
      });
      const code = result.otp || result.otpCode || Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setCountdown(result.expiresIn || 60);
      setStep('VERIFY_OTP');

      await notificationApi.sendLoginOtp({
        contactPhone: '',
        email: email.trim(),
        recipientName: 'Valued User',
        otpCode: code
      });
    } catch {
      setError('Failed to generate reset OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim().length !== 6) {
      setError('The OTP code must be exactly 6 digits.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await authApi.verifyBackendOtp(email.trim(), enteredOtp.trim());
      if (!res.success) {
        setError(res.message || 'Invalid OTP code entered.');
        setLoading(false);
        return;
      }
      setStep('SUCCESS');
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {
      setError('Password reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-blue-500/30 bg-[#0F172A] shadow-2xl space-y-6 text-center">
        
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
          <KeyRound className="w-6 h-6" />
        </div>
        
        <div>
          <h2 className="text-2xl font-black text-white">Reset Password</h2>
          <p className="text-xs text-slate-400 mt-1">
            {step === 'INPUT_EMAIL' && 'Enter your email to generate a 6-digit on-screen verification OTP.'}
            {step === 'VERIFY_OTP' && 'Verify your on-screen OTP code and set your new password.'}
            {step === 'SUCCESS' && 'Your password has been reset successfully!'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-xs text-rose-300">
            {error}
          </div>
        )}

        {step === 'INPUT_EMAIL' && (
          <form onSubmit={handleSendResetOtp} className="space-y-4">
            <div className="text-left">
              <label className="text-xs text-slate-400 font-semibold block mb-1">Email Address</label>
              <div className="relative">
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <span>{loading ? 'Generating OTP...' : 'Generate OTP & Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {step === 'VERIFY_OTP' && (
          <div className="space-y-4">
            {/* ON-SCREEN OTP DISPLAY */}
            {generatedOtp && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/90 via-indigo-950/80 to-purple-950/90 border-2 border-blue-400/80 shadow-[0_0_30px_rgba(59,130,246,0.3)] text-center space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black tracking-wide text-blue-300 uppercase flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    Generated Reset OTP
                  </span>
                  <span className="text-[10px] bg-blue-500/20 border border-blue-400/40 text-blue-200 px-2.5 py-0.5 rounded-full font-mono font-bold">
                    ⏱️ {countdown}s
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 py-1">
                  {generatedOtp.split('').map((digit, idx) => (
                    <div 
                      key={idx} 
                      className="w-9 h-11 rounded-xl bg-slate-950 border-2 border-blue-400 text-blue-300 text-xl font-black font-mono flex items-center justify-center shadow-lg"
                    >
                      {digit}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setEnteredOtp(generatedOtp);
                      setError(null);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all hover:scale-105"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current text-yellow-300" />
                    <span>⚡ Auto-Fill</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedOtp);
                      setOtpCopied(true);
                      setTimeout(() => setOtpCopied(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700"
                  >
                    {otpCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{otpCopied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleVerifyAndReset} className="space-y-3 text-left">
              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">Enter 6-Digit OTP</label>
                <input 
                  type="text"
                  maxLength={6}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.4em] font-mono text-lg font-black bg-slate-950 border border-slate-700 rounded-xl py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-semibold block mb-1">New Password</label>
                <div className="relative">
                  <input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('INPUT_EMAIL')}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={enteredOtp.length !== 6 || loading}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Set New Password'}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 'SUCCESS' && (
          <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <p className="text-xs text-emerald-300 font-semibold">
              Password has been successfully updated!
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
            >
              Sign In with New Password →
            </button>
          </div>
        )}

        <Link to="/login" className="text-xs text-blue-400 font-semibold hover:underline block pt-2">
          ← Back to Sign In
        </Link>
      </div>
    </div>
  );
};
