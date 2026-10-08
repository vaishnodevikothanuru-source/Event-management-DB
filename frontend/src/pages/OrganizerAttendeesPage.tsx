import React, { useState } from 'react';
import { 
  Users, Search, Download, QrCode, CheckCircle2, 
  XCircle, Filter, Sparkles, Check, Copy, ExternalLink, 
  ArrowRight, X, Key
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

export const OrganizerAttendeesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [scannedAttendee, setScannedAttendee] = useState<any | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);

  const [attendees, setAttendees] = useState([
    { id: '1', name: 'Elena Rostova', email: 'attendee@nexus.io', role: 'ATTENDEE', ticketTier: 'VIP All-Access Pass', token: 'ES-SUMMIT2026-VIP-ELENA-9942', otp: '849204', status: 'CHECKED_IN', checkedInTime: '08:42 AM', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80' },
    { id: '2', name: 'Alex Mercer', email: 'alex.m@cognitech.ai', role: 'ATTENDEE', ticketTier: 'Standard In-Person Pass', token: 'ES-SUMMIT2026-STD-ALEX-1402', otp: '194820', status: 'CHECKED_IN', checkedInTime: '09:05 AM', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80' },
    { id: '3', name: 'Dr. Aris Thorne', email: 'speaker@synthetix.ai', role: 'SPEAKER', ticketTier: 'Speaker Pass', token: 'ES-SUMMIT2026-SPK-ARIS-0012', otp: '932014', status: 'CHECKED_IN', checkedInTime: '08:15 AM', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80' },
    { id: '4', name: 'Victoria Chen', email: 'sponsor@hypercloud.com', role: 'SPONSOR', ticketTier: 'Sponsor VIP', token: 'ES-SUMMIT2026-SPN-VIC-7821', otp: '582049', status: 'CONFIRMED', checkedInTime: null, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80' },
    { id: '5', name: 'David Zhang', email: 'david.zhang@apexseed.com', role: 'ATTENDEE', ticketTier: 'Standard In-Person Pass', token: 'ES-SUMMIT2026-STD-DAV-4421', otp: '629401', status: 'CONFIRMED', checkedInTime: null, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80' },
  ]);

  const toggleCheckIn = (id: string) => {
    setAttendees(attendees.map(a => {
      if (a.id === id) {
        const nextStatus = a.status === 'CHECKED_IN' ? 'CONFIRMED' : 'CHECKED_IN';
        if (nextStatus === 'CHECKED_IN') {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 }
          });
        }
        return {
          ...a,
          status: nextStatus,
          checkedInTime: nextStatus === 'CHECKED_IN' ? 'Just now' : null
        };
      }
      return a;
    }));
  };

  const handleScanSimulate = (inputStr: string) => {
    if (!inputStr.trim()) return;
    
    // Auto-extract token if a full URL is scanned/pasted (e.g. http://localhost:3000/pass/ES-...)
    const cleanToken = inputStr.includes('/pass/') 
      ? inputStr.split('/pass/')[1].split('?')[0].trim() 
      : inputStr.trim();

    const match = attendees.find(a => 
      a.token.toLowerCase() === cleanToken.toLowerCase() || 
      (a.otp && a.otp === cleanToken)
    );
    if (match) {
      setScannedAttendee(match);
      setScannedCode('');
    } else {
      alert(`QR Code / OTP "${cleanToken}" not found in registry.`);
    }
  };

  const handleCopyLink = (token: string) => {
    const url = `${window.location.origin}/pass/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(otp);
    setTimeout(() => setCopiedOtp(null), 2500);
  };

  const exportCSV = () => {
    const headers = 'ID,Name,Email,Role,Ticket Tier,Token,OTP,Status,CheckedInTime\n';
    const rows = attendees.map(a => `${a.id},${a.name},${a.email},${a.role},${a.ticketTier},${a.token},${a.otp},${a.status},${a.checkedInTime || ''}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EventSphere_Attendees_${Date.now()}.csv`;
    link.click();
  };

  const filtered = attendees.filter(a => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = a.name.toLowerCase().includes(q) || 
                          a.email.toLowerCase().includes(q) ||
                          a.token.toLowerCase().includes(q) ||
                          (a.otp && a.otp.includes(q));
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const checkedInCount = attendees.filter(a => a.status === 'CHECKED_IN').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400">
            <Users className="w-4 h-4" />
            <span>Delegate Operations</span>
          </div>
          <h1 className="text-2xl font-black text-white">Attendee Roster & Check-In</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setScannerOpen(true); setScannedAttendee(null); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
          >
            <QrCode className="w-4 h-4" />
            <span>Live QR Scanner Tool</span>
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 uppercase font-bold block">Total Registered</span>
          <span className="text-xl font-black text-white">{attendees.length}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 uppercase font-bold block">Checked In</span>
          <span className="text-xl font-black text-emerald-400">{checkedInCount}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 uppercase font-bold block">Pending Arrival</span>
          <span className="text-xl font-black text-amber-400">{attendees.length - checkedInCount}</span>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
          <span className="text-[11px] text-slate-400 uppercase font-bold block">Attendance %</span>
          <span className="text-xl font-black text-purple-400">
            {Math.round((checkedInCount / attendees.length) * 100)}%
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or QR token..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'CHECKED_IN', 'CONFIRMED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === s 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Attendees Table */}
      <div className="glass-card rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold">Attendee</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Ticket Tier</th>
                <th className="p-4 font-semibold">Entry OTP</th>
                <th className="p-4 font-semibold">QR Pass & Link</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((att) => (
                <tr key={att.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img src={att.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-purple-500/40" />
                    <div>
                      <p className="font-bold text-white">{att.name}</p>
                      <p className="text-[11px] text-slate-400">{att.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {att.role}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-purple-300">{att.ticketTier}</td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleCopyOtp(att.otp)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-950/70 border border-brand-500/40 text-brand-300 hover:bg-brand-900 font-mono text-[11px] font-bold transition-colors"
                      title="Click to copy OTP passcode"
                    >
                      <Key className="w-3 h-3 text-brand-400" />
                      <span>{att.otp}</span>
                      {copiedOtp === att.otp ? (
                        <Check className="w-3 h-3 text-emerald-400 ml-0.5" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-500 ml-0.5" />
                      )}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`/pass/${att.token}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/70 border border-blue-500/50 text-blue-300 hover:text-white hover:bg-blue-900 font-mono text-[11px] font-bold shadow-sm shadow-blue-500/20 group"
                        title="Click to Open Badge Link"
                      >
                        <span className="truncate max-w-[140px] underline decoration-blue-400/60 group-hover:decoration-white">{att.token}</span>
                        <ExternalLink className="w-3 h-3 text-blue-400 group-hover:text-white shrink-0" />
                      </a>
                      <button
                        onClick={() => handleCopyLink(att.token)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                        title="Copy QR Badge Link"
                      >
                        {copiedToken === att.token ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      att.status === 'CHECKED_IN' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {att.status} {att.checkedInTime && `(${att.checkedInTime})`}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleCheckIn(att.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        att.status === 'CHECKED_IN'
                          ? 'bg-slate-800 text-slate-400 hover:text-white'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                      }`}
                    >
                      {att.status === 'CHECKED_IN' ? 'Undo Check-In' : 'Confirm Check-In'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Scanner & Verifier Simulator Modal */}
      {scannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg glass-panel p-6 rounded-3xl border border-slate-700 bg-[#0F172A] space-y-5 shadow-2xl relative">
            
            <button
              onClick={() => { setScannerOpen(false); setScannedAttendee(null); }}
              className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-purple-400" />
                Live Entrance QR Scanner
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Scan or paste an attendee's digital badge link / token to verify ticket validity and grant gate access.
              </p>
            </div>

            {/* Quick Test Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tap Demo Badge Token or Entry OTP to Scan:</span>
              <div className="flex flex-wrap gap-2">
                {attendees.slice(0, 3).map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleScanSimulate(a.token)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[11px] text-purple-300 font-semibold"
                  >
                    Scan QR: {a.name} ({a.token.slice(0, 12)}...)
                  </button>
                ))}
                {attendees.slice(0, 2).map((a) => (
                  <button
                    key={`otp-${a.id}`}
                    onClick={() => handleScanSimulate(a.otp)}
                    className="px-2.5 py-1 rounded-lg bg-brand-950/60 hover:bg-brand-900/80 border border-brand-500/40 text-[11px] text-brand-300 font-mono font-bold"
                  >
                    Enter OTP: {a.otp} ({a.name.split(' ')[0]})
                  </button>
                ))}
              </div>
            </div>

            {/* Scan / Paste Form */}
            <form onSubmit={(e) => { e.preventDefault(); handleScanSimulate(scannedCode); }} className="space-y-3">
              <input 
                type="text"
                value={scannedCode}
                onChange={(e) => setScannedCode(e.target.value)}
                placeholder="Enter 6-Digit OTP (e.g. 849204) or Pass URL..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30"
              >
                Scan & Verify Credentials
              </button>
            </form>

            {/* Verified Scanned Result Card */}
            {scannedAttendee && (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    Verified Valid Pass
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                    {scannedAttendee.ticketTier}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <img src={scannedAttendee.avatar} alt="" className="w-12 h-12 rounded-xl object-cover border border-emerald-400" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white">{scannedAttendee.name}</h4>
                    <p className="text-xs text-slate-300">{scannedAttendee.email}</p>
                    <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 pt-0.5">
                      <span className="truncate">{scannedAttendee.token}</span>
                      <span className="text-brand-400 font-bold bg-brand-950/80 px-1.5 py-0.5 rounded border border-brand-500/30">OTP: {scannedAttendee.otp}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-blue-400 block tracking-wider">
                    Attendee Badge Link (Highlighted in Blue):
                  </span>
                  <a
                    href={`/pass/${scannedAttendee.token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-blue-950/80 border-2 border-blue-400 text-blue-200 hover:text-white hover:bg-blue-900 shadow-md shadow-blue-500/20 ring-1 ring-blue-500/40 text-xs font-mono font-bold transition-all cursor-pointer group"
                  >
                    <span className="truncate underline decoration-blue-400 decoration-2 group-hover:decoration-white">
                      {window.location.origin}/pass/{scannedAttendee.token}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded shrink-0">
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </a>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-emerald-900/60">
                  <button
                    onClick={() => handleCopyLink(scannedAttendee.token)}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedToken === scannedAttendee.token ? 'Copied!' : 'Copy Badge Link'}</span>
                  </button>

                  <a
                    href={`/pass/${scannedAttendee.token}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold text-center shadow-md shadow-blue-600/30 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Badge Now</span>
                  </a>
                </div>

                <button
                  onClick={() => {
                    toggleCheckIn(scannedAttendee.id);
                    setScannedAttendee({ ...scannedAttendee, status: 'CHECKED_IN', checkedInTime: 'Just now' });
                  }}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30"
                >
                  {scannedAttendee.status === 'CHECKED_IN' ? 'Attendee Already Checked In ✓' : 'Confirm Gate Entry & Check In'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
