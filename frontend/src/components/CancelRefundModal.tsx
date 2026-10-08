import React, { useState } from 'react';
import { 
  X, AlertTriangle, RotateCcw, CheckCircle2, DollarSign, 
  CreditCard, Building, Zap, ArrowRight, ShieldCheck, 
  Receipt, Download, Clock, Sparkles, HelpCircle, FileText
} from 'lucide-react';
import { Registration, RefundMethod, CancellationRefund } from '../types';
import { ticketsApi } from '../services/api';
import confetti from 'canvas-confetti';

interface CancelRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration | null;
  onCancellationSuccess?: (refund: CancellationRefund) => void;
}

export const CancelRefundModal: React.FC<CancelRefundModalProps> = ({
  isOpen,
  onClose,
  registration,
  onCancellationSuccess
}) => {
  const [refundMethod, setRefundMethod] = useState<RefundMethod>('ORIGINAL_PAYMENT');
  const [reason, setReason] = useState<string>('Schedule Conflict');
  const [otherReasonText, setOtherReasonText] = useState('');
  
  // Bank transfer inputs
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingCode, setRoutingCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');

  // UPI / PayPal input
  const [digitalPayId, setDigitalPayId] = useState('');

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [completedRefund, setCompletedRefund] = useState<CancellationRefund | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !registration) return null;

  const ticketPrice = registration.ticketType?.price ?? 0;
  const currency = registration.ticketType?.currency || 'USD';
  const isFreeEvent = ticketPrice === 0;

  // 10% bonus for wallet credit
  const walletBonus = Math.round(ticketPrice * 0.10 * 100) / 100;
  const totalWalletCredit = Math.round((ticketPrice + walletBonus) * 100) / 100;

  const handleConfirmCancellation = async () => {
    setErrorMsg(null);
    setIsProcessing(true);

    // Validation for custom methods
    if (refundMethod === 'BANK_TRANSFER' && (!bankName || !accountNumber || !routingCode)) {
      setErrorMsg('Please fill in your bank name, account number, and routing/IFSC code.');
      setIsProcessing(false);
      return;
    }
    if (refundMethod === 'UPI_PAYPAL' && !digitalPayId) {
      setErrorMsg('Please provide your PayPal email or UPI ID.');
      setIsProcessing(false);
      return;
    }

    try {
      setProcessingStep('1/3: Voiding QR Smart Pass & Access Permissions...');
      await new Promise((r) => setTimeout(r, 600));

      setProcessingStep('2/3: Communicating with Payment Gateway & Initiating Withdrawal...');
      await new Promise((r) => setTimeout(r, 700));

      setProcessingStep('3/3: Generating Official Refund & Cancellation Receipt...');
      await new Promise((r) => setTimeout(r, 500));

      let accountDetails = '';
      if (refundMethod === 'ORIGINAL_PAYMENT') {
        accountDetails = 'Original Payment Card (•••• 4242)';
      } else if (refundMethod === 'BANK_TRANSFER') {
        accountDetails = `${bankName} • Acc: ••••${accountNumber.slice(-4)} • ${accountHolderName || 'Attendee'}`;
      } else if (refundMethod === 'WALLET_CREDIT') {
        accountDetails = `EventSphere Wallet (${currency} $${totalWalletCredit} with 10% bonus)`;
      } else if (refundMethod === 'UPI_PAYPAL') {
        accountDetails = `Digital Handle: ${digitalPayId}`;
      }

      const finalReason = reason === 'Other' ? (otherReasonText || 'Attendee Request') : reason;

      const res = await ticketsApi.cancelBooking({
        registrationId: registration.id,
        reason: finalReason,
        refundMethod,
        accountDetails
      });

      setCompletedRefund(res.refund);
      setIsProcessing(false);

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onCancellationSuccess) {
        onCancellationSuccess(res.refund);
      }
    } catch (err: any) {
      console.error('Cancellation failed:', err);
      setErrorMsg(err?.message || 'Failed to process cancellation. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!completedRefund) return;
    const receiptText = `
=====================================================
          EVENT SPHERE - OFFICIAL REFUND RECEIPT
=====================================================
Refund ID:        ${completedRefund.id}
Transaction Ref:  ${completedRefund.transactionRef}
Date & Time:      ${new Date(completedRefund.cancelledAt).toLocaleString()}
Status:           ${completedRefund.status}

EVENT DETAILS
-----------------------------------------------------
Event:            ${completedRefund.eventTitle}
Pass Tier:        ${completedRefund.ticketTypeName}
Ticket Price:     ${completedRefund.currency} $${completedRefund.amount.toFixed(2)}
Processing Fee:   $0.00 (100% Money-Back Policy)
Net Refund:       ${completedRefund.currency} $${completedRefund.amount.toFixed(2)}

WITHDRAWAL DESTINATION
-----------------------------------------------------
Method:           ${completedRefund.refundMethod}
Account Details:  ${completedRefund.accountDetails}
Cancellation Rsn: ${completedRefund.reason}

=====================================================
Thank you for using EventSphere. If you have questions,
please contact support@eventsphere.io
=====================================================
    `.trim();

    const blob = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EventSphere_Refund_Receipt_${completedRefund.transactionRef}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    setCompletedRefund(null);
    setIsProcessing(false);
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl shadow-rose-950/20 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Cancel Booking & Money Withdrawal
              </h2>
              <p className="text-xs text-slate-400">100% Instant Refund Guarantee</p>
            </div>
          </div>

          <button 
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* COMPLETED SUCCESS SCREEN */}
        {completedRefund ? (
          <div className="p-8 space-y-6 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">Cancellation & Refund Confirmed!</h3>
              <p className="text-sm text-slate-300">
                Your booking has been cancelled and money withdrawal has been successfully initiated.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs text-slate-400">Transaction Reference</span>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-500/30">
                  {completedRefund.transactionRef}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Event</span>
                  <span className="font-bold text-white truncate block">{completedRefund.eventTitle}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Pass Tier</span>
                  <span className="font-bold text-white block">{completedRefund.ticketTypeName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Refund Amount</span>
                  <span className="font-black text-emerald-400 text-base block">
                    {completedRefund.currency} ${completedRefund.amount.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Payout Destination</span>
                  <span className="font-semibold text-slate-200 block truncate">{completedRefund.accountDetails}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={handleDownloadReceipt}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Download Official Receipt (.TXT)</span>
              </button>

              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-blue-500/20"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            
            {/* Warning Banner */}
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-rose-200">
                  Are you sure you want to cancel your attendance?
                </p>
                <p className="text-rose-300/80 leading-relaxed">
                  Cancelling will immediately void your Digital QR Pass, revoke session seats, and release your ticket back to the public pool. 
                  {isFreeEvent 
                    ? ' Since this was a free registration, your pass will simply be archived.'
                    : ` 100% of your paid amount ($${ticketPrice}) will be refunded immediately.`
                  }
                </p>
              </div>
            </div>

            {/* Event & Pass Details */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Registered Event</span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {registration.event?.title || 'Event Sphere Conference'}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tier: <span className="font-bold text-slate-200">{registration.ticketType?.name || 'All-Access Pass'}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Refundable Value</span>
                <span className="text-lg font-black text-emerald-400 block">
                  {isFreeEvent ? 'FREE ($0.00)' : `${currency} $${ticketPrice}`}
                </span>
              </div>
            </div>

            {/* WITHDRAWAL METHOD SELECTOR (if paid) */}
            {!isFreeEvent && (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Select Money Withdrawal / Refund Method</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Method 1: Original Payment */}
                  <div
                    onClick={() => setRefundMethod('ORIGINAL_PAYMENT')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      refundMethod === 'ORIGINAL_PAYMENT'
                        ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold text-white">Original Card</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        Instant
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Refund directly to Visa / Mastercard ending in •••• 4242 (0-2 business days).
                    </p>
                  </div>

                  {/* Method 2: Wallet Credit with 10% Bonus */}
                  <div
                    onClick={() => setRefundMethod('WALLET_CREDIT')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      refundMethod === 'WALLET_CREDIT'
                        ? 'bg-purple-600/15 border-purple-500 shadow-md shadow-purple-500/10'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-purple-400" />
                        <span className="text-xs font-bold text-white">Sphere Wallet</span>
                      </div>
                      <span className="text-[10px] font-black text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        +10% Bonus
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Receive <span className="font-bold text-purple-300">${totalWalletCredit}</span> in platform credits for upcoming summits.
                    </p>
                  </div>

                  {/* Method 3: Direct Bank Wire */}
                  <div
                    onClick={() => setRefundMethod('BANK_TRANSFER')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      refundMethod === 'BANK_TRANSFER'
                        ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-cyan-400" />
                        <span className="text-xs font-bold text-white">Bank Account / Wire</span>
                      </div>
                      <span className="text-[10px] text-slate-400">ACH / Wire</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Direct withdrawal to your checking account or company bank ledger.
                    </p>
                  </div>

                  {/* Method 4: PayPal / UPI */}
                  <div
                    onClick={() => setRefundMethod('UPI_PAYPAL')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      refundMethod === 'UPI_PAYPAL'
                        ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white">PayPal / UPI</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Digital VPA</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Direct payout to your PayPal address or instant UPI identifier.
                    </p>
                  </div>

                </div>

                {/* Conditional Inputs for Bank Transfer */}
                {refundMethod === 'BANK_TRANSFER' && (
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 animate-in fade-in duration-200">
                    <span className="text-xs font-bold text-cyan-400 block">Bank Account Details for Wire Payout</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Account Holder Name</label>
                        <input
                          type="text"
                          value={accountHolderName}
                          onChange={(e) => setAccountHolderName(e.target.value)}
                          placeholder="e.g. Elena Rostova"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Bank Name</label>
                        <input
                          type="text"
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          placeholder="e.g. Chase / Silicon Valley Bank"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Account Number / IBAN</label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="e.g. 984029481239"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Routing Number / SWIFT / IFSC</label>
                        <input
                          type="text"
                          value={routingCode}
                          onChange={(e) => setRoutingCode(e.target.value)}
                          placeholder="e.g. 121000358 or HDFC000123"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Conditional Inputs for UPI / PayPal */}
                {refundMethod === 'UPI_PAYPAL' && (
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2 animate-in fade-in duration-200">
                    <label className="text-xs font-bold text-emerald-400 block">
                      PayPal Email or UPI ID (VPA)
                    </label>
                    <input
                      type="text"
                      value={digitalPayId}
                      onChange={(e) => setDigitalPayId(e.target.value)}
                      placeholder="e.g. elena@nexus.io or user@okhdfcbank"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                )}

              </div>
            )}

            {/* REASON FOR CANCELLATION */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Reason for Cancellation
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Schedule Conflict',
                  'Company Travel Policy',
                  'Emergency',
                  'Joining Virtually',
                  'Duplicate Booking',
                  'Other'
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setReason(item)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left truncate ${
                      reason === item
                        ? 'bg-slate-800 border-rose-500/80 text-rose-300 font-bold'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              {reason === 'Other' && (
                <textarea
                  rows={2}
                  value={otherReasonText}
                  onChange={(e) => setOtherReasonText(e.target.value)}
                  placeholder="Please specify reason (optional)..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-slate-600 mt-2"
                />
              )}
            </div>

            {/* Breakdown Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Original Ticket Amount</span>
                <span>${ticketPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Processing & Cancellation Fee</span>
                <span className="text-emerald-400 font-bold">$0.00 (Free Waiver)</span>
              </div>
              {refundMethod === 'WALLET_CREDIT' && (
                <div className="flex items-center justify-between text-purple-300 font-medium">
                  <span>Sphere 10% Bonus Credit</span>
                  <span>+${walletBonus.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm font-black text-white">
                <span>Total Amount Refunded</span>
                <span className="text-emerald-400 text-base">
                  {refundMethod === 'WALLET_CREDIT' ? `$${totalWalletCredit.toFixed(2)}` : `$${ticketPrice.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isProcessing}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors disabled:opacity-50"
              >
                Keep My Booking
              </button>

              <button
                type="button"
                onClick={handleConfirmCancellation}
                disabled={isProcessing}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/30 disabled:opacity-50 hover:scale-[1.02]"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{processingStep || 'Processing Cancellation...'}</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>
                      {isFreeEvent 
                        ? 'Confirm Cancellation' 
                        : `Confirm & Withdraw $${refundMethod === 'WALLET_CREDIT' ? totalWalletCredit.toFixed(2) : ticketPrice.toFixed(2)}`
                      }
                    </span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
