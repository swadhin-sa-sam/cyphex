import React, { useState } from 'react';
import { 
  ShieldCheck, Smartphone, KeyRound, PhoneCall, UserCheck, 
  ArrowRight, CheckCircle2, AlertTriangle, RefreshCw 
} from 'lucide-react';

interface VerificationPageProps {
  onNavigate: (path: string) => void;
}

export const VerificationPage: React.FC<VerificationPageProps> = ({ onNavigate }) => {
  const [method, setMethod] = useState<'SMS_OTP' | 'AUTHENTICATOR' | 'SECURE_CALLBACK' | 'MANAGER_APPROVAL'>('SMS_OTP');
  const [step, setStep] = useState<'CHALLENGE' | 'INPUT' | 'COMPLETED'>('CHALLENGE');
  const [token, setToken] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [riskBefore, setRiskBefore] = useState(91);
  const [riskAfter, setRiskAfter] = useState<number | null>(null);

  const handleSend = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('INPUT');
    }, 600);
  };

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setRiskAfter(12);
      setStep('COMPLETED');
    }, 700);
  };

  const handleReset = () => {
    setStep('CHALLENGE');
    setRiskAfter(null);
    setRiskBefore(91);
  };

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div>
        <h2 className="text-base font-black tracking-wider uppercase text-white font-sans flex items-center gap-2">
          <span>Secondary Verification & Clearance Portal</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400">
            OUT-OF-BAND PROTOCOL
          </span>
        </h2>
        <p className="text-xs text-slate-400">
          Enforce multi-factor physical identity challenges to mitigate synthetic speech risk before authorization
        </p>
      </div>

      {/* Main Flow Card */}
      <div className="cyber-card p-6 border-white/10 flex flex-col gap-5">
        {/* Dynamic Risk Shift Telemetry */}
        <div className="p-4 rounded-xl bg-navy-950/80 border border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Active Impersonation Target:</span>
            <div className="text-sm font-bold text-white mt-0.5">Rajesh Sharma &bull; Chief Financial Officer</div>
            <div className="text-xs text-slate-400">Action: ₹25,00,000 Wire Transfer to ABC Trading Pvt Ltd</div>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <div className="text-center">
              <span className="text-[10px] text-slate-500 block">RISK BEFORE</span>
              <span className="text-base font-bold text-red-400 bg-red-950/80 px-2.5 py-1 rounded border border-red-500/40">
                {riskBefore} / 100
              </span>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-600" />

            <div className="text-center">
              <span className="text-[10px] text-slate-500 block">RISK AFTER</span>
              <span className="text-base font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-500/40">
                {riskAfter !== null ? `${riskAfter} / 100` : 'PENDING'}
              </span>
            </div>
          </div>
        </div>

        {step === 'CHALLENGE' && (
          <div className="flex flex-col gap-4">
            <label className="text-xs font-mono text-slate-400 uppercase">
              Select Authorized Clearance Mechanism:
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setMethod('SMS_OTP')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  method === 'SMS_OTP'
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-navy-950/60 border-white/[0.06] hover:border-white/20'
                }`}
              >
                <Smartphone className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Registered Mobile (SMS OTP)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Dispatches 6-digit challenge to +91 98200 99887</div>
                </div>
              </button>

              <button
                onClick={() => setMethod('AUTHENTICATOR')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  method === 'AUTHENTICATOR'
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-navy-950/60 border-white/[0.06] hover:border-white/20'
                }`}
              >
                <KeyRound className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Banking Application Push MFA</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Biometric challenge on official executive device</div>
                </div>
              </button>

              <button
                onClick={() => setMethod('SECURE_CALLBACK')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  method === 'SECURE_CALLBACK'
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-navy-950/60 border-white/[0.06] hover:border-white/20'
                }`}
              >
                <PhoneCall className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Secure Landline Callback</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Immediate automated line to office extension</div>
                </div>
              </button>

              <button
                onClick={() => setMethod('MANAGER_APPROVAL')}
                className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                  method === 'MANAGER_APPROVAL'
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                    : 'bg-navy-950/60 border-white/[0.06] hover:border-white/20'
                }`}
              >
                <UserCheck className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Compliance Officer Co-Sign</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Multi-signature managerial authorization</div>
                </div>
              </button>
            </div>

            <button
              onClick={handleSend}
              disabled={loading}
              className="mt-3 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Dispatch Out-of-Band Challenge</span>}
            </button>
          </div>
        )}

        {step === 'INPUT' && (
          <div className="flex flex-col gap-4 max-w-md mx-auto w-full py-4">
            <div className="text-center">
              <h3 className="text-sm font-bold text-white">Enter 6-Digit Verification Token</h3>
              <p className="text-xs text-slate-400 mt-1">Dispatched to official CFO hardware mobile terminal</p>
            </div>

            <input
              type="text"
              maxLength={6}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full bg-navy-950 border border-white/10 rounded-xl py-3 text-center text-2xl tracking-[0.5em] font-mono text-white focus:outline-none focus:border-cyan-500"
            />
            <span className="text-[10px] text-slate-500 text-center font-mono">Demo token: 123456</span>

            <div className="flex gap-2">
              <button
                onClick={() => setStep('CHALLENGE')}
                className="w-1/3 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Confirm Authorization</span>}
              </button>
            </div>
          </div>
        )}

        {step === 'COMPLETED' && (
          <div className="flex flex-col items-center text-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Verification Successful &bull; Risk Mitigated
              </h3>
              <p className="text-xs text-slate-300 max-w-md mt-1">
                Identity verified through out-of-band mobile challenge. Risk decreased from <strong>91/100</strong> to <strong>12/100 (LOW)</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              ✓ Transaction hold released &bull; ₹25,00,000 transfer cleared for processing
            </div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => onNavigate('/transactions')}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider"
              >
                Go to Transactions
              </button>
              <button
                onClick={handleReset}
                className="px-5 py-2.5 rounded-xl bg-navy-800 text-slate-300 text-xs font-semibold"
              >
                Reset Verification
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificationPage;
