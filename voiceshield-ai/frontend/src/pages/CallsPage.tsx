import React, { useState, useEffect } from 'react';
import { PhoneIncoming, Radio, Search, Filter, ArrowUpRight } from 'lucide-react';
import { API_BASE_URL } from '../utils/constants';
import { Call, RiskLevel } from '../types';

interface CallsPageProps {
  onNavigate: (path: string) => void;
}

const FALLBACK_CALLS: Call[] = [
  {
    id: "call-sih-001",
    caller_phone: "+91 98200 11223",
    caller_name: "Caller ID: Executive Office",
    claimed_identity: "Rajesh Sharma (CFO)",
    channel: "VoIP",
    language: "en",
    status: "BLOCKED",
    risk_score: 94.0,
    risk_level: "CRITICAL",
    duration_seconds: 145,
    start_time: "2026-09-09T10:14:00Z"
  },
  {
    id: "call-sih-002",
    caller_phone: "+91 98450 44332",
    caller_name: "Supplier Payment Desk",
    claimed_identity: "Vendor Accounts Payable",
    channel: "PSTN",
    language: "en",
    status: "VERIFIED",
    risk_score: 78.0,
    risk_level: "HIGH",
    duration_seconds: 320,
    start_time: "2026-09-09T09:32:00Z"
  },
  {
    id: "call-sih-003",
    caller_phone: "+91 98111 88776",
    caller_name: "Retail Support Line",
    claimed_identity: "Customer #8829",
    channel: "WebRTC",
    language: "hi",
    status: "IN_PROGRESS",
    risk_score: 52.0,
    risk_level: "MEDIUM",
    duration_seconds: 85,
    start_time: "2026-09-09T08:45:00Z"
  },
  {
    id: "call-sih-004",
    caller_phone: "+91 98200 99887",
    caller_name: "Rajesh Sharma Mobile (Verified)",
    claimed_identity: "Rajesh Sharma (CFO)",
    channel: "VoIP",
    language: "en",
    status: "ENDED",
    risk_score: 12.0,
    risk_level: "LOW",
    duration_seconds: 410,
    start_time: "2026-09-09T08:15:00Z"
  }
];

export const CallsPage: React.FC<CallsPageProps> = ({ onNavigate }) => {
  const [calls, setCalls] = useState<Call[]>(FALLBACK_CALLS);
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/calls`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setCalls(data);
      })
      .catch(() => {});
  }, []);

  const filteredCalls = calls.filter((c) => {
    const matchesFilter = filter === 'ALL' || c.risk_level === filter;
    const matchesSearch = c.caller_name.toLowerCase().includes(search.toLowerCase()) ||
                          c.claimed_identity.toLowerCase().includes(search.toLowerCase()) ||
                          c.caller_phone.includes(search);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black tracking-wider uppercase text-white font-sans flex items-center gap-2">
            <span>Call Intercept Directory</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400">
              {calls.length} SESSIONS
            </span>
          </h2>
          <p className="text-xs text-slate-400">Continuous biometric and linguistic voice stream inspection</p>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search phone, persona..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-navy-900 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48 font-mono"
            />
          </div>

          <div className="flex items-center gap-1 bg-navy-900 p-1 rounded-xl border border-white/10 text-xs font-mono">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilter(lvl)}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  filter === lvl ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calls Table */}
      <div className="cyber-card p-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-500 font-mono text-[10px] uppercase">
                <th className="pb-3">Session ID</th>
                <th className="pb-3">Claimed Persona</th>
                <th className="pb-3">Originating Line</th>
                <th className="pb-3">Trunk Channel</th>
                <th className="pb-3">Duration</th>
                <th className="pb-3 text-center">Voice Integrity Risk</th>
                <th className="pb-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredCalls.map((c) => {
                let badgeClass = "bg-emerald-950/60 text-emerald-400 border-emerald-500/30";
                if (c.risk_level === 'CRITICAL') badgeClass = "bg-red-950/60 text-red-400 border-red-500/40 animate-pulse";
                else if (c.risk_level === 'HIGH') badgeClass = "bg-orange-950/60 text-orange-400 border-orange-500/30";
                else if (c.risk_level === 'MEDIUM') badgeClass = "bg-amber-950/60 text-amber-400 border-amber-500/30";

                return (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 font-mono text-slate-400">{c.id}</td>
                    <td className="py-3.5">
                      <div className="font-bold text-white">{c.claimed_identity}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs">{c.caller_name}</div>
                    </td>
                    <td className="py-3.5 font-mono text-slate-300">{c.caller_phone}</td>
                    <td className="py-3.5">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-navy-950 border border-white/10 text-slate-300">
                        {c.channel} &bull; {c.language.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-slate-400">
                      {Math.floor(c.duration_seconds / 60)}m {c.duration_seconds % 60}s
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`font-mono font-bold px-2 py-0.5 rounded border text-xs ${badgeClass}`}>
                        {Math.round(c.risk_score)} / 100 ({c.risk_level})
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => onNavigate(`/calls/${c.id}`)}
                        className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-cyan-950 hover:text-cyan-400 hover:border-cyan-500/40 border border-white/10 text-slate-300 text-xs font-semibold inline-flex items-center gap-1 transition-all"
                      >
                        <span>Monitor</span>
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

export default CallsPage;
