import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import RiskGauge from './RiskGauge';
import SpectrogramCanvas from './SpectrogramCanvas';
import WaveformDisplay from './WaveformDisplay';
import ProsodyMetrics from './ProsodyMetrics';
import AlertPanel from './AlertPanel';
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
import { RISK_LEVELS } from '../utils/constants';
import { Shield, Settings2, Flame, UserCheck, User, Radar, PhoneCall, ShieldAlert, BarChart3, Settings as SettingsIcon, Sun, Moon, Search, Bell } from 'lucide-react';
const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('RADAR');
    const { currentScore, riskLevel, anomalyFlags, recommendation, updateScore } = useRiskScore();
    const [audioData, setAudioData] = useState(null);
    const [duration, setDuration] = useState(0);
    const [alerts, setAlerts] = useState([
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
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const saved = localStorage.getItem('cyphex_user');
            return saved ? JSON.parse(saved) : null;
        }
        catch {
            return null;
        }
    });
    const [sessionId] = useState(() => 'SES-' + Math.random().toString(36).substring(2, 9).toUpperCase());
    const [lastResult, setLastResult] = useState(null);
    // Configurable security profile
    const [profile, setProfile] = useState("STANDARD");
    const [selectedSpeakerId, setSelectedSpeakerId] = useState(null);
    // Theme state persisted in localStorage & applied to document root
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('cyphex_theme') || 'DARK';
    });
    useEffect(() => {
        localStorage.setItem('cyphex_theme', theme);
        if (theme === 'LIGHT') {
            document.documentElement.classList.add('theme-light');
            document.body.classList.add('theme-light');
        }
        else {
            document.documentElement.classList.remove('theme-light');
            document.body.classList.remove('theme-light');
        }
    }, [theme]);
    useEffect(() => {
        let interval;
        if (isStreaming) {
            interval = window.setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);
        }
        else {
            setDuration(0);
        }
        return () => clearInterval(interval);
    }, [isStreaming]);
    const lastAlertTimeRef = useRef(0);
    const handleScoreUpdate = (result) => {
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
    const handleAudioData = (data) => {
        setAudioData(data);
    };
    // Live UTC Clock for SOC Telemetry
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
    return (_jsxs("div", { className: "dashboard-container min-h-screen p-5 sm:p-8 flex flex-col gap-6 max-w-[1640px] mx-auto", children: [_jsxs("header", { className: "premium-card px-5 py-3.5 flex flex-wrap justify-between items-center gap-4 relative z-10 pro-card-glow", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-gradient-to-b from-white/15 to-white/5 border border-white/20 flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.3)]", children: _jsx(Shield, { className: "w-5 h-5 text-white" }) }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("h1", { className: "text-sm font-bold tracking-wider text-white font-mono uppercase", children: "CYPHEX" }), _jsx("span", { className: "text-[9px] bg-white/[0.06] text-slate-300 font-mono px-2 py-0.5 rounded-md border border-white/[0.1] font-semibold tracking-wider", children: "v1.0" }), _jsxs("span", { className: "inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/40 px-2 py-0.5 rounded-md shadow-sm", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" }), _jsx("span", { className: "font-semibold tracking-wider", children: "SOC ACTIVE" })] })] }), _jsx("p", { className: "text-[11px] text-[#94a3b8] tracking-tight font-medium", children: "Enterprise Voice Biometrics & Deepfake Defense Platform" })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("div", { className: "relative hidden md:flex items-center", children: [_jsx(Search, { className: "w-3.5 h-3.5 text-slate-500 absolute left-2.5 pointer-events-none" }), _jsx("input", { type: "text", placeholder: "Search caller ID, SIP trunk, ANI...", className: "bg-white/[0.03] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 w-60 focus:outline-none focus:border-white/20 font-mono transition" })] }), _jsxs("nav", { className: "linear-tab-bar overflow-x-auto", children: [_jsxs("button", { onClick: () => setActiveTab('RADAR'), className: `linear-tab-item ${activeTab === 'RADAR' ? 'linear-tab-item-active' : ''}`, children: [_jsx(Radar, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Overview" })] }), _jsxs("button", { onClick: () => setActiveTab('CALLS'), className: `linear-tab-item ${activeTab === 'CALLS' ? 'linear-tab-item-active' : ''}`, children: [_jsx(PhoneCall, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Call Analysis" })] }), _jsxs("button", { onClick: () => setActiveTab('INCIDENTS'), className: `linear-tab-item ${activeTab === 'INCIDENTS' ? 'linear-tab-item-active text-red-300' : ''}`, children: [_jsx(ShieldAlert, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Incidents" }), _jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-red-400" })] }), _jsxs("button", { onClick: () => setActiveTab('ANALYTICS'), className: `linear-tab-item ${activeTab === 'ANALYTICS' ? 'linear-tab-item-active' : ''}`, children: [_jsx(BarChart3, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Risk Intelligence" })] }), _jsxs("button", { onClick: () => setActiveTab('SETTINGS'), className: `linear-tab-item ${activeTab === 'SETTINGS' ? 'linear-tab-item-active' : ''}`, children: [_jsx(SettingsIcon, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Settings" }), currentUser && (_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-emerald-400" }))] })] })] }), _jsxs("div", { className: "flex items-center gap-2.5 flex-wrap", children: [_jsxs("button", { onClick: () => setActiveTab('INCIDENTS'), className: "vercel-btn-secondary px-2.5 relative", title: "Active Security Notifications", children: [_jsx(Bell, { className: "w-3.5 h-3.5 text-slate-300 hover:text-white" }), _jsx("span", { className: "w-2 h-2 rounded-full bg-red-500 absolute top-1 right-1" })] }), _jsxs("div", { className: "flex items-center gap-2 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.09] text-xs", children: [_jsx(Settings2, { className: "w-3.5 h-3.5 text-cyan-400" }), _jsxs("select", { value: profile, onChange: (e) => setProfile(e.target.value), disabled: isStreaming || isSimulating, className: "bg-transparent text-slate-200 font-mono text-xs focus:outline-none cursor-pointer disabled:opacity-50 pr-2 font-medium", children: [_jsx("option", { value: "STANDARD", className: "bg-[#0b0d13] text-white", children: "Standard Profile" }), _jsx("option", { value: "HIGH_VALUE_TRANSACTION", className: "bg-[#0b0d13] text-white", children: "Wire Transfer (>$100k)" }), _jsx("option", { value: "PRIVILEGED_ACCESS", className: "bg-[#0b0d13] text-white", children: "Executive Clearance" })] })] }), _jsxs("button", { onClick: () => setIsDemoModalOpen(true), className: `vercel-btn-secondary ${isSimulating ? 'border-red-500 text-red-300 bg-red-950/40' : ''}`, children: [_jsx(Flame, { className: "w-3.5 h-3.5 text-red-400" }), _jsx("span", { children: isSimulating ? 'Threat Active' : 'Threat Simulator' })] }), _jsx("button", { onClick: () => setTheme(theme === 'DARK' ? 'LIGHT' : 'DARK'), className: "vercel-btn-secondary px-2.5", title: `Switch to ${theme === 'DARK' ? 'Tactical Light' : 'Dark Obsidian'} Mode`, children: theme === 'DARK' ? (_jsx(Sun, { className: "w-3.5 h-3.5 text-amber-400" })) : (_jsx(Moon, { className: "w-3.5 h-3.5 text-cyan-400" })) }), _jsx("button", { onClick: () => setIsAuthModalOpen(true), className: "vercel-btn-secondary", children: currentUser ? (_jsxs(_Fragment, { children: [_jsx(UserCheck, { className: "w-3.5 h-3.5 text-cyan-400" }), _jsx("span", { className: "font-mono text-xs font-semibold", children: currentUser.username })] })) : (_jsxs(_Fragment, { children: [_jsx(User, { className: "w-3.5 h-3.5 text-[#8a8f98]" }), _jsx("span", { children: "Operator" })] })) }), _jsx(AudioStreamer, { sessionId: sessionId, profile: profile, selectedSpeakerId: selectedSpeakerId, onScoreUpdate: handleScoreUpdate, onAudioData: handleAudioData, onStreamStateChange: setIsStreaming })] })] }), activeTab === 'RADAR' && (_jsxs("div", { className: "flex flex-col gap-6 flex-grow page-fade-enter", children: [_jsxs("div", { className: "premium-card px-6 py-4 flex flex-wrap justify-between items-center gap-4", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" }), _jsx("h2", { className: "text-sm font-bold tracking-wider text-white font-mono uppercase", children: "Voice Security Command Center" })] }), _jsx("p", { className: "text-[11px] text-[#94a3b8] mt-0.5 font-medium", children: "Enterprise real-time acoustic signal fusion & biometrics surveillance" })] }), _jsxs("div", { className: "flex items-center gap-6 flex-wrap font-mono", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-[10px] uppercase tracking-wider text-[#94a3b8]", children: "Total Calls Analyzed" }), _jsx("span", { className: "text-sm font-bold text-white", children: "14,892" })] }), _jsx("div", { className: "h-7 w-[1px] bg-white/[0.08]" }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-[10px] uppercase tracking-wider text-[#94a3b8]", children: "Threats Detected" }), _jsx("span", { className: "text-sm font-bold text-red-400", children: "342" })] }), _jsx("div", { className: "h-7 w-[1px] bg-white/[0.08]" }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-[10px] uppercase tracking-wider text-[#94a3b8]", children: "Synthetic Voice Prob" }), _jsxs("span", { className: `text-sm font-bold ${currentScore >= 0.6 ? 'text-red-400' : 'text-emerald-400'}`, children: [Math.round(currentScore * 100), "%"] })] }), _jsx("div", { className: "h-7 w-[1px] bg-white/[0.08]" }), _jsxs("div", { className: "flex flex-col", children: [_jsx("span", { className: "text-[10px] uppercase tracking-wider text-[#94a3b8]", children: "High-Risk Sessions" }), _jsx("span", { className: "text-sm font-bold text-amber-400", children: "18" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch", children: [_jsx("div", { className: "h-full pro-card-glow rounded-xl", children: _jsx(RiskGauge, { score: currentScore, riskLevel: riskLevel, recommendation: recommendation }) }), _jsx("div", { className: "h-full pro-card-glow rounded-xl", children: _jsx(ProsodyMetrics, { jitter: lastResult?.jitter, shimmer: lastResult?.shimmer, hnr: lastResult?.hnr, f0Mean: lastResult?.f0_mean }) }), _jsx("div", { className: "h-full pro-card-glow rounded-xl", children: _jsx(SessionInfo, { sessionId: sessionId, durationSeconds: duration, isConnected: isStreaming, profile: profile, latencyMs: lastResult?.latency_ms || 0 }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch", children: [_jsx("div", { className: "lg:col-span-7 flex flex-col min-h-[280px] pro-card-glow rounded-xl", children: _jsx(SpectrogramCanvas, { audioData: audioData, anomalyFlags: anomalyFlags }) }), _jsx("div", { className: "lg:col-span-5 flex flex-col min-h-[280px] pro-card-glow rounded-xl", children: _jsx(WaveformDisplay, { audioData: audioData, isActive: isStreaming, vadStatus: lastResult?.speech_active ?? false }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 items-start", children: [_jsx("div", { className: "flex flex-col gap-6 pro-card-glow rounded-xl", children: _jsx(AlertPanel, { alerts: alerts, onClearAlerts: () => setAlerts([]), onNavigateToIncidents: () => setActiveTab('INCIDENTS'), onAddSimulatedAlert: () => {
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
                                    } }) }), _jsxs("div", { className: "flex flex-col gap-6", children: [_jsxs("div", { className: "premium-card p-5 flex flex-col relative overflow-hidden pro-card-glow", children: [_jsxs("div", { className: "flex justify-between items-center mb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(UserCheck, { className: "w-4 h-4 text-cyan-400" }), _jsx("h3", { className: "text-xs font-semibold tracking-wider uppercase text-slate-300 font-mono", children: "SOC Operator Clearance" })] }), _jsx("span", { className: `text-[10px] font-mono font-medium px-2 py-0.5 rounded-md border ${currentUser
                                                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                                                            : 'bg-amber-950/60 text-amber-300 border-amber-500/40'}`, children: currentUser ? 'VERIFIED' : 'GUEST / EVAL' })] }), currentUser ? (_jsxs("div", { className: "flex items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-lg border border-white/[0.06]", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-9 h-9 rounded-lg bg-cyan-950/70 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-mono font-bold text-xs", children: currentUser.username.substring(0, 2).toUpperCase() }), _jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: "text-xs font-bold text-white font-mono", children: currentUser.username }), _jsx("span", { className: "text-[9px] bg-cyan-950/80 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-500/30 font-mono uppercase", children: currentUser.role })] }), _jsx("span", { className: "text-[10px] text-slate-400 font-mono block mt-0.5 truncate max-w-[200px]", children: currentUser.email })] })] }), _jsxs("button", { onClick: () => setActiveTab('SETTINGS'), className: "vercel-btn-secondary text-[11px]", children: [_jsx(SettingsIcon, { className: "w-3 h-3" }), _jsx("span", { children: "Manage" })] })] })) : (_jsxs("div", { className: "flex items-center justify-between gap-3 bg-white/[0.02] p-3 rounded-lg border border-amber-500/20", children: [_jsxs("div", { children: [_jsx("span", { className: "text-xs font-bold text-slate-200 font-mono block", children: "Operator Unauthenticated" }), _jsx("span", { className: "text-[10px] text-slate-400", children: "Sign in to unlock privileged forensic interception." })] }), _jsx("button", { onClick: () => setIsAuthModalOpen(true), className: "vercel-btn-primary text-[11px]", children: "Sign In" })] }))] }), _jsx(SpeakerEnrollment, { onSelectSpeaker: setSelectedSpeakerId, selectedSpeakerId: selectedSpeakerId })] })] })] })), activeTab === 'CALLS' && (_jsx("div", { className: "page-fade-enter", children: _jsx(CallsManagerView, {}) })), activeTab === 'INCIDENTS' && (_jsx("div", { className: "page-fade-enter", children: _jsx(IncidentsManagerView, {}) })), activeTab === 'ANALYTICS' && (_jsx("div", { className: "page-fade-enter", children: _jsx(AnalyticsTelemetryView, {}) })), activeTab === 'SETTINGS' && (_jsx("div", { className: "page-fade-enter", children: _jsx(SettingsManagerView, { currentUser: currentUser, currentTheme: theme, onThemeChange: (newTheme) => setTheme(newTheme), onAuthSuccess: (user) => setCurrentUser(user), onLogout: () => setCurrentUser(null) }) })), _jsxs("footer", { className: "flex flex-wrap justify-between items-center text-[10px] text-slate-400 py-3 border-t border-white/[0.08] px-2 gap-3 mt-1 bg-slate-950/40 rounded-xl backdrop-blur-md", children: [_jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [_jsx("span", { className: "font-bold text-slate-200 tracking-wider font-mono", children: "CYPHEX SOC ENGINE" }), _jsx("span", { className: "text-slate-600", children: "\u2022" }), _jsx("span", { className: "text-slate-400 font-medium", children: "Smart India Hackathon (SIH 2026)" }), _jsx("span", { className: "text-slate-600", children: "\u2022" }), _jsx("span", { className: "text-cyan-400/80 font-mono", children: "ENCRYPTED REAL-TIME BIOMETRIC TELEMETRY" })] }), _jsxs("div", { className: "font-mono text-slate-400 flex items-center gap-3", children: [_jsx("span", { className: "hidden sm:inline text-slate-500", children: "ENSEMBLE: AASIST + WAV2VEC2-SSL + ECAPA-TDNN" }), _jsx("span", { className: "px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold", children: "LATENCY SLA <300ms [PASS]" })] })] }), _jsx(DemoSimulatorModal, { isOpen: isDemoModalOpen, onClose: () => setIsDemoModalOpen(false), onAudioData: handleAudioData, onScoreUpdate: handleScoreUpdate, onSimulationStateChange: setIsSimulating }), _jsx(AuthModal, { isOpen: isAuthModalOpen, onClose: () => setIsAuthModalOpen(false), currentUser: currentUser, onAuthSuccess: (user) => setCurrentUser(user), onLogout: () => setCurrentUser(null) })] }));
};
export default Dashboard;
