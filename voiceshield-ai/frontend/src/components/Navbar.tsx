import React, { useState, useEffect } from 'react';
import { Shield, Globe, Clock, User, LogOut, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../utils/i18n';
import { SupportedLanguage } from '../types';

export const Navbar: React.FC = () => {
  const { user, logout, language, setLanguage, t } = useAuth();
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 border-b border-white/[0.08] bg-navy-950/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)]">
          <Shield className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black tracking-widest text-white uppercase font-sans">
              VoiceShield AI
            </h1>
            <span className="text-[10px] bg-cyan-950 text-cyan-400 font-mono px-2 py-0.5 rounded-full border border-cyan-500/30">
              v1.0 ENTERPRISE
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              SHIELD ACTIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 tracking-wide font-medium">
            {t('tagline')}
          </p>
        </div>
      </div>

      {/* Center: Live UTC Telemetry */}
      <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400 bg-navy-900 px-3 py-1.5 rounded-xl border border-white/[0.06]">
        <Clock className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-slate-500">SYS TIME:</span>
        <span className="text-slate-200 font-semibold">{utcTime || 'SYNCHRONIZING...'}</span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Multilingual Selector */}
        <div className="flex items-center gap-1.5 bg-navy-900 px-2.5 py-1.5 rounded-xl border border-white/[0.08] text-xs">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
            className="bg-transparent text-slate-200 font-medium text-xs focus:outline-none cursor-pointer pr-1"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-navy-950 text-white">
                {lang.nativeName} ({lang.name})
              </option>
            ))}
          </select>
        </div>

        {/* User Profile */}
        {user ? (
          <div className="flex items-center gap-2.5 pl-2 border-l border-white/[0.08]">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-white truncate max-w-[140px]">{user.full_name}</div>
              <div className="text-[9px] font-mono text-cyan-400">{user.role}</div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-xl bg-navy-900 hover:bg-red-950/60 border border-white/[0.08] hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <a
            href="#/login"
            className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Sign In
          </a>
        )}
      </div>
    </header>
  );
};

export default Navbar;
