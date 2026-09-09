import React, { useRef, useEffect } from 'react';
import { Activity, Radio } from 'lucide-react';

interface LiveWaveformProps {
  audioData?: Float32Array | null;
  isActive?: boolean;
  speechActive?: boolean;
}

export const LiveWaveform: React.FC<LiveWaveformProps> = ({
  audioData,
  isActive = true,
  speechActive = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#070A11';
      ctx.fillRect(0, 0, width, height);

      // Subtle laboratory grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 20;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center baseline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      if (!isActive) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Draw Oscilloscope Beam
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Outer glow filter
      ctx.shadowBlur = 10;
      ctx.shadowColor = speechActive ? '#38BDF8' : '#34D399';
      ctx.strokeStyle = speechActive ? '#38BDF8' : '#34D399';

      ctx.beginPath();
      const numPoints = 256;
      const sliceWidth = width / numPoints;

      for (let i = 0; i < numPoints; i++) {
        let sample = 0;
        if (audioData && audioData.length > 0) {
          const idx = Math.floor((i / numPoints) * audioData.length);
          sample = audioData[idx] || 0;
        } else {
          // Synthetic ambient carrier wave
          sample = (Math.sin(i * 0.08 + phase) * 0.15) + (Math.sin(i * 0.2 + phase * 1.5) * 0.05);
          if (speechActive) sample *= 3.0;
        }

        const y = (height / 2) + (sample * (height * 0.42));
        const x = i * sliceWidth;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      phase += 0.04;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [audioData, isActive, speechActive]);

  return (
    <div className="cyber-card p-3 relative overflow-hidden">
      <div className="flex items-center justify-between text-[11px] font-mono mb-2 px-1 text-slate-400">
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-slate-300 font-semibold uppercase tracking-wider">Acoustic Oscilloscope</span>
        </div>
        <div className="flex items-center gap-2">
          {speechActive ? (
            <span className="flex items-center gap-1 text-[10px] text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/40">
              <Radio className="w-2.5 h-2.5 animate-pulse text-cyan-400" />
              VOICED PHONEMES
            </span>
          ) : (
            <span className="text-[10px] text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-white/[0.04]">
              SILENCE / AMBIENT
            </span>
          )}
          <span className="text-slate-500 text-[10px]">16 kHz &bull; MONO</span>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={100}
        className="w-full h-24 rounded-lg bg-navy-950 border border-white/[0.04]"
      />
    </div>
  );
};

export default LiveWaveform;
