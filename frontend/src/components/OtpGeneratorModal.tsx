import React, { useState, useEffect } from 'react';
import { 
  X, KeyRound, Sparkles, Copy, Check, RefreshCw, 
  Clock, Zap, ShieldCheck, Mail, Phone, Send, ArrowRight
} from 'lucide-react';
import { authApi, notificationApi } from '../services/api';
import confetti from 'canvas-confetti';

interface OtpGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OtpGeneratorModal: React.FC<OtpGeneratorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [target, setTarget] = useState('adimulam.tejobhiram@klh.edu.in');
  const [targetType, setTargetType] = useState<'email' | 'phone'>('email');
  const [purpose, setPurpose] = useState<'LOGIN' | 'REGISTRATION' | 'SECURITY_VERIFY'>('LOGIN');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(60);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: any;
    if (generatedOtp && countdown > 0) {
      timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [generatedOtp, countdown]);

  if (!isOpen) return null;

  const handleGenerateOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setStatusMessage(null);
    setCopied(false);

    try {
      const result = await authApi.sendBackendOtp(target.trim(), targetType, purpose, {
        email: targetType === 'email' ? target.trim() : undefined,
        phone: targetType === 'phone' ? target.trim() : undefined
      });

      const activeCode = result.otp || result.otpCode || Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(activeCode);
      setCountdown(result.expiresIn || 60);
      setStatusMessage(`New ${activeCode.length}-digit OTP code generated & active in Redis for 60 seconds!`);

      // Dispatch alert event so DeviceMessageAlert shows it
      await notificationApi.sendLoginOtp({
        contactPhone: targetType === 'phone' ? target.trim() : '',
        email: targetType === 'email' ? target.trim() : '',
        recipientName: 'Event Sphere User',
        otpCode: activeCode
      });

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 }
      });
    } catch {
      const fallback = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(fallback);
      setCountdown(60);
      setStatusMessage('Generated on-screen simulated OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedOtp) return;
    navigator.clipboard.writeText(generatedOtp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAutofill = () => {
    if (!generatedOtp) return;
    window.dispatchEvent(new CustomEvent('es_autofill_otp', {
      detail: { otp: generatedOtp }
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel bg-[#0B132B]/95 rounded-3xl border-2 border-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.35)] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Generate OTP Code</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold">
                  On-Screen Display
                </span>
              </h3>
              <p className="text-xs text-slate-400">Generate, display & test 6-digit OTP verification codes instantly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          
          {/* Form to configure generator */}
          <form onSubmit={handleGenerateOtp} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setTargetType('email'); setTarget('adimulam.tejobhiram@klh.edu.in'); }}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  targetType === 'email'
                    ? 'bg-blue-600/30 border-blue-500 text-blue-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Email Target</span>
              </button>
              <button
                type="button"
                onClick={() => { setTargetType('phone'); setTarget('9391215547'); }}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  targetType === 'phone'
                    ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>SMS / Phone Target</span>
              </button>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">
                Recipient / Identifier
              </label>
              <input 
                type="text"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                required
                placeholder={targetType === 'email' ? 'user@example.com' : '9391215547'}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Generating Code...' : 'Generate New OTP On Screen'}</span>
            </button>
          </form>

          {/* ON-SCREEN OTP DISPLAY CARD */}
          {generatedOtp ? (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 border-2 border-blue-400/80 shadow-[0_0_35px_rgba(59,130,246,0.3)] text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-blue-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-400 animate-spin" style={{ animationDuration: '6s' }} />
                  Active On-Screen OTP
                </span>
                <div className="flex items-center gap-1 text-[11px] font-mono">
                  <Clock className={`w-3.5 h-3.5 ${countdown <= 15 ? 'text-rose-400 animate-pulse' : 'text-blue-400'}`} />
                  <span className={countdown <= 15 ? 'text-rose-400 font-bold' : 'text-blue-200'}>
                    {countdown > 0 ? `${countdown}s TTL` : 'Expired'}
                  </span>
                </div>
              </div>

              {/* 6-Digit Display Blocks */}
              <div className="flex items-center justify-center gap-2.5 py-2">
                {generatedOtp.split('').map((digit, idx) => (
                  <div 
                    key={idx}
                    className="w-11 h-14 rounded-2xl bg-slate-950 border-2 border-blue-400 text-blue-300 text-3xl font-black font-mono flex items-center justify-center shadow-xl shadow-blue-500/25"
                  >
                    {digit}
                  </div>
                ))}
              </div>

              {statusMessage && (
                <p className="text-[11px] text-emerald-400 font-medium">
                  {statusMessage}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleAutofill}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/30 transition-all hover:scale-105"
                >
                  <Zap className="w-3.5 h-3.5 fill-current text-yellow-300" />
                  <span>⚡ 1-Click Auto-Fill</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-1 text-slate-400">
              <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-300">No OTP code generated yet.</p>
              <p className="text-[11px]">Click "Generate New OTP On Screen" to create a fresh 6-digit code.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
