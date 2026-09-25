import React, { useState, useEffect, useRef } from 'react';
import RiskGauge from './RiskGauge';
import SpectrogramCanvas from './SpectrogramCanvas';
import WaveformDisplay from './WaveformDisplay';
import ProsodyMetrics from './ProsodyMetrics';
import AlertPanel, { Alert } from './AlertPanel';
import SessionInfo from './SessionInfo';
import SpeakerEnrollment from './SpeakerEnrollment';
import AudioStreamer from './AudioStreamer';
import DemoSimulatorModal from './DemoSimulatorModal';
import AuthModal from './AuthModal';
import CallsManagerView from './pages/CallsManagerView';
import IncidentsManagerView from './pages/IncidentsManagerView';
import AnalyticsTelemetryView from './pages/AnalyticsTelemetryView';
import SettingsManagerView from './pages/SettingsManagerView';
import { useRiskScore } from '../hooks/useRiskScore';
import { DetectionResult, RISK_LEVELS, SocOperator } from '../utils/constants';
import { 
  Shield, Settings2, Flame, UserCheck, User, 
  Radar, PhoneCall, ShieldAlert, BarChart3, Settings as SettingsIcon,
  Sun, Moon, Search, Bell
} from 'lucide-react';

type NavTab = 'RADAR' | 'CALLS' | 'INCIDENTS' | 'ANALYTICS' | 'SETTINGS';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('RADAR');
  const { currentScore, riskLevel, anomalyFlags, recommendation, updateScore } = useRiskScore();
  const [audioData, setAudioData] = useState<Float32Array | null>(null);
  const [duration, setDuration] = useState(0);
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 'EVT-9481',
      timestamp: new Date(Date.now() - 1000 * 60 * 3),
      score: 0.94,
      anomalyFlags: ['HF_VOCODER_ARTIFACT', 'PROSODY_ROBOTIC_FLATNESS', 'SPECTRAL_CUTOFF_ABOVE_7KHZ'],
      recommendation: 'CRITICAL: Neural vocoder synthesis detected. Initiated automated PBX disconnect.'
    },
    {
      id: 'EVT-9480',
      timestamp: new Date(Date.now() - 1000 * 60 * 12),
      score: 0.78,
      anomalyFlags: ['UNNATURAL_PITCH_JUMP', 'ABNORMAL_SHIMMER'],
      recommendation: 'HIGH: Out-of-band push authentication challenge dispatched to enrolled VIP device.'
    },
    {
      id: 'EVT-9479',
      timestamp: new Date(Date.now() - 1000 * 60 * 27),
      score: 0.45,
      anomalyFlags: ['SPECTRAL_TILT_ANOMALY'],
      recommendation: 'MONITOR: Elevated jitter signature recorded. Audio session marked for continuous forensic audit.'
    }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<SocOperator | null>(() => {
    try {
      const saved = localStorage.getItem('cyphex_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [sessionId] = useState(() => 'SES-' + Math.random().toString(36).substring(2, 9).toUpperCase());
  const [lastResult, setLastResult] = useState<DetectionResult | null>(null);
  
  // Configurable security profile
  const [profile, setProfile] = useState<string>("STANDARD");
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string | null>(null);

  // Theme state persisted in localStorage & applied to document root
  const [theme, setTheme] = useState<'DARK' | 'LIGHT'>(() => {
    return (localStorage.getItem('cyphex_theme') as 'DARK' | 'LIGHT') || 'DARK';
  });

  useEffect(() => {
    localStorage.setItem('cyphex_theme', theme);
    if (theme === 'LIGHT') {
      document.documentElement.classList.add('theme-light');
      document.body.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
      document.body.classList.remove('theme-light');
    }
  }, [theme]);

  useEffect(() => {
    let interval: number;
    if (isStreaming) {
      interval = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [isStreaming]);

  const lastAlertTimeRef = useRef<number>(0);

  const handleScoreUpdate = (result: DetectionResult) => {
    updateScore(result);
    setLastResult(result);

    const now = Date.now();
    // Throttle duplicate incident events to one per 1.5 seconds during live streaming
    if (result.score >= RISK_LEVELS.MEDIUM.threshold && (now - lastAlertTimeRef.current > 1500)) {
      lastAlertTimeRef.current = now;
      const eventId = `EVT-${Math.floor(9480 + Math.random() * 500)}`;
      setAlerts((prev) => [
        {
          id: eventId,
          timestamp: new Date(),
          score: result.score,
          anomalyFlags: result.anomaly_flags || [],
          recommendation: result.recommendation || '',
        },
        ...prev,
      ].slice(0, 50));
    }
  };

  const handleAudioData = (data: Float32Array) => {
    setAudioData(data);
  };

  // Live UTC Clock for SOC Telemetry
  const [layoutMode, setLayoutMode] = useState<'FLUID' | 'CONTAINED'>(() => {
    return (localStorage.getItem('cyphex_layout_mode') as 'FLUID' | 'CONTAINED') || 'FLUID';
  });

  const [utcTime, setUtcTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`dashboard-container min-h-screen p-3 sm:p-5 md:p-6 lg:p-8 flex flex-col gap-4 sm:gap-6 transition-all duration-300 ${
      layoutMode === 'FLUID' ? 'w-full max-w-none' : 'w-full max-w-[1640px] mx-auto'
    }`}>
      {/* Top Executive Command Header */}
      <header className="premium-card p-3.5 sm:p-4 md:p-5 flex flex-col gap-3 sm:gap-4 relative z-10 pro-card-glow">
        {/* Top Row: Brand & Quick Operator Controls */}
        <div className="flex flex-wrap justify-between items-center gap-3 w-full">
          {/* Left: Brand & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-b from-white/15 to-white/5 border border-white/20 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] shrink-0">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                <h1 className="text-xs sm:text-sm font-bold tracking-wider text-white font-mono uppercase">
                  CYPHEX
                </h1>
                <span className="text-[9px] bg-white/[0.06] text-slate-300 font-mono px-1.5 sm:px-2 py-0.5 rounded-md border border-white/[0.1] font-semibold tracking-wider">
                  v1.0
                </span>
                <span className="inline-flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/40 px-2 py-0.5 rounded-md shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
                  <span className="font-semibold tracking-wider">SOC ACTIVE</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-[#94a3b8] tracking-tight font-medium hidden sm:block">
                Enterprise Voice Biometrics & Deepfake Defense Platform
              </p>
            </div>
          </div>

          {/* Right: Controls, Notifications & Operator */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap ml-auto">
            {/* Policy Profile Selector */}
            <div className="flex items-center gap-1.5 bg-white/[0.03] px-2.5 py-1.5 rounded-lg border border-white/[0.09] text-xs">
              <Settings2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                disabled={isStreaming || isSimulating}
                className="bg-transparent text-slate-200 font-mono text-xs focus:outline-none cursor-pointer disabled:opacity-50 pr-1 font-medium max-w-[130px] sm:max-w-none truncate"
              >
                <option value="STANDARD" className="bg-[#0b0d13] text-white">Standard Profile</option>
                <option value="HIGH_VALUE_TRANSACTION" className="bg-[#0b0d13] text-white">Wire Transfer (&gt;$100k)</option>
                <option value="PRIVILEGED_ACCESS" className="bg-[#0b0d13] text-white">Executive Clearance</option>
              </select>
            </div>

            {/* Attack Simulator Trigger */}
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className={`vercel-btn-secondary px-2.5 sm:px-3 text-xs ${isSimulating ? 'border-red-500 text-red-300 bg-red-950/40' : ''}`}
              title="Threat Simulator"
            >
              <Flame className="w-3.5 h-3.5 text-red-400 shrink-0" />
              <span className="hidden sm:inline">{isSimulating ? 'Threat Active' : 'Threat Simulator'}</span>
              <span className="sm:hidden">{isSimulating ? 'Threat' : 'Simulate'}</span>
            </button>

            {/* Notifications Bell */}
            <button 
              onClick={() => setActiveTab('INCIDENTS')}
              className="vercel-btn-secondary px-2.5 relative"
              title="Active Security Notifications"
            >
              <Bell className="w-3.5 h-3.5 text-slate-300 hover:text-white" />
              <span className="w-2 h-2 rounded-full bg-red-500 absolute top-1 right-1" />
            </button>

            {/* Display Theme Switcher */}
            <button
              onClick={() => setTheme(theme === 'DARK' ? 'LIGHT' : 'DARK')}
              className="vercel-btn-secondary px-2.5"
              title={`Switch to ${theme === 'DARK' ? 'Tactical Light' : 'Dark Obsidian'} Mode`}
            >
              {theme === 'DARK' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-cyan-400" />
              )}
            </button>

            {/* Operator Auth Button */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="vercel-btn-secondary px-2.5 sm:px-3"
            >
              {currentUser ? (
                <>
                  <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-mono text-xs font-semibold">{currentUser.username}</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-[#8a8f98]" />
                  <span className="hidden sm:inline">Operator</span>
                </>
              )}
            </button>

            {/* Live Audio Intercept Streamer */}
            <AudioStreamer
              sessionId={sessionId}
              profile={profile}
              selectedSpeakerId={selectedSpeakerId}
              onScoreUpdate={handleScoreUpdate}
              onAudioData={handleAudioData}
              onStreamStateChange={setIsStreaming}
            />
          </div>
        </div>

        {/* Bottom Row: Linear Navigation Tab Bar & Search */}
        <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-white/[0.06] w-full">
          {/* Segmented Nav Tabs */}
          <nav className="linear-tab-bar overflow-x-auto touch-scroll-x no-scrollbar w-full md:w-auto max-w-full">
            <button
              onClick={() => setActiveTab('RADAR')}
              className={`linear-tab-item shrink-0 ${activeTab === 'RADAR' ? 'linear-tab-item-active' : ''}`}
            >
              <Radar className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('CALLS')}
              className={`linear-tab-item shrink-0 ${activeTab === 'CALLS' ? 'linear-tab-item-active' : ''}`}
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Analysis</span>
            </button>

            <button
              onClick={() => setActiveTab('INCIDENTS')}
              className={`linear-tab-item shrink-0 ${activeTab === 'INCIDENTS' ? 'linear-tab-item-active text-red-300' : ''}`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Incidents</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            </button>

            <button
              onClick={() => setActiveTab('ANALYTICS')}
              className={`linear-tab-item shrink-0 ${activeTab === 'ANALYTICS' ? 'linear-tab-item-active' : ''}`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Risk Intelligence</span>
            </button>

            <button
              onClick={() => setActiveTab('SETTINGS')}
              className={`linear-tab-item shrink-0 ${activeTab === 'SETTINGS' ? 'linear-tab-item-active' : ''}`}
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>Settings</span>
              {currentUser && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          </nav>

          {/* Quick Search */}
          <div className="relative hidden lg:flex items-center shrink-0">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search caller ID, SIP trunk..." 
              className="bg-white/[0.03] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 w-56 focus:outline-none focus:border-white/20 font-mono transition"
            />
          </div>
        </div>
      </header>

      {/* Multi-View Router Switch with Smooth Page Transitions */}
      {activeTab === 'RADAR' && (
        <div className="flex flex-col gap-6 flex-grow page-fade-enter">
          {/* Main Security Overview: Voice Security Command Center */}
          <div className="premium-card px-4 sm:px-6 py-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <h2 className="text-sm font-bold tracking-wider text-white font-mono uppercase">
                  Voice Security Command Center
                </h2>
              </div>
              <p className="text-[11px] text-[#94a3b8] mt-0.5 font-medium">
                Enterprise real-time acoustic signal fusion & biometrics surveillance
              </p>
            </div>

            {/* 4 Overview Statistics - Responsive Grid on Mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto font-mono">
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] flex flex-col">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#94a3b8]">Total Calls Analyzed</span>
                <span className="text-sm sm:text-base font-bold text-white">14,892</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] flex flex-col">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#94a3b8]">Threats Detected</span>
                <span className="text-sm sm:text-base font-bold text-red-400">342</span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] flex flex-col">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#94a3b8]">Synthetic Voice Prob</span>
                <span className={`text-sm sm:text-base font-bold ${currentScore >= 0.6 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {Math.round(currentScore * 100)}%
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] flex flex-col">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-[#94a3b8]">High-Risk Sessions</span>
                <span className="text-sm sm:text-base font-bold text-amber-400">18</span>
              </div>
            </div>
          </div>

          {/* Tier 1: Executive KPI Metrics Strip (3 equal balanced columns) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            <div className="h-full pro-card-glow rounded-xl">
              <RiskGauge 
                score={currentScore} 
                riskLevel={riskLevel} 
                recommendation={recommendation} 
              />
            </div>
            <div className="h-full pro-card-glow rounded-xl">
              <ProsodyMetrics 
                jitter={lastResult?.jitter} 
                shimmer={lastResult?.shimmer} 
                hnr={lastResult?.hnr} 
                f0Mean={lastResult?.f0_mean} 
              />
            </div>
            <div className="h-full pro-card-glow rounded-xl">
              <SessionInfo 
                sessionId={sessionId}
                durationSeconds={duration}
                isConnected={isStreaming}
                profile={profile}
                latencyMs={lastResult?.latency_ms || 0}
              />
            </div>
          </div>

          {/* Tier 2: Real-time Audio Forensic Visualizers (60/40 balanced split) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7 flex flex-col min-h-[280px] pro-card-glow rounded-xl">
              <SpectrogramCanvas audioData={audioData} anomalyFlags={anomalyFlags} />
            </div>
            <div className="lg:col-span-5 flex flex-col min-h-[280px] pro-card-glow rounded-xl">
              <WaveformDisplay 
                audioData={audioData} 
                isActive={isStreaming} 
                vadStatus={lastResult?.speech_active ?? false} 
              />
            </div>
          </div>

          {/* Tier 3: Triage Feed & Biometrics / Clearance (50/50 balanced split) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-6 pro-card-glow rounded-xl">
              <AlertPanel 
                alerts={alerts} 
                onClearAlerts={() => setAlerts([])}
                onNavigateToIncidents={() => setActiveTab('INCIDENTS')}
                onAddSimulatedAlert={() => {
                  const simAlerts = [
                    {
                      score: 0.94,
                      flags: ['HF_VOCODER_ARTIFACT', 'PROSODY_ROBOTIC_FLATNESS', 'SPECTRAL_CUTOFF_ABOVE_7KHZ'],
                      rec: 'CRITICAL: High-frequency neural vocoder synthesis detected. Initiated automated PBX disconnect.'
                    },
                    {
                      score: 0.82,
                      flags: ['INDIC_VOCAL_UNNATURAL_TREMOR', 'ABNORMAL_SHIMMER'],
                      rec: 'HIGH: Cloned voice with acoustic tremor detected. Triggered out-of-band biometric challenge.'
                    },
                    {
                      score: 0.65,
                      flags: ['UNNATURAL_PITCH_JUMP', 'SYNTHETIC_TIMBRE_VOID'],
                      rec: 'HIGH: Pitch discontinuity anomaly flagged. Out-of-band verification required.'
                    }
                  ];
                  const pick = simAlerts[Math.floor(Math.random() * simAlerts.length)];
                  handleScoreUpdate({
                    score: pick.score,
                    anomaly_flags: pick.flags,
                    recommendation: pick.rec,
                    latency_ms: Math.floor(130 + Math.random() * 40),
                    jitter: 0.021,
                    shimmer: 0.068,
                    hnr: 11.2,
                    f0_mean: 145,
                    speech_active: true
                  });
                }}
              />
            </div>
            <div className="flex flex-col gap-6">
              {/* Operator Clearance HUD Card */}
              <div className="premium-card p-5 flex flex-col relative overflow-hidden pro-card-glow">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-semibold tracking-wider uppercase text-slate-300 font-mono">
                      SOC Operator Clearance
                    </h3>
                  </div>
                  <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border ${
                    currentUser 
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40' 
                      : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                  }`}>
                    {currentUser ? 'VERIFIED' : 'GUEST / EVAL'}
                  </span>
                </div>

                {currentUser ? (
                  <div className="flex items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-lg border border-white/[0.06]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-cyan-950/70 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-mono font-bold text-xs">
                        {currentUser.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white font-mono">{currentUser.username}</span>
                          <span className="text-[9px] bg-cyan-950/80 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30 font-mono uppercase">
                            {currentUser.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate max-w-[200px]">
                          {currentUser.email}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('SETTINGS')}
                      className="vercel-btn-secondary text-[11px]"
                    >
                      <SettingsIcon className="w-3 h-3" />
                      <span>Manage</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-lg border border-amber-500/20">
                    <div>
                      <span className="text-xs font-bold text-slate-200 font-mono block">Operator Unauthenticated</span>
                      <span className="text-[10px] text-slate-400">Sign in to unlock privileged forensic interception.</span>
                    </div>
                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="vercel-btn-primary text-[11px]"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>

              <SpeakerEnrollment 
                onSelectSpeaker={setSelectedSpeakerId}
                selectedSpeakerId={selectedSpeakerId}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'CALLS' && (
        <div className="page-fade-enter">
          <CallsManagerView />
        </div>
      )}
      {activeTab === 'INCIDENTS' && (
        <div className="page-fade-enter">
          <IncidentsManagerView />
        </div>
      )}
      {activeTab === 'ANALYTICS' && (
        <div className="page-fade-enter">
          <AnalyticsTelemetryView />
        </div>
      )}
      {activeTab === 'SETTINGS' && (
        <div className="page-fade-enter">
          <SettingsManagerView 
            currentUser={currentUser}
            currentTheme={theme}
            onThemeChange={(newTheme) => setTheme(newTheme)}
            onAuthSuccess={(user) => setCurrentUser(user)}
            onLogout={() => setCurrentUser(null)}
          />
        </div>
      )}
      
      {/* Executive SOC Command Footer */}
      <footer className="flex flex-wrap justify-between items-center text-[10px] text-slate-400 py-3 border-t border-white/[0.08] px-2 gap-3 mt-1 bg-slate-950/40 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-200 tracking-wider font-mono">CYPHEX SOC ENGINE</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-slate-400 font-medium">Smart India Hackathon (SIH 2026)</span>
          <span className="text-slate-600">&bull;</span>
          <span className="text-cyan-400/80 font-mono">ENCRYPTED REAL-TIME BIOMETRIC TELEMETRY</span>
        </div>
        <div className="font-mono text-slate-400 flex items-center gap-3">
          <span className="hidden sm:inline text-slate-500">ENSEMBLE: AASIST + WAV2VEC2-SSL + ECAPA-TDNN</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold">
            LATENCY SLA &lt;300ms [PASS]
          </span>
        </div>
      </footer>

      {/* Attack Simulation Modal */}
      <DemoSimulatorModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onAudioData={handleAudioData}
        onScoreUpdate={handleScoreUpdate}
        onSimulationStateChange={setIsSimulating}
      />

      {/* SOC Operator Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(user) => setCurrentUser(user)}
        onLogout={() => setCurrentUser(null)}
      />
    </div>
  );
};

export default Dashboard;

