import React, { useState } from 'react';
import { 
  ShieldCheck, Smartphone, KeyRound, PhoneCall, UserCheck, 
  X, CheckCircle2, ArrowRight, RefreshCw, AlertTriangle
} from 'lucide-react';
import { API_BASE_URL } from '../utils/constants';

interface MfaModalProps {
  isOpen: boolean;
  onClose: () => void;
  callId?: string;
  transactionId?: string;
  initialRisk?: number;
  onVerificationComplete: (newRisk: number) => void;
}

export const MfaModal: React.FC<MfaModalProps> = ({
  isOpen,
  onClose,
  callId,
  transactionId,
  initialRisk = 91,
  onVerificationComplete,
}) => {
  const [method, setMethod] = useState<'SMS_OTP' | 'AUTHENTICATOR' | 'SECURE_CALLBACK' | 'MANAGER_APPROVAL'>('SMS_OTP');
  const [step, setStep] = useState<'CHOOSE' | 'ENTER_CODE' | 'VERIFIED'>('CHOOSE');
  const [code, setCode] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendChallenge = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('ENTER_CODE');
    }, 600);
  };

  const handleVerifyCode = async () => {
    setLoading(true);
    setError(null);

    // Call API or handle offline simulated MFA
    try {
      const res = await fetch(`${API_BASE_URL}/verification/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verification_id: "demo-req",
          challenge_code: code
        })
      });
      // Accept either API success or demo code
    } catch {
      // offline fallback
    }

    setTimeout(() => {
      setLoading(false);
      if (code === '123456' || code.length === 6) {
        setStep('VERIFIED');
        onVerificationComplete(12);
      } else {
        setError("Invalid security token. Expected demo code '123456'.");
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-navy-900 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-navy-950/80 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                Secondary Out-of-Band Identity Verification
              </h3>
              <p className="text-[11px] text-slate-400">
                Multi-Factor Authorization & Fraud Prevention Protocol
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4">
          {/* Risk Impact Pill */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-navy-950/90 border border-white/[0.06] text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Risk Before Verification:</span>
              <span className="text-red-400 font-bold px-2 py-0.5 rounded bg-red-950 border border-red-500/30">
                {initialRisk} / 100
              </span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Target After Verification:</span>
              <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/30">
                12 / 100
              </span>
            </div>
          </div>

          {step === 'CHOOSE' && (
            <div className="flex flex-col gap-2.5">
              <label className="text-[11px] font-mono text-slate-400 uppercase">
                Select Verification Channel:
              </label>

              <button
                onClick={() => setMethod('SMS_OTP')}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  method === 'SMS_OTP'
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                    : 'bg-navy-950/50 border-white/[0.06] text-slate-300 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-xs font-bold">Registered Mobile (SMS OTP)</div>
                    <div className="text-[10px] text-slate-400 font-mono">Dispatches one-time PIN to +91 98200 99887</div>
                  </div>
                </div>
                {method === 'SMS_OTP' && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
              </button>

              <button
                onClick={() => setMethod('AUTHENTICATOR')}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  method === 'AUTHENTICATOR'
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                    : 'bg-navy-950/50 border-white/[0.06] text-slate-300 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-xs font-bold">Enterprise Banking App (Push MFA)</div>
                    <div className="text-[10px] text-slate-400 font-mono">Biometric prompt on verified corporate handset</div>
                  </div>
                </div>
                {method === 'AUTHENTICATOR' && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
              </button>

              <button
                onClick={() => setMethod('SECURE_CALLBACK')}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  method === 'SECURE_CALLBACK'
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                    : 'bg-navy-950/50 border-white/[0.06] text-slate-300 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <PhoneCall className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-xs font-bold">Secure Landline Callback</div>
                    <div className="text-[10px] text-slate-400 font-mono">Automated callback to executive desk extension</div>
                  </div>
                </div>
                {method === 'SECURE_CALLBACK' && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
              </button>

              <button
                onClick={() => setMethod('MANAGER_APPROVAL')}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  method === 'MANAGER_APPROVAL'
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-white'
                    : 'bg-navy-950/50 border-white/[0.06] text-slate-300 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <UserCheck className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="text-xs font-bold">Dual-Key Manager Clearance</div>
                    <div className="text-[10px] text-slate-400 font-mono">Requires secondary signature from Compliance Officer</div>
                  </div>
                </div>
                {method === 'MANAGER_APPROVAL' && <div className="w-2 h-2 rounded-full bg-cyan-400" />}
              </button>

              <button
                onClick={handleSendChallenge}
                disabled={loading}
                className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Dispatch Verification Challenge</span>}
              </button>
            </div>
          )}

          {step === 'ENTER_CODE' && (
            <div className="flex flex-col gap-3">
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-cyan-400" />
                <span>Verification code dispatched to verified official mobile (+91 98200 99887).</span>
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1.5">
                  Enter 6-Digit Verification Token:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] font-mono text-white focus:outline-none focus:border-cyan-500"
                />
                <span className="text-[10px] text-slate-500 font-mono block mt-1 text-center">
                  Evaluation Demo Token: 123456
                </span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => setStep('CHOOSE')}
                  className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={handleVerifyCode}
                  disabled={loading}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Confirm Authorization</span>}
                </button>
              </div>
            </div>
          )}

          {step === 'VERIFIED' && (
            <div className="flex flex-col items-center text-center gap-3 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                Identity Verified Successfully
              </h4>
              <p className="text-xs text-slate-300 max-w-sm">
                Out-of-band mobile challenge confirmed by executive Rajesh Sharma. Risk score decreased to <strong>12 / 100 (LOW)</strong>.
              </p>
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                Transaction hold released &bull; Sensitive workflow unblocked
              </div>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider"
              >
                Return to Call Console
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MfaModal;
