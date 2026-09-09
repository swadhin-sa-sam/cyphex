import React from 'react';
import { Sliders, Mic, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface ProsodyMetricsProps {
  jitter?: number;
  shimmer?: number;
  hnr?: number;
  f0Mean?: number;
}

const ProsodyMetrics: React.FC<ProsodyMetricsProps> = ({ 
  jitter = 0, 
  shimmer = 0, 
  hnr = 0, 
  f0Mean = 0 
}) => {
  // Clinical voice pathology & synthetic speech heuristics
  const isJitterSynthetic = jitter > 0 && jitter < 0.35;
  const isJitterAbnormal = jitter > 2.2;
  const isJitterOk = jitter >= 0.35 && jitter <= 2.2;

  const isShimmerSynthetic = shimmer > 0 && shimmer < 0.8;
  const isShimmerAbnormal = shimmer > 5.5;
  const isShimmerOk = shimmer >= 0.8 && shimmer <= 5.5;

  const isHnrOk = hnr >= 10 && hnr <= 24;

  return (
    <div className="premium-card p-5 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
            Acoustic Prosody
          </h3>
        </div>
        <div className="status-pill text-[10px] font-mono text-[#94a3b8] bg-white/[0.03]">
          <span>PRAAT ALGORITHM</span>
        </div>
      </div>

      {/* Metrics List */}
      <div className="space-y-3.5 flex-grow flex flex-col justify-around my-1">
        {/* Jitter Metric */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-medium text-xs">Pitch Jitter</span>
              {isJitterSynthetic && (
                <span className="text-[9px] font-mono font-semibold text-red-300 bg-red-950/60 px-1.5 py-0.2 rounded border border-red-500/40">
                  VOCODER DETECTED
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-[10px] text-[#62666d]">Norm 0.4–1.8%</span>
              <span className={`text-xs font-bold ${isJitterOk ? 'text-emerald-400' : 'text-red-400'}`}>
                {jitter.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="w-full bg-white/[0.04] rounded-full h-2 relative overflow-hidden border border-white/[0.06]">
            {/* Safe zone overlay */}
            <div className="absolute top-0 h-full bg-emerald-500/15 border-x border-emerald-500/30" style={{ left: '15%', width: '35%' }} />
            {/* Actual marker bar */}
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isJitterOk ? 'bg-emerald-400' : 'bg-red-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(4, jitter * 35))}%` }}
            />
          </div>
        </div>

        {/* Shimmer Metric */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-200 font-medium text-xs">Amplitude Shimmer</span>
              {isShimmerSynthetic && (
                <span className="text-[9px] font-mono font-semibold text-red-300 bg-red-950/60 px-1.5 py-0.2 rounded border border-red-500/40">
                  OVER-SMOOTHED
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-[10px] text-[#62666d]">Norm 1.0–4.5%</span>
              <span className={`text-xs font-bold ${isShimmerOk ? 'text-emerald-400' : 'text-red-400'}`}>
                {shimmer.toFixed(2)}%
              </span>
            </div>
          </div>
          <div className="w-full bg-white/[0.04] rounded-full h-2 relative overflow-hidden border border-white/[0.06]">
            {/* Safe zone overlay */}
            <div className="absolute top-0 h-full bg-emerald-500/15 border-x border-emerald-500/30" style={{ left: '12%', width: '38%' }} />
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isShimmerOk ? 'bg-emerald-400' : 'bg-red-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(4, shimmer * 18))}%` }}
            />
          </div>
        </div>

        {/* HNR & Pitch Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-1.5 border-t border-white/[0.06]">
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[11px] text-[#8a8f98]">Harmonics/Noise:</span>
            <span className={`font-mono text-xs font-bold ${isHnrOk ? 'text-emerald-400' : 'text-amber-400'}`}>
              {hnr.toFixed(1)} dB
            </span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <span className="text-[11px] text-[#8a8f98]">Pitch (f0):</span>
            <span className="font-mono text-xs font-bold text-cyan-300">
              {f0Mean > 0 ? `${Math.round(f0Mean)} Hz` : '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProsodyMetrics;

