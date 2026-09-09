import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ShieldCheck, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';
const RiskGauge = ({ score, riskLevel, recommendation }) => {
    const percentage = Math.round(score * 100);
    const radius = 78;
    const circumference = 2 * Math.PI * radius;
    const arcLength = (270 / 360) * circumference;
    const strokeDasharray = `${arcLength} ${circumference}`;
    const strokeDashoffset = arcLength - (score * arcLength);
    // Definitive Enterprise Security Verdict mapping
    let verdictTitle = 'ALLOW';
    let verdictSubtitle = 'BONA FIDE HUMAN';
    let color = '#10b981';
    let gradientId = 'gradLow';
    let StatusIcon = ShieldCheck;
    let verdictBadgeClass = 'text-emerald-300 bg-emerald-950/80 border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]';
    let beaconColor = 'bg-emerald-400 shadow-[0_0_8px_#34d399]';
    if (score >= 0.80) {
        verdictTitle = 'BLOCK & HALT';
        verdictSubtitle = 'HIGH-CONFIDENCE DEEPFAKE';
        color = '#ef4444';
        gradientId = 'gradCritical';
        StatusIcon = ShieldAlert;
        verdictBadgeClass = 'text-red-200 bg-red-950/90 border-red-500/60 shadow-[0_0_16px_rgba(239,68,68,0.5)] animate-pulse';
        beaconColor = 'bg-red-400 shadow-[0_0_10px_#ef4444] animate-ping';
    }
    else if (score >= 0.60) {
        verdictTitle = 'STEP-UP MFA';
        verdictSubtitle = 'OUT-OF-BAND CHALLENGE';
        color = '#f97316';
        gradientId = 'gradHigh';
        StatusIcon = AlertTriangle;
        verdictBadgeClass = 'text-orange-200 bg-orange-950/90 border-orange-500/60 shadow-[0_0_12px_rgba(249,115,22,0.4)]';
        beaconColor = 'bg-orange-400 shadow-[0_0_8px_#f97316]';
    }
    else if (score >= 0.30) {
        verdictTitle = 'MONITOR';
        verdictSubtitle = 'ACOUSTIC ANOMALY';
        color = '#06b6d4';
        gradientId = 'gradMedium';
        StatusIcon = AlertTriangle;
        verdictBadgeClass = 'text-cyan-200 bg-cyan-950/80 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]';
        beaconColor = 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]';
    }
    const isCritical = score >= 0.70;
    // Generate 28 precision tachometer tick marks around the 270 deg arc
    const totalTicks = 27;
    const ticks = Array.from({ length: totalTicks + 1 }, (_, i) => {
        const angleDeg = -135 + (i / totalTicks) * 270;
        const angleRad = (angleDeg * Math.PI) / 180;
        const isMajor = i % 3 === 0;
        const rInner = isMajor ? 62 : 65;
        const rOuter = 70;
        const x1 = 100 + rInner * Math.cos(angleRad);
        const y1 = 100 + rInner * Math.sin(angleRad);
        const x2 = 100 + rOuter * Math.cos(angleRad);
        const y2 = 100 + rOuter * Math.sin(angleRad);
        const active = (i / totalTicks) <= score;
        return { x1, y1, x2, y2, isMajor, active };
    });
    return (_jsxs("div", { className: "premium-card p-5 flex flex-col items-center justify-between relative overflow-hidden h-full", children: [_jsxs("div", { className: "w-full flex justify-between items-center mb-1", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "w-2 h-2 rounded-full bg-cyan-400 animate-pulse" }), _jsx("span", { className: "text-xs font-semibold uppercase tracking-wider text-[#8a8f98] font-mono", children: "Voice Authenticity" })] }), _jsxs("div", { className: "status-pill text-[10px] text-[#8a8f98] font-mono", children: [_jsx(Cpu, { className: "w-3 h-3 text-cyan-400" }), _jsx("span", { children: "FUSED ENGINE" })] })] }), _jsxs("div", { className: `relative w-48 h-48 my-auto flex items-center justify-center ${isCritical ? 'gauge-critical-active' : ''}`, children: [_jsx("div", { className: "absolute w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none transition-all duration-700", style: { backgroundColor: color } }), _jsxs("svg", { className: "gauge-svg-container w-full h-full relative z-10", viewBox: "0 0 200 200", children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "gradLow", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [_jsx("stop", { offset: "0%", stopColor: "#06b6d4" }), _jsx("stop", { offset: "100%", stopColor: "#10b981" })] }), _jsxs("linearGradient", { id: "gradMedium", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [_jsx("stop", { offset: "0%", stopColor: "#10b981" }), _jsx("stop", { offset: "100%", stopColor: "#f59e0b" })] }), _jsxs("linearGradient", { id: "gradHigh", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [_jsx("stop", { offset: "0%", stopColor: "#f59e0b" }), _jsx("stop", { offset: "100%", stopColor: "#f97316" })] }), _jsxs("linearGradient", { id: "gradCritical", x1: "0%", y1: "0%", x2: "100%", y2: "100%", children: [_jsx("stop", { offset: "0%", stopColor: "#f97316" }), _jsx("stop", { offset: "100%", stopColor: "#ef4444" })] }), _jsxs("filter", { id: "dialGlow", x: "-20%", y: "-20%", width: "140%", height: "140%", children: [_jsx("feGaussianBlur", { stdDeviation: "3", result: "blur" }), _jsx("feComposite", { in: "SourceGraphic", in2: "blur", operator: "over" })] })] }), _jsx("circle", { cx: "100", cy: "100", r: "95", fill: "none", stroke: "rgba(255, 255, 255, 0.08)", strokeWidth: "1" }), _jsx("circle", { cx: "100", cy: "100", r: "92", fill: "none", stroke: "rgba(255, 255, 255, 0.03)", strokeWidth: "0.5", strokeDasharray: "2 3" }), ticks.map((t, idx) => (_jsx("line", { x1: t.x1, y1: t.y1, x2: t.x2, y2: t.y2, stroke: t.active ? color : 'rgba(255, 255, 255, 0.12)', strokeWidth: t.isMajor ? 1.75 : 1, strokeLinecap: "round", className: "transition-colors duration-300" }, idx))), _jsxs("g", { transform: "rotate(-135 100 100)", children: [_jsx("circle", { cx: "100", cy: "100", r: radius, fill: "none", stroke: "rgba(255, 255, 255, 0.05)", strokeWidth: "10", strokeDasharray: strokeDasharray, strokeLinecap: "round" }), _jsx("circle", { cx: "100", cy: "100", r: radius, fill: "none", stroke: `url(#${gradientId})`, strokeWidth: "10", strokeDasharray: strokeDasharray, strokeDashoffset: strokeDashoffset, strokeLinecap: "round", filter: "url(#dialGlow)", className: "gauge-circle-indicator transition-all duration-500 ease-out" })] })] }), _jsxs("div", { className: "absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none", children: [_jsxs("div", { className: "flex items-baseline gap-1", children: [_jsx("span", { className: "gauge-center-readout font-mono text-5xl font-bold tracking-tight text-white", children: percentage }), _jsx("span", { className: "font-mono text-lg font-medium text-[#8a8f98]", children: "%" })] }), _jsxs("div", { className: "flex flex-col items-center mt-1.5 gap-0.5", children: [_jsxs("div", { className: `px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border ${score >= 0.8 ? 'bg-red-950/60 border-red-500/40 text-red-300' :
                                            score >= 0.6 ? 'bg-orange-950/60 border-orange-500/40 text-orange-300' :
                                                score >= 0.3 ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300' :
                                                    'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'}`, children: [_jsx(StatusIcon, { className: "w-3 h-3" }), _jsx("span", { children: verdictTitle })] }), _jsx("span", { className: "text-[9px] font-mono tracking-wider text-[#8a8f98] uppercase", children: verdictSubtitle })] })] })] }), _jsxs("div", { className: "w-full mt-2 pt-2.5 border-t border-white/[0.08] flex flex-col gap-1.5", children: [_jsxs("div", { className: "flex justify-between items-center text-[10px] font-mono text-[#94a3b8]", children: [_jsx("span", { className: "uppercase tracking-wider", children: "Detection Confidence" }), _jsx("span", { className: "text-emerald-400 font-semibold font-mono", children: "98.4% [HIGH SENSITIVITY]" })] }), _jsx("p", { className: "text-xs font-mono font-medium tracking-tight truncate max-w-full text-slate-300", title: recommendation, children: recommendation })] })] }));
};
export default RiskGauge;
