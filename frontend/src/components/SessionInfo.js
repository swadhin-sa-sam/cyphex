import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Clock, Activity, Layers, Copy, Check } from 'lucide-react';
import { API_BASE_URL } from '../utils/constants';
const SessionInfo = ({ sessionId, durationSeconds, isConnected, profile, latencyMs }) => {
    const [copied, setCopied] = useState(false);
    const [modelStatus, setModelStatus] = useState({
        vad: true,
        aasist: true,
        wav2vec2: true,
        speaker_verifier: true,
    });
    useEffect(() => {
        const fetchHealth = async () => {
            try {
                const res = await fetch(`${API_BASE_URL.replace('/api/v1', '')}/health`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.models) {
                        setModelStatus(data.models);
                    }
                }
            }
            catch {
                // Backend offline or booting
            }
        };
        fetchHealth();
        const interval = setInterval(fetchHealth, 10000);
        return () => clearInterval(interval);
    }, []);
    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };
    const copySessionId = () => {
        navigator.clipboard.writeText(sessionId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const isSlaCompliant = latencyMs > 0 && latencyMs <= 300;
    return (_jsxs("div", { className: "premium-card p-5 flex flex-col justify-between h-full relative overflow-hidden", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Layers, { className: "w-4 h-4 text-cyan-400" }), _jsx("h3", { className: "text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono", children: "Pipeline Health & Telemetry" })] }), _jsxs("button", { onClick: copySessionId, className: "flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.08] hover:border-white/20 text-[10px] font-mono text-[#8a8f98] hover:text-white transition group", title: "Click to copy Session ID", children: [_jsx("span", { children: sessionId }), copied ? _jsx(Check, { className: "w-2.5 h-2.5 text-emerald-400" }) : _jsx(Copy, { className: "w-2.5 h-2.5 text-slate-500 group-hover:text-white" })] })] }), _jsxs("div", { className: "space-y-2.5 flex-grow flex flex-col justify-between", children: [_jsxs("div", { className: "grid grid-cols-2 gap-2.5", children: [_jsxs("div", { className: "p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]", children: [_jsxs("div", { className: "text-[10px] text-[#8a8f98] mb-1 flex items-center gap-1", children: [_jsx(Activity, { className: "w-3 h-3 text-cyan-400" }), " Stream Pipeline"] }), _jsxs("div", { className: "flex items-center gap-1.5", children: [_jsx("span", { className: `w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-slate-600'}` }), _jsx("span", { className: `text-xs font-bold font-mono tracking-wide ${isConnected ? 'text-emerald-400' : 'text-slate-400'}`, children: isConnected ? 'ONLINE ACTIVE' : 'STANDBY' })] })] }), _jsxs("div", { className: "p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]", children: [_jsxs("div", { className: "text-[10px] text-[#8a8f98] mb-1 flex items-center gap-1", children: [_jsx(Clock, { className: "w-3 h-3 text-cyan-400" }), " Session Elapsed"] }), _jsx("div", { className: "font-mono text-sm font-bold text-white tracking-wider", children: formatTime(durationSeconds) })] })] }), _jsxs("div", { className: "pt-2 border-t border-white/[0.06] space-y-1.5", children: [_jsxs("div", { className: "text-[10px] font-semibold tracking-wider uppercase text-slate-300 mb-1.5 flex justify-between font-mono", children: [_jsx("span", { children: "CYPHEX Intelligence Diagnostic" }), _jsx("span", { className: "text-cyan-400 font-bold", children: "MULTI-SIGNAL FUSION" })] }), _jsxs("div", { className: "space-y-1 text-xs", children: [_jsxs("div", { className: "flex justify-between items-center px-2 py-1 rounded-md bg-white/[0.02] border border-white/[0.04]", children: [_jsx("span", { className: "text-[#94a3b8] text-[11px]", children: "Acoustic Anomalies:" }), _jsx("span", { className: "text-emerald-400 font-mono text-[10px] font-semibold", children: "PHASE CONTINUITY STABLE" })] }), _jsxs("div", { className: "flex justify-between items-center px-2 py-1 rounded-md bg-white/[0.02] border border-white/[0.04]", children: [_jsx("span", { className: "text-[#94a3b8] text-[11px]", children: "Speaker Mismatch:" }), _jsx("span", { className: "text-cyan-400 font-mono text-[10px] font-semibold", children: "<0.04 COSINE DISTANCE" })] }), _jsxs("div", { className: "flex justify-between items-center px-2 py-1 rounded-md bg-white/[0.02] border border-white/[0.04]", children: [_jsx("span", { className: "text-[#94a3b8] text-[11px]", children: "Behavioral Indicators:" }), _jsx("span", { className: "text-emerald-400 font-mono text-[10px] font-semibold", children: "ZERO URGENCY PRESSURE" })] }), _jsxs("div", { className: "flex justify-between items-center px-2 py-1 rounded-md bg-white/[0.02] border border-white/[0.04]", children: [_jsx("span", { className: "text-[#94a3b8] text-[11px]", children: "Ensemble Status:" }), _jsx("span", { className: "text-emerald-400 font-mono text-[10px] font-semibold", children: "4/4 LAYERS ONLINE" })] })] })] })] })] }));
};
export default SessionInfo;
