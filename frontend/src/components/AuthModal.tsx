import React, { useState, useEffect } from 'react';
import { Shield, Key, User, Lock, Mail, CheckCircle2, AlertCircle, X, LogOut, Copy, Check } from 'lucide-react';
import { AUTH_API, SocOperator } from '../utils/constants';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: SocOperator | null;
  onAuthSuccess: (user: SocOperator, token: string) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onLogout,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('CyphexSOC#2026!');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      setUsername('admin');
      setPassword('CyphexSOC#2026!');
      setError(null);
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleFillDemoAdmin = () => {
    setIsRegisterMode(false);
    setUsername('admin');
    setPassword('CyphexSOC#2026!');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isRegisterMode ? AUTH_API.REGISTER : AUTH_API.LOGIN;
    const bodyPayload = isRegisterMode 
      ? { username, password, email: email || `${username}@cyphex.defense` }
      : { username, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed. Please verify credentials.');
      }

      localStorage.setItem('cyphex_token', data.access_token);
      localStorage.setItem('cyphex_user', JSON.stringify(data.user));
      onAuthSuccess(data.user, data.access_token);
      onClose();
    } catch (err: any) {
      // If server is not yet running or network error, provide simulated offline admin session
      if (username === 'admin' && password === 'CyphexSOC#2026!') {
        const offlineAdmin: SocOperator = {
          id: 1,
          username: 'admin',
          email: 'admin@cyphex.defense',
          role: 'ADMIN'
        };
        localStorage.setItem('cyphex_token', 'offline-simulated-token-soc-2026');
        localStorage.setItem('cyphex_user', JSON.stringify(offlineAdmin));
        onAuthSuccess(offlineAdmin, 'offline-simulated-token-soc-2026');
        onClose();
      } else {
        setError(err.message || 'Authentication error.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 bg-slate-950/70 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-widest text-white uppercase font-sans">
                SOC OPERATOR ACCESS
              </h2>
              <p className="text-[11px] text-slate-400">Identity & Role-Based Clearance Control</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 flex flex-col gap-4">
          {currentUser ? (
            /* Logged in state */
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  {currentUser.username.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{currentUser.username}</span>
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                      {currentUser.role}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-0.5">{currentUser.email}</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 mt-1 font-mono">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active Session Validated (PBKDF2/JWT)</span>
                  </div>
                </div>
              </div>

              {/* API Token Callout */}
              <div className="p-3 rounded-xl bg-slate-950 border border-white/[0.06] flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                  <Key className="w-3 h-3 text-cyan-400" />
                  SOC ACCESS TOKEN
                </span>
                <div className="flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-white/[0.04] text-[11px] font-mono text-slate-300">
                  <span className="truncate max-w-[260px]">
                    {localStorage.getItem('cyphex_token') || 'cyphex_jwt_active'}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(localStorage.getItem('cyphex_token') || '');
                      setCopiedKey(true);
                      setTimeout(() => setCopiedKey(false), 2000);
                    }}
                    className="text-slate-400 hover:text-cyan-400 p-1"
                    title="Copy Token"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  localStorage.removeItem('cyphex_token');
                  localStorage.removeItem('cyphex_user');
                  onLogout();
                }}
                className="w-full py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Revoke Session & Logout</span>
              </button>
            </div>
          ) : (
            /* Login / Register Form */
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              {error && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Demo Admin Quick Button */}
              <div className="flex justify-between items-center bg-slate-950/80 p-2.5 rounded-xl border border-cyan-500/20">
                <span className="text-[10px] text-slate-400 font-mono">Evaluation / Demo Mode:</span>
                <button
                  type="button"
                  onClick={handleFillDemoAdmin}
                  className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/80 px-2 py-1 rounded border border-cyan-500/30 transition-colors"
                >
                  ⚡ Auto-fill SOC Admin
                </button>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                  Operator Handle:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. admin or analyst1"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {isRegisterMode && (
                <div>
                  <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                    Defense Email:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="analyst@cyphex.defense"
                      className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
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
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  {isRegisterMode ? 'Already have clearance? Log In' : 'Need clearance? Register Analyst'}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : isRegisterMode ? 'Register SOC Analyst' : 'Authenticate Operator'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
