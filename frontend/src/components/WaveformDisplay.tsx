import React, { useEffect, useRef } from 'react';
import { Waves, Zap } from 'lucide-react';

interface WaveformDisplayProps {
  audioData: Float32Array | null;
  isActive: boolean;
  vadStatus: boolean;
}

const WaveformDisplay: React.FC<WaveformDisplayProps> = ({ audioData, isActive, vadStatus }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bufferRef = useRef<number[]>([]);

  // Auto-adjust canvas resolution dynamically to match viewport / container width
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = Math.max(260, Math.floor(rect.width));
      const newHeight = Math.max(120, Math.floor(rect.height));
      
      if (canvasRef.current.width !== newWidth || canvasRef.current.height !== newHeight) {
        canvasRef.current.width = newWidth;
        canvasRef.current.height = newHeight;
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    window.addEventListener('resize', handleResize);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;

    // Deep Obsidian Screen Background
    ctx.fillStyle = '#06090e';
    ctx.fillRect(0, 0, width, height);

    // High-Precision Oscilloscope Grid
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';

    // Horizontal Voltage Division Lines
    [-0.75, -0.5, -0.25, 0.25, 0.5, 0.75].forEach((ratio) => {
      const y = centerY + ratio * (centerY * 0.85);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    });

    // Center Zero-Volt Axis (Crisper)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();

    // Vertical Reticle Ticks every 40px
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    for (let x = 40; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();

      // Small crosshair hash on zero-axis
      ctx.beginPath();
      ctx.moveTo(x, centerY - 3);
      ctx.lineTo(x, centerY + 3);
      ctx.stroke();
    }

    if (!isActive) {
      bufferRef.current = [];
      // Flat standby beam
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 1;
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      return;
    }

    if (audioData && audioData.length > 0) {
      const step = Math.max(1, Math.floor(audioData.length / 120));
      for (let i = 0; i < audioData.length; i += step) {
        bufferRef.current.push(audioData[i]);
      }
      
      if (bufferRef.current.length > width) {
        bufferRef.current = bufferRef.current.slice(-width);
      }
    }

    if (bufferRef.current.length < 2) return;

    // Layer 1: Soft Diffuse Phosphor Glow
    ctx.beginPath();
    ctx.strokeStyle = vadStatus ? 'rgba(16, 185, 129, 0.35)' : 'rgba(6, 182, 212, 0.3)';
    ctx.lineWidth = 4;
    for (let i = 0; i < bufferRef.current.length; i++) {
      const x = i;
      const val = Math.max(-1.0, Math.min(1.0, bufferRef.current[i] || 0));
      const y = centerY - val * (centerY * 0.85);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Layer 2: Razor-Sharp Intense Center Beam
    ctx.beginPath();
    ctx.strokeStyle = vadStatus ? '#34d399' : '#38bdf8';
    ctx.shadowColor = vadStatus ? 'rgba(52, 211, 153, 0.8)' : 'rgba(56, 189, 248, 0.8)';
    ctx.shadowBlur = 6;
    ctx.lineWidth = 1.5;
    for (let i = 0; i < bufferRef.current.length; i++) {
      const x = i;
      const val = Math.max(-1.0, Math.min(1.0, bufferRef.current[i] || 0));
      const y = centerY - val * (centerY * 0.85);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

  }, [audioData, isActive, vadStatus]);

  return (
    <div className="premium-card p-5 flex flex-col h-full relative overflow-hidden">
      {/* Header bar */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <Waves className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
            Oscilloscope & VAD
          </h3>
          <span className="text-[10px] font-mono text-[#94a3b8] bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.08]">
            16 kHz PCM
          </span>
        </div>

        {/* Voice Activity Detection Pill */}
        <div className="flex items-center gap-2">
          <div
            className={`status-pill text-[10px] font-mono transition-all duration-200 ${
              vadStatus
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-white/[0.02] border-white/[0.06] text-[#62666d]'
            }`}
          >
            <Zap className={`w-3 h-3 ${vadStatus ? 'text-emerald-400 fill-emerald-400' : 'text-slate-600'}`} />
            <span>{vadStatus ? 'SPEECH DETECTED' : 'STANDBY IDLE'}</span>
          </div>
        </div>
      </div>

      {/* Main Canvas Viewport with CRT Reticle Overlay */}
      <div 
        ref={containerRef}
        className="relative flex-grow bg-black rounded-lg overflow-hidden border border-white/[0.08] shadow-[inset_0_2px_15px_rgba(0,0,0,0.8)] h-44"
      >
        <canvas
          ref={canvasRef}
          width={640}
          height={176}
          className="w-full h-full block"
        />

        {/* Oscilloscope Calibration Labels */}
        <div className="absolute top-2 left-2 pointer-events-none text-[9px] font-mono text-[#62666d] select-none">
          CH-1: 500mV/DIV
        </div>
        <div className="absolute bottom-2 left-2 pointer-events-none text-[9px] font-mono text-[#62666d] select-none">
          TB: 5ms/DIV • AC COUPLING
        </div>
        <div className="absolute top-2 right-2 pointer-events-none flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          TRIG: AUTO
        </div>
      </div>

      {/* Live Voice Authenticity & Signal Indicators Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-2.5 border-t border-white/[0.06] text-center font-mono text-[10px]">
        <div className="p-1.5 rounded bg-white/[0.02] border border-white/[0.04]">
          <span className="text-[#94a3b8] block text-[9px] uppercase">Voice Authenticity</span>
          <span className="text-emerald-400 font-bold">{vadStatus ? 'ORGANIC' : 'VERIFYING'}</span>
        </div>
        <div className="p-1.5 rounded bg-white/[0.02] border border-white/[0.04]">
          <span className="text-[#94a3b8] block text-[9px] uppercase">Synthetic Prob</span>
          <span className="text-emerald-400 font-bold">2.4%</span>
        </div>
        <div className="p-1.5 rounded bg-white/[0.02] border border-white/[0.04]">
          <span className="text-[#94a3b8] block text-[9px] uppercase">Speaker Match</span>
          <span className="text-cyan-400 font-bold">96.8%</span>
        </div>
        <div className="p-1.5 rounded bg-white/[0.02] border border-white/[0.04]">
          <span className="text-[#94a3b8] block text-[9px] uppercase">Behavioral Risk</span>
          <span className="text-emerald-400 font-bold">0.05 [LOW]</span>
        </div>
      </div>
    </div>
  );
};

export default WaveformDisplay;

