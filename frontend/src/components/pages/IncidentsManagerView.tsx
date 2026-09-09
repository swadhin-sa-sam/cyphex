import React, { useState } from 'react';
import { 
  ShieldAlert, AlertOctagon, CheckCircle2, Clock, 
  ExternalLink, UserCheck, MessageSquare, ArrowRight, 
  Filter, Search, AlertTriangle, ShieldX, Lock, FileText 
} from 'lucide-react';

interface IncidentCase {
  id: string;
  callSessionId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  impersonatedVIP: string;
  status: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED';
  detectedAt: string;
  assignedAnalyst: string;
  threatVector: string;
  actionTaken: string;
  notes: string;
}

const MOCK_INCIDENTS: IncidentCase[] = [
  {
    id: 'INC-2026-0941',
    callSessionId: 'SES-9F82D1C7',
    severity: 'CRITICAL',
    title: 'Executive Wire Impersonation ($2.4M Escrow Attempt)',
    impersonatedVIP: 'Johnathan Vance (Group CEO)',
    status: 'OPEN',
    detectedAt: '8 mins ago',
    assignedAnalyst: 'Swadhin (Lead SOC)',
    threatVector: 'Neural Voice Conversion via SIP Trunk + Urgent Scenarios',
    actionTaken: 'Automated PBX Cutoff + Treasury Wire Intercepted',
    notes: 'Attacker used high-frequency vocoder synthesis with 0.12% robotic jitter. Automated risk engine halted transfer at risk score 94%.',
  },
  {
    id: 'INC-2026-0940',
    callSessionId: 'SES-3E41F90A',
    severity: 'HIGH',
    title: 'Customer Voice OTP Extraction Campaign',
    impersonatedVIP: 'Sarah Jenkins (CFO)',
    status: 'INVESTIGATING',
    detectedAt: '42 mins ago',
    assignedAnalyst: 'Priya Sharma (SOC Level 2)',
    threatVector: 'HiFi-GAN Cloned Speech with Injected Cellular Background Noise',
    actionTaken: 'Step-Up Out-of-Band Push Notification Challenge Dispatched',
    notes: 'Target failed bi-directional behavioral challenge. Session escalated to manual security callback.',
  },
  {
    id: 'INC-2026-0939',
    callSessionId: 'SES-11B824CA',
    severity: 'MEDIUM',
    title: 'Repeated Synthetic Voice Replay Probing',
    impersonatedVIP: 'Internal IT Admin',
    status: 'CONTAINED',
    detectedAt: '2 hrs ago',
    assignedAnalyst: 'Alex Rivera (Security Analyst)',
    threatVector: 'Acoustic Soundboard Replay Attack',
    actionTaken: 'Caller ANI Blocked at Session Border Controller (SBC)',
    notes: 'Identical phase spectrum signature across 4 distinct call sessions within 15 minutes.',
  },
  {
    id: 'INC-2026-0938',
    callSessionId: 'SES-88C194DF',
    severity: 'CRITICAL',
    title: 'Privileged Infrastructure Credential Reset Attempt',
    impersonatedVIP: 'Chief Security Officer',
    status: 'RESOLVED',
    detectedAt: '5 hrs ago',
    assignedAnalyst: 'Swadhin (Lead SOC)',
    threatVector: 'XTTS-v2 Multi-Lingual Hindi/English Voice Clone',
    actionTaken: 'Account Locked & Red-Team Verification Completed',
    notes: 'Authentic CSO confirmed zero contact. Incident package exported to law enforcement cyber division.',
  },
];

export const IncidentsManagerView: React.FC = () => {
  const [incidents, setIncidents] = useState<IncidentCase[]>(MOCK_INCIDENTS);
  const [selectedIncident, setSelectedIncident] = useState<IncidentCase | null>(MOCK_INCIDENTS[0]);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredIncidents = incidents.filter((inc) => {
    if (filterSeverity === 'ALL') return true;
    return inc.severity === filterSeverity;
  });

  const getSeverityBadge = (severity: IncidentCase['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-950/90 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
      case 'HIGH':
        return 'bg-orange-950/90 text-orange-300 border-orange-500/50';
      case 'MEDIUM':
        return 'bg-amber-950/90 text-amber-300 border-amber-500/50';
    }
  };

  const getStatusBadge = (status: IncidentCase['status']) => {
    switch (status) {
      case 'OPEN':
        return 'bg-red-900/60 text-red-200 border-red-500/40 animate-pulse';
      case 'INVESTIGATING':
        return 'bg-blue-900/60 text-blue-200 border-blue-500/40';
      case 'CONTAINED':
        return 'bg-amber-900/60 text-amber-200 border-amber-500/40';
      case 'RESOLVED':
        return 'bg-emerald-900/60 text-emerald-200 border-emerald-500/40';
    }
  };

  const [newNote, setNewNote] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleUpdateStatus = (status: IncidentCase['status']) => {
    if (!selectedIncident) return;
    const updated = incidents.map((inc) => 
      inc.id === selectedIncident.id ? { ...inc, status } : inc
    );
    setIncidents(updated);
    setSelectedIncident({ ...selectedIncident, status });
    setToastMsg(`Case ${selectedIncident.id} transitioned to status: ${status}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident || !newNote.trim()) return;

    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedNote = `${selectedIncident.notes} | [${time} SOC]: ${newNote.trim()}`;
    const updated = incidents.map((inc) =>
      inc.id === selectedIncident.id ? { ...inc, notes: formattedNote } : inc
    );
    setIncidents(updated);
    setSelectedIncident({ ...selectedIncident, notes: formattedNote });
    setNewNote('');
    setToastMsg('Appended forensic observation to case log.');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleExportAuditReport = (incident: IncidentCase) => {
    const reportText = `==================================================================
CYPHEX VOICE SECURITY INTELLIGENCE - INCIDENT AUDIT REPORT
==================================================================
Incident Case ID   : ${incident.id}
Session Call ID    : ${incident.callSessionId}
Severity           : ${incident.severity}
Workflow Status    : ${incident.status}
Detected Timestamp : ${incident.detectedAt}
Assigned Lead      : ${incident.assignedAnalyst}
Impersonated VIP   : ${incident.impersonatedVIP}

THREAT CLASSIFICATION
------------------------------------------------------------------
Attack Vector      : ${incident.threatVector}
MITRE ATT&CK       : T1656 Impersonation & T1566 Phishing (Voice)
Automated Action   : ${incident.actionTaken}

FORENSIC LOG & OBSERVATIONS
------------------------------------------------------------------
${incident.notes}

COMPLIANCE VERIFICATION
------------------------------------------------------------------
Evidence Signature : SHA-256 (b8e49d27f8a92b3c4d5e6f1029384756ac71)
Regulatory Status  : DPDP Act 2023 & RBI Cyber Security Framework Compliant
Generated By       : CYPHEX Enterprise SOC Defense System
Generated On       : ${new Date().toISOString()}
==================================================================
`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyphex_incident_report_${incident.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setToastMsg(`Generated & downloaded audit dossier for ${incident.id}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="premium-card p-5 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            Active Threat Incidents & Forensics Desk
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time containment workflow for verified synthetic voice impersonations and financial fraud attacks.
          </p>
        </div>

        {/* Upgraded Severity Filter Bar */}
        <div className="flex items-center gap-1 bg-white/[0.03] p-1 rounded-lg border border-white/[0.08] text-xs">
          <span className="text-[10px] font-mono uppercase font-bold text-slate-400 px-2.5 py-1 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            SEVERITY:
          </span>
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map((sev) => {
            const isActive = filterSeverity === sev;
            let activeClass = 'bg-white/10 text-white font-semibold shadow-sm';
            if (sev === 'CRITICAL' && isActive) activeClass = 'bg-red-500 text-white';
            if (sev === 'HIGH' && isActive) activeClass = 'bg-orange-500 text-white';
            if (sev === 'MEDIUM' && isActive) activeClass = 'bg-amber-500 text-slate-950 font-bold';

            return (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded-md text-[10px] font-mono font-medium uppercase transition-all ${
                  isActive ? activeClass : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev === 'ALL' ? 'ALL SEVERITIES' : sev}
              </button>
            );
          })}
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Incident Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Incidents List (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-2.5">
          {filteredIncidents.map((inc) => {
            const isSelected = selectedIncident?.id === inc.id;
            return (
              <div
                key={inc.id}
                onClick={() => setSelectedIncident(inc)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-900/90 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'bg-slate-950/60 border-white/[0.06] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-300">{inc.id}</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black border tracking-wider uppercase ${getSeverityBadge(inc.severity)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        inc.severity === 'CRITICAL' ? 'bg-red-400 animate-ping' :
                        inc.severity === 'HIGH' ? 'bg-orange-400' : 'bg-amber-400'
                      }`} />
                      <span>SEVERITY: {inc.severity}</span>
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${getStatusBadge(inc.status)}`}>
                    {inc.status}
                  </span>
                </div>

                <h4 className="text-xs font-semibold text-white line-clamp-1 mb-1">{inc.title}</h4>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Target: <strong className="text-slate-200">{inc.impersonatedVIP}</strong></span>
                  <span className="font-mono text-[10px] text-slate-500">{inc.detectedAt}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Case Dossier Details (7 cols) */}
        <div className="lg:col-span-7">
          {selectedIncident ? (
            <div className="premium-card p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start border-b border-white/[0.06] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-cyan-400 font-bold">{selectedIncident.id}</span>
                    <span className="text-xs text-slate-500 font-mono">• {selectedIncident.callSessionId}</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[9px] font-mono font-black border tracking-wider uppercase ${getSeverityBadge(selectedIncident.severity)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        selectedIncident.severity === 'CRITICAL' ? 'bg-red-400 animate-ping' :
                        selectedIncident.severity === 'HIGH' ? 'bg-orange-400' : 'bg-amber-400'
                      }`} />
                      <span>SEVERITY: {selectedIncident.severity}</span>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">{selectedIncident.title}</h3>
                </div>

                {/* Workflow Status Transition */}
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-white/[0.08]">
                  <button
                    onClick={() => handleUpdateStatus('INVESTIGATING')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition ${
                      selectedIncident.status === 'INVESTIGATING' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    INVESTIGATE
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('CONTAINED')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition ${
                      selectedIncident.status === 'CONTAINED' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    CONTAIN
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('RESOLVED')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition ${
                      selectedIncident.status === 'RESOLVED' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    RESOLVE
                  </button>
                </div>
              </div>

              {/* Case Attributes Matrix */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 block mb-1">IMPERSONATED VIP:</span>
                  <span className="font-semibold text-slate-200">{selectedIncident.impersonatedVIP}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.06]">
                  <span className="text-[10px] text-slate-500 block mb-1">ASSIGNED LEAD:</span>
                  <span className="font-semibold text-cyan-300">{selectedIncident.assignedAnalyst}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.06] col-span-2">
                  <span className="text-[10px] text-slate-500 block mb-1">IDENTIFIED THREAT VECTOR:</span>
                  <span className="text-slate-200">{selectedIncident.threatVector}</span>
                </div>
                <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 col-span-2">
                  <span className="text-[10px] text-red-400 font-bold block mb-1">AUTOMATED MITIGATION EXECUTED:</span>
                  <span className="text-red-200">{selectedIncident.actionTaken}</span>
                </div>
              </div>

              {/* Forensic Notes */}
              <div>
                <h4 className="text-xs font-mono uppercase text-slate-400 font-bold tracking-wider mb-2">
                  SOC Forensic Log & Observations
                </h4>
                <div className="p-3 rounded-xl bg-slate-950/90 border border-white/[0.06] text-xs text-slate-300 leading-relaxed font-sans mb-3">
                  {selectedIncident.notes}
                </div>

                {/* Append New Forensic Note */}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Append forensic observation or containment step..."
                    className="flex-grow bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-white/20"
                  />
                  <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className="px-3 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold disabled:opacity-40 transition"
                  >
                    Log Note
                  </button>
                </form>
              </div>

              {/* Intercept Audio & Evidence Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] flex-wrap gap-2">
                <span className="text-[11px] text-slate-500 font-mono">
                  EVIDENCE HASH: SHA-256 (b8e4...90fa)
                </span>
                <button
                  onClick={() => handleExportAuditReport(selectedIncident)}
                  className="premium-btn px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Generate Audit Report</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="premium-card p-12 text-center text-slate-500 text-xs font-mono">
              Select an incident from the left to view complete dossier
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentsManagerView;
