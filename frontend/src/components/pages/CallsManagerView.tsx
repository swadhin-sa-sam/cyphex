import React, { useState, useRef, useEffect } from 'react';
import { 
  PhoneCall, Play, Square, Download, Filter, 
  Search, ShieldAlert, ShieldCheck, Clock, User, 
  ArrowUpRight, AlertTriangle, FileText, CheckCircle2,
  X, Volume2, Radio, ExternalLink, Sliders
} from 'lucide-react';

interface CallRecord {
  id: string;
  caller: string;
  target: string;
  timestamp: string;
  duration: string;
  riskScore: number;
  verdict: 'ALLOW' | 'MONITOR' | 'MFA_REQUIRED' | 'BLOCKED';
  attackType?: string;
  audioDuration: number;
  language: string;
  jitter?: string;
  shimmer?: string;
  hnr?: string;
}

const MOCK_CALLS: CallRecord[] = [
  {
    id: 'CALL-89421',
    caller: '+91 98201 44821 (Spoofed)',
    target: 'Treasury Desk (Vance J.)',
    timestamp: '2 mins ago',
    duration: '01:45',
    riskScore: 94,
    verdict: 'BLOCKED',
    attackType: 'Diffusion Voice Clone (HiFi-GAN)',
    audioDuration: 105,
    language: 'English (Indian Accent)',
    jitter: '0.12% (Robotic Flatness)',
    shimmer: '0.45% (Over-Smoothed)',
    hnr: '8.2 dB (High Distortion)',
  },
  {
    id: 'CALL-89420',
    caller: '+1 415 892 1102',
    target: 'Accounts Payable',
    timestamp: '14 mins ago',
    duration: '03:12',
    riskScore: 78,
    verdict: 'MFA_REQUIRED',
    attackType: 'FastSpeech2 + WaveGlow',
    audioDuration: 192,
    language: 'English (US)',
    jitter: '0.24% (Low Variance)',
    shimmer: '0.62% (Synthetic Uniform)',
    hnr: '12.4 dB',
  },
  {
    id: 'CALL-89419',
    caller: '+91 91672 33410',
    target: 'Customer Support (VIP)',
    timestamp: '38 mins ago',
    duration: '02:08',
    riskScore: 18,
    verdict: 'ALLOW',
    audioDuration: 128,
    language: 'Hindi / English (Hinglish)',
    jitter: '0.84% (Natural Phonation)',
    shimmer: '2.40% (Natural Breath)',
    hnr: '21.5 dB (Authentic Human)',
  },
  {
    id: 'CALL-89418',
    caller: '+44 20 7946 0912',
    target: 'Board Secretariat',
    timestamp: '1 hr ago',
    duration: '04:30',
    riskScore: 88,
    verdict: 'BLOCKED',
    attackType: 'Real-Time Voice Conversion (RVC v2)',
    audioDuration: 270,
    language: 'English (UK)',
    jitter: '0.18% (Conversion Artifact)',
    shimmer: '0.51% (Over-Smoothed)',
    hnr: '9.8 dB',
  },
  {
    id: 'CALL-89417',
    caller: '+91 80 4112 9000',
    target: 'IT Helpdesk',
    timestamp: '2 hrs ago',
    duration: '01:15',
    riskScore: 42,
    verdict: 'MONITOR',
    audioDuration: 75,
    language: 'Kannada / English',
    jitter: '0.65% (Borderline)',
    shimmer: '1.80% (Acceptable)',
    hnr: '16.2 dB',
  },
  {
    id: 'CALL-89416',
    caller: '+91 98110 55678',
    target: 'Private Wealth Management',
    timestamp: '3 hrs ago',
    duration: '05:40',
    riskScore: 12,
    verdict: 'ALLOW',
    audioDuration: 340,
    language: 'English (Indian Accent)',
    jitter: '0.92% (Natural Human)',
    shimmer: '2.85% (Natural Human)',
    hnr: '23.8 dB (High Clarity)',
  },
];

export const CallsManagerView: React.FC = () => {
  const [calls] = useState<CallRecord[]>(MOCK_CALLS);
  const [search, setSearch] = useState('');
  const [filterVerdict, setFilterVerdict] = useState<string>('ALL');
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  const stopPlayback = () => {
    if (oscRef.current) {
      try {
        oscRef.current.stop();
        oscRef.current.disconnect();
      } catch {}
      oscRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setPlayingCallId(null);
  };

  useEffect(() => {
    return () => {
      stopPlayback();
    };
  }, []);

  const handleTogglePlay = (call: CallRecord) => {
    if (playingCallId === call.id) {
      stopPlayback();
      return;
    }

    stopPlayback();

    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = audioCtx;

      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      // Telephony bandpass (300Hz - 3400Hz)
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
      filter.Q.setValueAtTime(1.8, audioCtx.currentTime);

      const isSynthetic = call.verdict === 'BLOCKED' || call.riskScore >= 75;

      if (isSynthetic) {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, audioCtx.currentTime);
        osc.frequency.setValueAtTime(190, audioCtx.currentTime + 0.4);
        osc.frequency.setValueAtTime(130, audioCtx.currentTime + 0.9);
        osc.frequency.setValueAtTime(260, audioCtx.currentTime + 1.4);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(135, audioCtx.currentTime + 0.5);
        osc.frequency.linearRampToValueAtTime(115, audioCtx.currentTime + 1.2);
      }

      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 4.0);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      oscRef.current = osc;
      setPlayingCallId(call.id);

      osc.onended = () => {
        setPlayingCallId(null);
      };

      setTimeout(() => {
        if (playingCallId === call.id) {
          stopPlayback();
        }
      }, 4000);
    } catch (e) {
      console.warn("Audio playback notice:", e);
      setPlayingCallId(null);
    }
  };

  const handleDownloadEvidence = (call: CallRecord) => {
    const evidencePack = {
      evidenceId: `EVD-${call.id}`,
      callSessionId: call.id,
      timestamp: new Date().toISOString(),
      originCaller: call.caller,
      targetExtension: call.target,
      audioDuration: `${call.audioDuration} seconds`,
      languageLocale: call.language,
      forensicVerification: {
        riskScore: `${call.riskScore}%`,
        securityVerdict: call.verdict,
        synthesisMarker: call.attackType || 'Natural Human Phonation',
        acousticProsody: {
          jitter: call.jitter || '0.75%',
          shimmer: call.shimmer || '2.10%',
          hnr: call.hnr || '19.4 dB',
        },
        cryptographicHash: 'SHA-256(7f8a92b3c4d5e6f1029384756)',
        mitreTechnique: 'T1656 Impersonation / Deepfake Voice Cloning',
      },
      auditCompliance: 'RBI Digital Payment Security & DPDP Act 2023 Compliant',
    };

    const blob = new Blob([JSON.stringify(evidencePack, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyphex_evidence_${call.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setToastMsg(`Exported forensic evidence pack for ${call.id}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredCalls = calls.filter((c) => {
    const matchesSearch = 
      c.caller.toLowerCase().includes(search.toLowerCase()) ||
      c.target.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase());
    const matchesVerdict = filterVerdict === 'ALL' || c.verdict === filterVerdict;
    return matchesSearch && matchesVerdict;
  });

  const getVerdictBadge = (verdict: CallRecord['verdict']) => {
    switch (verdict) {
      case 'BLOCKED':
        return 'bg-red-950/80 text-red-300 border-red-500/40 shadow-[0_0_8px_rgba(239,68,68,0.2)]';
      case 'MFA_REQUIRED':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
      case 'MONITOR':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40';
      case 'ALLOW':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar */}
      <div className="premium-card p-5 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-cyan-400" />
            Interception History & Call Audits
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Historical call telemetry, neural risk verdicts, and compliance recordings archive.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search call ID, caller, target..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/[0.03] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-white/20 w-full font-mono transition"
            />
          </div>

          {/* Verdict Filter Bar */}
          <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-lg border border-white/[0.08] text-xs overflow-x-auto touch-scroll-x no-scrollbar max-w-full">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 px-2 py-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3 text-cyan-400" />
              VERDICT:
            </span>
            {(['ALL', 'BLOCKED', 'MFA_REQUIRED', 'MONITOR', 'ALLOW'] as const).map((v) => {
              const isActive = filterVerdict === v;
              let activeClass = 'bg-white/10 text-white font-semibold shadow-sm';
              if (v === 'BLOCKED' && isActive) activeClass = 'bg-red-500 text-white';
              if (v === 'MFA_REQUIRED' && isActive) activeClass = 'bg-amber-500 text-slate-950 font-bold';
              if (v === 'ALLOW' && isActive) activeClass = 'bg-emerald-500 text-slate-950 font-bold';

              return (
                <button
                  key={v}
                  onClick={() => setFilterVerdict(v)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-medium uppercase shrink-0 transition-all ${
                    isActive ? activeClass : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Audio Playback Notification Banner */}
      {playingCallId && (
        <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 flex items-center justify-between animate-fadeIn text-xs font-mono">
          <div className="flex items-center gap-3">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Auditing Intercepted Telephony Channel: <strong>{playingCallId}</strong></span>
            <div className="flex items-center gap-1">
              {[12, 24, 18, 28, 14, 20, 10].map((h, i) => (
                <div key={i} className="w-1 bg-cyan-400 rounded animate-pulse" style={{ height: `${h}px` }} />
              ))}
            </div>
          </div>
          <button
            onClick={stopPlayback}
            className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold"
          >
            Stop Audio
          </button>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Call Records: Mobile Adaptive Card View (< md) */}
      <div className="flex flex-col gap-3 md:hidden">
        {filteredCalls.map((call) => (
          <div key={call.id} className="premium-card p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start">
              <div>
                <button
                  onClick={() => setSelectedCall(call)}
                  className="font-mono text-cyan-300 font-bold text-xs hover:underline flex items-center gap-1"
                >
                  <span>{call.id}</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </button>
                <div className="font-semibold text-slate-200 text-xs mt-0.5">{call.caller}</div>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-black border tracking-wider uppercase ${getVerdictBadge(call.verdict)}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  call.verdict === 'BLOCKED' ? 'bg-red-400 animate-ping' :
                  call.verdict === 'MFA_REQUIRED' ? 'bg-amber-400' :
                  call.verdict === 'MONITOR' ? 'bg-cyan-400' : 'bg-emerald-400'
                }`} />
                <span>{call.verdict.replace('_', ' ')}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">Target Extension</span>
                <span className="text-slate-300 font-medium truncate block">{call.target}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 block uppercase">Risk Score</span>
                <span className={`font-bold text-xs ${
                  call.riskScore >= 80 ? 'text-red-400' :
                  call.riskScore >= 60 ? 'text-amber-400' :
                  call.riskScore >= 30 ? 'text-cyan-400' : 'text-emerald-400'
                }`}>
                  {call.riskScore}%
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[9px] text-slate-500 block uppercase">Language / Marker</span>
                <span className="text-slate-300 truncate block">{call.language} • {call.attackType || 'Natural Speech'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
              <span className="text-[10px] text-slate-500 font-mono">{call.timestamp} • {call.duration}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleTogglePlay(call)}
                  className={`p-1.5 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1 ${
                    playingCallId === call.id
                      ? 'bg-red-500 text-white border-red-400'
                      : 'bg-slate-900 border-white/[0.08] text-slate-300'
                  }`}
                >
                  {playingCallId === call.id ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{playingCallId === call.id ? 'Stop' : 'Audio'}</span>
                </button>
                <button
                  onClick={() => setSelectedCall(call)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-cyan-300 text-xs font-mono font-semibold flex items-center gap-1"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Dossier</span>
                </button>
                <button
                  onClick={() => handleDownloadEvidence(call)}
                  className="p-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-slate-400"
                  title="Download Evidence"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call Records: Desktop / Tablet Table View (>= md) */}
      <div className="premium-card p-4 overflow-x-auto touch-scroll-x no-scrollbar hidden md:block">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-white/[0.06] text-[10px] font-mono uppercase text-slate-400 tracking-wider">
              <th className="pb-3 pl-2">Session ID</th>
              <th className="pb-3">Origin Caller</th>
              <th className="pb-3">Target Extension</th>
              <th className="pb-3">Language / Accent</th>
              <th className="pb-3">Risk Score</th>
              <th className="pb-3">Security Verdict</th>
              <th className="pb-3">Synthesis Marker</th>
              <th className="pb-3 text-right pr-2">Forensic Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-xs">
            {filteredCalls.map((call) => (
              <tr key={call.id} className="hover:bg-slate-950/40 transition-colors group">
                <td className="py-3.5 pl-2 font-mono text-cyan-300 font-semibold">
                  <button 
                    onClick={() => setSelectedCall(call)}
                    className="hover:underline text-left"
                  >
                    {call.id}
                  </button>
                </td>
                <td className="py-3.5 font-medium text-slate-200">
                  {call.caller}
                </td>
                <td className="py-3.5 text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  {call.target}
                </td>
                <td className="py-3.5 text-slate-400 font-mono text-[11px]">
                  {call.language}
                </td>
                <td className="py-3.5 font-mono font-bold">
                  <span className={`text-sm ${
                    call.riskScore >= 80 ? 'text-red-400' :
                    call.riskScore >= 60 ? 'text-amber-400' :
                    call.riskScore >= 30 ? 'text-cyan-400' : 'text-emerald-400'
                  }`}>
                    {call.riskScore}%
                  </span>
                </td>
                <td className="py-3.5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-black border tracking-wider uppercase shadow-sm ${getVerdictBadge(call.verdict)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      call.verdict === 'BLOCKED' ? 'bg-red-400 shadow-[0_0_6px_#ef4444] animate-ping' :
                      call.verdict === 'MFA_REQUIRED' ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]' :
                      call.verdict === 'MONITOR' ? 'bg-cyan-400 shadow-[0_0_6px_#06b6d4]' :
                      'bg-emerald-400 shadow-[0_0_6px_#10b981]'
                    }`} />
                    <span>{call.verdict.replace('_', ' ')}</span>
                  </span>
                </td>
                <td className="py-3.5 text-[11px] text-slate-400 font-mono">
                  {call.attackType ? (
                    <span className="text-red-300 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/20">
                      {call.attackType}
                    </span>
                  ) : (
                    <span className="text-emerald-400">Natural Human Dynamic</span>
                  )}
                </td>
                <td className="py-3.5 text-right pr-2">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleTogglePlay(call)}
                      className={`p-1.5 rounded-lg border transition ${
                        playingCallId === call.id
                          ? 'bg-red-500 text-white border-red-400 shadow-[0_0_8px_#ef4444]'
                          : 'bg-slate-900 border-white/[0.08] text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40'
                      }`}
                      title={playingCallId === call.id ? "Halt playback" : "Auditory telemetry preview"}
                    >
                      {playingCallId === call.id ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => setSelectedCall(call)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-slate-300 hover:text-white hover:border-white/20 transition"
                      title="Inspect Call Telemetry Dossier"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDownloadEvidence(call)}
                      className="p-1.5 rounded-lg bg-slate-900 border border-white/[0.08] text-slate-400 hover:text-slate-200 hover:border-white/20 transition"
                      title="Download Forensic Evidence Pack"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Call Telemetry Inspection Modal */}
      {selectedCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="premium-card p-4 sm:p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto no-scrollbar border border-white/20 shadow-2xl relative flex flex-col gap-4">
            <div className="flex justify-between items-start border-b border-white/[0.08] pb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-bold text-cyan-400">{selectedCall.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${getVerdictBadge(selectedCall.verdict)}`}>
                    {selectedCall.verdict}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-white">Call Forensic Interception Dossier</h3>
              </div>
              <button
                onClick={() => setSelectedCall(null)}
                className="p-1 rounded-lg bg-white/[0.04] text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] text-slate-500 block mb-0.5">ORIGIN CALLER</span>
                <span className="text-slate-200 font-bold">{selectedCall.caller}</span>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] text-slate-500 block mb-0.5">TARGET EXTENSION</span>
                <span className="text-slate-200 font-bold">{selectedCall.target}</span>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] text-slate-500 block mb-0.5">DURATION</span>
                <span className="text-slate-200">{selectedCall.duration} ({selectedCall.audioDuration}s)</span>
              </div>
              <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <span className="text-[10px] text-slate-500 block mb-0.5">RISK SCORE</span>
                <span className={`text-base font-bold ${selectedCall.riskScore >= 80 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {selectedCall.riskScore}%
                </span>
              </div>
            </div>

            {/* Prosody Analysis Strip */}
            <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-xs font-mono space-y-2">
              <span className="text-[10px] text-cyan-400 uppercase font-bold block">
                Acoustic Prosody Diagnostics (Praat Extract)
              </span>
              <div className="flex justify-between text-slate-300">
                <span>Pitch Jitter:</span>
                <span className="font-bold">{selectedCall.jitter || '0.72%'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Amplitude Shimmer:</span>
                <span className="font-bold">{selectedCall.shimmer || '2.10%'}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Harmonics-to-Noise (HNR):</span>
                <span className="font-bold">{selectedCall.hnr || '19.5 dB'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.08]">
              <button
                onClick={() => handleTogglePlay(selectedCall)}
                className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{playingCallId === selectedCall.id ? 'Stop Playback' : 'Play Intercepted Audio'}</span>
              </button>
              <button
                onClick={() => handleDownloadEvidence(selectedCall)}
                className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 text-xs font-mono flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Dossier (JSON)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallsManagerView;
