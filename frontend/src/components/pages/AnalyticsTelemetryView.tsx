import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, ShieldCheck, ShieldAlert, 
  Cpu, Activity, Zap, Layers, PieChart, Globe, 
  Calendar, Download, ArrowUpRight 
} from 'lucide-react';

export const AnalyticsTelemetryView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D'>('7D');
  const [downloadedNotice, setDownloadedNotice] = useState<string | null>(null);

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

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar */}
      <div className="premium-card p-5 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Neural Engine Analytics & Telemetry
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Aggregated threat intelligence, synthetic voice synthesis vectors, and latency performance metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-lg border border-white/[0.08]">
            {(['24H', '7D', '30D'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition ${
                  timeRange === r ? 'bg-white/10 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportAnalytics}
            className="vercel-btn-secondary px-3 py-1.5 text-xs flex items-center gap-1.5"
            title="Download Analytics Digest"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {downloadedNotice && (
        <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{downloadedNotice}</span>
        </div>
      )}

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="premium-card p-4 flex flex-col gap-1">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span className="font-mono uppercase text-[10px]">Total Calls Analyzed</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono mt-1">{stats.totalCalls}</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3" /> {stats.growth} vs previous window
          </div>
        </div>

        <div className="premium-card p-4 flex flex-col gap-1">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span className="font-mono uppercase text-[10px]">Deepfakes Intercepted</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400 font-mono mt-1">{stats.threats}</div>
          <div className="text-[10px] text-red-400 flex items-center gap-1 font-mono">
            {stats.threatPct} of incoming voice volume
          </div>
        </div>

        <div className="premium-card p-4 flex flex-col gap-1">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span className="font-mono uppercase text-[10px]">P99 Latency SLA</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">{stats.p99Latency}</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
            Compliant (&lt;300ms SLA Target)
          </div>
        </div>

        <div className="premium-card p-4 flex flex-col gap-1">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span className="font-mono uppercase text-[10px]">Prevented Fraud Volume</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-cyan-300 font-mono mt-1">{stats.fraudPrevented}</div>
          <div className="text-[10px] text-slate-400 font-mono">
            Cumulative wire transfer halts
          </div>
        </div>
      </div>

      {/* Analytics Visual Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Synthesis Architecture Vectors */}
        <div className="premium-card p-5 flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Observed Synthesis & Vocoder Vectors
            </h3>
            <span className="text-[10px] font-mono text-slate-500">Distribution %</span>
          </div>

          <div className="space-y-3 pt-1">
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300">HiFi-GAN Vocoder (ElevenLabs / Bark)</span>
                <span className="text-cyan-400 font-bold">{stats.hifiGan}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/[0.04]">
                <div className="bg-cyan-500 h-full rounded-full shadow-[0_0_8px_#06b6d4] transition-all duration-500" style={{ width: `${stats.hifiGan}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300">Diffusion Vocoders (Grad-TTS / TorToiSe)</span>
                <span className="text-amber-400 font-bold">{stats.diffusion}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/[0.04]">
                <div className="bg-amber-400 h-full rounded-full shadow-[0_0_8px_#fbbf24] transition-all duration-500" style={{ width: `${stats.diffusion}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300">Real-Time Voice Conversion (RVC v2)</span>
                <span className="text-red-400 font-bold">{stats.rvc}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/[0.04]">
                <div className="bg-red-500 h-full rounded-full shadow-[0_0_8px_#ef4444] transition-all duration-500" style={{ width: `${stats.rvc}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300">Legacy Neural Concatenation (WaveNet)</span>
                <span className="text-slate-400 font-bold">{stats.legacy}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/[0.04]">
                <div className="bg-slate-600 h-full rounded-full transition-all duration-500" style={{ width: `${stats.legacy}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Regional Indian Language Distribution */}
        <div className="premium-card p-5 flex flex-col gap-3">
          <div className="flex justify-between items-center border-b border-white/[0.06] pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              Multilingual Indian Speech Defense Coverage
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">AI4BHARAT BACKBONE</span>
          </div>

          <div className="space-y-3 pt-1 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.06]">
              <span className="text-slate-200 font-medium">Hinglish / Indian English</span>
              <span className="text-cyan-300 font-mono font-bold">54.2% Volume • 99.1% Acc</span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.06]">
              <span className="text-slate-200 font-medium">Hindi (Standard & Regional Accents)</span>
              <span className="text-cyan-300 font-mono font-bold">22.8% Volume • 98.6% Acc</span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.06]">
              <span className="text-slate-200 font-medium">Tamil & Telugu (South Indian Telecom)</span>
              <span className="text-cyan-300 font-mono font-bold">14.1% Volume • 97.9% Acc</span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-950/80 border border-white/[0.06]">
              <span className="text-slate-200 font-medium">Bengali, Marathi, Gujarati</span>
              <span className="text-cyan-300 font-mono font-bold">8.9% Volume • 98.2% Acc</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTelemetryView;
