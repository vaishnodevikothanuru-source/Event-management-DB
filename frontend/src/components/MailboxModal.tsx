import React, { useState, useEffect } from 'react';
import { 
  Mail, X, Clock, Check, Key, ShieldCheck, 
  Trash2, RefreshCw, Search, ArrowRight, ExternalLink, Inbox
} from 'lucide-react';
import { notificationApi, SentEmailNotification } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface MailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetEmail?: string;
}

export const MailboxModal: React.FC<MailboxModalProps> = ({
  isOpen,
  onClose,
  targetEmail
}) => {
  const { user } = useAuth();
  const [emails, setEmails] = useState<SentEmailNotification[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<SentEmailNotification | null>(null);
  const [filterEmail, setFilterEmail] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copiedOtp, setCopiedOtp] = useState<boolean>(false);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const data = await notificationApi.getSentEmails();
      setEmails(data);
      if (data.length > 0) {
        // If targetEmail is provided, find the newest matching email
        if (targetEmail) {
          const match = data.find(e => e.recipientEmail.toLowerCase() === targetEmail.toLowerCase());
          if (match) setSelectedEmail(match);
          else setSelectedEmail(data[0]);
        } else {
          setSelectedEmail(data[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (targetEmail) {
        setFilterEmail(targetEmail);
      }
      fetchEmails();
    }
  }, [isOpen, targetEmail]);

  // Live listener for new incoming emails
  useEffect(() => {
    const handleNewEmail = (e: any) => {
      const newEmail: SentEmailNotification = e.detail;
      setEmails(prev => [newEmail, ...prev.filter(item => item.id !== newEmail.id)]);
      setSelectedEmail(newEmail);
    };

    window.addEventListener('es_new_email_received', handleNewEmail);
    return () => window.removeEventListener('es_new_email_received', handleNewEmail);
  }, []);

  if (!isOpen) return null;

  const filteredEmails = emails.filter(e => 
    !filterEmail || 
    e.recipientEmail.toLowerCase().includes(filterEmail.toLowerCase()) ||
    e.subject.toLowerCase().includes(filterEmail.toLowerCase())
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl h-[600px] rounded-3xl glass-panel border border-slate-700 bg-[#0F172A] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Mailbox Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Attendee Email Inbox</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
                  Live SMTP Dispatch Simulator
                </span>
              </div>
              <p className="text-xs text-slate-400">
                View emails and verification codes received by your registered email addresses.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={fetchEmails}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh Mailbox"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mailbox Body: Split View (List & Message View) */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Email List Sidebar */}
          <div className="w-1/3 border-r border-slate-800 bg-slate-950/40 flex flex-col">
            {/* Search Filter */}
            <div className="p-3 border-b border-slate-800">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input 
                  type="text"
                  value={filterEmail}
                  onChange={(e) => setFilterEmail(e.target.value)}
                  placeholder="Filter by email or subject..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
              {filteredEmails.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <span>No emails received yet. Dispatched OTPs and passes will appear here.</span>
                </div>
              ) : (
                filteredEmails.map((email) => {
                  const isSelected = selectedEmail?.id === email.id;
                  return (
                    <div
                      key={email.id}
                      onClick={() => setSelectedEmail(email)}
                      className={`p-3.5 cursor-pointer transition-colors ${
                        isSelected 
                          ? 'bg-brand-950/50 border-l-2 border-brand-500' 
                          : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-emerald-400 truncate max-w-[140px]">{email.recipientEmail}</span>
                        <span>{new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <h5 className="text-xs font-semibold text-white truncate">{email.subject}</h5>
                      <p className="text-[11px] text-slate-400 mt-1 truncate">
                        {email.type === 'REGISTRATION_OTP' ? 'Email Verification OTP Code' : 'Event Booking Pass Confirmed'}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Email Reading Pane */}
          <div className="flex-1 bg-slate-900/40 p-6 overflow-y-auto flex flex-col">
            {selectedEmail ? (
              <div className="space-y-4">
                {/* Header Info */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white">{selectedEmail.subject}</h4>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(selectedEmail.sentAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 space-y-0.5">
                    <div><strong className="text-slate-500">From:</strong> Event Sphere Notification Service &lt;noreply@eventsphere.io&gt;</div>
                    <div><strong className="text-slate-500">To:</strong> <span className="text-emerald-400 font-bold">{selectedEmail.recipientEmail}</span> ({selectedEmail.recipientName})</div>
                  </div>
                </div>

                {/* Email Body */}
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-200 space-y-4">
                  <p>
                    Hello <strong className="text-white">{selectedEmail.recipientName || 'Valued Attendee'}</strong>,
                  </p>
                  
                  {selectedEmail.type === 'REGISTRATION_OTP' ? (
                    <p>
                      You requested an entry verification code to register and purchase a pass for <strong className="text-brand-400">{selectedEmail.eventTitle}</strong> ({selectedEmail.ticketTier}).
                    </p>
                  ) : (
                    <p>
                      Your registration and pass purchase for <strong className="text-brand-400">{selectedEmail.eventTitle}</strong> has been successfully confirmed.
                    </p>
                  )}

                  {/* Highlighted OTP Box */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-950/70 via-slate-900 to-purple-950/70 border-2 border-brand-500/50 text-center space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      Your 6-Digit Single-Use OTP
                    </span>
                    <div className="text-3xl font-black font-mono tracking-widest text-brand-300 py-2 px-6 rounded-xl bg-slate-950 inline-block border border-brand-500/40 shadow-xl shadow-brand-500/10">
                      {selectedEmail.otpCode}
                    </div>
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleCopyCode(selectedEmail.otpCode)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-colors"
                      >
                        {copiedOtp ? <Check className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
                        <span>{copiedOtp ? 'OTP Copied to Clipboard!' : 'Copy OTP Code'}</span>
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Enter this 6-digit code in the event registration modal to tally and unlock your payment.
                    </p>
                  </div>

                  {selectedEmail.qrCodeToken && (
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] space-y-1">
                      <div><span className="text-slate-500">Pass Token:</span> <strong className="text-brand-400 font-mono">{selectedEmail.qrCodeToken}</strong></div>
                      {selectedEmail.passUrl && (
                        <div>
                          <a 
                            href={selectedEmail.passUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-blue-400 hover:underline flex items-center gap-1 mt-1"
                          >
                            <span>Open Digital Smart Badge</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 border-t border-slate-900 pt-3">
                    Security Notice: Event Sphere will never ask for your password. This OTP expires in 7 days.
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
                <Mail className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-xs">Select an email message on the left to read its contents.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
