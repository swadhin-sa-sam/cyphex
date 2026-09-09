import React, { useState, useEffect } from 'react';
import { AlertOctagon, ShieldAlert, ArrowUpRight, Search, Clock } from 'lucide-react';
import { API_BASE_URL } from '../utils/constants';
import { Incident } from '../types';

interface IncidentsPageProps {
  onNavigate: (path: string) => void;
}

const FALLBACK_INCIDENTS: Incident[] = [
  {
    id: "VC-28491",
    call_id: "call-sih-001",
    caller: "+91 98200 11223",
    claimed_identity: "Rajesh Sharma (CFO)",
    risk_score: 94.0,
    threat_type: "Executive Voice Impersonation",
    transaction_id: "tx-sih-001",
    recommended_action: "BLOCK",
    actual_action: "TRANSACTION_HELD",
    status: "BLOCKED",
    timeline: [
      { time: "10:14:02", event: "Incoming VoIP call received from unrecognized trunk" },
      { time: "10:14:15", event: "Caller claimed identity: Rajesh Sharma (CFO)" },
      { time: "10:14:28", event: "Request initiated: ₹25,00,000 wire to ABC Trading Pvt Ltd" },
      { time: "10:14:35", event: "Synthetic voice detected (86%) + Speaker Mismatch (78%)" },
      { time: "10:14:38", event: "High impersonation risk (94/100). Transaction placed ON HOLD automatically." }
    ],
    created_at: "2026-09-09T10:14:38Z"
  },
  {
    id: "VC-28489",
    call_id: "call-sih-002",
    caller: "+91 98450 44332",
    claimed_identity: "Vendor Accounts Payable",
    risk_score: 78.0,
    threat_type: "Vendor Invoice Redirection Attempt",
    transaction_id: "tx-sih-002",
    recommended_action: "VERIFY",
    actual_action: "SECONDARY_VERIFIED",
    status: "VERIFIED",
    timeline: [
      { time: "09:32:10", event: "Call received requesting account details update" },
      { time: "09:32:45", event: "Prosody anomaly detected (72%). Urgency detected." },
      { time: "09:33:10", event: "Secondary callback verification passed with registered vendor." }
    ],
    created_at: "2026-09-09T09:33:10Z"
  }
];

export const IncidentsPage: React.FC<IncidentsPageProps> = ({ onNavigate }) => {
  const [incidents, setIncidents] = useState<Incident[]>(FALLBACK_INCIDENTS);
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    fetch(`${API_BASE_URL}/incidents`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setIncidents(data);
      })
      .catch(() => {});
  }, []);

  const filtered = incidents.filter(inc => filter === 'ALL' || inc.status === filter);

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black tracking-wider uppercase text-white font-sans flex items-center gap-2">
            <span>Security Incident Queue</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-red-950 border border-red-500/30 text-red-400">
              CRITICAL RISKS &ge; 80
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Escalated impersonation fraud incidents and post-event forensic audit trails
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-navy-900 p-1 rounded-xl border border-white/10 text-xs font-mono">
          {['ALL', 'OPEN', 'INVESTIGATING', 'BLOCKED', 'VERIFIED', 'RESOLVED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-2.5 py-1 rounded-lg transition-colors ${
                filter === st ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Table */}
      <div className="cyber-card p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-500 font-mono text-[10px] uppercase">
                <th className="pb-3">Incident ID</th>
                <th className="pb-3">Claimed Persona / Caller</th>
                <th className="pb-3">Threat Classification</th>
                <th className="pb-3 text-center">Risk Score</th>
                <th className="pb-3">Action Enforced</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right">Forensic Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filtered.map((inc) => {
                let statusBadge = "bg-slate-900 text-slate-400 border-white/10";
                if (inc.status === 'BLOCKED') statusBadge = "bg-red-950/60 text-red-400 border-red-500/40 font-bold animate-pulse";
                else if (inc.status === 'VERIFIED') statusBadge = "bg-emerald-950/60 text-emerald-400 border-emerald-500/30";
                else if (inc.status === 'INVESTIGATING') statusBadge = "bg-amber-950/60 text-amber-400 border-amber-500/30";

                return (
                  <tr key={inc.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 font-mono text-cyan-400 font-bold">{inc.id}</td>
                    <td className="py-3.5">
                      <div className="font-bold text-white">{inc.claimed_identity}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{inc.caller}</div>
                    </td>
                    <td className="py-3.5 text-slate-200 font-medium">{inc.threat_type}</td>
                    <td className="py-3.5 text-center font-mono font-bold">
                      <span className={inc.risk_score >= 80 ? 'text-red-400' : 'text-amber-400'}>
                        {inc.risk_score} / 100
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-xs text-slate-300">
                      {inc.actual_action}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${statusBadge}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => onNavigate(`/incidents/${inc.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-cyan-950 hover:text-cyan-400 hover:border-cyan-500/40 border border-white/10 text-slate-300 text-xs font-semibold inline-flex items-center gap-1 transition-all"
                      >
                        <span>Investigate</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IncidentsPage;
