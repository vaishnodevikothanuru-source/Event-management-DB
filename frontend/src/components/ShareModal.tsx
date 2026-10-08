import React, { useState } from 'react';
import { 
  X, Share2, Copy, Check, ExternalLink, 
  QrCode, Download, Sparkles, Link as LinkIcon 
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  description?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  url,
  description = "Join me at Event Sphere!"
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    confetti({
      particleCount: 30,
      spread: 45,
      origin: { y: 0.7 }
    });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyAndOpen = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });
    window.open(url, '_blank');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (err) {
        console.warn('Native share cancelled', err);
      }
    } else {
      handleCopyAndOpen();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-3xl glass-panel border border-blue-500/40 bg-[#0F172A] p-6 shadow-2xl shadow-blue-500/10 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Share & Open Link</h3>
              <p className="text-xs text-slate-400">Click highlighted blue link below to open directly</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scannable High-Res QR Code Card */}
        <div className="text-center p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="Click QR to Open Link"
            className="p-3 bg-white rounded-2xl inline-block shadow-xl border-2 border-blue-500/50 hover:scale-105 transition-transform cursor-pointer"
          >
            <QRCodeSVG 
              value={url} 
              size={145}
              level="H"
              includeMargin={false}
              fgColor="#0B0F19"
              bgColor="#ffffff"
            />
          </a>
          <p className="text-[11px] text-slate-300">
            Scan with any phone camera or click the highlighted blue link below:
          </p>
        </div>

        {/* PROMINENT BLUE HIGHLIGHTED SHARED LINK BOX */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[11px] uppercase font-extrabold text-blue-400 flex items-center gap-1.5 tracking-wider">
              <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Shared Link (Highlighted & Clickable)</span>
            </label>
            <span className="text-[10px] font-bold text-blue-300 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">
              Live URL
            </span>
          </div>
          
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="Click to Open Shared Link"
            className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-blue-950/80 border-2 border-blue-400 text-blue-200 hover:text-white hover:bg-blue-900/90 shadow-[0_0_25px_rgba(59,130,246,0.35)] ring-2 ring-blue-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-ping shrink-0" />
              <span className="font-mono text-xs font-bold text-blue-200 group-hover:text-white truncate underline decoration-blue-400 group-hover:decoration-white decoration-2">
                {url}
              </span>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-xl shrink-0 shadow-md shadow-blue-600/40 transition-all group-hover:scale-105">
              <span>Open</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </a>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 hover:border-slate-600 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/40 hover:scale-[1.02] transition-all text-center"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open Link Now</span>
            </a>
          </div>

          <button
            onClick={handleCopyAndOpen}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-blue-600/30 hover:scale-[1.02] transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Sparkles className="w-4 h-4 text-blue-200" />}
            <span>Copy & Open Page</span>
            <ExternalLink className="w-4 h-4 ml-1" />
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              onClick={handleNativeShare}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
            >
              <Share2 className="w-4 h-4 text-blue-400" />
              <span>Share via Device Menu</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
