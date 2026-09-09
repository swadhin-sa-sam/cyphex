import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, ShieldCheck, AlertTriangle, AlertOctagon, Play, Square, 
  RefreshCw, CheckCircle2, XCircle, ArrowRight, Radio, Volume2, ShieldAlert
} from 'lucide-react';
import LiveWaveform from '../components/LiveWaveform';
import RiskScoreCard from '../components/RiskScoreCard';
import WhyIsThisRisky from '../components/WhyIsThisRisky';
import MfaModal from '../components/MfaModal';
import { RiskLevel } from '../types';

interface DemoPageProps {
  onNavigate: (path: string) => void;
}

export const DemoPage: React.FC<DemoPageProps> = ({ onNavigate }) => {
  const [activeScenario, setActiveScenario] = useState<'genuine' | 'suspicious' | 'ai_impersonation'>('ai_impersonation');
  
  // Animation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [displayedRisk, setDisplayedRisk] = useState<number>(10);
  const [displayedSynthetic, setDisplayedSynthetic] = useState<number>(15);
  const [displayedSpeakerMatch, setDisplayedSpeakerMatch] = useState<number>(88);
  const [displayedContext, setDisplayedContext] = useState<number>(20);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('LOW');
  
  // End-to-end full scenario sequence flags
  const [callReceived, setCallReceived] = useState(false);
  const [transactionHeld, setTransactionHeld] = useState(false);
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [fraudPrevented, setFraudPrevented] = useState(false);
  const [whyRiskyFactors, setWhyRiskyFactors] = useState<string[]>([]);

  const animTimerRef = useRef<number | null>(null);

  // Animation values for AI Impersonation
  const IMPERSONATION_STEPS = [10, 24, 42, 61, 78, 94];

  const handleSelectScenario = (scenario: 'genuine' | 'suspicious' | 'ai_impersonation') => {
    stopSimulation();
    setActiveScenario(scenario);
    setFraudPrevented(false);
    setTransactionHeld(false);

    if (scenario === 'genuine') {
      setDisplayedRisk(12);
      setRiskLevel('LOW');
      setDisplayedSynthetic(8);
      setDisplayedSpeakerMatch(96);
      setDisplayedContext(10);
      setWhyRiskyFactors(["Voice acoustics match enrolled executive voiceprint", "Caller line verified in corporate directory"]);
    } else if (scenario === 'suspicious') {
      setDisplayedRisk(67);
      setRiskLevel('HIGH');
      setDisplayedSynthetic(45);
      setDisplayedSpeakerMatch(62);
      setDisplayedContext(70);
      setWhyRiskyFactors(["Borderline prosodic variance", "Unverified vendor contact attempting to change payment routing"]);
    } else {
      setDisplayedRisk(10);
      setRiskLevel('LOW');
      setDisplayedSynthetic(15);
      setDisplayedSpeakerMatch(88);
      setDisplayedContext(20);
      setWhyRiskyFactors([]);
    }
  };

  const stopSimulation = () => {
    if (animTimerRef.current) {
      clearInterval(animTimerRef.current);
      animTimerRef.current = null;
    }
    setIsSimulating(false);
    setCurrentStepIndex(0);
  };

  const startImpersonationDemo = () => {
    stopSimulation();
    setIsSimulating(true);
    setCallReceived(true);
    setTransactionHeld(false);
    setFraudPrevented(false);
    setCurrentStepIndex(0);

    let idx = 0;
    animTimerRef.current = window.setInterval(() => {
      idx += 1;
      if (idx < IMPERSONATION_STEPS.length) {
        const score = IMPERSONATION_STEPS[idx];
        setDisplayedRisk(score);
        setCurrentStepIndex(idx);

        if (score >= 80) {
          setRiskLevel('CRITICAL');
          setDisplayedSynthetic(91);
          setDisplayedSpeakerMatch(34);
          setDisplayedContext(92);
          setTransactionHeld(true);
          setWhyRiskyFactors([
            "Voice differs from the registered voice profile",
            "Caller is using an unrecognized number (+91 98200 11223)",
            "High-value transaction detected (₹25,00,000 exceeds threshold)",
            "Urgency language detected ('transfer immediately before 4 PM')",
            "Normal verification procedure is being bypassed"
          ]);
        } else if (score >= 60) {
          setRiskLevel('HIGH');
          setDisplayedSynthetic(74);
          setDisplayedSpeakerMatch(52);
          setDisplayedContext(65);
        } else if (score >= 30) {
          setRiskLevel('MEDIUM');
          setDisplayedSynthetic(42);
          setDisplayedSpeakerMatch(68);
          setDisplayedContext(40);
        }
      } else {
        stopSimulation();
      }
    }, 1200); // 1.2s per step for dramatic presentation
  };

  const handleCfoReject = () => {
    setTransactionHeld(false);
    setFraudPrevented(true);
  };

  const handleMfaSuccess = (newRisk: number) => {
    setDisplayedRisk(newRisk);
    setRiskLevel('LOW');
    setTransactionHeld(false);
  };

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black tracking-wider uppercase text-white font-sans flex items-center gap-2">
            <span>Smart India Hackathon 2026 Interactive Demonstration Suite</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-red-950 border border-red-500/40 text-red-400 font-bold">
              LIVE ATTACK LAB
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Select a threat vector to simulate real-time neural voice cloning interception and automated circuit-breaker enforcement
          </p>
        </div>

        <button
          onClick={() => handleSelectScenario('ai_impersonation')}
          className="px-3 py-1.5 rounded-xl bg-navy-900 border border-white/10 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset Lab State</span>
        </button>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Scenario 1: Genuine Executive */}
        <button
          onClick={() => handleSelectScenario('genuine')}
          className={`cyber-card p-4 text-left border transition-all ${
            activeScenario === 'genuine'
              ? 'border-emerald-500/60 bg-emerald-950/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400 font-bold">
              SCENARIO 1
            </span>
            <span className="text-xs font-mono font-bold text-emerald-400">12 / 100 🟢</span>
          </div>
          <div className="text-sm font-bold text-white">Genuine Executive</div>
          <div className="text-xs text-slate-400 mt-1">CFO routine strategy call with natural human micro-tremors</div>
          <div className="mt-3 pt-2 border-t border-white/[0.04] text-[10px] font-mono text-slate-500 flex justify-between">
            <span>Synthetic: 8%</span>
            <span>Speaker: 96%</span>
            <span className="text-emerald-400 font-bold">TRUSTED</span>
          </div>
        </button>

        {/* Scenario 2: Suspicious Caller */}
        <button
          onClick={() => handleSelectScenario('suspicious')}
          className={`cyber-card p-4 text-left border transition-all ${
            activeScenario === 'suspicious'
              ? 'border-amber-500/60 bg-amber-950/30 shadow-[0_0_20px_rgba(234,179,8,0.2)]'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-amber-400 font-bold">
              SCENARIO 2
            </span>
            <span className="text-xs font-mono font-bold text-amber-400">67 / 100 🟠</span>
          </div>
          <div className="text-sm font-bold text-white">Suspicious Caller</div>
          <div className="text-xs text-slate-400 mt-1">Vendor representative with anomalous urgency and audio variance</div>
          <div className="mt-3 pt-2 border-t border-white/[0.04] text-[10px] font-mono text-slate-500 flex justify-between">
            <span>Synthetic: 45%</span>
            <span>Speaker: 62%</span>
            <span className="text-amber-400 font-bold">VERIFY</span>
          </div>
        </button>

        {/* Scenario 3: AI Voice Impersonation (Flagship) */}
        <button
          onClick={() => handleSelectScenario('ai_impersonation')}
          className={`cyber-card p-4 text-left border transition-all ${
            activeScenario === 'ai_impersonation'
              ? 'border-red-500/70 bg-red-950/40 shadow-[0_0_25px_rgba(239,68,68,0.3)]'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 border border-red-500/50 text-red-400 font-bold">
              SCENARIO 3 (FLAGSHIP)
            </span>
            <span className="text-xs font-mono font-bold text-red-400 animate-pulse">94 / 100 🔴</span>
          </div>
          <div className="text-sm font-bold text-white flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-red-400" />
            <span>AI Voice Impersonation</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Zero-shot diffusion clone requesting urgent ₹25 Lakh wire</div>
          <div className="mt-3 pt-2 border-t border-white/[0.04] text-[10px] font-mono text-slate-500 flex justify-between">
            <span>Synthetic: 91%</span>
            <span>Speaker: 34%</span>
            <span className="text-red-400 font-bold">CRITICAL</span>
          </div>
        </button>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Simulation Stage & Telemetry */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Active Call Stage Banner */}
          <div className="cyber-card p-5 border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Active Inbound Intercept:</span>
              <div className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                <span>Rajesh Sharma (Claimed CFO)</span>
                <span className="text-xs font-mono text-slate-400">Line: +91 98200 11223</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Instruction: "Wire ₹25,00,000 immediately to ABC Trading Pvt Ltd before 4 PM cutoff."
              </p>
            </div>

            {activeScenario === 'ai_impersonation' && (
              <div>
                {isSimulating ? (
                  <button
                    onClick={stopSimulation}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    <span>Halt Simulation</span>
                  </button>
                ) : (
                  <button
                    onClick={startImpersonationDemo}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Run Live Attack Simulation</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Animated Risk Progression Step Tracker */}
          {activeScenario === 'ai_impersonation' && (
            <div className="cyber-card p-4 border-red-500/30 bg-red-950/20 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-red-400 font-bold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 animate-ping text-red-500" />
                  DYNAMIC SCORE PROGRESSION:
                </span>
                <span className="text-white font-black text-sm">{displayedRisk} / 100</span>
              </div>
              {/* Step Pills */}
              <div className="grid grid-cols-6 gap-2 pt-1">
                {IMPERSONATION_STEPS.map((stepVal, i) => (
                  <div
                    key={stepVal}
                    className={`py-1.5 text-center font-mono text-xs rounded-lg border transition-all ${
                      displayedRisk >= stepVal
                        ? 'bg-red-600 border-red-400 text-white font-bold shadow-[0_0_8px_#ef4444]'
                        : 'bg-navy-950 border-white/10 text-slate-500'
                    }`}
                  >
                    {stepVal}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Oscilloscope Waveform */}
          <LiveWaveform isActive={true} speechActive={displayedRisk >= 40} />

          {/* Telemetry Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="cyber-card p-3">
              <span className="text-slate-500 block text-[10px]">SYNTHETIC PROB:</span>
              <span className={`text-base font-bold ${displayedSynthetic >= 70 ? 'text-red-400' : 'text-emerald-400'}`}>
                {displayedSynthetic}%
              </span>
            </div>
            <div className="cyber-card p-3">
              <span className="text-slate-500 block text-[10px]">SPEAKER MATCH:</span>
              <span className={`text-base font-bold ${displayedSpeakerMatch < 60 ? 'text-red-400' : 'text-emerald-400'}`}>
                {displayedSpeakerMatch}%
              </span>
            </div>
            <div className="cyber-card p-3">
              <span className="text-slate-500 block text-[10px]">CONTEXT ANOMALY:</span>
              <span className={`text-base font-bold ${displayedContext >= 70 ? 'text-red-400' : 'text-slate-300'}`}>
                {displayedContext}%
              </span>
            </div>
            <div className="cyber-card p-3">
              <span className="text-slate-500 block text-[10px]">VERDICT TIER:</span>
              <span className="text-base font-bold text-white">{riskLevel}</span>
            </div>
          </div>
        </div>

        {/* Right Col: Verdict Card, Auto-Hold, and Prevention Outcome */}
        <div className="flex flex-col gap-5">
          <RiskScoreCard
            score={displayedRisk}
            riskLevel={riskLevel}
            size="large"
            explanation={activeScenario === 'ai_impersonation' 
              ? "Critical neural vocoder artifacts and biometric mismatch detected during live high-value transaction." 
              : undefined}
          />

          {whyRiskyFactors.length > 0 && (
            <WhyIsThisRisky factors={whyRiskyFactors} defaultOpen={true} />
          )}

          {/* Section 29: End-to-End Automatic Hold & Fraud Prevention Banner */}
          {transactionHeld && (
            <div className="cyber-card p-5 border-red-500/50 bg-red-950/40 flex flex-col gap-3.5 animate-bounce-short">
              <div className="flex items-center gap-2.5">
                <AlertOctagon className="w-6 h-6 text-red-400 animate-pulse flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-red-200">
                    CRITICAL IMPERSONATION RISK &bull; TRANSACTION ON HOLD
                  </h4>
                  <p className="text-[11px] text-slate-300">
                    Automated circuit breaker engaged for ₹25,00,000 transfer.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setIsMfaModalOpen(true)}
                  className="w-1/2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Verify Identity
                </button>
                <button
                  onClick={handleCfoReject}
                  className="w-1/2 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                >
                  Reject Request
                </button>
              </div>
            </div>
          )}

          {/* Fraud Attempt Prevented Banner */}
          {fraudPrevented && (
            <div className="cyber-card p-5 border-emerald-500/60 bg-emerald-950/40 flex flex-col gap-2.5 text-center items-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest text-emerald-300 font-sans">
                FRAUD ATTEMPT PREVENTED
              </h4>
              <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                Executive rejected out-of-band mobile verification. Transaction voided. Incident <strong>#VC-28491</strong> logged in SOC audit repository.
              </p>
              <button
                onClick={() => onNavigate('/incidents/VC-28491')}
                className="mt-1 px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs uppercase font-mono"
              >
                Inspect Incident #VC-28491
              </button>
            </div>
          )}
        </div>
      </div>

      <MfaModal
        isOpen={isMfaModalOpen}
        onClose={() => setIsMfaModalOpen(false)}
        initialRisk={displayedRisk}
        onVerificationComplete={handleMfaSuccess}
      />
    </div>
  );
};

export default DemoPage;
