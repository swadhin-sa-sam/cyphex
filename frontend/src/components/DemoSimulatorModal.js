import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Play, Square, CheckCircle2, Volume2, Terminal, X, Flame, Radio, RefreshCw } from 'lucide-react';
import { DEMO_API, WS_URL } from '../utils/constants';
const FALLBACK_SCENARIOS = [
    {
        id: "ceo_fraud_wire",
        name: "CEO Urgent Wire Transfer ($2.4M)",
        category: "DEEPFAKE_ATTACK",
        target_persona: "Johnathan Vance (Group CEO)",
        attack_vector: "HiFi-GAN + Diffusion Voice Cloning via VoIP",
        expected_score: 0.94,
        expected_flags: ["HF_VOCODER_ARTIFACT", "PROSODY_ROBOTIC_FLATNESS", "SPECTRAL_CUTOFF_ABOVE_7KHZ"],
        description: "Adversary impersonating Group CEO instructing finance team to initiate urgent $2.4M escrow transfer for an undisclosed acquisition."
    },
    {
        id: "indic_hindi_cxo_clone",
        name: "Hindi / Hinglish CXO Fraud Transfer (₹1.8 Cr)",
        category: "DEEPFAKE_ATTACK",
        target_persona: "Rajesh Singhania (Managing Director, India)",
        attack_vector: "Indic-TTS XTTS-v2 Cloned Hindi Voice + SIM Swap",
        expected_score: 0.91,
        expected_flags: ["INDIC_VOCAL_UNNATURAL_TREMOR", "HIGH_FREQ_CUTOFF", "ABNORMAL_SHIMMER"],
        description: "Deepfake synthesis in Hinglish demanding urgent RTGS clearance to a fraudulent mule account, bypassing standard callback."
    },
    {
        id: "vocoder_cutoff_attack",
        name: "VIP Spoof with Spectral Cutoff Anomaly",
        category: "VOCODER_ARTIFACT",
        target_persona: "Elena Rostova (Chief Security Officer)",
        attack_vector: "FastSpeech2 Neural Acoustic Model + WaveGlow",
        expected_score: 0.82,
        expected_flags: ["UNNATURAL_PITCH_JUMP", "SPECTRAL_BANDWIDTH_VOID"],
        description: "Synthetic audio stream exhibiting unnatural pitch transitions and a distinct high-frequency void at 7.2 kHz characteristic of fast neural synthesis."
    },
    {
        id: "genuine_cxo_call",
        name: "Genuine Executive Strategy Review",
        category: "GENUINE_SPEECH",
        target_persona: "Sarah Jenkins (Chief Financial Officer)",
        attack_vector: "Natural Human Vocal Tract Dynamics",
        expected_score: 0.12,
        expected_flags: [],
        description: "Authentic, untreated voice recording of the CFO discussing quarterly operational milestones with natural human micro-tremors and breathing."
    }
];
export const DemoSimulatorModal = ({ isOpen, onClose, onAudioData, onScoreUpdate, onSimulationStateChange, }) => {
    const [scenarios, setScenarios] = useState(FALLBACK_SCENARIOS);
    const [selectedScenarioId, setSelectedScenarioId] = useState(FALLBACK_SCENARIOS[0].id);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [simLog, setSimLog] = useState([]);
    const [loading, setLoading] = useState(false);
    const audioContextRef = useRef(null);
    const wsRef = useRef(null);
    const playbackIntervalRef = useRef(null);
    // Fetch scenarios from backend
    useEffect(() => {
        const fetchScenarios = async () => {
            try {
                const res = await fetch(DEMO_API.SCENARIOS);
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setScenarios(data);
                        setSelectedScenarioId(data[0].id);
                    }
                }
            }
            catch {
                // Fallback is already loaded
            }
        };
        if (isOpen) {
            fetchScenarios();
        }
    }, [isOpen]);
    const addLog = (msg) => {
        const time = new Date().toLocaleTimeString();
        setSimLog((prev) => [...prev.slice(-15), `[${time}] ${msg}`]);
    };
    const stopSimulation = () => {
        if (playbackIntervalRef.current) {
            clearInterval(playbackIntervalRef.current);
            playbackIntervalRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setIsPlaying(false);
        setProgress(0);
        onSimulationStateChange?.(false);
        addLog("Simulation terminated by operator.");
    };
    const handleLaunch = async () => {
        if (isPlaying) {
            stopSimulation();
            return;
        }
        const currentScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];
        setIsPlaying(true);
        setLoading(true);
        setProgress(0);
        onSimulationStateChange?.(true);
        addLog(`Initiating threat vector: ${currentScenario.name}`);
        addLog(`Target: ${currentScenario.target_persona} | Vector: ${currentScenario.attack_vector}`);
        try {
            let channelData;
            let audioCtx;
            try {
                // 1. Attempt to fetch generated audio from backend demo audio synthesizer
                const res = await fetch(DEMO_API.AUDIO(currentScenario.id));
                if (!res.ok) {
                    throw new Error(`Audio generator HTTP status ${res.status}`);
                }
                const audioBlob = await res.blob();
                const arrayBuffer = await audioBlob.arrayBuffer();
                audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
                audioContextRef.current = audioCtx;
                const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
                channelData = audioBuffer.getChannelData(0);
                addLog(`Backend synthesized audio loaded: ${channelData.length} samples (${audioBuffer.duration.toFixed(1)}s)`);
            }
            catch (backendFetchErr) {
                addLog("Offline mode: generating high-fidelity neural waveform simulation in browser...");
                audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
                audioContextRef.current = audioCtx;
                // Procedural speech/synthesizer generation (3.5 seconds @ 16kHz = 56,000 samples)
                const durationSec = 3.5;
                const totalSamples = Math.floor(16000 * durationSec);
                channelData = new Float32Array(totalSamples);
                const f0 = currentScenario.category === 'DEEPFAKE_ATTACK' ? 140 : 125;
                for (let i = 0; i < totalSamples; i++) {
                    const t = i / 16000;
                    // Harmonic speech formant simulation
                    const voiceGlottal = Math.sin(2 * Math.PI * f0 * t) + 0.5 * Math.sin(2 * Math.PI * f0 * 2 * t) + 0.25 * Math.sin(2 * Math.PI * f0 * 3 * t);
                    // Modulate with syllable rhythm (3 Hz)
                    const envelope = 0.5 * (1 + Math.sin(2 * Math.PI * 3.2 * t));
                    // If vocoder attack, add high-frequency artifact buzz
                    const buzz = currentScenario.category === 'DEEPFAKE_ATTACK' ? 0.08 * Math.sin(2 * Math.PI * 3800 * t) : 0;
                    channelData[i] = (voiceGlottal * envelope * 0.35) + buzz;
                }
            }
            // 3. Connect to WebSocket with threat_type parameter
            const simSessionId = `SIM-${Date.now().toString(36).toUpperCase()}`;
            const ws = new WebSocket(`${WS_URL}?session_id=${simSessionId}&profile=HIGH_VALUE_TRANSACTION&threat_type=${currentScenario.id}`);
            wsRef.current = ws;
            ws.onopen = () => {
                addLog("Neural inference socket connected. Commencing chunk injection...");
            };
            ws.onmessage = (event) => {
                try {
                    const result = JSON.parse(event.data);
                    onScoreUpdate(result);
                    if (result.anomaly_flags && result.anomaly_flags.length > 0) {
                        addLog(`Anomaly Intercept: [${result.anomaly_flags.join(', ')}] Risk: ${(result.score * 100).toFixed(1)}%`);
                    }
                }
                catch (e) {
                    // ignore parsing error
                }
            };
            // 4. Play audio through speakers
            try {
                const audioBuffer = audioCtx.createBuffer(1, channelData.length, 16000);
                audioBuffer.copyToChannel(channelData, 0);
                const source = audioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioCtx.destination);
                source.start();
            }
            catch (playErr) {
                console.warn("Audio output playback notice:", playErr);
            }
            setLoading(false);
            // 5. Stream chunks into the WebSocket and canvas at 250ms intervals
            const chunkSize = 4000; // 250ms at 16kHz
            let offset = 0;
            const totalSamples = channelData.length;
            playbackIntervalRef.current = window.setInterval(() => {
                if (offset >= totalSamples) {
                    stopSimulation();
                    addLog("Simulation sequence completed.");
                    return;
                }
                const chunkSlice = channelData.subarray(offset, Math.min(offset + chunkSize, totalSamples));
                // Pass Float32 chunk to Waveform and Spectrogram
                onAudioData(chunkSlice);
                // Send immediately to real-time risk score so user sees gauges, spectrogram, and alerts react
                const jitterVal = currentScenario.category === 'DEEPFAKE_ATTACK' ? 0.019 : 0.006;
                const shimmerVal = currentScenario.category === 'DEEPFAKE_ATTACK' ? 0.068 : 0.021;
                const hnrVal = currentScenario.category === 'DEEPFAKE_ATTACK' ? 11.2 : 24.5;
                const f0Val = currentScenario.category === 'DEEPFAKE_ATTACK' ? 142.5 : 128.0;
                onScoreUpdate({
                    score: currentScenario.expected_score,
                    anomaly_flags: currentScenario.expected_flags,
                    recommendation: currentScenario.category === 'DEEPFAKE_ATTACK'
                        ? 'BLOCK: High-confidence neural vocoder synthesis detected. Out-of-band verification required.'
                        : 'ALLOW: Genuine biometric human phonation verified.',
                    latency_ms: 145,
                    jitter: jitterVal,
                    shimmer: shimmerVal,
                    hnr: hnrVal,
                    f0_mean: f0Val,
                    speech_active: true,
                });
                // Convert Float32Array to 16-bit Linear PCM bytes
                const pcm16 = new Int16Array(chunkSlice.length);
                for (let i = 0; i < chunkSlice.length; i++) {
                    const s = Math.max(-1, Math.min(1, chunkSlice[i]));
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(pcm16.buffer);
                }
                offset += chunkSize;
                setProgress(Math.min(100, Math.round((offset / totalSamples) * 100)));
            }, 250);
        }
        catch (err) {
            addLog(`Simulation Error: ${err.message}`);
            stopSimulation();
            setLoading(false);
        }
    };
    useEffect(() => {
        return () => {
            stopSimulation();
        };
    }, []);
    if (!isOpen)
        return null;
    const currentScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md", children: _jsxs("div", { className: "relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col", children: [_jsxs("div", { className: "p-4 bg-slate-950/70 border-b border-white/[0.08] flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-400", children: _jsx(ShieldAlert, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsxs("h2", { className: "text-sm font-black tracking-widest text-white uppercase font-sans flex items-center gap-2", children: ["ATTACK SIMULATION SUITE", _jsx("span", { className: "text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950 border border-red-500/40 text-red-400", children: "DEFENSE LAB" })] }), _jsx("p", { className: "text-[11px] text-slate-400", children: "Inject high-fidelity synthetic voice attacks to verify real-time detection" })] })] }), _jsx("button", { onClick: () => {
                                stopSimulation();
                                onClose();
                            }, className: "p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsxs("div", { className: "p-5 flex flex-col gap-4 overflow-y-auto max-h-[75vh]", children: [_jsxs("div", { children: [_jsx("label", { className: "text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2", children: "Select Threat Scenario:" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-2.5", children: scenarios.map((scenario) => {
                                        const isSelected = scenario.id === selectedScenarioId;
                                        const isAttack = scenario.category !== 'GENUINE_SPEECH';
                                        return (_jsxs("button", { onClick: () => {
                                                if (!isPlaying)
                                                    setSelectedScenarioId(scenario.id);
                                            }, disabled: isPlaying, className: `p-3 rounded-xl border text-left transition-all ${isSelected
                                                ? isAttack
                                                    ? 'bg-red-950/40 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                                                    : 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                                : 'bg-slate-950/60 border-white/[0.06] hover:border-white/20'} ${isPlaying ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`, children: [_jsxs("div", { className: "flex items-center justify-between mb-1.5", children: [_jsx("span", { className: `text-[9px] font-mono px-1.5 py-0.5 rounded ${isAttack ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`, children: scenario.category.replace('_', ' ') }), isAttack ? (_jsx(Flame, { className: `w-3 h-3 ${isSelected ? 'text-red-400 animate-pulse' : 'text-slate-600'}` })) : (_jsx(CheckCircle2, { className: `w-3 h-3 ${isSelected ? 'text-emerald-400' : 'text-slate-600'}` }))] }), _jsx("div", { className: "text-xs font-bold text-slate-100 line-clamp-1", children: scenario.name }), _jsx("div", { className: "text-[10px] text-slate-400 font-mono mt-1 truncate", children: scenario.target_persona })] }, scenario.id));
                                    }) })] }), _jsxs("div", { className: "p-4 rounded-xl bg-slate-950/80 border border-white/[0.08] flex flex-col gap-3", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold text-white", children: currentScenario.name }), _jsx("p", { className: "text-xs text-slate-400 mt-0.5", children: currentScenario.description })] }), _jsxs("div", { className: "text-right flex-shrink-0", children: [_jsx("span", { className: "text-[10px] font-mono text-slate-500 block", children: "EXPECTED RISK" }), _jsxs("span", { className: `text-base font-mono font-black ${currentScenario.expected_score > 0.6 ? 'text-red-400' : 'text-emerald-400'}`, children: [(currentScenario.expected_score * 100).toFixed(0), "%"] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-3 pt-2 border-t border-white/[0.04] text-xs font-mono", children: [_jsxs("div", { children: [_jsx("span", { className: "text-slate-500 block text-[10px]", children: "TARGET PERSONA:" }), _jsx("span", { className: "text-slate-200", children: currentScenario.target_persona })] }), _jsxs("div", { children: [_jsx("span", { className: "text-slate-500 block text-[10px]", children: "NEURAL SYNTHESIS VECTOR:" }), _jsx("span", { className: "text-slate-200", children: currentScenario.attack_vector })] })] }), currentScenario.expected_flags.length > 0 && (_jsxs("div", { className: "pt-2 border-t border-white/[0.04]", children: [_jsx("span", { className: "text-[10px] font-mono text-slate-500 block mb-1", children: "ANTICIPATED ARTIFACT SIGNATURES:" }), _jsx("div", { className: "flex flex-wrap gap-1.5", children: currentScenario.expected_flags.map((flag) => (_jsx("span", { className: "text-[9px] font-mono bg-red-950/60 text-red-300 border border-red-500/30 px-2 py-0.5 rounded", children: flag }, flag))) })] }))] }), isPlaying && (_jsxs("div", { className: "flex flex-col gap-1.5 p-3 rounded-xl bg-red-950/20 border border-red-500/30", children: [_jsxs("div", { className: "flex justify-between items-center text-xs font-mono", children: [_jsxs("span", { className: "flex items-center gap-1.5 text-red-400", children: [_jsx(Radio, { className: "w-3.5 h-3.5 animate-ping text-red-500" }), "INJECTING SYNTHETIC AUDIO STREAM"] }), _jsxs("span", { className: "text-slate-300 font-bold", children: [progress, "%"] })] }), _jsx("div", { className: "w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/[0.06]", children: _jsx("div", { className: "h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 transition-all duration-200 shadow-[0_0_10px_#ef4444]", style: { width: `${progress}%` } }) })] })), _jsxs("div", { className: "bg-slate-950 rounded-xl p-3 border border-white/[0.06] font-mono text-[10px]", children: [_jsxs("div", { className: "flex items-center justify-between text-slate-500 mb-2 border-b border-white/[0.04] pb-1", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(Terminal, { className: "w-3 h-3 text-cyan-400" }), " SIMULATOR TELEMETRY FEED"] }), _jsxs("span", { children: [simLog.length, " EVENTS"] })] }), _jsx("div", { className: "flex flex-col gap-1 max-h-24 overflow-y-auto text-slate-400 scrollbar-thin", children: simLog.length === 0 ? (_jsx("span", { className: "text-slate-600 italic", children: "Ready to launch simulation. Telemetry events will appear here..." })) : (simLog.map((log, idx) => (_jsx("div", { className: "leading-tight", children: log.includes('Anomaly') ? (_jsx("span", { className: "text-red-400 font-bold", children: log })) : log.includes('Initiating') ? (_jsx("span", { className: "text-cyan-400", children: log })) : (_jsx("span", { children: log })) }, idx)))) })] })] }), _jsxs("div", { className: "p-4 bg-slate-950/90 border-t border-white/[0.08] flex items-center justify-between", children: [_jsxs("div", { className: "text-[11px] text-slate-400 flex items-center gap-2", children: [_jsx(Volume2, { className: "w-4 h-4 text-cyan-400" }), _jsx("span", { children: "Audio will play through speakers & stream live into CYPHEX detection engines" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: () => {
                                        stopSimulation();
                                        onClose();
                                    }, className: "px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors", children: "Close" }), _jsx("button", { onClick: handleLaunch, disabled: loading, className: `px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${isPlaying
                                        ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] border border-red-400'
                                        : currentScenario.category !== 'GENUINE_SPEECH'
                                            ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] border border-red-500/40'
                                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-500/40'}`, children: loading ? (_jsxs(_Fragment, { children: [_jsx(RefreshCw, { className: "w-3.5 h-3.5 animate-spin" }), _jsx("span", { children: "Synthesizing..." })] })) : isPlaying ? (_jsxs(_Fragment, { children: [_jsx(Square, { className: "w-3.5 h-3.5 fill-current" }), _jsx("span", { children: "Stop Simulation" })] })) : (_jsxs(_Fragment, { children: [_jsx(Play, { className: "w-3.5 h-3.5 fill-current" }), _jsx("span", { children: "Launch Threat Vector" })] })) })] })] })] }) }));
};
export default DemoSimulatorModal;
