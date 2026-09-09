import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { BarChart3, TrendingUp, ShieldCheck, ShieldAlert, Activity, Zap, Layers, Globe, Download } from 'lucide-react';
export const AnalyticsTelemetryView = () => {
    const [timeRange, setTimeRange] = useState('7D');
    const [downloadedNotice, setDownloadedNotice] = useState(null);
    const stats = {
        '24H': {
            totalCalls: '2,148',
            growth: '+8.2%',
            threats: '46',
            threatPct: '2.1%',
            p99Latency: '172 ms',
            fraudPrevented: '$2.8M',
            hifiGan: 52,
            diffusion: 22,
            rvc: 16,
            legacy: 10,
        },
        '7D': {
            totalCalls: '14,892',
            growth: '+18.4%',
            threats: '342',
            threatPct: '2.3%',
            p99Latency: '184 ms',
            fraudPrevented: '$18.6M',
            hifiGan: 48,
            diffusion: 24,
            rvc: 18,
            legacy: 10,
        },
        '30D': {
            totalCalls: '64,120',
            growth: '+24.1%',
            threats: '1,420',
            threatPct: '2.2%',
            p99Latency: '189 ms',
            fraudPrevented: '$76.4M',
            hifiGan: 45,
            diffusion: 27,
            rvc: 20,
            legacy: 8,
        }
    }[timeRange];
    const handleExportAnalytics = () => {
        const report = {
            reportType: 'CYPHEX Neural Engine Analytics & Telemetry Executive Digest',
            timeframe: timeRange,
            generatedAt: new Date().toISOString(),
            kpis: {
                totalCallsAnalyzed: stats.totalCalls,
                deepfakesIntercepted: stats.threats,
                interceptRate: stats.threatPct,
                p99LatencySLA: stats.p99Latency,
                preventedFraudVolume: stats.fraudPrevented,
            },
            synthesisVectors: {
                hifiGanVocoder: `${stats.hifiGan}%`,
                diffusionVocoders: `${stats.diffusion}%`,
                rvcRealTimeConversion: `${stats.rvc}%`,
                legacyWaveNet: `${stats.legacy}%`,
            },
            compliance: 'RBI Digital Payment Security Controls & DPDP Act 2023',
        };
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cyphex_analytics_${timeRange.toLowerCase()}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDownloadedNotice(`Exported ${timeRange} Executive Analytics Digest`);
        setTimeout(() => setDownloadedNotice(null), 3000);
    };
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "premium-card p-5 flex flex-wrap justify-between items-center gap-4", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2", children: [_jsx(BarChart3, { className: "w-5 h-5 text-cyan-400" }), "Neural Engine Analytics & Telemetry"] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Aggregated threat intelligence, synthetic voice synthesis vectors, and latency performance metrics." })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex items-center gap-1 bg-white/[0.03] p-1 rounded-lg border border-white/[0.08]", children: ['24H', '7D', '30D'].map((r) => (_jsx("button", { onClick: () => setTimeRange(r), className: `px-3 py-1 rounded-md text-xs font-mono font-medium transition ${timeRange === r ? 'bg-white/10 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'}`, children: r }, r))) }), _jsxs("button", { onClick: handleExportAnalytics, className: "vercel-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5", title: "Download Analytics Digest", children: [_jsx(Download, { className: "w-3.5 h-3.5" }), _jsx("span", { className: "hidden sm:inline", children: "Export" })] })] })] }), downloadedNotice && (_jsxs("div", { className: "p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn", children: [_jsx(ShieldCheck, { className: "w-4 h-4 text-emerald-400" }), _jsx("span", { children: downloadedNotice })] })), _jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { className: "premium-card p-4 flex flex-col gap-1", children: [_jsxs("div", { className: "flex justify-between items-center text-slate-400 text-xs", children: [_jsx("span", { className: "font-mono uppercase text-[10px]", children: "Total Calls Analyzed" }), _jsx(Activity, { className: "w-4 h-4 text-cyan-400" })] }), _jsx("div", { className: "text-2xl font-black text-white font-mono mt-1", children: stats.totalCalls }), _jsxs("div", { className: "text-[10px] text-emerald-400 flex items-center gap-1 font-mono", children: [_jsx(TrendingUp, { className: "w-3 h-3" }), " ", stats.growth, " vs previous window"] })] }), _jsxs("div", { className: "premium-card p-4 flex flex-col gap-1", children: [_jsxs("div", { className: "flex justify-between items-center text-slate-400 text-xs", children: [_jsx("span", { className: "font-mono uppercase text-[10px]", children: "Deepfakes Intercepted" }), _jsx(ShieldAlert, { className: "w-4 h-4 text-red-400" })] }), _jsx("div", { className: "text-2xl font-black text-red-400 font-mono mt-1", children: stats.threats }), _jsxs("div", { className: "text-[10px] text-red-400 flex items-center gap-1 font-mono", children: [stats.threatPct, " of incoming voice volume"] })] }), _jsxs("div", { className: "premium-card p-4 flex flex-col gap-1", children: [_jsxs("div", { className: "flex justify-between items-center text-slate-400 text-xs", children: [_jsx("span", { className: "font-mono uppercase text-[10px]", children: "P99 Latency SLA" }), _jsx(Zap, { className: "w-4 h-4 text-emerald-400" })] }), _jsx("div", { className: "text-2xl font-black text-emerald-400 font-mono mt-1", children: stats.p99Latency }), _jsx("div", { className: "text-[10px] text-emerald-400 flex items-center gap-1 font-mono", children: "Compliant (<300ms SLA Target)" })] }), _jsxs("div", { className: "premium-card p-4 flex flex-col gap-1", children: [_jsxs("div", { className: "flex justify-between items-center text-slate-400 text-xs", children: [_jsx("span", { className: "font-mono uppercase text-[10px]", children: "Prevented Fraud Volume" }), _jsx(ShieldCheck, { className: "w-4 h-4 text-cyan-400" })] }), _jsx("div", { className: "text-2xl font-black text-cyan-300 font-mono mt-1", children: stats.fraudPrevented }), _jsx("div", { className: "text-[10px] text-slate-400 font-mono", children: "Cumulative wire transfer halts" })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [_jsxs("div", { className: "premium-card p-5 flex flex-col gap-3", children: [_jsxs("div", { className: "flex justify-between items-center border-b border-white/[0.06] pb-3", children: [_jsxs("h3", { className: "text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2", children: [_jsx(Layers, { className: "w-4 h-4 text-cyan-400" }), "Observed Synthesis & Vocoder Vectors"] }), _jsx("span", { className: "text-[10px] font-mono text-slate-500", children: "Distribution %" })] }), _jsxs("div", { className: "space-y-3 pt-1", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-xs mb-1 font-mono", children: [_jsx("span", { className: "text-slate-300", children: "HiFi-GAN Vocoder (ElevenLabs / Bark)" }), _jsxs("span", { className: "text-cyan-400 font-bold", children: [stats.hifiGan, "%"] })] }), _jsx("div", { className: "w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/[0.04]", children: _jsx("div", { className: "bg-cyan-500 h-full rounded-full shadow-[0_0_8px_#06b6d4] transition-all duration-500", style: { width: `${stats.hifiGan}%` } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-xs mb-1 font-mono", children: [_jsx("span", { className: "text-slate-300", children: "Diffusion Vocoders (Grad-TTS / TorToiSe)" }), _jsxs("span", { className: "text-amber-400 font-bold", children: [stats.diffusion, "%"] })] }), _jsx("div", { className: "w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/[0.04]", children: _jsx("div", { className: "bg-amber-400 h-full rounded-full shadow-[0_0_8px_#fbbf24] transition-all duration-500", style: { width: `${stats.diffusion}%` } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-xs mb-1 font-mono", children: [_jsx("span", { className: "text-slate-300", children: "Real-Time Voice Conversion (RVC v2)" }), _jsxs("span", { className: "text-red-400 font-bold", children: [stats.rvc, "%"] })] }), _jsx("div", { className: "w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/[0.04]", children: _jsx("div", { className: "bg-red-500 h-full rounded-full shadow-[0_0_8px_#ef4444] transition-all duration-500", style: { width: `${stats.rvc}%` } }) })] }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between text-xs mb-1 font-mono", children: [_jsx("span", { className: "text-slate-300", children: "Legacy Neural Concatenation (WaveNet)" }), _jsxs("span", { className: "text-slate-400 font-bold", children: [stats.legacy, "%"] })] }), _jsx("div", { className: "w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/[0.04]", children: _jsx("div", { className: "bg-slate-600 h-full rounded-full transition-all duration-500", style: { width: `${stats.legacy}%` } }) })] })] })] }), _jsxs("div", { className: "premium-card p-5 flex flex-col gap-3", children: [_jsxs("div", { className: "flex justify-between items-center border-b border-white/[0.06] pb-3", children: [_jsxs("h3", { className: "text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2", children: [_jsx(Globe, { className: "w-4 h-4 text-emerald-400" }), "Multilingual Indian Speech Defense Coverage"] }), _jsx("span", { className: "text-[10px] font-mono text-emerald-400", children: "AI4BHARAT BACKBONE" })] }), _jsxs("div", { className: "space-y-3 pt-1 text-xs", children: [_jsxs("div", { className: "flex justify-between items-center p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.06]", children: [_jsx("span", { className: "text-slate-200 font-medium", children: "Hinglish / Indian English" }), _jsx("span", { className: "text-cyan-300 font-mono font-bold", children: "54.2% Volume \u2022 99.1% Acc" })] }), _jsxs("div", { className: "flex justify-between items-center p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.06]", children: [_jsx("span", { className: "text-slate-200 font-medium", children: "Hindi (Standard & Regional Accents)" }), _jsx("span", { className: "text-cyan-300 font-mono font-bold", children: "22.8% Volume \u2022 98.6% Acc" })] }), _jsxs("div", { className: "flex justify-between items-center p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.06]", children: [_jsx("span", { className: "text-slate-200 font-medium", children: "Tamil & Telugu (South Indian Telecom)" }), _jsx("span", { className: "text-cyan-300 font-mono font-bold", children: "14.1% Volume \u2022 97.9% Acc" })] }), _jsxs("div", { className: "flex justify-between items-center p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.06]", children: [_jsx("span", { className: "text-slate-200 font-medium", children: "Bengali, Marathi, Gujarati" }), _jsx("span", { className: "text-cyan-300 font-mono font-bold", children: "8.9% Volume \u2022 98.2% Acc" })] })] })] })] })] }));
};
export default AnalyticsTelemetryView;
