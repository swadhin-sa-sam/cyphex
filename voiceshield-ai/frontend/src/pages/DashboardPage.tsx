import React, { useState, useEffect } from 'react';
import { 
  PhoneIncoming, AlertTriangle, ShieldAlert, ShieldCheck, 
  ArrowUpRight, Clock, ChevronRight, Activity, Flame
} from 'lucide-react';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { API_BASE_URL } from '../utils/constants';
import { DashboardStats } from '../types';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
}

const FALLBACK_STATS: DashboardStats = {
  calls_today: 142,
  suspicious_calls: 18,
  critical_threats: 4,
  transactions_protected_amount: 8500000.0,
  risk_over_time: [
    { time: "08:00", score: 14, baseline: 20 },
    { time: "09:00", score: 22, baseline: 20 },
    { time: "10:00", score: 94, baseline: 20 },
    { time: "11:00", score: 45, baseline: 20 },
    { time: "12:00", score: 78, baseline: 20 },
    { time: "13:00", score: 31, baseline: 20 },
    { time: "14:00", score: 19, baseline: 20 },
    { time: "15:00", score: 25, baseline: 20 },
    { time: "16:00", score: 52, baseline: 20 },
    { time: "17:00", score: 18, baseline: 20 }
  ],
  threat_distribution: [
    { name: "Executive Impersonation", count: 12, color: "#EF4444" },
    { name: "Vendor Redirection", count: 8, color: "#F97316" },
    { name: "Credential Harvesting", count: 5, color: "#EAB308" },
    { name: "OTP Intercept Attempt", count: 3, color: "#3B82F6" }
  ],
  calls_by_risk_level: [
    { level: "LOW (0-29)", count: 114, color: "#22C55E" },
    { level: "MEDIUM (30-59)", count: 16, color: "#EAB308" },
    { level: "HIGH (60-79)", count: 8, color: "#F97316" },
    { level: "CRITICAL (80-100)", count: 4, color: "#EF4444" }
  ],
  recent_events: [
    {
      id: "EV-9901",
      threat: "CFO Voice Impersonation",
      score: 94,
      risk_level: "CRITICAL",
      action: "BLOCKED",
      time: "10:14 AM",
      target: "Finance Wire Desk"
    },
    {
      id: "EV-9894",
      threat: "Vendor Invoice Redirection",
      score: 78,
      risk_level: "HIGH",
      action: "VERIFIED",
      time: "09:32 AM",
      target: "Accounts Payable"
    },
    {
      id: "EV-9882",
      threat: "Unrecognized Trunk Line",
      score: 52,
      risk_level: "MEDIUM",
      action: "MONITOR",
      time: "08:45 AM",
      target: "Customer Service"
    }
  ]
};

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats>(FALLBACK_STATS);

  useEffect(() => {
    fetch(`${API_BASE_URL}/dashboard/stats`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setStats(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Top Banner Alert */}
      <div className="p-4 rounded-xl cyber-card border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-navy-900 to-navy-950 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              VoiceShield Active Threat Intercept Engine
            </h2>
            <p className="text-xs text-slate-400">
              Analyzing continuous 250ms audio chunks over 2.0s circular sliding windows with sub-300ms SLA.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/calls/call-sih-001')}
            className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>Inspect Active Call</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('/demo')}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Launch Attack Simulator</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calls Today */}
        <div className="cyber-card p-4 flex items-center justify-between border-slate-800">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400">Calls Scanned Today</span>
            <div className="text-2xl font-black font-mono text-white mt-1">{stats.calls_today}</div>
            <span className="text-[10px] text-emerald-400 font-mono mt-0.5 block">&uarr; 12% vs 7-day avg</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-navy-950 border border-white/10 flex items-center justify-center text-cyan-400">
            <PhoneIncoming className="w-5 h-5" />
          </div>
        </div>

        {/* Suspicious Calls */}
        <div className="cyber-card p-4 flex items-center justify-between border-amber-500/30 bg-amber-950/10">
          <div>
            <span className="text-[10px] font-mono uppercase text-amber-400">Suspicious Intercepts</span>
            <div className="text-2xl font-black font-mono text-amber-300 mt-1">{stats.suspicious_calls}</div>
            <span className="text-[10px] text-amber-400/80 font-mono mt-0.5 block">Triggered secondary verification</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Critical Threats */}
        <div className="cyber-card p-4 flex items-center justify-between border-red-500/40 bg-red-950/20">
          <div>
            <span className="text-[10px] font-mono uppercase text-red-400">Critical Threats Blocked</span>
            <div className="text-2xl font-black font-mono text-red-300 mt-1">{stats.critical_threats}</div>
            <span className="text-[10px] text-red-400 font-mono mt-0.5 block">Executive voice clones</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-500/50 flex items-center justify-center text-red-400 animate-pulse">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        {/* Transactions Protected */}
        <div className="cyber-card p-4 flex items-center justify-between border-emerald-500/30 bg-emerald-950/10">
          <div>
            <span className="text-[10px] font-mono uppercase text-emerald-400">Transactions Protected</span>
            <div className="text-xl font-black font-mono text-emerald-300 mt-1">
              ₹{(stats.transactions_protected_amount / 100000).toFixed(1)} Lakh
            </div>
            <span className="text-[10px] text-emerald-400/80 font-mono mt-0.5 block">Zero unauthorized leakage</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Chart: Risk Score Over Time (2 cols) */}
        <div className="lg:col-span-2 cyber-card p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Live Impersonation Risk Timeline (24h Trend)
              </h3>
              <p className="text-[11px] text-slate-400">Dynamic multi-modal anomaly telemetry</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-950 border border-white/10 text-cyan-400">
              HOURLY AGGREGATION
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.risk_over_time} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#64748B" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070A11', borderColor: 'rgba(255,255,255,0.1)', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="score" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#riskGrad)" name="Risk Score" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Calls by Risk Level */}
        <div className="cyber-card p-5 flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">
            Calls by Risk Decision Tier
          </h3>
          <p className="text-[11px] text-slate-400">Distribution across security clearance policies</p>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.calls_by_risk_level} layout="vertical" margin={{ top: 10, right: 15, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="#64748B" tick={{ fontSize: 10 }} />
                <YAxis dataKey="level" type="category" stroke="#64748B" tick={{ fontSize: 9 }} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#070A11', borderColor: 'rgba(255,255,255,0.1)', fontSize: '11px' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {stats.calls_by_risk_level.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Security Events Table */}
      <div className="cyber-card p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Recent Security Events & Intercepts
            </h3>
            <p className="text-[11px] text-slate-400">Real-time audit log of flagged high-risk calls</p>
          </div>
          <button
            onClick={() => onNavigate('/incidents')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View All Incidents</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-500 font-mono text-[10px] uppercase">
                <th className="pb-2.5">Event ID</th>
                <th className="pb-2.5">Threat Classification</th>
                <th className="pb-2.5">Target Channel</th>
                <th className="pb-2.5">Timestamp</th>
                <th className="pb-2.5 text-center">Risk Score</th>
                <th className="pb-2.5 text-right">Security Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {stats.recent_events.map((ev) => {
                let badgeClass = "bg-emerald-950/60 text-emerald-400 border-emerald-500/30";
                if (ev.risk_level === 'CRITICAL') badgeClass = "bg-red-950/60 text-red-400 border-red-500/40";
                else if (ev.risk_level === 'HIGH') badgeClass = "bg-orange-950/60 text-orange-400 border-orange-500/30";
                else if (ev.risk_level === 'MEDIUM') badgeClass = "bg-amber-950/60 text-amber-400 border-amber-500/30";

                return (
                  <tr key={ev.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 font-mono text-slate-400">{ev.id}</td>
                    <td className="py-3 font-semibold text-white">{ev.threat}</td>
                    <td className="py-3 text-slate-400">{ev.target}</td>
                    <td className="py-3 font-mono text-slate-400">{ev.time}</td>
                    <td className="py-3 text-center">
                      <span className={`font-mono font-bold px-2 py-0.5 rounded border text-[11px] ${badgeClass}`}>
                        {ev.score} / 100
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className="font-mono font-bold text-xs text-slate-200">
                        {ev.action}
                      </span>
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

export default DashboardPage;
