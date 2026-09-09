import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { PhoneCall, Play, Square, Download, Filter, Search, User, CheckCircle2, X, Volume2, Radio, Sliders } from 'lucide-react';
const MOCK_CALLS = [
    {
        id: 'CALL-89421',
        caller: '+91 98201 44821 (Spoofed)',
        target: 'Treasury Desk (Vance J.)',
        timestamp: '2 mins ago',
        duration: '01:45',
        riskScore: 94,
        verdict: 'BLOCKED',
        attackType: 'Diffusion Voice Clone (HiFi-GAN)',
        audioDuration: 105,
        language: 'English (Indian Accent)',
        jitter: '0.12% (Robotic Flatness)',
        shimmer: '0.45% (Over-Smoothed)',
        hnr: '8.2 dB (High Distortion)',
    },
    {
        id: 'CALL-89420',
        caller: '+1 415 892 1102',
        target: 'Accounts Payable',
        timestamp: '14 mins ago',
        duration: '03:12',
        riskScore: 78,
        verdict: 'MFA_REQUIRED',
        attackType: 'FastSpeech2 + WaveGlow',
        audioDuration: 192,
        language: 'English (US)',
        jitter: '0.24% (Low Variance)',
        shimmer: '0.62% (Synthetic Uniform)',
        hnr: '12.4 dB',
    },
    {
        id: 'CALL-89419',
        caller: '+91 91672 33410',
        target: 'Customer Support (VIP)',
        timestamp: '38 mins ago',
        duration: '02:08',
        riskScore: 18,
        verdict: 'ALLOW',
        audioDuration: 128,
        language: 'Hindi / English (Hinglish)',
        jitter: '0.84% (Natural Phonation)',
        shimmer: '2.40% (Natural Breath)',
        hnr: '21.5 dB (Authentic Human)',
    },
    {
        id: 'CALL-89418',
        caller: '+44 20 7946 0912',
        target: 'Board Secretariat',
        timestamp: '1 hr ago',
        duration: '04:30',
        riskScore: 88,
        verdict: 'BLOCKED',
        attackType: 'Real-Time Voice Conversion (RVC v2)',
        audioDuration: 270,
        language: 'English (UK)',
        jitter: '0.18% (Conversion Artifact)',
        shimmer: '0.51% (Over-Smoothed)',
        hnr: '9.8 dB',
    },
    {
        id: 'CALL-89417',
        caller: '+91 80 4112 9000',
        target: 'IT Helpdesk',
        timestamp: '2 hrs ago',
        duration: '01:15',
        riskScore: 42,
        verdict: 'MONITOR',
        audioDuration: 75,
        language: 'Kannada / English',
        jitter: '0.65% (Borderline)',
        shimmer: '1.80% (Acceptable)',
        hnr: '16.2 dB',
    },
    {
        id: 'CALL-89416',
        caller: '+91 98110 55678',
        target: 'Private Wealth Management',
        timestamp: '3 hrs ago',
        duration: '05:40',
        riskScore: 12,
        verdict: 'ALLOW',
        audioDuration: 340,
        language: 'English (Indian Accent)',
        jitter: '0.92% (Natural Human)',
        shimmer: '2.85% (Natural Human)',
        hnr: '23.8 dB (High Clarity)',
    },
];
export const CallsManagerView = () => {
    const [calls] = useState(MOCK_CALLS);
    const [search, setSearch] = useState('');
    const [filterVerdict, setFilterVerdict] = useState('ALL');
    const [playingCallId, setPlayingCallId] = useState(null);
    const [selectedCall, setSelectedCall] = useState(null);
    const [toastMsg, setToastMsg] = useState(null);
    const audioCtxRef = useRef(null);
    const oscRef = useRef(null);
    const stopPlayback = () => {
        if (oscRef.current) {
            try {
                oscRef.current.stop();
                oscRef.current.disconnect();
            }
            catch { }
            oscRef.current = null;
        }
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
            audioCtxRef.current.close().catch(() => { });
            audioCtxRef.current = null;
        }
        setPlayingCallId(null);
    };
    useEffect(() => {
        return () => {
            stopPlayback();
        };
    }, []);
    const handleTogglePlay = (call) => {
        if (playingCallId === call.id) {
            stopPlayback();
            return;
        }
        stopPlayback();
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            audioCtxRef.current = audioCtx;
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();
            // Telephony bandpass (300Hz - 3400Hz)
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
            filter.Q.setValueAtTime(1.8, audioCtx.currentTime);
            const isSynthetic = call.verdict === 'BLOCKED' || call.riskScore >= 75;
            if (isSynthetic) {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(140, audioCtx.currentTime);
                osc.frequency.setValueAtTime(190, audioCtx.currentTime + 0.4);
                osc.frequency.setValueAtTime(130, audioCtx.currentTime + 0.9);
                osc.frequency.setValueAtTime(260, audioCtx.currentTime + 1.4);
            }
            else {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(120, audioCtx.currentTime);
                osc.frequency.linearRampToValueAtTime(135, audioCtx.currentTime + 0.5);
                osc.frequency.linearRampToValueAtTime(115, audioCtx.currentTime + 1.2);
            }
            gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 4.0);
            osc.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            osc.start();
            oscRef.current = osc;
            setPlayingCallId(call.id);
            osc.onended = () => {
                setPlayingCallId(null);
            };
            setTimeout(() => {
                if (playingCallId === call.id) {
                    stopPlayback();
                }
            }, 4000);
        }
        catch (e) {
            console.warn("Audio playback notice:", e);
            setPlayingCallId(null);
        }
    };
    const handleDownloadEvidence = (call) => {
        const evidencePack = {
            evidenceId: `EVD-${call.id}`,
            callSessionId: call.id,
            timestamp: new Date().toISOString(),
            originCaller: call.caller,
            targetExtension: call.target,
            audioDuration: `${call.audioDuration} seconds`,
            languageLocale: call.language,
            forensicVerification: {
                riskScore: `${call.riskScore}%`,
                securityVerdict: call.verdict,
                synthesisMarker: call.attackType || 'Natural Human Phonation',
                acousticProsody: {
                    jitter: call.jitter || '0.75%',
                    shimmer: call.shimmer || '2.10%',
                    hnr: call.hnr || '19.4 dB',
                },
                cryptographicHash: 'SHA-256(7f8a92b3c4d5e6f1029384756)',
                mitreTechnique: 'T1656 Impersonation / Deepfake Voice Cloning',
            },
            auditCompliance: 'RBI Digital Payment Security & DPDP Act 2023 Compliant',
        };
        const blob = new Blob([JSON.stringify(evidencePack, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cyphex_evidence_${call.id}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setToastMsg(`Exported forensic evidence pack for ${call.id}`);
        setTimeout(() => setToastMsg(null), 3000);
    };
    const filteredCalls = calls.filter((c) => {
        const matchesSearch = c.caller.toLowerCase().includes(search.toLowerCase()) ||
            c.target.toLowerCase().includes(search.toLowerCase()) ||
            c.id.toLowerCase().includes(search.toLowerCase());
        const matchesVerdict = filterVerdict === 'ALL' || c.verdict === filterVerdict;
        return matchesSearch && matchesVerdict;
    });
    const getVerdictBadge = (verdict) => {
        switch (verdict) {
            case 'BLOCKED':
                return 'bg-red-950/80 text-red-300 border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.2)]';
            case 'MFA_REQUIRED':
                return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
            case 'MONITOR':
                return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40';
            case 'ALLOW':
                return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
        }
    };
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "premium-card p-5 flex flex-wrap justify-between items-center gap-4", children: [_jsxs("div", { children: [_jsxs("h2", { className: "text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2", children: [_jsx(PhoneCall, { className: "w-5 h-5 text-cyan-400" }), "Interception History & Call Audits"] }), _jsx("p", { className: "text-xs text-slate-400 mt-1", children: "Historical call telemetry, neural risk verdicts, and compliance recordings archive." })] }), _jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [_jsxs("div", { className: "relative", children: [_jsx(Search, { className: "w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" }), _jsx("input", { type: "text", placeholder: "Search call ID, caller, target...", value: search, onChange: (e) => setSearch(e.target.value), className: "bg-white/[0.03] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-white/20 w-64 font-mono transition" })] }), _jsxs("div", { className: "flex items-center gap-1 bg-white/[0.03] p-1 rounded-lg border border-white/[0.08] text-xs", children: [_jsxs("span", { className: "text-[10px] font-mono uppercase font-bold text-slate-400 px-2 py-1 flex items-center gap-1", children: [_jsx(Filter, { className: "w-3 h-3 text-cyan-400" }), "VERDICT:"] }), ['ALL', 'BLOCKED', 'MFA_REQUIRED', 'MONITOR', 'ALLOW'].map((v) => {
                                        const isActive = filterVerdict === v;
                                        let activeClass = 'bg-white/10 text-white font-semibold shadow-sm';
                                        if (v === 'BLOCKED' && isActive)
                                            activeClass = 'bg-red-500 text-white';
                                        if (v === 'MFA_REQUIRED' && isActive)
                                            activeClass = 'bg-amber-500 text-slate-950 font-bold';
                                        if (v === 'ALLOW' && isActive)
                                            activeClass = 'bg-emerald-500 text-slate-950 font-bold';
                                        return (_jsx("button", { onClick: () => setFilterVerdict(v), className: `px-2.5 py-1 rounded-md text-[10px] font-mono font-medium uppercase transition-all ${isActive ? activeClass : 'text-slate-400 hover:text-white'}`, children: v }, v));
                                    })] })] })] }), playingCallId && (_jsxs("div", { className: "p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 flex items-center justify-between animate-fadeIn text-xs font-mono", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Radio, { className: "w-4 h-4 text-cyan-400 animate-pulse" }), _jsxs("span", { children: ["Auditing Intercepted Telephony Channel: ", _jsx("strong", { children: playingCallId })] }), _jsx("div", { className: "flex items-center gap-1", children: [12, 24, 18, 28, 14, 20, 10].map((h, i) => (_jsx("div", { className: "w-1 bg-cyan-400 rounded animate-pulse", style: { height: `${h}px` } }, i))) })] }), _jsx("button", { onClick: stopPlayback, className: "px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold", children: "Stop Audio" })] })), toastMsg && (_jsxs("div", { className: "p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn", children: [_jsx(CheckCircle2, { className: "w-4 h-4 text-emerald-400" }), _jsx("span", { children: toastMsg })] })), _jsx("div", { className: "premium-card p-4 overflow-x-auto", children: _jsxs("table", { className: "w-full text-left border-collapse", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-white/[0.06] text-[10px] font-mono uppercase text-slate-400 tracking-wider", children: [_jsx("th", { className: "pb-3 pl-2", children: "Session ID" }), _jsx("th", { className: "pb-3", children: "Origin Caller" }), _jsx("th", { className: "pb-3", children: "Target Extension" }), _jsx("th", { className: "pb-3", children: "Language / Accent" }), _jsx("th", { className: "pb-3", children: "Risk Score" }), _jsx("th", { className: "pb-3", children: "Security Verdict" }), _jsx("th", { className: "pb-3", children: "Synthesis Marker" }), _jsx("th", { className: "pb-3 text-right pr-2", children: "Forensic Actions" })] }) }), _jsx("tbody", { className: "divide-y divide-white/[0.04] text-xs", children: filteredCalls.map((call) => (_jsxs("tr", { className: "hover:bg-slate-950/40 transition-colors group", children: [_jsx("td", { className: "py-3.5 pl-2 font-mono text-cyan-300 font-semibold", children: _jsx("button", { onClick: () => setSelectedCall(call), className: "hover:underline text-left", children: call.id }) }), _jsx("td", { className: "py-3.5 font-medium text-slate-200", children: call.caller }), _jsxs("td", { className: "py-3.5 text-slate-300 flex items-center gap-1.5", children: [_jsx(User, { className: "w-3.5 h-3.5 text-slate-500" }), call.target] }), _jsx("td", { className: "py-3.5 text-slate-400 font-mono text-[11px]", children: call.language }), _jsx("td", { className: "py-3.5 font-mono font-bold", children: _jsxs("span", { className: `text-sm ${call.riskScore >= 80 ? 'text-red-400' :
                                                call.riskScore >= 60 ? 'text-amber-400' :
                                                    call.riskScore >= 30 ? 'text-cyan-400' : 'text-emerald-400'}`, children: [call.riskScore, "%"] }) }), _jsx("td", { className: "py-3.5", children: _jsxs("span", { className: `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-black border tracking-wider uppercase shadow-sm ${getVerdictBadge(call.verdict)}`, children: [_jsx("span", { className: `w-1.5 h-1.5 rounded-full ${call.verdict === 'BLOCKED' ? 'bg-red-400 shadow-[0_0_6px_#ef4444] animate-ping' :
                                                        call.verdict === 'MFA_REQUIRED' ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]' :
                                                            call.verdict === 'MONITOR' ? 'bg-cyan-400 shadow-[0_0_6px_#06b6d4]' :
                                                                'bg-emerald-400 shadow-[0_0_6px_#10b981]'}` }), _jsx("span", { children: call.verdict.replace('_', ' ') })] }) }), _jsx("td", { className: "py-3.5 text-[11px] text-slate-400 font-mono", children: call.attackType ? (_jsx("span", { className: "text-red-300 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/20", children: call.attackType })) : (_jsx("span", { className: "text-emerald-400", children: "Natural Human Dynamic" })) }), _jsx("td", { className: "py-3.5 text-right pr-2", children: _jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx("button", { onClick: () => handleTogglePlay(call), className: `p-1.5 rounded-lg border transition ${playingCallId === call.id
                                                        ? 'bg-red-500 text-white border-red-400 shadow-[0_0_8px_#ef4444]'
                                                        : 'bg-slate-900 border-white/[0.08] text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40'}`, title: playingCallId === call.id ? "Halt playback" : "Auditory telemetry preview", children: playingCallId === call.id ? _jsx(Square, { className: "w-3.5 h-3.5" }) : _jsx(Play, { className: "w-3.5 h-3.5" }) }), _jsx("button", { onClick: () => setSelectedCall(call), className: "p-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-slate-300 hover:text-white hover:border-white/20 transition", title: "Inspect Call Telemetry Dossier", children: _jsx(Sliders, { className: "w-3.5 h-3.5" }) }), _jsx("button", { onClick: () => handleDownloadEvidence(call), className: "p-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/20 transition", title: "Download Forensic Evidence Pack", children: _jsx(Download, { className: "w-3.5 h-3.5" }) })] }) })] }, call.id))) })] }) }), selectedCall && (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn", children: _jsxs("div", { className: "premium-card p-6 w-full max-w-xl border border-white/20 shadow-2xl relative flex flex-col gap-4", children: [_jsxs("div", { className: "flex justify-between items-start border-b border-white/[0.08] pb-3", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [_jsx("span", { className: "text-xs font-mono font-bold text-cyan-400", children: selectedCall.id }), _jsx("span", { className: `px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${getVerdictBadge(selectedCall.verdict)}`, children: selectedCall.verdict })] }), _jsx("h3", { className: "text-base font-bold text-white", children: "Call Forensic Interception Dossier" })] }), _jsx("button", { onClick: () => setSelectedCall(null), className: "p-1 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white transition", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3 text-xs font-mono", children: [_jsxs("div", { className: "p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]", children: [_jsx("span", { className: "text-[10px] text-slate-500 block mb-0.5", children: "ORIGIN CALLER" }), _jsx("span", { className: "text-slate-200 font-bold", children: selectedCall.caller })] }), _jsxs("div", { className: "p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]", children: [_jsx("span", { className: "text-[10px] text-slate-500 block mb-0.5", children: "TARGET EXTENSION" }), _jsx("span", { className: "text-slate-200 font-bold", children: selectedCall.target })] }), _jsxs("div", { className: "p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]", children: [_jsx("span", { className: "text-[10px] text-slate-500 block mb-0.5", children: "DURATION" }), _jsxs("span", { className: "text-slate-200", children: [selectedCall.duration, " (", selectedCall.audioDuration, "s)"] })] }), _jsxs("div", { className: "p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]", children: [_jsx("span", { className: "text-[10px] text-slate-500 block mb-0.5", children: "RISK SCORE" }), _jsxs("span", { className: `text-base font-bold ${selectedCall.riskScore >= 80 ? 'text-red-400' : 'text-emerald-400'}`, children: [selectedCall.riskScore, "%"] })] })] }), _jsxs("div", { className: "p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs font-mono space-y-2", children: [_jsx("span", { className: "text-[10px] text-cyan-400 uppercase font-bold block", children: "Acoustic Prosody Diagnostics (Praat Extract)" }), _jsxs("div", { className: "flex justify-between text-slate-300", children: [_jsx("span", { children: "Pitch Jitter:" }), _jsx("span", { className: "font-bold", children: selectedCall.jitter || '0.72%' })] }), _jsxs("div", { className: "flex justify-between text-slate-300", children: [_jsx("span", { children: "Amplitude Shimmer:" }), _jsx("span", { className: "font-bold", children: selectedCall.shimmer || '2.10%' })] }), _jsxs("div", { className: "flex justify-between text-slate-300", children: [_jsx("span", { children: "Harmonics-to-Noise (HNR):" }), _jsx("span", { className: "font-bold", children: selectedCall.hnr || '19.5 dB' })] })] }), _jsxs("div", { className: "flex items-center justify-between pt-2 border-t border-white/[0.08]", children: [_jsxs("button", { onClick: () => handleTogglePlay(selectedCall), className: "px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5", children: [_jsx(Volume2, { className: "w-3.5 h-3.5" }), _jsx("span", { children: playingCallId === selectedCall.id ? 'Stop Playback' : 'Play Intercepted Audio' })] }), _jsxs("button", { onClick: () => handleDownloadEvidence(selectedCall), className: "px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 text-xs font-mono flex items-center gap-1.5", children: [_jsx(Download, { className: "w-3.5 h-3.5" }), _jsx("span", { children: "Export Dossier (JSON)" })] })] })] }) }))] }));
};
export default CallsManagerView;
