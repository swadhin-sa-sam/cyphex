import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, PhoneOff, Shield, ShieldAlert, AlertTriangle, 
  CheckCircle2, Clock, Globe, Mic, Volume2, ShieldCheck, 
  ArrowRight, Radio, RefreshCw
} from 'lucide-react';
import RiskScoreCard from '../components/RiskScoreCard';
import LiveWaveform from '../components/LiveWaveform';
import WhyIsThisRisky from '../components/WhyIsThisRisky';
import MfaModal from '../components/MfaModal';
import { WS_BASE_URL, API_BASE_URL } from '../utils/constants';
import { RiskResult, RiskLevel } from '../types';

interface LiveCallPageProps {
  callId?: string;
  onNavigate: (path: string) => void;
}

export const LiveCallPage: React.FC<LiveCallPageProps> = ({ callId = "call-sih-001", onNavigate }) => {
  const [duration, setDuration] = useState(124);
  const [isConnected, setIsConnected] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Real-time signal state (Defaults match prompt specifications)
  const [overallRisk, setOverallRisk] = useState<number>(87);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('HIGH');
  const [actionRecommended, setActionRecommended] = useState<string>('SECONDARY_VERIFICATION_REQUIRED');
  
  const [syntheticSpeech, setSyntheticSpeech] = useState<number>(84);
  const [speakerMatch, setSpeakerMatch] = useState<number>(41);
  const [prosodyAnomaly, setProsodyAnomaly] = useState<number>(72);
  const [callerAnomaly, setCallerAnomaly] = useState<number>(68);
  const [behavioralRisk, setBehavioralRisk] = useState<number>(75);
  const [transactionRisk, setTransactionRisk] = useState<number>(90);

  const [whyRiskyFactors, setWhyRiskyFactors] = useState<string[]>([
    "Voice differs from the registered voice profile",
    "Caller is using an unrecognized number",
    "High-value transaction detected",
    "Urgency language detected",
    "Normal verification procedure is being bypassed"
  ]);

  const [speechActive, setSpeechActive] = useState<boolean>(true);
  const [latencyMs, setLatencyMs] = useState<number>(24.5);

  const wsRef = useRef<WebSocket | null>(null);

  // Duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // WebSocket Live Stream Connection
  useEffect(() => {
    const wsUrl = `${WS_BASE_URL}/calls/${callId}/stream?scenario=ai_impersonation`;
    let ws: WebSocket;

    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        // Send initial ping
        ws.send(JSON.stringify({ action: "INIT_STREAM", scenario: "ai_impersonation" }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.overall_risk !== undefined) {
            setOverallRisk(data.overall_risk);
            setRiskLevel(data.risk_level as RiskLevel);
            setActionRecommended(data.action_recommended);
            setSyntheticSpeech(data.synthetic_score);
            setSpeakerMatch(data.speaker_score);
            setProsodyAnomaly(data.prosody_score);
            setCallerAnomaly(data.caller_anomaly_score);
            setBehavioralRisk(data.behavior_score);
            setTransactionRisk(data.transaction_risk_score);
            if (data.why_risky && data.why_risky.length > 0) {
              setWhyRiskyFactors(data.why_risky);
            }
            if (data.speech_active !== undefined) {
              setSpeechActive(data.speech_active);
            }
            if (data.latency_ms) {
              setLatencyMs(data.latency_ms);
            }
          }
        } catch {}
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

      ws.onerror = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
    }

    // Fallback simulation timer if WS offline to ensure real-time values update smoothly
    const simInterval = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        setSyntheticSpeech((prev) => Math.min(96, Math.max(78, prev + Math.floor(Math.random() * 5 - 2))));
        setSpeakerMatch((prev) => Math.min(48, Math.max(34, prev + Math.floor(Math.random() * 3 - 1))));
        setProsodyAnomaly((prev) => Math.min(80, Math.max(68, prev + Math.floor(Math.random() * 3 - 1))));
        setLatencyMs(round(Math.random() * 8 + 20));
      } else {
        // Send keepalive chunk
        try {
          wsRef.current.send(JSON.stringify({ action: "PING" }));
        } catch {}
      }
    }, 2500);

    return () => {
      clearInterval(simInterval);
      if (wsRef.current) wsRef.current.close();
    };
  }, [callId]);

  const round = (num: number) => Math.round(num * 10) / 10;

  const handleVerificationComplete = (newRisk: number) => {
    setOverallRisk(newRisk);
    setRiskLevel('LOW');
    setActionRecommended("ALLOW / CONTINUE");
    setSpeakerMatch(94);
    setSyntheticSpeech(14);
    setWhyRiskyFactors([
      "Out-of-band mobile verification confirmed by executive",
      "Biometric voiceprint authorization cleared",
      "Transaction hold automatically released"
    ]);
  };

  return (
    <div className="p-4 md:p-6 flex flex-col gap-5 max-w-7xl mx-auto w-full">
      {/* Caller Header Card */}
      <div className="cyber-card p-5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Caller Info */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Phone className="w-6 h-6" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-navy-950 shadow-[0_0_8px_#34d399]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white uppercase tracking-wider">
                Rajesh Sharma
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950 border border-red-500/40 text-red-400 animate-pulse">
                SPOOF SUSPECT
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-navy-950 border border-white/10 text-slate-300">
                VoIP TRUNK
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
              <span>Claimed: <strong>Chief Financial Officer (CFO)</strong></span>
              <span>&bull;</span>
              <span>Origin: <strong>+91 98200 11223</strong></span>
            </div>
          </div>
        </div>

        {/* Center: Live Call Telemetry */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-navy-950 border border-white/[0.08] flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Duration:</span>
            <span className="text-white font-bold">
              {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-navy-950 border border-white/[0.08] flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Language:</span>
            <span className="text-white font-bold">EN-IN</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-navy-950 border border-white/[0.08] flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-400">Inference SLA:</span>
            <span className="text-emerald-400 font-bold">{latencyMs} ms</span>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsVerifying(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-1.5 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Identity</span>
          </button>
          <button
            onClick={() => onNavigate('/transactions')}
            className="px-4 py-2 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Reject & Terminate</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column Diagnostics (2 cols) | Right Column Verdict (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Column: Waveform & Real-Time Signal Breakdown */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Live Waveform Oscilloscope */}
          <LiveWaveform isActive={true} speechActive={speechActive} />

          {/* Section 11: Real-Time Signals Grid */}
          <div className="cyber-card p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <span>Multi-Modal Telemetry Signals</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/30">
                    REAL-TIME
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Continuous decomposition across acoustic, biometric, and contextual layers
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Auto-refresh &bull; 250ms</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Synthetic Speech */}
              <div className="p-3 rounded-xl bg-navy-950/70 border border-white/[0.06] flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Synthetic Speech Probability</span>
                  <span className="font-mono font-bold text-red-400">{syntheticSpeech}%</span>
                </div>
                <div className="w-full bg-navy-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500 shadow-[0_0_8px_#ef4444]"
                    style={{ width: `${syntheticSpeech}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Vocoder cutoff &gt;7.2kHz, unnatural flatness</span>
              </div>

              {/* Speaker Match */}
              <div className="p-3 rounded-xl bg-navy-950/70 border border-white/[0.06] flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Biometric Speaker Match</span>
                  <span className={`font-mono font-bold ${speakerMatch < 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {speakerMatch}%
                  </span>
                </div>
                <div className="w-full bg-navy-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${speakerMatch < 50 ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${speakerMatch}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Mismatch vs registered CFO voiceprint</span>
              </div>

              {/* Prosody Anomaly */}
              <div className="p-3 rounded-xl bg-navy-950/70 border border-white/[0.06] flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Prosody Anomaly Score</span>
                  <span className="font-mono font-bold text-orange-400">{prosodyAnomaly}%</span>
                </div>
                <div className="w-full bg-navy-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${prosodyAnomaly}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Robotic micro-jitter &lt;0.25%, pitch step anomaly</span>
              </div>

              {/* Caller Lineage Anomaly */}
              <div className="p-3 rounded-xl bg-navy-950/70 border border-white/[0.06] flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Caller Lineage Anomaly</span>
                  <span className="font-mono font-bold text-orange-400">{callerAnomaly}%</span>
                </div>
                <div className="w-full bg-navy-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${callerAnomaly}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Unrecognized originating trunk line</span>
              </div>

              {/* Behavioral Risk */}
              <div className="p-3 rounded-xl bg-navy-950/70 border border-white/[0.06] flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Behavioral NLP Risk</span>
                  <span className="font-mono font-bold text-orange-400">{behavioralRisk}%</span>
                </div>
                <div className="w-full bg-navy-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                    style={{ width: `${behavioralRisk}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-mono">Urgency detected: 'before 4 PM cutoff'</span>
              </div>

              {/* Transaction Risk */}
              <div className="p-3 rounded-xl bg-navy-950/70 border border-white/[0.06] flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Transaction Context Risk</span>
                  <span className="font-mono font-bold text-red-400">{transactionRisk}%</span>
                </div>
                <div className="w-full bg-navy-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500 shadow-[0_0_8px_#ef4444]"
                    style={{ width: `${transactionRisk}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 font-mono">₹25,00,000 wire to unverified beneficiary</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Prominent Risk Verdict Card & Why is this risky */}
        <div className="flex flex-col gap-5">
          {/* Main Reusable Risk Score Card */}
          <RiskScoreCard
            score={overallRisk}
            riskLevel={riskLevel}
            actionRecommended={actionRecommended}
            size="large"
            explanation="Multiple high-confidence indicators of AI speech synthesis and identity mismatch detected on active voice channel."
          />

          {/* Section 12: Expandable 'Why is this risky?' Panel */}
          <WhyIsThisRisky factors={whyRiskyFactors} defaultOpen={true} />

          {/* Transaction Action Safeguard Card */}
          <div className="cyber-card p-4 flex flex-col gap-3 border border-red-500/30 bg-red-950/20">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Target Financial Action:</span>
                <div className="text-sm font-bold text-white mt-0.5">Wire Transfer &bull; ₹25,00,000</div>
                <div className="text-xs text-slate-400">Beneficiary: ABC Trading Pvt Ltd</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 border border-red-500/40 text-red-400 font-bold">
                HOLD ENFORCED
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-snug">
              System policy automatically suspended this transaction because risk score (<strong>{overallRisk}/100</strong>) exceeds threshold 80.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setIsVerifying(true)}
                className="w-1/2 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
              >
                Verify Identity
              </button>
              <button
                onClick={() => onNavigate('/transactions')}
                className="w-1/2 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 border border-white/10 text-slate-300 font-semibold text-xs transition-colors"
              >
                Transaction Hub
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MFA Verification Modal */}
      <MfaModal
        isOpen={isVerifying}
        onClose={() => setIsVerifying(false)}
        callId={callId}
        initialRisk={overallRisk}
        onVerificationComplete={handleVerificationComplete}
      />
    </div>
  );
};

export default LiveCallPage;
