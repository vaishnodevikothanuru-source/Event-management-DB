import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, QrCode, Camera, Upload, CheckCircle2, 
  ExternalLink, Sparkles, ArrowRight, Zap, RefreshCw 
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import confetti from 'canvas-confetti';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  title = "Scan Event QR Code"
}) => {
  const navigate = useNavigate();
  const [scanMode, setScanMode] = useState<'CAMERA' | 'FILE' | 'INPUT'>('CAMERA');
  const [manualInput, setManualInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-reader-container";

  // Handle detection and auto-redirection
  const handleDecodedText = (decodedText: string) => {
    setScannedResult(decodedText);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });

    // Stop active camera
    stopCamera();

    // Auto-redirect to destination page after a brief 800ms visual confirmation
    setTimeout(() => {
      onClose();
      if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
        try {
          const url = new URL(decodedText);
          if (url.origin === window.location.origin) {
            navigate(url.pathname + url.search);
          } else {
            window.location.href = decodedText;
          }
        } catch {
          window.location.href = decodedText;
        }
      } else if (decodedText.startsWith('/')) {
        navigate(decodedText);
      } else if (/^\d{6}$/.test(decodedText.trim())) {
        // If 6-digit OTP is entered, redirect to the default attendee pass
        navigate(`/pass/ES-SUMMIT2026-VIP-ELENA-9942`);
      } else if (decodedText.startsWith('ES-') || decodedText.includes('VIP') || decodedText.includes('STD')) {
        navigate(`/pass/${decodedText}`);
      } else if (decodedText.includes('summit') || decodedText.includes('expo') || decodedText.includes('event')) {
        navigate(`/events/${decodedText}`);
      } else {
        navigate(`/pass/${decodedText}`);
      }
    }, 800);
  };

  const startCamera = async () => {
    setCameraError(null);
    setScanning(true);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
        },
        (decodedText) => {
          handleDecodedText(decodedText);
        },
        (errorMessage) => {
          // parse error, ignore continuously
        }
      );
    } catch (err: any) {
      console.warn("Camera start failed, falling back to input mode:", err);
      setCameraError("Camera access unavailable on this device. Use image upload or fast input.");
      setScanMode('INPUT');
    } finally {
      setScanning(false);
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error("Error stopping camera", err);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode("qr-file-container");
      const result = await html5QrCode.scanFile(file, true);
      handleDecodedText(result);
    } catch (err) {
      alert("Could not detect a valid QR code in this image. Please try another image or use direct input.");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleDecodedText(manualInput.trim());
  };

  useEffect(() => {
    if (isOpen && scanMode === 'CAMERA') {
      const timer = setTimeout(() => {
        startCamera();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [isOpen, scanMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl glass-panel border border-slate-700 bg-[#0F172A] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-600/30 text-brand-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-xs text-slate-400">Scan any event QR code to be automatically redirected</p>
            </div>
          </div>
          <button 
            onClick={() => { stopCamera(); onClose(); }}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-800/60 pb-3">
          <button
            onClick={() => setScanMode('CAMERA')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              scanMode === 'CAMERA' 
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>

          <button
            onClick={() => setScanMode('FILE')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              scanMode === 'FILE' 
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Scan Image File</span>
          </button>

          <button
            onClick={() => setScanMode('INPUT')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              scanMode === 'INPUT' 
                ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Fast Input / Demo</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          
          {/* CAMERA SCANNER MODE */}
          {scanMode === 'CAMERA' && (
            <div className="space-y-3 text-center">
              <div 
                id={scannerContainerId} 
                className="w-full max-w-xs h-64 mx-auto rounded-2xl overflow-hidden bg-black border-2 border-brand-500/50 shadow-inner relative flex items-center justify-center"
              >
                {cameraError && (
                  <p className="text-xs text-amber-400 p-4">{cameraError}</p>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Point your camera at any conference badge, ticket pass, or event QR code.
              </p>
            </div>
          )}

          {/* FILE UPLOAD SCANNER MODE */}
          {scanMode === 'FILE' && (
            <div className="space-y-4 text-center">
              <div id="qr-file-container" className="hidden" />
              <label className="border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-900/60">
                <Upload className="w-10 h-10 text-brand-400 mb-2" />
                <span className="text-xs font-bold text-white">Click to Upload QR Code Image</span>
                <span className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP screenshots supported</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* FAST INPUT / DEMO SHORTCUTS */}
          {scanMode === 'INPUT' && (
            <div className="space-y-4">
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <label className="text-xs text-slate-400 block font-semibold">
                  Paste or Enter Scanned QR URL, Token, or 6-Digit OTP:
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="e.g. 849204 or http://localhost:3000/pass/ES-SUMMIT2026-VIP-ELENA-9942"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/30 flex items-center gap-1.5 shrink-0"
                  >
                    <span>Go</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>

              {/* Quick Demo QR Links */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Quick Demo QR & OTP Badges (Click to Simulate Instant Scan):
                </span>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleDecodedText('849204')}
                    className="w-full text-left p-2.5 rounded-xl bg-brand-950/60 hover:bg-brand-900/80 border border-brand-500/40 text-xs flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-bold text-white block">Elena Rostova — 6-Digit Entry OTP</span>
                      <span className="text-[10px] font-mono text-brand-300">OTP Passcode: 849204</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-brand-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecodedText('ES-SUMMIT2026-VIP-ELENA-9942')}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-bold text-white block">Elena Rostova — All-Access VIP Pass</span>
                      <span className="text-[10px] font-mono text-purple-400">ES-SUMMIT2026-VIP-ELENA-9942</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-brand-400" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecodedText('global-ai-summit-2026')}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs flex items-center justify-between transition-colors"
                  >
                    <div>
                      <span className="font-bold text-white block">Global AI Summit 2026 — Public Event Page</span>
                      <span className="text-[10px] font-mono text-cyan-400">/events/global-ai-summit-2026</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-brand-400" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Scanned Result / Redirecting Notification */}
          {scannedResult && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-between text-xs text-emerald-300 animate-pulse">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">QR Code Detected! Redirecting to respective page...</span>
              </div>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
