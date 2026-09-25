import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Lock, Bell, Database, 
  Cpu, Link2, Monitor, Key, Smartphone, 
  CheckCircle2, Save, Trash2, LogOut, Copy, 
  Check, RefreshCw, Eye, EyeOff, AlertTriangle,
  Flame, Globe, Zap, Sliders, Layers, ChevronRight,
  LogIn, UserPlus, AlertCircle, CheckCircle, ShieldCheck
} from 'lucide-react';
import { AUTH_API, SocOperator } from '../../utils/constants';

type SettingsSection = 
  | 'ACCOUNT' 
  | 'SECURITY' 
  | 'PRIVACY' 
  | 'DETECTION_AI' 
  | 'NOTIFICATIONS' 
  | 'BLOCKCHAIN' 
  | 'SYSTEM';

interface SettingsManagerViewProps {
  currentUser?: SocOperator | null;
  currentTheme?: 'DARK' | 'LIGHT';
  layoutMode?: 'FLUID' | 'CONTAINED';
  onThemeChange?: (theme: 'DARK' | 'LIGHT') => void;
  onLayoutModeChange?: (mode: 'FLUID' | 'CONTAINED') => void;
  onAuthSuccess?: (user: SocOperator, token: string) => void;
  onLogout?: () => void;
}

export const SettingsManagerView: React.FC<SettingsManagerViewProps> = ({
  currentUser,
  currentTheme = 'DARK',
  layoutMode = 'FLUID',
  onThemeChange,
  onLayoutModeChange,
  onAuthSuccess,
  onLogout,
}) => {
  const [activeSection, setActiveSection] = useState<SettingsSection>('ACCOUNT');
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [currentLayoutMode, setCurrentLayoutMode] = useState<'FLUID' | 'CONTAINED'>(() => {
    return (localStorage.getItem('cyphex_layout_mode') as 'FLUID' | 'CONTAINED') || layoutMode;
  });
  const [mobileTouchOptimized, setMobileTouchOptimized] = useState(true);

  // 1. Account & Operator Auth State
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState(currentUser?.username || 'admin');
  const [email, setEmail] = useState(currentUser?.email || 'admin@cyphex.defense');
  const [loginPassword, setLoginPassword] = useState('CyphexSOC#2026!');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username);
      setEmail(currentUser.email);
    }
  }, [currentUser]);

  const [sessions, setSessions] = useState([
    { id: 'SESS-1', device: 'Chrome on Windows 11 (Current)', ip: '103.24.112.9', location: 'Bhubaneswar, IN', active: true },
    { id: 'SESS-2', device: 'CYPHEX Mobile SDK (iOS 18)', ip: '49.36.88.14', location: 'Mumbai, IN', active: false },
    { id: 'SESS-3', device: 'Terminal SOC Session (Debian Linux)', ip: '172.16.0.42', location: 'Secure Vault', active: false }
  ]);

  // 2. Security State
  const [securityLevel, setSecurityLevel] = useState<'STANDARD' | 'ENHANCED' | 'MAXIMUM'>('ENHANCED');
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [suspiciousAlerts, setSuspiciousAlerts] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState('30m');
  const [apiKey, setApiKey] = useState('cyphex_live_sec_994a28f10b77e812d45c0');
  const [copiedKey, setCopiedKey] = useState(false);

  // 3. Privacy State
  const [dataRetention, setDataRetention] = useState('EPHEMERAL'); // 0-retention DPDP 2023
  const [activityLogging, setActivityLogging] = useState('FEATURE_ONLY');
  const [anonymousAnalytics, setAnonymousAnalytics] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true);

  // 4. Detection & AI State
  const [realtimeThreatDetection, setRealtimeThreatDetection] = useState(true);
  const [riskSensitivity, setRiskSensitivity] = useState(75); // 0-100
  const [automaticAnalysis, setAutomaticAnalysis] = useState(true);
  const [aiModel, setAiModel] = useState('ENSEMBLE_AASIST_WAV2VEC2');
  const [confidenceThreshold, setConfidenceThreshold] = useState(85);

  // 5. Notifications State
  const [criticalAlerts, setCriticalAlerts] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);
  const [threatAlerts, setThreatAlerts] = useState(true);
  const [systemUpdates, setSystemUpdates] = useState(false);

  // 6. Blockchain State
  const [network, setNetwork] = useState('ETHEREUM_MAINNET');
  const [walletConnected, setWalletConnected] = useState(true);
  const [walletAddress] = useState('0x71C...89B4');
  const [smartContractAudit, setSmartContractAudit] = useState(true);
  const [gasPreference, setGasPreference] = useState<'FAST' | 'STANDARD' | 'LOW'>('FAST');

  // 7. System State
  const [theme, setTheme] = useState<'DARK' | 'LIGHT'>(currentTheme);

  useEffect(() => {
    setTheme(currentTheme);
  }, [currentTheme]);

  const handleThemeSelect = (newTheme: 'DARK' | 'LIGHT') => {
    setTheme(newTheme);
    if (onThemeChange) {
      onThemeChange(newTheme);
    }
    triggerSaveNotification(`Display theme switched to ${newTheme === 'DARK' ? 'Dark Obsidian' : 'Tactical Light'}.`);
  };

  const handleLayoutModeSelect = (mode: 'FLUID' | 'CONTAINED') => {
    setCurrentLayoutMode(mode);
    localStorage.setItem('cyphex_layout_mode', mode);
    if (onLayoutModeChange) {
      onLayoutModeChange(mode);
    }
    triggerSaveNotification(`Layout set to ${mode === 'FLUID' ? 'Fluid Full Window Auto-Adjust' : 'Standard Contained Console'}.`);
  };

  const [language, setLanguage] = useState('EN_IN');
  const [autoRefreshInterval, setAutoRefreshInterval] = useState('2s');
  const [performanceMode, setPerformanceMode] = useState(true);

  const triggerSaveNotification = (msg: string) => {
    setSavedSuccess(msg);
    setTimeout(() => setSavedSuccess(null), 3000);
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleLogoutAll = () => {
    setSessions(prev => prev.filter(s => s.active));
    triggerSaveNotification('Terminated all remote active sessions.');
  };

  const handleOperatorAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    const endpoint = isRegisterMode ? AUTH_API.REGISTER : AUTH_API.LOGIN;
    const bodyPayload = isRegisterMode 
      ? { username, password: loginPassword, email: email || `${username}@cyphex.defense` }
      : { username, password: loginPassword };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed. Please check credentials.');
      }

      localStorage.setItem('cyphex_token', data.access_token);
      localStorage.setItem('cyphex_user', JSON.stringify(data.user));
      if (onAuthSuccess) {
        onAuthSuccess(data.user, data.access_token);
      }
      triggerSaveNotification(`Authenticated successfully as ${data.user.username}`);
    } catch (err: any) {
      if (username === 'admin' && loginPassword === 'CyphexSOC#2026!') {
        const offlineAdmin: SocOperator = {
          id: 1,
          username: 'admin',
          email: 'admin@cyphex.defense',
          role: 'ADMIN'
        };
        localStorage.setItem('cyphex_token', 'offline-simulated-token-soc-2026');
        localStorage.setItem('cyphex_user', JSON.stringify(offlineAdmin));
        if (onAuthSuccess) {
          onAuthSuccess(offlineAdmin, 'offline-simulated-token-soc-2026');
        }
        triggerSaveNotification('Signed in as SOC Lead Administrator (Evaluation Mode)');
      } else {
        setAuthError(err.message || 'Authentication error.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogoutCurrent = () => {
    localStorage.removeItem('cyphex_token');
    localStorage.removeItem('cyphex_user');
    if (onLogout) {
      onLogout();
    }
    triggerSaveNotification('Operator logged out successfully.');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Executive Header Banner */}
      <div className="premium-card p-5 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Control Center & Operator Governance
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise administration across operator authentication, neural inference engines, cryptographic ledgers, and privacy policies.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-mono shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{savedSuccess}</span>
          </div>
        )}
      </div>

      {/* Mobile Horizontal Section Tabs (< lg screens) */}
      <div className="flex lg:hidden overflow-x-auto touch-scroll-x no-scrollbar gap-1.5 p-1.5 bg-slate-950/70 rounded-xl border border-white/[0.08] mb-2">
        {[
          { id: 'ACCOUNT', label: 'Auth & Profile', icon: User },
          { id: 'SECURITY', label: 'Security', icon: Shield },
          { id: 'PRIVACY', label: 'Privacy', icon: Lock },
          { id: 'DETECTION_AI', label: 'Detection AI', icon: Cpu },
          { id: 'NOTIFICATIONS', label: 'Alerts', icon: Bell },
          { id: 'BLOCKCHAIN', label: 'Web3', icon: Link2 },
          { id: 'SYSTEM', label: 'System & Engine', icon: Monitor },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as SettingsSection)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white bg-white/[0.02] border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Settings Split: Sidebar (3 cols) + Content Stage (9 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Navigation Sidebar (Desktop >= lg) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-1.5 premium-card p-3">
          {[
            { id: 'ACCOUNT', label: '1. Operator Auth & Profile', icon: User, badge: currentUser ? 'AUTHENTICATED' : 'LOGIN REQ' },
            { id: 'SECURITY', label: '2. Security Posture', icon: Shield, badge: 'ENHANCED' },
            { id: 'PRIVACY', label: '3. Privacy & DPDP', icon: Lock, badge: 'ZERO-RETENTION' },
            { id: 'DETECTION_AI', label: '4. Detection & AI', icon: Cpu, badge: '4-LAYER' },
            { id: 'NOTIFICATIONS', label: '5. Notifications', icon: Bell, badge: 'LIVE' },
            { id: 'BLOCKCHAIN', label: '6. Web3 & Ledger', icon: Link2, badge: 'MAINNET' },
            { id: 'SYSTEM', label: '7. System & Engine', icon: Monitor, badge: 'AUTO-ADJUST' },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as SettingsSection)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
                  isSelected
                    ? 'bg-white/[0.08] text-white border border-white/[0.12] shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="font-mono text-left">{item.label}</span>
                </div>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                  isSelected 
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 font-semibold' 
                    : 'bg-white/[0.02] text-slate-500 border-white/[0.04]'
                }`}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Stage */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          
          {/* SECTION 1: OPERATOR AUTH & PROFILE */}
          {activeSection === 'ACCOUNT' && (
            <div className="premium-card p-6 flex flex-col gap-5">
              <div className="border-b border-white/[0.08] pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-400" />
                    SOC Operator Access & Profile Governance
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Manage operator credentials, active sessions, and enterprise role clearance.</p>
                </div>
                <span className={`status-pill text-[10px] ${currentUser ? 'text-emerald-400 border-emerald-500/30' : 'text-amber-400 border-amber-500/30'}`}>
                  {currentUser ? `ROLE: ${currentUser.role}` : 'CLEARANCE: GUEST / UNVERIFIED'}
                </span>
              </div>

              {/* Real-time Operator Status Banner */}
              {currentUser ? (
                <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-base shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                      {currentUser.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white font-mono">{currentUser.username}</span>
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 font-semibold">
                          {currentUser.role}
                        </span>
                        <span className="text-[9px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40 font-mono">
                          ACTIVE SESSION
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 font-mono block mt-1">{currentUser.email}</span>
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 mt-1 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Cryptographic Operator Token: PBKDF2/SHA-256 Verified</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handleLogoutCurrent}
                      className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Interactive Operator Login / Registration Form */
                <form onSubmit={handleOperatorAuthSubmit} className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.08] flex flex-col gap-3.5">
                  <div className="flex justify-between items-center pb-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-2">
                      <LogIn className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                        {isRegisterMode ? 'New SOC Analyst Registration' : 'Operator Credential Authentication'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setUsername('admin');
                          setLoginPassword('CyphexSOC#2026!');
                          setIsRegisterMode(false);
                          setAuthError(null);
                        }}
                        className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 hover:bg-cyan-900/80 px-2.5 py-1 rounded-lg border border-cyan-500/30 transition-colors"
                      >
                        ⚡ Auto-fill SOC Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsRegisterMode(!isRegisterMode)}
                        className="text-[10px] font-mono text-slate-300 hover:text-white bg-slate-900 px-2.5 py-1 rounded-lg border border-white/[0.1] transition-colors"
                      >
                        {isRegisterMode ? 'Switch to Login' : 'Register Operator'}
                      </button>
                    </div>
                  </div>

                  {authError && (
                    <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <label className="text-slate-400 uppercase text-[10px] block mb-1.5 font-bold">Operator Handle</label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. admin or analyst"
                        className="w-full bg-slate-900 border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 uppercase text-[10px] block mb-1.5 font-bold">
                        {isRegisterMode ? 'Email Address' : 'Security Passphrase'}
                      </label>
                      {isRegisterMode ? (
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="analyst@cyphex.defense"
                          className="w-full bg-slate-900 border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 shadow-inner"
                        />
                      ) : (
                        <input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-slate-900 border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 shadow-inner"
                        />
                      )}
                    </div>
                  </div>

                  {isRegisterMode && (
                    <div className="text-xs font-mono">
                      <label className="text-slate-400 uppercase text-[10px] block mb-1.5 font-bold">Security Passphrase</label>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Choose a strong passphrase"
                        className="w-full bg-slate-900 border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 shadow-inner"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="premium-btn py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider cursor-pointer shadow-md flex items-center justify-center gap-2 hover:bg-cyan-400 transition"
                  >
                    {authLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : isRegisterMode ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                    <span>{authLoading ? 'Authenticating...' : isRegisterMode ? 'Register Operator Account' : 'Authenticate Operator'}</span>
                  </button>
                </form>
              )}

              {/* Profile credentials customization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="text-slate-400 uppercase text-[10px] block mb-1.5 font-bold">Configured Operator Handle</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-slate-400 uppercase text-[10px] block mb-1.5 font-bold">Defense Contact Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-white/[0.08] rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 shadow-inner"
                  />
                </div>
              </div>

              {/* Password update */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.06] flex flex-col gap-3">
                <span className="text-xs font-bold text-slate-200 font-mono flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  Rotate Cryptographic Password
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-slate-900 border border-white/[0.08] rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                  <input
                    type="password"
                    placeholder="New Secure Passphrase"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-slate-900 border border-white/[0.08] rounded-xl px-3.5 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Two-Factor Authentication (2FA) */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-white/[0.06] flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-100 font-mono">Hardware / TOTP Two-Factor Authentication (2FA)</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Enforces RFC 6238 TOTP authenticator tokens on privileged SOC operations.</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                  className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                />
              </div>

              {/* Active Sessions Ledger */}
              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">Active Device Sessions</h4>
                  <button
                    onClick={handleLogoutAll}
                    className="flex items-center gap-1 text-[10px] font-mono text-red-400 hover:text-red-300 bg-red-950/60 px-2.5 py-1 rounded-lg border border-red-500/30 transition"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Terminate All Other Sessions</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {sessions.map((sess) => (
                    <div key={sess.id} className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.06] flex justify-between items-center text-xs font-mono">
                      <div>
                        <div className="font-semibold text-slate-200 flex items-center gap-2">
                          <span>{sess.device}</span>
                          {sess.active && (
                            <span className="text-[9px] bg-emerald-950 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/40">
                              THIS DEVICE
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{sess.ip} • {sess.location}</div>
                      </div>
                      <span className="text-slate-400 text-[10px]">Active Now</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => triggerSaveNotification('Account profile preferences updated.')}
                className="premium-btn w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md mt-2"
              >
                Save Profile Configuration
              </button>
            </div>
          )}

          {/* SECTION 2: SECURITY */}
          {activeSection === 'SECURITY' && (
            <div className="premium-card p-6 flex flex-col gap-5">
              <div className="border-b border-white/[0.08] pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    Security Posture & Enforcement Matrix
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Control operational security bounds, session hygiene, and programmatic API authorization.</p>
                </div>
              </div>

              {/* Security Level Radio Matrix */}
              <div>
                <label className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider block mb-2">
                  Defense Security Tier:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'STANDARD', title: 'Standard', desc: 'Default heuristic bounds. Step-up MFA at 70% risk.' },
                    { id: 'ENHANCED', title: 'Enhanced (Recommended)', desc: 'Multi-factor verification on high value wire transfers.' },
                    { id: 'MAXIMUM', title: 'Maximum Lockdown', desc: 'Immediate PBX trunk freeze on any synthetic prosody markers.' },
                  ].map((tier) => {
                    const isSelected = securityLevel === tier.id;
                    return (
                      <div
                        key={tier.id}
                        onClick={() => setSecurityLevel(tier.id as any)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                            : 'bg-slate-950/70 border-white/[0.06] hover:border-white/[0.15]'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-mono text-xs font-bold text-white">{tier.title}</span>
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-slate-700'}`} />
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">{tier.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Security Switches */}
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/[0.06] flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block font-mono">Immediate Login Notifications</span>
                    <span className="text-[11px] text-slate-400">Dispatch out-of-band alerts when operator logins occur from novel subnet ranges.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={loginNotifications}
                    onChange={(e) => setLoginNotifications(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/[0.06] flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block font-mono">Suspicious-Activity Early Warning</span>
                    <span className="text-[11px] text-slate-400">Escalate pre-attack scanning patterns (e.g. repeated short duration robotic calls).</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={suspiciousAlerts}
                    onChange={(e) => setSuspiciousAlerts(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/[0.06] flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 block font-mono">Inactivity Session Timeout</span>
                    <span className="text-[11px] text-slate-400">Terminate operator token when idle on the SOC command radar.</span>
                  </div>
                  <select
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="dashboard-policy-select bg-slate-900 text-white font-mono text-xs px-3 py-1.5 rounded-lg border border-white/[0.08]"
                  >
                    <option value="15m">15 Minutes</option>
                    <option value="30m">30 Minutes</option>
                    <option value="1h">1 Hour</option>
                    <option value="4h">4 Hours</option>
                  </select>
                </div>
              </div>

              {/* API Key Management */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex flex-col gap-2">
                <span className="text-xs font-bold text-slate-200 font-mono flex items-center justify-between">
                  <span>Production API Key (PBX / SIP Gateway Integration)</span>
                  <button
                    onClick={() => setApiKey(`cyphex_live_sec_${Math.random().toString(36).substring(2, 12)}`)}
                    className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Roll New Key
                  </button>
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={apiKey}
                    className="w-full bg-slate-900 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs font-mono text-cyan-300 focus:outline-none"
                  />
                  <button
                    onClick={copyApiKey}
                    className="p-2 rounded-xl bg-slate-900 border border-white/[0.08] hover:border-cyan-500 text-slate-300 hover:text-white transition"
                    title="Copy API Key"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={() => triggerSaveNotification('Security enforcement policies deployed.')}
                className="premium-btn w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md"
              >
                Apply Security Posture
              </button>
            </div>
          )}

          {/* SECTION 3: PRIVACY & DPDP */}
          {activeSection === 'PRIVACY' && (
            <div className="premium-card p-6 flex flex-col gap-5">
              <div className="border-b border-white/[0.08] pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    Privacy Architecture & DPDP Act 2023 Compliance
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Strict zero-retention voice buffering and biometric pseudonymization controls.</p>
                </div>
                <span className="status-pill text-[10px] text-emerald-400 border-emerald-500/40">COMPLIANCE CERTIFIED</span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-emerald-300 font-mono block">Zero Raw-Audio Retention (Strict DPDP 2023)</span>
                    <span className="text-[11px] text-slate-300">Raw voice PCM samples exist only in volatile circular RAM buffers for the duration of FFT analysis. No raw recordings stored on disk.</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/50">
                    ENFORCED
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 font-mono block">Activity-Log Telemetry Level</span>
                    <span className="text-[11px] text-slate-400">Stores only 10-dimensional acoustic feature vectors and timestamp hashes.</span>
                  </div>
                  <select
                    value={activityLogging}
                    onChange={(e) => setActivityLogging(e.target.value)}
                    className="dashboard-policy-select bg-slate-900 text-white font-mono text-xs px-3 py-1.5 rounded-lg border border-white/[0.08]"
                  >
                    <option value="FEATURE_ONLY">Feature-Only Logging (Privacy Compliant)</option>
                    <option value="MINIMAL_METADATA">Minimal Metadata (Risk Scores Only)</option>
                    <option value="AUDIT_TRAIL">Audit Trail Only</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 font-mono block">Anonymous Telemetry Share</span>
                    <span className="text-[11px] text-slate-400">Contribute anonymized acoustic phase signatures to the national SIH cyber defense repository.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={anonymousAnalytics}
                    onChange={(e) => setAnonymousAnalytics(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 font-mono block">Hardware Local Privacy Shield</span>
                    <span className="text-[11px] text-slate-400">Disables all remote logging; executes models strictly within the edge browser / local cluster.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={privacyMode}
                    onChange={(e) => setPrivacyMode(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Data Purge Action */}
              <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 flex justify-between items-center">
                <div>
                  <span className="text-xs font-bold text-red-300 font-mono block">Emergency Cache & Session Purge</span>
                  <span className="text-[11px] text-slate-400">Permanently clears local indexed databases, in-flight session buffers, and cached speaker vectors.</span>
                </div>
                <button
                  onClick={() => {
                    localStorage.removeItem('cyphex_token');
                    triggerSaveNotification('Local security caches and volatile buffers purged.');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold transition shadow-md"
                >
                  Purge Local Data
                </button>
              </div>

              <button
                onClick={() => triggerSaveNotification('Privacy policies committed.')}
                className="premium-btn w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md"
              >
                Save Privacy Configuration
              </button>
            </div>
          )}

          {/* SECTION 4: DETECTION & AI */}
          {activeSection === 'DETECTION_AI' && (
            <div className="premium-card p-6 flex flex-col gap-5">
              <div className="border-b border-white/[0.08] pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    Neural Inference Engine & Detection Calibrator
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Tune neural sensitivity, temporal smoothing, and multi-model ensemble weights.</p>
                </div>
                <span className="status-pill text-[10px] text-cyan-400 border-cyan-500/30">LATENCY &lt;184ms P99</span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 font-mono block">Continuous Real-Time Threat Detection</span>
                    <span className="text-[11px] text-slate-400">Execute bidirectional streaming neural analysis across incoming audio frames every 250ms.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={realtimeThreatDetection}
                    onChange={(e) => setRealtimeThreatDetection(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                {/* Risk-Score Sensitivity Slider */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-300 font-bold">Risk Score Engine Sensitivity:</span>
                    <span className="text-cyan-400 font-bold">{riskSensitivity}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="95"
                    value={riskSensitivity}
                    onChange={(e) => setRiskSensitivity(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>Low False-Alarms (Conservative)</span>
                    <span>Standard Balance</span>
                    <span>High Paranoia (Aggressive)</span>
                  </div>
                </div>

                {/* Model Selection */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 font-mono block">Primary AI Model Architecture</span>
                    <span className="text-[11px] text-slate-400">Select active neural classification pipeline for vocoder artifact extraction.</span>
                  </div>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="dashboard-policy-select bg-slate-900 text-white font-mono text-xs px-3 py-1.5 rounded-lg border border-white/[0.08]"
                  >
                    <option value="ENSEMBLE_AASIST_WAV2VEC2">AASIST + Wav2Vec2 + ECAPA (Recommended)</option>
                    <option value="AASIST_L_ONNX">AASIST-L (Ultra-Low Latency ONNX)</option>
                    <option value="WAV2VEC2_XLSR">Wav2Vec2-XLSR-53 (Multilingual Indian Accent)</option>
                    <option value="RAWNET3">RawNet3 Direct Waveform Net</option>
                  </select>
                </div>

                {/* Detection Confidence Threshold */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex flex-col gap-2">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-slate-300 font-bold">Detection Confidence Threshold for Automated Block:</span>
                    <span className="text-red-400 font-bold">{confidenceThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="99"
                    value={confidenceThreshold}
                    onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                    className="w-full accent-red-500 cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={() => triggerSaveNotification('AI engine hyperparameters re-calibrated.')}
                className="premium-btn w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md"
              >
                Apply AI Detection Parameters
              </button>
            </div>
          )}

          {/* SECTION 5: NOTIFICATIONS */}
          {activeSection === 'NOTIFICATIONS' && (
            <div className="premium-card p-6 flex flex-col gap-5">
              <div className="border-b border-white/[0.08] pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Bell className="w-4 h-4 text-cyan-400" />
                    SOC Dispatch & Alerting Relays
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Route critical alerts across in-app broadcasts, email digests, and webhook channels.</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 font-mono block">Critical Impersonation Alerts</span>
                    <span className="text-[11px] text-slate-400">Immediate priority banner and auditory beacon when risk exceeds 80%.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={criticalAlerts}
                    onChange={(e) => setCriticalAlerts(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 font-mono block">Operator Email Notifications</span>
                    <span className="text-[11px] text-slate-400">Dispatch detailed cryptographic incident PDF dossiers to security team inbox.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 font-mono block">In-App Live Toast Notifications</span>
                    <span className="text-[11px] text-slate-400">Show real-time toast alerts when new anomaly flags (e.g. vocoder cutoff) are detected.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={inAppNotifications}
                    onChange={(e) => setInAppNotifications(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 font-mono block">Platform & Signature Updates</span>
                    <span className="text-[11px] text-slate-400">Notify when new zero-shot voice cloning threat signatures are synchronized from SIH intelligence.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={systemUpdates}
                    onChange={(e) => setSystemUpdates(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={() => triggerSaveNotification('Alert notification routing configured.')}
                className="premium-btn w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md"
              >
                Save Notification Preferences
              </button>
            </div>
          )}

          {/* SECTION 6: BLOCKCHAIN */}
          {activeSection === 'BLOCKCHAIN' && (
            <div className="premium-card p-6 flex flex-col gap-5">
              <div className="border-b border-white/[0.08] pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-cyan-400" />
                    Web3 Forensic Ledger & Smart Contract Verification
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Immutable on-chain anchoring of biometric incident hashes for legal provenance.</p>
                </div>
                <span className="status-pill text-[10px] text-cyan-400 border-cyan-500/30">MAINNET ACTIVE</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Anchoring Network</span>
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value)}
                    className="dashboard-policy-select bg-slate-900 text-white font-mono text-xs px-3 py-2 rounded-lg border border-white/[0.08]"
                  >
                    <option value="ETHEREUM_MAINNET">Ethereum Mainnet (L1 Settlement)</option>
                    <option value="POLYGON_POS">Polygon PoS (Low Gas Anchoring)</option>
                    <option value="ARBITRUM_ONE">Arbitrum One (Rollup)</option>
                    <option value="HYPERLEDGER_FABRIC">Hyperledger Enterprise Vault</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">Connected Security Wallet</span>
                  <div className="flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-white/[0.08] font-mono text-xs">
                    <span className="text-cyan-300 font-bold">{walletAddress}</span>
                    <span className="text-[9px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">CONNECTED</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 font-mono block">Automated Transaction Verification</span>
                    <span className="text-[11px] text-slate-400">Verifies high-value smart contract calls require biometric voice affirmation on-chain.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={smartContractAudit}
                    onChange={(e) => setSmartContractAudit(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 font-mono block">Gas Speed / Settlement Urgency</span>
                    <span className="text-[11px] text-slate-400">Controls gas multipliers for critical security state freezes.</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-white/[0.06]">
                    {(['FAST', 'STANDARD', 'LOW'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGasPreference(g)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition ${
                          gasPreference === g ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => triggerSaveNotification('Web3 ledger configuration saved.')}
                className="premium-btn w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md"
              >
                Update Blockchain Configuration
              </button>
            </div>
          )}

          {/* SECTION 7: SYSTEM */}
          {activeSection === 'SYSTEM' && (
            <div className="premium-card p-6 flex flex-col gap-5">
              <div className="border-b border-white/[0.08] pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-cyan-400" />
                    System Engine & Display Environment
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Configure rendering optimizations, language localizations, and refresh frequencies.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex flex-col gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Display Theme Mode</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleThemeSelect('DARK')}
                      className={`flex-1 py-2 rounded-lg font-bold border transition ${
                        theme === 'DARK' 
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                          : 'bg-slate-900 border-white/[0.06] text-slate-400 hover:text-white'
                      }`}
                    >
                      Dark Obsidian
                    </button>
                    <button
                      onClick={() => handleThemeSelect('LIGHT')}
                      className={`flex-1 py-2 rounded-lg font-bold border transition ${
                        theme === 'LIGHT' 
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                          : 'bg-slate-900 border-white/[0.06] text-slate-400 hover:text-white'
                      }`}
                    >
                      Tactical Light
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex flex-col gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Interface Localization</span>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="dashboard-policy-select bg-slate-900 text-white font-mono text-xs px-3 py-2 rounded-lg border border-white/[0.08]"
                  >
                    <option value="EN_IN">English (India - Default)</option>
                    <option value="HI">हिन्दी (Hindi)</option>
                    <option value="TA">தமிழ் (Tamil)</option>
                    <option value="TE">తెలుగు (Telugu)</option>
                    <option value="BN">বাংলা (Bengali)</option>
                  </select>
                </div>
              </div>

              {/* Auto-Adjust Window Size & Fluid Layout Configuration */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex flex-col gap-3 font-mono text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider block flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      Window Display Auto-Adjustment
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Auto-fit dashboard canvas, oscilloscope, risk telemetry, and audit tables to 100% of the browser window size.
                    </span>
                  </div>
                  <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/40 px-2 py-0.5 rounded font-bold">
                    {currentLayoutMode === 'FLUID' ? 'FLUID EXPAND' : 'CONTAINED'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <button
                    onClick={() => handleLayoutModeSelect('FLUID')}
                    className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                      currentLayoutMode === 'FLUID'
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                        : 'bg-slate-900/80 border-white/[0.06] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">Fluid Auto-Adjust (Full Width)</span>
                      {currentLayoutMode === 'FLUID' && <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 leading-relaxed">
                      Expands dynamically to match any monitor, tablet, or mobile window size seamlessly.
                    </span>
                  </button>

                  <button
                    onClick={() => handleLayoutModeSelect('CONTAINED')}
                    className={`p-3 rounded-lg border text-left flex flex-col gap-1 transition-all ${
                      currentLayoutMode === 'CONTAINED'
                        ? 'bg-cyan-500/15 border-cyan-500 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                        : 'bg-slate-900/80 border-white/[0.06] text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">Contained Console (1640px)</span>
                      {currentLayoutMode === 'CONTAINED' && <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />}
                    </div>
                    <span className="text-[10px] text-slate-400 leading-relaxed">
                      Centers the SOC interface within a fixed maximum width for standard command terminals.
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 font-mono block">Mobile Touch & High-Density Optimization</span>
                    <span className="text-[11px] text-slate-400">Enables swipeable tabs, touch-friendly buttons, and high-DPI waveform rendering on smartphones.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={mobileTouchOptimized}
                    onChange={(e) => {
                      setMobileTouchOptimized(e.target.checked);
                      triggerSaveNotification(`Mobile touch optimization ${e.target.checked ? 'enabled' : 'disabled'}.`);
                    }}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 font-mono block">Telemetry Refresh Frequency</span>
                    <span className="text-[11px] text-slate-400">Rate of WebSocket telemetry polling and canvas stream re-draw.</span>
                  </div>
                  <select
                    value={autoRefreshInterval}
                    onChange={(e) => setAutoRefreshInterval(e.target.value)}
                    className="dashboard-policy-select bg-slate-900 text-white font-mono text-xs px-3 py-1.5 rounded-lg border border-white/[0.08]"
                  >
                    <option value="250ms">250ms (Ultra-Smooth Live)</option>
                    <option value="500ms">500ms (Balanced)</option>
                    <option value="1s">1 Second</option>
                    <option value="2s">2 Seconds</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/[0.06] flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-slate-200 font-mono block">GPU Performance Hardware Acceleration</span>
                    <span className="text-[11px] text-slate-400">Uses WebGL/WebGPU for 60fps spectrogram waterfall and oscilloscope rendering.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={performanceMode}
                    onChange={(e) => setPerformanceMode(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={() => triggerSaveNotification('System environment settings applied.')}
                className="premium-btn w-full py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-md"
              >
                Save System Parameters
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SettingsManagerView;
