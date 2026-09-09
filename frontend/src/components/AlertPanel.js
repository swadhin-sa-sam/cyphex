import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { AlertCircle, ShieldAlert, ShieldCheck, Bell, Search, Download, Trash2, Zap, X, Volume2, ExternalLink, CheckCircle2, Sliders, ChevronRight } from 'lucide-react';
import { RISK_LEVELS } from '../utils/constants';
const AlertPanel = ({ alerts, onClearAlerts, onNavigateToIncidents, onAddSimulatedAlert }) => {
    const scrollRef = useRef(null);
    const [selectedAlert, setSelectedAlert] = useState(null);
    const [filterSeverity, setFilterSeverity] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [actionSuccessMsg, setActionSuccessMsg] = useState(null);
    const audioContextRef = useRef(null);
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
        }
    }, [alerts]);
    const getAlertSeverityInfo = (score) => {
        if (score >= RISK_LEVELS.CRITICAL.threshold) {
            return {
                level: 'CRITICAL',
                badge: 'VERDICT: BLOCK SPOOF',
                badgeClass: 'text-red-300 bg-red-950/90 border-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.3)]',
                borderClass: 'border-l-2 border-l-red-500 bg-gradient-to-r from-red-950/30 to-transparent',
                Icon: ShieldAlert,
                iconColor: 'text-red-400',
                pulseColor: 'bg-red-400',
            };
        }
        if (score >= RISK_LEVELS.HIGH.threshold) {
            return {
                level: 'HIGH',
                badge: 'VERDICT: STEP-UP MFA',
                badgeClass: 'text-orange-300 bg-orange-950/90 border-orange-500/60',
                borderClass: 'border-l-2 border-l-orange-500 bg-gradient-to-r from-orange-950/30 to-transparent',
                Icon: AlertCircle,
                iconColor: 'text-orange-400',
                pulseColor: 'bg-orange-400',
            };
        }
        if (score >= RISK_LEVELS.MEDIUM.threshold) {
            return {
                level: 'MEDIUM',
                badge: 'VERDICT: MONITOR',
                badgeClass: 'text-cyan-300 bg-cyan-950/90 border-cyan-500/60',
                borderClass: 'border-l-2 border-l-cyan-500 bg-gradient-to-r from-cyan-950/30 to-transparent',
                Icon: AlertCircle,
                iconColor: 'text-cyan-400',
                pulseColor: 'bg-cyan-400',
            };
        }
        return {
            level: 'LOW',
            badge: 'VERDICT: ALLOW HUMAN',
            badgeClass: 'text-emerald-300 bg-emerald-950/90 border-emerald-500/60',
            borderClass: 'border-l-2 border-l-emerald-500 bg-gradient-to-r from-emerald-950/30 to-transparent',
            Icon: ShieldCheck,
            iconColor: 'text-emerald-400',
            pulseColor: 'bg-emerald-400',
        };
    };
    // Filtered and Searched Alerts
    const filteredAlerts = alerts.filter(alert => {
        const info = getAlertSeverityInfo(alert.score);
        if (filterSeverity !== 'ALL' && info.level !== filterSeverity) {
            return false;
        }
        if (!searchQuery.trim())
            return true;
        const q = searchQuery.toLowerCase();
        const matchesId = alert.id.toLowerCase().includes(q);
        const matchesRec = alert.recommendation.toLowerCase().includes(q);
        const matchesFlags = alert.anomalyFlags.some(f => f.toLowerCase().includes(q));
        return matchesId || matchesRec || matchesFlags;
    });
    // Relative Time Helper
    const getRelativeTime = (timestamp) => {
        const diffSec = Math.floor((Date.now() - timestamp.getTime()) / 1000);
        if (diffSec < 15)
            return 'Just now';
        if (diffSec < 60)
            return `${diffSec}s ago`;
        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60)
            return `${diffMin}m ago`;
        const diffHour = Math.floor(diffMin / 60);
        return `${diffHour}h ago`;
    };
    // Export Telemetry as JSON/STIX
    const handleExportTelemetry = () => {
        const exportData = {
            exportTimestamp: new Date().toISOString(),
            platform: 'CYPHEX Voice Security Intelligence',
            socSession: 'SOC-ACTIVE-AUDIT',
            totalEvents: alerts.length,
            events: alerts.map(a => ({
                eventId: a.id,
                timestamp: a.timestamp.toISOString(),
                riskScore: a.score,
                verdict: getAlertSeverityInfo(a.score).badge,
                anomalyFlags: a.anomalyFlags,
                recommendation: a.recommendation,
                mitreTechnique: 'T1656 Impersonation & T1566 Phishing (Voice)',
            }))
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cyphex_telemetry_feed_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setActionSuccessMsg('Exported Telemetry Dossier (JSON)');
        setTimeout(() => setActionSuccessMsg(null), 3000);
    };
    // Synthesize Forensic Sound for Investigation Modal
    const playForensicArtifactSound = () => {
        if (isPlayingAudio) {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(() => { });
                audioContextRef.current = null;
            }
            setIsPlayingAudio(false);
            return;
        }
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = audioCtx;
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            const biquad = audioCtx.createBiquadFilter();
            // Telephony bandpass with metallic high-frequency glitch
            biquad.type = 'bandpass';
            biquad.frequency.setValueAtTime(1450, audioCtx.currentTime);
            biquad.Q.setValueAtTime(3.5, audioCtx.currentTime);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.3);
            osc.frequency.exponentialRampToValueAtTime(310, audioCtx.currentTime + 0.8);
            osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 1.2);
            gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.0);
            osc.connect(biquad);
            biquad.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            osc.start();
            setIsPlayingAudio(true);
            osc.stop(audioCtx.currentTime + 2.0);
            osc.onended = () => {
                setIsPlayingAudio(false);
            };
        }
        catch (e) {
            setIsPlayingAudio(false);
        }
    };
    const handleMitigationAction = (actionName) => {
        setActionSuccessMsg(`Action Executed: ${actionName}`);
        setTimeout(() => setActionSuccessMsg(null), 3500);
    };
    return (_jsxs("div", { className: "premium-card p-5 h-full flex flex-col relative overflow-hidden", children: [_jsxs("div", { className: "flex flex-wrap justify-between items-center gap-2 mb-3 pb-2.5 border-b border-white/[0.06]", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-6 h-6 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center", children: _jsx(Bell, { className: "w-3.5 h-3.5 text-cyan-400" }) }), _jsx("div", { children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("h3", { className: "text-xs font-bold tracking-wider uppercase text-slate-200 font-mono", children: "Incident Telemetry Feed" }), _jsxs("span", { className: "inline-flex items-center gap-1 text-[9px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.2 rounded", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" }), "STREAM ACTIVE"] })] }) })] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [onAddSimulatedAlert && (_jsxs("button", { onClick: onAddSimulatedAlert, className: "text-[10px] font-mono text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-950 border border-amber-500/30 px-2 py-1 rounded transition flex items-center gap-1", title: "Inject simulated anomaly alert", children: [_jsx(Zap, { className: "w-2.5 h-2.5 text-amber-400" }), _jsx("span", { children: "Simulate" })] })), _jsxs("button", { onClick: handleExportTelemetry, className: "text-[10px] font-mono text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-2 py-1 rounded transition flex items-center gap-1", title: "Export forensic incident feed as STIX/JSON", children: [_jsx(Download, { className: "w-2.5 h-2.5 text-slate-400" }), _jsx("span", { children: "Export" })] }), onClearAlerts && alerts.length > 0 && (_jsx("button", { onClick: onClearAlerts, className: "text-[10px] font-mono text-slate-400 hover:text-red-300 bg-white/[0.04] hover:bg-red-950/40 border border-white/[0.08] hover:border-red-500/30 p-1 rounded transition", title: "Clear Incident Feed", children: _jsx(Trash2, { className: "w-3 h-3" }) }))] })] }), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 mb-3", children: [_jsx("div", { className: "flex items-center gap-1 bg-white/[0.02] p-0.5 rounded-lg border border-white/[0.06]", children: ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => {
                            const isActive = filterSeverity === sev;
                            let activeClass = 'bg-white/10 text-white font-bold shadow-sm';
                            if (sev === 'CRITICAL' && isActive)
                                activeClass = 'bg-red-500 text-white font-bold';
                            if (sev === 'HIGH' && isActive)
                                activeClass = 'bg-orange-500 text-white font-bold';
                            if (sev === 'MEDIUM' && isActive)
                                activeClass = 'bg-cyan-500 text-slate-950 font-bold';
                            return (_jsx("button", { onClick: () => setFilterSeverity(sev), className: `px-2 py-0.5 rounded text-[9px] font-mono font-medium transition ${isActive ? activeClass : 'text-slate-400 hover:text-slate-200'}`, children: sev }, sev));
                        }) }), _jsxs("div", { className: "relative flex items-center flex-grow max-w-[200px]", children: [_jsx(Search, { className: "w-3 h-3 text-slate-500 absolute left-2 pointer-events-none" }), _jsx("input", { type: "text", placeholder: "Search anomaly flag...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "w-full bg-white/[0.02] border border-white/[0.06] rounded pl-6 pr-2 py-0.5 text-[10px] text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-white/20 transition" })] })] }), actionSuccessMsg && (_jsxs("div", { className: "mb-2 p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono flex items-center gap-2 animate-fadeIn", children: [_jsx(CheckCircle2, { className: "w-3.5 h-3.5 text-emerald-400 shrink-0" }), _jsx("span", { children: actionSuccessMsg })] })), _jsx("div", { ref: scrollRef, className: "flex-grow overflow-y-auto space-y-2 pr-1 min-h-[220px]", children: filteredAlerts.length === 0 ? (_jsxs("div", { className: "h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-2 py-8", children: [_jsx("div", { className: "w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-center", children: _jsx(ShieldCheck, { className: "w-5 h-5 text-emerald-400" }) }), _jsx("span", { className: "font-mono text-xs font-medium text-slate-300", children: searchQuery || filterSeverity !== 'ALL'
                                ? 'No matching security anomalies found'
                                : 'Zero Active Security Threats Recorded' }), _jsx("span", { className: "text-[10px] text-[#8a8f98]", children: "Continuous biometric neural inference stream active" })] })) : (filteredAlerts.map(alert => {
                    const info = getAlertSeverityInfo(alert.score);
                    const Icon = info.Icon;
                    const percentage = Math.round(alert.score * 100);
                    return (_jsxs("div", { className: `alert-item-enter ${info.borderClass} p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] transition hover:border-white/20 group`, children: [_jsxs("div", { className: "flex justify-between items-center mb-1.5 flex-wrap gap-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `w-1.5 h-1.5 rounded-full ${info.pulseColor} animate-pulse` }), _jsx(Icon, { className: `w-3.5 h-3.5 ${info.iconColor}` }), _jsx("span", { className: "text-[10px] font-mono font-bold text-slate-300", children: alert.id }), _jsx("span", { className: `px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border ${info.badgeClass}`, children: info.badge }), _jsxs("span", { className: "text-[10px] font-mono font-bold text-white bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.08]", children: [percentage, "% RISK"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-[10px] font-mono text-[#8a8f98]", children: getRelativeTime(alert.timestamp) }), _jsxs("button", { onClick: () => setSelectedAlert(alert), className: "text-[10px] font-mono text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 px-2.5 py-0.5 rounded transition flex items-center gap-1 shadow-sm", children: [_jsx("span", { children: "Investigate" }), _jsx(ChevronRight, { className: "w-2.5 h-2.5" })] })] })] }), _jsx("div", { className: "text-xs text-slate-200 mb-2 leading-relaxed", children: alert.recommendation }), _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.04]", children: [_jsx("div", { className: "flex flex-wrap gap-1", children: alert.anomalyFlags.length > 0 ? (alert.anomalyFlags.map((flag, idx) => (_jsx("span", { className: "text-[9px] font-mono bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.07] text-slate-300 font-semibold", children: flag }, idx)))) : (_jsx("span", { className: "text-[9px] font-mono text-emerald-400", children: "NATURAL_VOCAL_DYNAMICS" })) }), _jsx("div", { className: "flex items-center gap-0.5 h-3 opacity-60 group-hover:opacity-100 transition", children: [12, 18, 8, 22, 14, 28, 10, 24, 16, 6].map((h, i) => (_jsx("div", { className: `w-0.5 rounded-full ${alert.score >= 0.8 ? 'bg-red-400' : alert.score >= 0.6 ? 'bg-orange-400' : 'bg-cyan-400'}`, style: { height: `${(h / 30) * 12}px` } }, i))) })] })] }, alert.id));
                })) }), selectedAlert && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn", children: _jsxs("div", { className: "premium-card p-6 w-full max-w-2xl border border-white/20 shadow-2xl relative flex flex-col gap-4 max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "flex justify-between items-start border-b border-white/[0.08] pb-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "text-xs font-mono font-bold text-cyan-400", children: selectedAlert.id }), _jsxs("span", { className: "text-xs font-mono text-slate-500", children: ["\u2022 ", selectedAlert.timestamp.toUTCString()] }), _jsx("span", { className: `px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border ${getAlertSeverityInfo(selectedAlert.score).badgeClass}`, children: getAlertSeverityInfo(selectedAlert.score).badge })] }), _jsx("h3", { className: "text-base font-bold text-white font-mono uppercase tracking-wide", children: "Incident Forensic Dossier" })] }), _jsx("button", { onClick: () => setSelectedAlert(null), className: "p-1 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.1] transition", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "grid grid-cols-3 gap-3", children: [_jsxs("div", { className: "p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col", children: [_jsx("span", { className: "text-[10px] font-mono text-slate-400 uppercase", children: "Composite Risk" }), _jsxs("span", { className: "text-xl font-bold font-mono text-red-400 mt-0.5", children: [Math.round(selectedAlert.score * 100), "%"] }), _jsx("span", { className: "text-[9px] text-slate-500 mt-1", children: "Multi-signal ensemble" })] }), _jsxs("div", { className: "p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col", children: [_jsx("span", { className: "text-[10px] font-mono text-slate-400 uppercase", children: "Detection Confidence" }), _jsx("span", { className: "text-xl font-bold font-mono text-emerald-400 mt-0.5", children: "99.2%" }), _jsx("span", { className: "text-[9px] text-slate-500 mt-1", children: "AASIST + Wav2Vec2" })] }), _jsxs("div", { className: "p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col", children: [_jsx("span", { className: "text-[10px] font-mono text-slate-400 uppercase", children: "MITRE Mapping" }), _jsx("span", { className: "text-xs font-bold font-mono text-cyan-300 mt-1", children: "T1656 / T1566" }), _jsx("span", { className: "text-[9px] text-slate-500 mt-1", children: "Voice Spoof Impersonation" })] })] }), _jsxs("div", { className: "p-3.5 rounded-lg bg-red-950/20 border border-red-500/30", children: [_jsx("span", { className: "text-[10px] font-mono uppercase font-bold text-red-400 block mb-1", children: "Automated SOC Risk Assessment:" }), _jsx("p", { className: "text-xs text-slate-200 leading-relaxed font-sans", children: selectedAlert.recommendation })] }), _jsxs("div", { children: [_jsxs("h4", { className: "text-[11px] font-mono uppercase text-slate-400 font-bold mb-2 tracking-wider flex items-center gap-1.5", children: [_jsx(Sliders, { className: "w-3.5 h-3.5 text-cyan-400" }), "Detected Forensic Anomaly Flags"] }), _jsx("div", { className: "flex flex-wrap gap-2", children: selectedAlert.anomalyFlags.length > 0 ? (selectedAlert.anomalyFlags.map((flag, idx) => (_jsxs("div", { className: "px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-slate-200 flex items-center gap-1.5", children: [_jsx("span", { className: "w-1.5 h-1.5 rounded-full bg-red-400" }), _jsx("span", { children: flag })] }, idx)))) : (_jsx("div", { className: "text-xs text-slate-400 italic", children: "No discrete acoustic anomalies tagged." })) })] }), _jsxs("div", { className: "p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: playForensicArtifactSound, className: `p-2 rounded-lg border transition ${isPlayingAudio
                                                ? 'bg-red-500 text-white border-red-400 shadow-[0_0_10px_#ef4444]'
                                                : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900'}`, children: _jsx(Volume2, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsx("span", { className: "text-xs font-mono font-bold text-white block", children: isPlayingAudio ? 'Auditing Forensic Artifact Waveform...' : 'Inspect Audio Evidence Sample' }), _jsx("span", { className: "text-[10px] text-slate-400 font-mono", children: "16 kHz Linear PCM \u2022 High-frequency vocoder distortion synthesis" })] })] }), _jsx("span", { className: "text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30", children: "AUDIT HASH: #B8F2" })] }), _jsxs("div", { className: "pt-2 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => handleMitigationAction('Severed SIP Trunk Connection (PBX Disconnect)'), className: "px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold uppercase tracking-wider transition shadow-sm", children: "Sever SIP Trunk" }), _jsx("button", { onClick: () => handleMitigationAction('Dispatched Out-of-Band Push Challenge to VIP Phone'), className: "px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono font-bold uppercase tracking-wider transition", children: "Push Step-Up MFA" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [onNavigateToIncidents && (_jsxs("button", { onClick: () => {
                                                setSelectedAlert(null);
                                                onNavigateToIncidents();
                                            }, className: "px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-1.5", children: [_jsx("span", { children: "Open in Incidents Desk" }), _jsx(ExternalLink, { className: "w-3.5 h-3.5" })] })), _jsx("button", { onClick: () => setSelectedAlert(null), className: "px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-mono transition", children: "Close Dossier" })] })] })] }) }))] }));
};
export default AlertPanel;
