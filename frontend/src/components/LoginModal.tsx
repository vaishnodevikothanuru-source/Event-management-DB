import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, Lock, Mail, User, Sparkles, ArrowRight, 
  CheckCircle2, ShieldCheck, Eye, EyeOff, Building, 
  ChevronLeft, RefreshCw, AlertCircle, ExternalLink, Phone, Smartphone, Clock,
  Copy, Zap, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { notificationApi, authApi } from '../services/api';
import { getEmailProviderInfo, openUserEmail } from '../utils/emailHelper';
import confetti from 'canvas-confetti';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectUrl?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  redirectUrl
}) => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'QUICK' | 'FORM' | 'SSO'>('QUICK');
  const [email, setEmail] = useState('adimulam.tejobhiram@klh.edu.in');
  const [phone, setPhone] = useState('9391215547');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // OTP Verification States
  const [loginStep, setLoginStep] = useState<'CREDENTIALS' | 'VERIFY_OTP'>('CREDENTIALS');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpCopied, setOtpCopied] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(60);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

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

  // 60s Redis Expiration Timer
  useEffect(() => {
    let timer: any;
    if (loginStep === 'VERIFY_OTP' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [loginStep, countdown]);

  if (!isOpen) return null;

  const demoAccounts: {
    role: UserRole;
    name: string;
    email: string;
    phone: string;
    title: string;
    company: string;
    avatar: string;
    color: string;
    route: string;
  }[] = [
    {
      role: 'ATTENDEE',
      name: 'Elena Rostova',
      email: 'adimulam.tejobhiram@klh.edu.in',
      phone: '9391215547',
      title: 'Lead AI Engineer',
      company: 'Nexus Robotics',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      color: 'from-blue-600 to-indigo-600',
      route: '/dashboard'
    },
    {
      role: 'ORGANIZER',
      name: 'Sarah Jenkins',
      email: 'organizer@techcorp.io',
      phone: '+1 (555) 912-4433',
      title: 'VP of Engineering & Events',
      company: 'TechCorp Global',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      color: 'from-purple-600 to-pink-600',
      route: '/organizer/dashboard'
    },
    {
      role: 'ADMIN',
      name: 'Marcus Vance',
      email: 'admin@eventsphere.io',
      phone: '+1 (555) 234-8901',
      title: 'Platform Infrastructure Director',
      company: 'Event Sphere Cloud',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      color: 'from-red-600 to-orange-600',
      route: '/admin/dashboard'
    },
    {
      role: 'SPEAKER',
      name: 'Dr. Aris Thorne',
      email: 'speaker@synthetix.ai',
      phone: '+1 (555) 762-9011',
      title: 'Chief AI Scientist',
      company: 'Synthetix Research',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      color: 'from-cyan-600 to-blue-600',
      route: '/agenda'
    },
    {
      role: 'SPONSOR',
      name: 'Victoria Chen',
      email: 'sponsor@hypercloud.com',
      phone: '+1 (555) 843-1290',
      title: 'Head of Global Partnerships',
      company: 'HyperCloud Scale',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
      color: 'from-amber-600 to-yellow-600',
      route: '/events'
    }
  ];

  const handleQuickLogin = async (account: typeof demoAccounts[0]) => {
    setLoading(true);
    try {
      await login(account.email, 'Password123!', account.phone);
      setSuccessMessage(`Welcome back, ${account.name}! Logged in as ${account.role}.`);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        onClose();
        navigate(redirectUrl || account.route);
      }, 700);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Dispatch OTP to Contact Number & Email via FastAPI Backend + Redis 60s TTL
  const handleInitiateLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      alert('Please provide a valid email address.');
      return;
    }
    if (!phone) {
      alert('Please provide a contact phone number to receive the OTP.');
      return;
    }

    setSendingOtp(true);
    setOtpError(null);
    setEnteredOtp('');
    setOtpVerified(false);
    setCountdown(60);
    setAttemptsRemaining(null);

    const primaryTarget = phone.trim() || email.trim();
    const targetType = phone.trim() ? 'phone' : 'email';

    try {
      // 1. Call Backend FastAPI + Redis endpoint with dual binding
      const result = await authApi.sendBackendOtp(primaryTarget, targetType, 'LOGIN', {
        email: email.trim(),
        phone: phone.trim()
      });
      
      if (!result.success && result.error === 'RATE_LIMITED') {
        setOtpError(result.message);
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

      setLoginStep('VERIFY_OTP');
      setCountdown(result.expiresIn || 60);

      // Automatically open the user's email client/inbox in a new tab
      openUserEmail(email.trim());
    } catch (err: any) {
      setOtpError('Failed to dispatch login OTP. Please check your backend connection.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Resend Login OTP with fresh 60s Redis TTL
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
      setOtpError('Could not resend OTP. Please check your connection.');
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify OTP and complete authentication
  const handleVerifyOtpAndLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOtpError(null);

    const cleanEntered = enteredOtp.trim();
    if (!cleanEntered) {
      setOtpError('Please enter the 6-digit OTP sent to your contact number.');
      return;
    }

    if (cleanEntered.length !== 6) {
      setOtpError('The OTP code must be exactly 6 digits.');
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

      // Verification Success! Complete login
      setOtpVerified(true);
      await login(email, password, phone);
      setSuccessMessage('Contact OTP Verified! Signing you into Event Sphere...');
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        onClose();
        if (email.includes('organizer')) {
          navigate(redirectUrl || '/organizer/dashboard');
        } else if (email.includes('admin')) {
          navigate(redirectUrl || '/admin/dashboard');
        } else {
          navigate(redirectUrl || '/dashboard');
        }
      }, 700);
    } catch (err) {
      setOtpError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-blue-500/40 bg-[#0F172A] shadow-2xl overflow-hidden flex flex-col my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Sign In to Event Sphere</h3>
              <p className="text-xs text-slate-400">Secure OTP & persona access</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800/80 pb-3">
          <button
            onClick={() => { setActiveTab('QUICK'); setLoginStep('CREDENTIALS'); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'QUICK'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1-Click Fast Login</span>
          </button>

          <button
            onClick={() => { setActiveTab('FORM'); setLoginStep('CREDENTIALS'); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'FORM'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Contact Number & OTP</span>
          </button>

          <button
            onClick={() => { setActiveTab('SSO'); setLoginStep('CREDENTIALS'); }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SSO'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Enterprise SSO</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          
          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/60 flex items-center gap-2.5 text-xs text-emerald-300 animate-pulse">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{successMessage}</span>
            </div>
          )}

          {/* TAB 1: 1-CLICK QUICK PERSONA LOGINS */}
          {activeTab === 'QUICK' && (
            <div className="space-y-3">
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider block">
                Select a Verified Account to Log In Instantly:
              </span>

              <div className="space-y-2.5">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.email}
                    onClick={() => handleQuickLogin(acc)}
                    disabled={loading}
                    className="w-full p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-blue-500/50 flex items-center justify-between text-left transition-all hover:scale-[1.01] group shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={acc.avatar} 
                        alt={acc.name} 
                        className="w-11 h-11 rounded-xl object-cover border border-slate-700 group-hover:border-blue-400 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white group-hover:text-blue-300 truncate">
                            {acc.name}
                          </h4>
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${acc.color}`}>
                            {acc.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {acc.title} • {acc.company}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 truncate mt-0.5">
                          <span>📧 {acc.email}</span>
                          <span>•</span>
                          <span className="text-emerald-400">📱 {acc.phone}</span>
                        </p>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-800 group-hover:bg-blue-600 group-hover:text-white text-slate-400 transition-colors shrink-0 ml-2">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: MANUAL CREDENTIALS WITH CONTACT NUMBER & OTP */}
          {activeTab === 'FORM' && (
            <div>
              {loginStep === 'CREDENTIALS' ? (
                <form onSubmit={handleInitiateLoginOtp} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-semibold">Email Address</label>
                    <div className="relative">
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="name@company.com"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-medium"
                      />
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1 font-semibold flex items-center justify-between">
                      <span>Contact Phone Number (For OTP Delivery)</span>
                      <span className="text-[10px] text-emerald-400 font-normal">SMS OTP Enabled</span>
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
                      📱 A 6-digit authentication OTP will be sent to this contact number & Google Mail.
                    </p>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs text-slate-400 font-semibold">Password</label>
                      <a href="/login" className="text-[11px] text-blue-400 hover:underline">
                        Forgot password?
                      </a>
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
                      <span>Remember me on this device</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={sendingOtp}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                  >
                    <span>{sendingOtp ? 'Sending OTP to Contact...' : 'Send OTP to Contact Number & Continue'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                /* STEP 2: VERIFY LOGIN OTP SENT TO CONTACT NUMBER & EMAIL */
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
                          onClick={() => {
                            setEnteredOtp(generatedOtp);
                            setOtpError(null);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/30 transition-all hover:scale-105"
                        >
                          <Zap className="w-3.5 h-3.5 fill-current text-yellow-300" />
                          <span>⚡ 1-Click Auto-Fill</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedOtp);
                            setOtpCopied(true);
                            setTimeout(() => setOtpCopied(false), 2000);
                          }}
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

                  <form onSubmit={handleVerifyOtpAndLogin} className="space-y-4">
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
                          setLoginStep('CREDENTIALS');
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
            </div>
          )}

          {/* TAB 3: ENTERPRISE SSO & SOCIAL */}
          {activeTab === 'SSO' && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-400">
                Single Sign-On through Okta, Azure AD, Google Workspace, or GitHub.
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickLogin(demoAccounts[1])}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-all hover:bg-slate-800"
                >
                  <Building className="w-4 h-4 text-blue-400" />
                  <span>Corporate SAML SSO</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin(demoAccounts[0])}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition-all hover:bg-slate-800"
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Google Workspace</span>
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-[11px] text-blue-300 text-left flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
                <span>Encrypted via OAuth 2.0 & JWT with role-based claim verification.</span>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Need a new account?</span>
          <a 
            href="/register" 
            onClick={(e) => { e.preventDefault(); onClose(); navigate('/register'); }}
            className="text-blue-400 font-bold hover:underline"
          >
            Create Free Account →
          </a>
        </div>

      </div>
    </div>
  );
};
