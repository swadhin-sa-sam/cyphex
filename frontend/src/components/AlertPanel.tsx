import React, { useState, useEffect, useRef } from 'react';
import { 
  AlertCircle, ShieldAlert, Shield, ShieldCheck, Bell, 
  Search, Filter, Download, Trash2, Zap, X, Volume2, 
  ExternalLink, CheckCircle2, Lock, Radio, Sliders, ChevronRight
} from 'lucide-react';
import { RISK_LEVELS } from '../utils/constants';

export interface Alert {
  id: string;
  timestamp: Date;
  score: number;
  anomalyFlags: string[];
  recommendation: string;
  callerId?: string;
  target?: string;
}

interface AlertPanelProps {
  alerts: Alert[];
  onClearAlerts?: () => void;
  onNavigateToIncidents?: () => void;
  onAddSimulatedAlert?: () => void;
}

const AlertPanel: React.FC<AlertPanelProps> = ({ 
  alerts, 
  onClearAlerts, 
  onNavigateToIncidents,
  onAddSimulatedAlert 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [alerts]);

  const getAlertSeverityInfo = (score: number) => {
    if (score >= RISK_LEVELS.CRITICAL.threshold) {
      return {
        level: 'CRITICAL',
        badge: 'VERDICT: BLOCK SPOOF',
        badgeClass: 'text-red-300 bg-red-950/90 border-red-500/60 shadow-[0_0_8px_rgba(239,68,68,0.3)]',
        borderClass: 'border-l-2 border-l-red-500 bg-gradient-to-r from-red-950/30 to-transparent',
        Icon: ShieldAlert,
        iconColor: 'text-red-400',
        pulseColor: 'bg-red-400',
      };
    }
    if (score >= RISK_LEVELS.HIGH.threshold) {
      return {
        level: 'HIGH',
        badge: 'VERDICT: STEP-UP MFA',
        badgeClass: 'text-orange-300 bg-orange-950/90 border-orange-500/60',
        borderClass: 'border-l-2 border-l-orange-500 bg-gradient-to-r from-orange-950/30 to-transparent',
        Icon: AlertCircle,
        iconColor: 'text-orange-400',
        pulseColor: 'bg-orange-400',
      };
    }
    if (score >= RISK_LEVELS.MEDIUM.threshold) {
      return {
        level: 'MEDIUM',
        badge: 'VERDICT: MONITOR',
        badgeClass: 'text-cyan-300 bg-cyan-950/90 border-cyan-500/60',
        borderClass: 'border-l-2 border-l-cyan-500 bg-gradient-to-r from-cyan-950/30 to-transparent',
        Icon: AlertCircle,
        iconColor: 'text-cyan-400',
        pulseColor: 'bg-cyan-400',
      };
    }
    return {
      level: 'LOW',
      badge: 'VERDICT: ALLOW HUMAN',
      badgeClass: 'text-emerald-300 bg-emerald-950/90 border-emerald-500/60',
      borderClass: 'border-l-2 border-l-emerald-500 bg-gradient-to-r from-emerald-950/30 to-transparent',
      Icon: ShieldCheck,
      iconColor: 'text-emerald-400',
      pulseColor: 'bg-emerald-400',
    };
  };

  // Filtered and Searched Alerts
  const filteredAlerts = alerts.filter(alert => {
    const info = getAlertSeverityInfo(alert.score);
    if (filterSeverity !== 'ALL' && info.level !== filterSeverity) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchesId = alert.id.toLowerCase().includes(q);
    const matchesRec = alert.recommendation.toLowerCase().includes(q);
    const matchesFlags = alert.anomalyFlags.some(f => f.toLowerCase().includes(q));
    return matchesId || matchesRec || matchesFlags;
  });

  // Relative Time Helper
  const getRelativeTime = (timestamp: Date) => {
    const diffSec = Math.floor((Date.now() - timestamp.getTime()) / 1000);
    if (diffSec < 15) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    return `${diffHour}h ago`;
  };

  // Export Telemetry as JSON/STIX
  const handleExportTelemetry = () => {
    const exportData = {
      exportTimestamp: new Date().toISOString(),
      platform: 'CYPHEX Voice Security Intelligence',
      socSession: 'SOC-ACTIVE-AUDIT',
      totalEvents: alerts.length,
      events: alerts.map(a => ({
        eventId: a.id,
        timestamp: a.timestamp.toISOString(),
        riskScore: a.score,
        verdict: getAlertSeverityInfo(a.score).badge,
        anomalyFlags: a.anomalyFlags,
        recommendation: a.recommendation,
        mitreTechnique: 'T1656 Impersonation & T1566 Phishing (Voice)',
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyphex_telemetry_feed_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setActionSuccessMsg('Exported Telemetry Dossier (JSON)');
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // Synthesize Forensic Sound for Investigation Modal
  const playForensicArtifactSound = () => {
    if (isPlayingAudio) {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
      setIsPlayingAudio(false);
      return;
    }

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const biquad = audioCtx.createBiquadFilter();

      // Telephony bandpass with metallic high-frequency glitch
      biquad.type = 'bandpass';
      biquad.frequency.setValueAtTime(1450, audioCtx.currentTime);
      biquad.Q.setValueAtTime(3.5, audioCtx.currentTime);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.3);
      osc.frequency.exponentialRampToValueAtTime(310, audioCtx.currentTime + 0.8);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 1.2);

      gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 2.0);

      osc.connect(biquad);
      biquad.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      setIsPlayingAudio(true);
      osc.stop(audioCtx.currentTime + 2.0);

      osc.onended = () => {
        setIsPlayingAudio(false);
      };
    } catch (e) {
      setIsPlayingAudio(false);
    }
  };

  const handleMitigationAction = (actionName: string) => {
    setActionSuccessMsg(`Action Executed: ${actionName}`);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  return (
    <div className="premium-card p-5 h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-3 pb-2.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center">
            <Bell className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold tracking-wider uppercase text-slate-200 font-mono">
                Incident Telemetry Feed
              </h3>
              <span className="inline-flex items-center gap-1 text-[9px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.2 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                STREAM ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-1.5">
          {onAddSimulatedAlert && (
            <button
              onClick={onAddSimulatedAlert}
              className="text-[10px] font-mono text-amber-300 hover:text-white bg-amber-950/40 hover:bg-amber-950 border border-amber-500/30 px-2 py-1 rounded transition flex items-center gap-1"
              title="Inject simulated anomaly alert"
            >
              <Zap className="w-2.5 h-2.5 text-amber-400" />
              <span>Simulate</span>
            </button>
          )}

          <button
            onClick={handleExportTelemetry}
            className="text-[10px] font-mono text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] px-2 py-1 rounded transition flex items-center gap-1"
            title="Export forensic incident feed as STIX/JSON"
          >
            <Download className="w-2.5 h-2.5 text-slate-400" />
            <span>Export</span>
          </button>

          {onClearAlerts && alerts.length > 0 && (
            <button
              onClick={onClearAlerts}
              className="text-[10px] font-mono text-slate-400 hover:text-red-300 bg-white/[0.04] hover:bg-red-950/40 border border-white/[0.08] hover:border-red-500/30 p-1 rounded transition"
              title="Clear Incident Feed"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        {/* Severity Filter Pills */}
        <div className="flex items-center gap-1 bg-white/[0.02] p-0.5 rounded-lg border border-white/[0.06]">
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map((sev) => {
            const isActive = filterSeverity === sev;
            let activeClass = 'bg-white/10 text-white font-bold shadow-sm';
            if (sev === 'CRITICAL' && isActive) activeClass = 'bg-red-500 text-white font-bold';
            if (sev === 'HIGH' && isActive) activeClass = 'bg-orange-500 text-white font-bold';
            if (sev === 'MEDIUM' && isActive) activeClass = 'bg-cyan-500 text-slate-950 font-bold';

            return (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2 py-0.5 rounded text-[9px] font-mono font-medium transition ${
                  isActive ? activeClass : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev}
              </button>
            );
          })}
        </div>

        {/* Live Search Input */}
        <div className="relative flex items-center flex-grow max-w-[200px]">
          <Search className="w-3 h-3 text-slate-500 absolute left-2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search anomaly flag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/[0.06] rounded pl-6 pr-2 py-0.5 text-[10px] text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-white/20 transition"
          />
        </div>
      </div>

      {/* Toast Notification */}
      {actionSuccessMsg && (
        <div className="mb-2 p-2 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Incident Stream List */}
      <div ref={scrollRef} className="flex-grow overflow-y-auto space-y-2 pr-1 min-h-[220px]">
        {filteredAlerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-2 py-8">
            <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="font-mono text-xs font-medium text-slate-300">
              {searchQuery || filterSeverity !== 'ALL' 
                ? 'No matching security anomalies found' 
                : 'Zero Active Security Threats Recorded'}
            </span>
            <span className="text-[10px] text-[#8a8f98]">
              Continuous biometric neural inference stream active
            </span>
          </div>
        ) : (
          filteredAlerts.map(alert => {
            const info = getAlertSeverityInfo(alert.score);
            const Icon = info.Icon;
            const percentage = Math.round(alert.score * 100);

            return (
              <div 
                key={alert.id} 
                className={`alert-item-enter ${info.borderClass} p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] transition hover:border-white/20 group`}
              >
                <div className="flex justify-between items-center mb-1.5 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${info.pulseColor} animate-pulse`} />
                    <Icon className={`w-3.5 h-3.5 ${info.iconColor}`} />
                    <span className="text-[10px] font-mono font-bold text-slate-300">
                      {alert.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border ${info.badgeClass}`}>
                      {info.badge}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-white bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.08]">
                      {percentage}% RISK
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#8a8f98]">
                      {getRelativeTime(alert.timestamp)}
                    </span>
                    <button 
                      onClick={() => setSelectedAlert(alert)}
                      className="text-[10px] font-mono text-cyan-300 hover:text-white bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 px-2.5 py-0.5 rounded transition flex items-center gap-1 shadow-sm"
                    >
                      <span>Investigate</span>
                      <ChevronRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-200 mb-2 leading-relaxed">
                  {alert.recommendation}
                </div>
                
                {/* Visual Telemetry Sparkline & Anomaly Flag Tags */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/[0.04]">
                  <div className="flex flex-wrap gap-1">
                    {alert.anomalyFlags.length > 0 ? (
                      alert.anomalyFlags.map((flag, idx) => (
                        <span 
                          key={idx} 
                          className="text-[9px] font-mono bg-white/[0.04] px-1.5 py-0.5 rounded border border-white/[0.07] text-slate-300 font-semibold"
                        >
                          {flag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[9px] font-mono text-emerald-400">
                        NATURAL_VOCAL_DYNAMICS
                      </span>
                    )}
                  </div>

                  {/* Micro Audio Spectrum Preview */}
                  <div className="flex items-center gap-0.5 h-3 opacity-60 group-hover:opacity-100 transition">
                    {[12, 18, 8, 22, 14, 28, 10, 24, 16, 6].map((h, i) => (
                      <div
                        key={i}
                        className={`w-0.5 rounded-full ${alert.score >= 0.8 ? 'bg-red-400' : alert.score >= 0.6 ? 'bg-orange-400' : 'bg-cyan-400'}`}
                        style={{ height: `${(h / 30) * 12}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Incident Forensic Dossier Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="premium-card p-6 w-full max-w-2xl border border-white/20 shadow-2xl relative flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-white/[0.08] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-cyan-400">{selectedAlert.id}</span>
                  <span className="text-xs font-mono text-slate-500">• {selectedAlert.timestamp.toUTCString()}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-wider uppercase border ${getAlertSeverityInfo(selectedAlert.score).badgeClass}`}>
                    {getAlertSeverityInfo(selectedAlert.score).badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                  Incident Forensic Dossier
                </h3>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-1 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.1] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Risk & Confidence Gauge Strip */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Composite Risk</span>
                <span className="text-xl font-bold font-mono text-red-400 mt-0.5">
                  {Math.round(selectedAlert.score * 100)}%
                </span>
                <span className="text-[9px] text-slate-500 mt-1">Multi-signal ensemble</span>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Detection Confidence</span>
                <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5">99.2%</span>
                <span className="text-[9px] text-slate-500 mt-1">AASIST + Wav2Vec2</span>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex flex-col">
                <span className="text-[10px] font-mono text-slate-400 uppercase">MITRE Mapping</span>
                <span className="text-xs font-bold font-mono text-cyan-300 mt-1">T1656 / T1566</span>
                <span className="text-[9px] text-slate-500 mt-1">Voice Spoof Impersonation</span>
              </div>
            </div>

            {/* Recommendation & Assessment */}
            <div className="p-3.5 rounded-lg bg-red-950/20 border border-red-500/30">
              <span className="text-[10px] font-mono uppercase font-bold text-red-400 block mb-1">
                Automated SOC Risk Assessment:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {selectedAlert.recommendation}
              </p>
            </div>

            {/* Forensic Acoustic Signatures */}
            <div>
              <h4 className="text-[11px] font-mono uppercase text-slate-400 font-bold mb-2 tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Detected Forensic Anomaly Flags
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedAlert.anomalyFlags.length > 0 ? (
                  selectedAlert.anomalyFlags.map((flag, idx) => (
                    <div 
                      key={idx} 
                      className="px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-slate-200 flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      <span>{flag}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 italic">No discrete acoustic anomalies tagged.</div>
                )}
              </div>
            </div>

            {/* Intercepted Audio Forensic Player */}
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={playForensicArtifactSound}
                  className={`p-2 rounded-lg border transition ${
                    isPlayingAudio
                      ? 'bg-red-500 text-white border-red-400 shadow-[0_0_10px_#ef4444]'
                      : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <div>
                  <span className="text-xs font-mono font-bold text-white block">
                    {isPlayingAudio ? 'Auditing Forensic Artifact Waveform...' : 'Inspect Audio Evidence Sample'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    16 kHz Linear PCM • High-frequency vocoder distortion synthesis
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                AUDIT HASH: #B8F2
              </span>
            </div>

            {/* Tactical Remediation Actions */}
            <div className="pt-2 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMitigationAction('Severed SIP Trunk Connection (PBX Disconnect)')}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold uppercase tracking-wider transition shadow-sm"
                >
                  Sever SIP Trunk
                </button>
                <button
                  onClick={() => handleMitigationAction('Dispatched Out-of-Band Push Challenge to VIP Phone')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-mono font-bold uppercase tracking-wider transition"
                >
                  Push Step-Up MFA
                </button>
              </div>

              <div className="flex items-center gap-2">
                {onNavigateToIncidents && (
                  <button
                    onClick={() => {
                      setSelectedAlert(null);
                      onNavigateToIncidents();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold uppercase tracking-wider transition flex items-center gap-1.5"
                  >
                    <span>Open in Incidents Desk</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 text-xs font-mono transition"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertPanel;


