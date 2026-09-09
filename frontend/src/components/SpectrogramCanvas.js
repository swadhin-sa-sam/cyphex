import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { Activity, Radio, AlertOctagon } from 'lucide-react';
/**
 * High-Precision Discrete Fourier Transform (FFT) with Hann Windowing
 */
function computeFFT(samples, fftSize = 256) {
    const N = Math.min(fftSize, samples.length);
    const magnitudes = new Float32Array(N / 2);
    for (let k = 0; k < N / 2; k++) {
        let real = 0;
        let imag = 0;
        for (let n = 0; n < N; n++) {
            const windowed = samples[n] * 0.5 * (1.0 - Math.cos((2 * Math.PI * n) / (N - 1)));
            const angle = (2 * Math.PI * k * n) / N;
            real += windowed * Math.cos(angle);
            imag -= windowed * Math.sin(angle);
        }
        magnitudes[k] = Math.sqrt(real * real + imag * imag) / N;
    }
    return magnitudes;
}
const SpectrogramCanvas = ({ audioData, anomalyFlags }) => {
    const canvasRef = useRef(null);
    const [isLogScale, setIsLogScale] = useState(true);
    const [colorScheme, setColorScheme] = useState('CYBER');
    const [hoverFreq, setHoverFreq] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    const animationFrameRef = useRef(null);
    // Initialize canvas with obsidian background
    useEffect(() => {
        if (!canvasRef.current)
            return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#06090e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, []);
    // Ambient waterfall continuous scroll even during silence
    useEffect(() => {
        if (isPaused)
            return;
        const renderStep = () => {
            if (!canvasRef.current)
                return;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx)
                return;
            const width = canvas.width;
            const height = canvas.height;
            const shiftPixels = 2;
            // Shift waterfall left
            const imageData = ctx.getImageData(shiftPixels, 0, width - shiftPixels, height);
            ctx.putImageData(imageData, 0, 0);
            // Compute FFT from current audioData or gentle ambient noise floor
            let fftMagnitudes;
            if (audioData && audioData.length > 0) {
                fftMagnitudes = computeFFT(audioData, 256);
            }
            else {
                // Subtle ambient thermal noise floor
                fftMagnitudes = new Float32Array(128);
                for (let i = 0; i < 128; i++) {
                    fftMagnitudes[i] = Math.random() * 0.003;
                }
            }
            const numBins = fftMagnitudes.length;
            // Render latest spectrum slice on right edge with high-contrast forensic heat colormap
            for (let y = 0; y < height; y++) {
                const normalizedY = (height - 1 - y) / height;
                let binIndex;
                if (isLogScale) {
                    binIndex = Math.floor(Math.pow(normalizedY, 1.8) * (numBins - 1));
                }
                else {
                    binIndex = Math.floor(normalizedY * (numBins - 1));
                }
                binIndex = Math.max(0, Math.min(numBins - 1, binIndex));
                const rawMag = fftMagnitudes[binIndex] || 0.0;
                const db = Math.max(0.0, Math.min(1.0, (20 * Math.log10(rawMag + 1e-5) + 60) / 60));
                let r = 0, g = 0, b = 0;
                if (colorScheme === 'CYBER') {
                    // Cyber Sapphire -> Cyan -> Emerald -> Hot White
                    if (db < 0.20) {
                        r = Math.floor(db * 5 * 18);
                        g = Math.floor(db * 5 * 24);
                        b = Math.floor(db * 5 * 70);
                    }
                    else if (db < 0.50) {
                        const t = (db - 0.20) / 0.30;
                        r = Math.floor(18 + t * 20);
                        g = Math.floor(24 + t * 160);
                        b = Math.floor(70 + t * 185);
                    }
                    else if (db < 0.80) {
                        const t = (db - 0.50) / 0.30;
                        r = Math.floor(38 + t * 217);
                        g = Math.floor(184 - t * 40);
                        b = Math.floor(255 * (1 - t * 0.8));
                    }
                    else {
                        const t = (db - 0.80) / 0.20;
                        r = 255;
                        g = Math.floor(144 + t * 111);
                        b = Math.floor(51 + t * 204);
                    }
                }
                else if (colorScheme === 'INFERNO') {
                    // Classic Forensic Inferno: Black -> Purple -> Orange -> Yellow
                    r = Math.floor(Math.min(255, db * 280));
                    g = Math.floor(Math.max(0, (db - 0.3) * 360));
                    b = Math.floor(Math.max(0, (0.7 - Math.abs(db - 0.4)) * 255));
                }
                else {
                    // Viridis: Purple -> Blue -> Green -> Yellow
                    r = Math.floor(Math.sin(db * Math.PI) * 120 + db * 135);
                    g = Math.floor(db * 255);
                    b = Math.floor((1 - db) * 220);
                }
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(width - shiftPixels, y, shiftPixels, 1);
            }
            // High frequency truncation overlay if anomaly flagged
            if (anomalyFlags.includes("HIGH_FREQ_CUTOFF")) {
                ctx.fillStyle = "rgba(239, 68, 68, 0.4)";
                ctx.fillRect(width - shiftPixels, 0, shiftPixels, Math.floor(height * 0.22));
            }
            animationFrameRef.current = requestAnimationFrame(renderStep);
        };
        animationFrameRef.current = requestAnimationFrame(renderStep);
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [audioData, isLogScale, colorScheme, isPaused, anomalyFlags]);
    const handleCanvasMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = rect.height;
        const norm = Math.max(0, Math.min(1, (height - y) / height));
        // Convert to frequency (0 to 8000 Hz)
        let freq;
        if (isLogScale) {
            freq = Math.round(Math.pow(norm, 1.8) * 8000);
        }
        else {
            freq = Math.round(norm * 8000);
        }
        setHoverFreq(freq);
    };
    return (_jsxs("div", { className: "premium-card p-5 flex flex-col h-full relative overflow-hidden", children: [_jsxs("div", { className: "flex flex-wrap justify-between items-center gap-3 mb-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "w-4 h-4 text-cyan-400" }), _jsx("h3", { className: "text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono", children: "Spectral Waterfall FFT" }), _jsx("span", { className: "text-[10px] font-mono text-[#94a3b8] bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.08]", children: "0 \u2013 8.0 kHz" }), hoverFreq !== null && (_jsxs("span", { className: "text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30", children: [hoverFreq, " Hz"] }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "flex items-center gap-1 bg-white/[0.03] p-0.5 rounded-md border border-white/[0.08] text-[9px] font-mono", children: ['CYBER', 'INFERNO', 'VIRIDIS'].map((scheme) => (_jsx("button", { onClick: () => setColorScheme(scheme), className: `px-2 py-0.5 rounded transition ${colorScheme === scheme
                                        ? 'bg-white/10 text-white font-semibold shadow-sm'
                                        : 'text-[#8a8f98] hover:text-white'}`, children: scheme }, scheme))) }), _jsxs("div", { className: "flex items-center gap-1 bg-white/[0.03] p-0.5 rounded-md border border-white/[0.08] text-[9px] font-mono", children: [_jsx("button", { onClick: () => setIsLogScale(true), className: `px-2 py-0.5 rounded transition ${isLogScale
                                            ? 'bg-white/10 text-white font-semibold'
                                            : 'text-[#8a8f98] hover:text-white'}`, children: "LOG" }), _jsx("button", { onClick: () => setIsLogScale(false), className: `px-2 py-0.5 rounded transition ${!isLogScale
                                            ? 'bg-white/10 text-white font-semibold'
                                            : 'text-[#8a8f98] hover:text-white'}`, children: "LIN" })] }), _jsx("button", { onClick: () => setIsPaused(!isPaused), className: `px-2.5 py-0.5 rounded-md text-[9px] font-mono font-medium border transition ${isPaused
                                    ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                                    : 'bg-white/[0.03] text-slate-300 border-white/[0.08] hover:border-white/20'}`, children: isPaused ? 'PAUSED' : 'LIVE' })] })] }), _jsxs("div", { className: "flex flex-grow gap-2", children: [_jsxs("div", { className: "flex flex-col justify-between text-[9px] font-mono text-[#62666d] select-none py-1 text-right w-11 shrink-0 font-medium", children: [_jsx("span", { children: "8.0 kHz" }), _jsx("span", { children: "6.0 kHz" }), _jsx("span", { children: "4.0 kHz" }), _jsx("span", { children: "2.0 kHz" }), _jsx("span", { children: "0 Hz" })] }), _jsxs("div", { className: "relative flex-grow bg-black rounded-lg overflow-hidden border border-white/[0.08] shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)] h-44 cursor-crosshair", onMouseMove: handleCanvasMouseMove, onMouseLeave: () => setHoverFreq(null), children: [_jsx("canvas", { ref: canvasRef, width: 640, height: 144, className: "w-full h-full block" }), _jsxs("div", { className: "absolute inset-0 pointer-events-none grid grid-rows-4 grid-cols-4 divide-y divide-x divide-white/[0.03]", children: [_jsx("div", {}), _jsx("div", {}), _jsx("div", {}), _jsx("div", {}), _jsx("div", {}), _jsx("div", {}), _jsx("div", {}), _jsx("div", {}), _jsx("div", {}), _jsx("div", {}), _jsx("div", {}), _jsx("div", {}), _jsx("div", {}), _jsx("div", {}), _jsx("div", {}), _jsx("div", {})] }), anomalyFlags.length > 0 && (_jsx("div", { className: "absolute top-2 right-2 flex flex-col gap-1 pointer-events-none", children: anomalyFlags.map((flag, i) => (_jsxs("div", { className: "flex items-center gap-1.5 text-[10px] bg-red-950/90 text-red-200 font-mono font-bold px-2 py-0.5 rounded-lg border border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.4)] animate-pulse", children: [_jsx(AlertOctagon, { className: "w-3 h-3 text-red-400" }), _jsx("span", { children: flag })] }, i))) }))] })] }), _jsxs("div", { className: "flex justify-between items-center text-[9px] font-mono text-slate-400 pl-14 pr-1 pt-2 font-medium", children: [_jsx("span", { children: "-2.0s" }), _jsx("span", { children: "-1.5s" }), _jsx("span", { children: "-1.0s" }), _jsx("span", { children: "-0.5s" }), _jsxs("span", { className: "text-cyan-400 font-bold flex items-center gap-1", children: [_jsx(Radio, { className: "w-2.5 h-2.5 text-cyan-400 animate-pulse" }), " ", isPaused ? 'FREEZE FRAME' : 'LIVE STREAM'] })] })] }));
};
export default SpectrogramCanvas;
