import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, ShieldAlert, ArrowLeft, Clock, CheckCircle2, 
  FileText, User, Phone, DollarSign, Activity 
} from 'lucide-react';
import { API_BASE_URL } from '../utils/constants';
import { Incident } from '../types';

interface IncidentDetailPageProps {
  incidentId?: string;
  onNavigate: (path: string) => void;
}

export const IncidentDetailPage: React.FC<IncidentDetailPageProps> = ({ 
  incidentId = "VC-28491", 
  onNavigate 
}) => {
  const [incident, setIncident] = useState<Incident>({
    id: incidentId,
    call_id: "call-sih-001",
    caller: "+91 98200 11223",
    claimed_identity: "Rajesh Sharma (CFO)",
    risk_score: 91.0,
    threat_type: "Executive Voice Impersonation",
    transaction_id: "tx-sih-001",
    recommended_action: "BLOCK",
    actual_action: "TRANSACTION BLOCKED",
    status: "BLOCKED",
    timeline: [
      { time: "10:14:02", event: "Incoming VoIP call received from unrecognized trunk (+91 98200 11223)" },
      { time: "10:14:15", event: "Caller claimed executive identity: Rajesh Sharma (Chief Financial Officer)" },
      { time: "10:14:28", event: "High-value transaction requested: ₹25,00,000 wire to ABC Trading Pvt Ltd" },
      { time: "10:14:35", event: "AASIST & Wav2Vec2 detected neural vocoder artifacts (86%) + Speaker Mismatch (78%)" },
      { time: "10:14:38", event: "Critical impersonation risk (91/100). Automated circuit breaker: TRANSACTION BLOCKED." }
    ],
    created_at: "2026-09-09T10:14:38Z"
  });

  useEffect(() => {
    fetch(`${API_BASE_URL}/incidents/${incidentId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setIncident(data);
      })
      .catch(() => {});
  }, [incidentId]);

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-5xl mx-auto w-full">
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('/incidents')}
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Incident Queue</span>
        </button>
      </div>

      {/* Incident Header Card */}
      <div className="cyber-card p-6 border-red-500/40 bg-gradient-to-r from-red-950/40 via-navy-950 to-navy-900 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-500/60 flex items-center justify-center text-red-400 animate-pulse">
            <AlertOctagon className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black uppercase tracking-wider text-white font-mono">
                Incident #{incident.id}
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-950 border border-red-500/40 text-red-400 font-bold">
                {incident.status}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Threat: <strong>{incident.threat_type}</strong>
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Severity Risk Score</span>
          <span className="text-2xl font-black font-mono text-red-400">
            {Math.round(incident.risk_score)} / 100
          </span>
        </div>
      </div>

      {/* Grid: Signals Breakdown & Transaction Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Signals */}
        <div className="cyber-card p-5 flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Forensic Signal Breakdown</span>
          </h3>

          <div className="flex flex-col gap-3 mt-1">
            <div className="p-3 rounded-xl bg-navy-950/80 border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white">Synthetic Voice Probability</span>
                <span className="text-[10px] text-slate-400 block font-mono">Diffusion & HiFi-GAN acoustic signature</span>
              </div>
              <span className="text-sm font-mono font-black text-red-400">86%</span>
            </div>

            <div className="p-3 rounded-xl bg-navy-950/80 border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white">Speaker Biometric Mismatch</span>
                <span className="text-[10px] text-slate-400 block font-mono">Deviation from Rajesh Sharma voiceprint</span>
              </div>
              <span className="text-sm font-mono font-black text-red-400">78%</span>
            </div>

            <div className="p-3 rounded-xl bg-navy-950/80 border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white">Social Engineering / Behavior Risk</span>
                <span className="text-[10px] text-slate-400 block font-mono">Urgency pressure ('before 4 PM cutoff')</span>
              </div>
              <span className="text-sm font-mono font-black text-orange-400">82%</span>
            </div>

            <div className="p-3 rounded-xl bg-navy-950/80 border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white">Caller Lineage Anomaly</span>
                <span className="text-[10px] text-slate-400 block font-mono">Unrecognized originating VoIP trunk</span>
              </div>
              <span className="text-sm font-mono font-black text-orange-400">71%</span>
            </div>
          </div>
        </div>

        {/* Transaction & Action Taken */}
        <div className="cyber-card p-5 flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Target Financial Context & Action</span>
          </h3>

          <div className="p-4 rounded-xl bg-navy-950/80 border border-white/[0.06] flex flex-col gap-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">TARGETED AMOUNT:</span>
              <span className="text-white font-bold text-sm">₹25,00,000 (INR)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">BENEFICIARY:</span>
              <span className="text-slate-300">ABC Trading Pvt Ltd</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ACCOUNT NUMBER:</span>
              <span className="text-slate-300">HDFC000123456789</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-white/[0.04]">
              <span className="text-slate-500">ACTION ENFORCED:</span>
              <span className="text-red-400 font-bold uppercase">TRANSACTION BLOCKED</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-200">
            🛡️ <strong>Automated Resolution:</strong> Out-of-band verification challenge was dispatched to CFO mobile. Executive explicitly rejected authorization. Fraud prevented with zero capital loss.
          </div>
        </div>
      </div>

      {/* Explanation Timeline */}
      <div className="cyber-card p-5 flex flex-col gap-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span>Chronological Forensic Timeline</span>
        </h3>

        <div className="relative pl-6 border-l-2 border-cyan-500/30 flex flex-col gap-4 mt-2">
          {incident.timeline.map((item, idx) => (
            <div key={idx} className="relative text-xs">
              <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-cyan-400 border-2 border-navy-950 shadow-[0_0_6px_#38bdf8]" />
              <span className="font-mono text-[10px] text-cyan-400 font-bold block">{item.time} UTC</span>
              <p className="text-slate-300 mt-0.5">{item.event}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailPage;
