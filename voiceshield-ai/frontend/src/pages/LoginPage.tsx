import React, { useState } from 'react';
import { Shield, Lock, Mail, Building, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('employee@demo.com');
  const [password, setPassword] = useState('VoiceShieldDemo#2026');
  const [org, setOrg] = useState('demo.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const success = await login(email, password, org);
    setLoading(false);
    if (success) {
      onLoginSuccess();
    } else {
      setError("Invalid security credentials. Check password or organization domain.");
    }
  };

  const handleDemoFill = () => {
    setEmail('employee@demo.com');
    setPassword('VoiceShieldDemo#2026');
    setOrg('demo.com');
    setError(null);
  };

  const handleAdminFill = () => {
    setEmail('admin@demo.com');
    setPassword('VoiceShieldAdmin#2026');
    setOrg('demo.com');
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-navy-950">
      <div className="w-full max-w-md cyber-card p-6 md:p-8 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)]">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-widest text-white font-sans mt-1">
            VoiceShield AI
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Enterprise Voice Integrity & Impersonation Defense
          </p>
        </div>

        {/* Demo Quick-Fill Pill */}
        <div className="mb-5 p-3 rounded-xl bg-navy-900 border border-cyan-500/20 flex flex-col gap-2">
          <span className="text-[10px] font-mono text-slate-400 uppercase">⚡ Quick Demo Clearance Credentials:</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDemoFill}
              className="px-2.5 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-medium transition-colors text-left"
            >
              👤 Operations Officer
            </button>
            <button
              type="button"
              onClick={handleAdminFill}
              className="px-2.5 py-1.5 rounded-lg bg-navy-950 hover:bg-slate-800 border border-white/10 text-slate-300 text-[11px] font-mono font-medium transition-colors text-left"
            >
              🛡️ SOC Director (Admin)
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
              Organization Domain:
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder="e.g. demo.com or apexbank.in"
                className="w-full bg-navy-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
              Corporate Email:
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="employee@demo.com"
                className="w-full bg-navy-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
              Security Passphrase:
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-navy-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
          >
            {loading ? "Authenticating Clearance..." : (
              <>
                <span>Access Security Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-white/[0.06] text-center text-[10px] text-slate-500 font-mono">
          🔒 DPDP Act 2023 Compliant &bull; End-to-End Encrypted Session
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
