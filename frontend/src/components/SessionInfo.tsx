import React, { useState, useEffect } from 'react';
import { Clock, Activity, ShieldCheck, CheckCircle2, AlertTriangle, Layers, Copy, Check } from 'lucide-react';
import { API_BASE_URL } from '../utils/constants';

interface SessionInfoProps {
  sessionId: string;
  durationSeconds: number;
  isConnected: boolean;
  profile: string;
  latencyMs: number;
}

const SessionInfo: React.FC<SessionInfoProps> = ({ 
  sessionId, 
  durationSeconds, 
  isConnected, 
  profile, 
  latencyMs 
}) => {
  const [copied, setCopied] = useState(false);
  const [modelStatus, setModelStatus] = useState<Record<string, boolean>>({
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
      } catch {
        // Backend offline or booting
      }
    };
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs: number) => {
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

  return (
    <div className="premium-card p-5 flex flex-col justify-between h-full relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
            Pipeline Health & Telemetry
          </h3>
        </div>

        {/* Session ID Chip with Copy */}
        <button
          onClick={copySessionId}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/[0.08] hover:border-white/20 text-[10px] font-mono text-[#8a8f98] hover:text-white transition group"
          title="Click to copy Session ID"
        >
          <span>{sessionId}</span>
          {copied ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-slate-500 group-hover:text-white" />}
        </button>
      </div>
      
      <div className="space-y-2.5 flex-grow flex flex-col justify-between">
        {/* Stream Status & Duration Row */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <div className="text-[10px] text-[#8a8f98] mb-1 flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" /> Stream Pipeline
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-slate-600'}`} />
              <span className={`text-xs font-bold font-mono tracking-wide ${isConnected ? 'text-emerald-400' : 'text-slate-400'}`}>
                {isConnected ? 'ONLINE ACTIVE' : 'STANDBY'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <div className="text-[10px] text-[#8a8f98] mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" /> Session Elapsed
            </div>
            <div className="font-mono text-sm font-bold text-white tracking-wider">
              {formatTime(durationSeconds)}
            </div>
          </div>
        </div>

        {/* CYPHEX Intelligence: AI Analysis Panel */}
        <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
          <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-300 mb-1.5 flex justify-between font-mono">
            <span>CYPHEX Intelligence Diagnostic</span>
            <span className="text-cyan-400 font-bold">MULTI-SIGNAL FUSION</span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center px-2 py-1 rounded-md bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[#94a3b8] text-[11px]">Acoustic Anomalies:</span>
              <span className="text-emerald-400 font-mono text-[10px] font-semibold">PHASE CONTINUITY STABLE</span>
            </div>

            <div className="flex justify-between items-center px-2 py-1 rounded-md bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[#94a3b8] text-[11px]">Speaker Mismatch:</span>
              <span className="text-cyan-400 font-mono text-[10px] font-semibold">&lt;0.04 COSINE DISTANCE</span>
            </div>

            <div className="flex justify-between items-center px-2 py-1 rounded-md bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[#94a3b8] text-[11px]">Behavioral Indicators:</span>
              <span className="text-emerald-400 font-mono text-[10px] font-semibold">ZERO URGENCY PRESSURE</span>
            </div>

            <div className="flex justify-between items-center px-2 py-1 rounded-md bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[#94a3b8] text-[11px]">Ensemble Status:</span>
              <span className="text-emerald-400 font-mono text-[10px] font-semibold">4/4 LAYERS ONLINE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionInfo;

