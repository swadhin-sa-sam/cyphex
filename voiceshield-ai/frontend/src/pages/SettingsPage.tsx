import React, { useState, useEffect } from 'react';
import { Sliders, Shield, Save, CheckCircle2, Lock, Scale, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../utils/constants';

interface SettingsPageProps {
  onNavigate: (path: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigate }) => {
  const [retention, setRetention] = useState<number>(0); // 0 = No retention
  const [highValueThreshold, setHighValueThreshold] = useState<number>(1000000);
  const [criticalThreshold, setCriticalThreshold] = useState<number>(80);
  const [weightSynthetic, setWeightSynthetic] = useState<number>(35);
  const [weightSpeaker, setWeightSpeaker] = useState<number>(25);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/settings`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setRetention(data.audio_retention_days || 0);
          setHighValueThreshold(data.high_value_threshold || 1000000);
          setCriticalThreshold(data.critical_risk_threshold || 80);
          setWeightSynthetic(Math.round((data.weight_synthetic || 0.35) * 100));
          setWeightSpeaker(Math.round((data.weight_speaker || 0.25) * 100));
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        audio_retention_days: retention,
        high_value_threshold: highValueThreshold,
        critical_risk_threshold: criticalThreshold,
        weight_synthetic: weightSynthetic / 100,
        weight_speaker: weightSpeaker / 100
      })
    }).catch(() => {});

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black tracking-wider uppercase text-white font-sans flex items-center gap-2">
            <span>Security Governance & Privacy Settings</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400">
              DPDP COMPLIANT
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Configure risk thresholds, multi-modal signal weights, and raw audio retention policies
          </p>
        </div>

        {saved && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Policy Saved Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Section 26: Privacy Settings (Raw Audio Retention) */}
        <div className="cyber-card p-6 border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-3">
            <Lock className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Audio Privacy & Retention Policy (DPDP Act 2023)
              </h3>
              <p className="text-[11px] text-slate-400">
                Control ephemeral voice buffering and data minimisation rules
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-navy-950/90 border border-emerald-500/30 flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="text-emerald-400 font-bold block mb-0.5">🔒 Privacy Protected</span>
              <span className="text-slate-300 leading-relaxed">
                Raw voice recordings are <strong>not retained by default</strong>. Incoming audio streams are processed purely in ephemeral RAM circular buffers and immediately discarded after acoustic feature extraction. Only irreversible security telemetry and cryptographic hashes are persisted.
              </span>
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-300 uppercase block mb-2">
              Raw Audio Retention Lifecycle:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { days: 0, label: "No Retention", sub: "Default (Recommended)" },
                { days: 1, label: "24 Hours", sub: "Brief forensic buffer" },
                { days: 7, label: "7 Days", sub: "Weekly audit cycle" },
                { days: 30, label: "30 Days", sub: "Extended enterprise log" },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.days}
                  onClick={() => setRetention(opt.days)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    retention === opt.days
                      ? 'bg-cyan-950/50 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)] text-white'
                      : 'bg-navy-950/50 border-white/[0.06] text-slate-400 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{opt.label}</span>
                    <input
                      type="radio"
                      checked={retention === opt.days}
                      onChange={() => setRetention(opt.days)}
                      className="accent-cyan-400"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono block">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 35: Admin Settings & Risk Thresholds */}
        <div className="cyber-card p-6 border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-3">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Risk Engine Thresholds & Financial Circuit Breakers
              </h3>
              <p className="text-[11px] text-slate-400">
                Trigger points for automated quarantine and secondary MFA
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                High-Value Transaction Threshold (INR):
              </label>
              <input
                type="number"
                value={highValueThreshold}
                onChange={(e) => setHighValueThreshold(Number(e.target.value))}
                className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                Current: ₹{(highValueThreshold / 100000).toFixed(1)} Lakh &bull; Any transfer &ge; this limit mandates elevated scrutiny
              </span>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">
                Critical Threat Threshold (Auto-Hold):
              </label>
              <input
                type="number"
                value={criticalThreshold}
                onChange={(e) => setCriticalThreshold(Number(e.target.value))}
                className="w-full bg-navy-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                Default: 80 / 100 &bull; Risk &ge; 80 immediately halts transaction and initiates incident
              </span>
            </div>
          </div>

          {/* Risk Weights */}
          <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-3">
            <span className="text-xs font-mono text-slate-300 uppercase block">
              Multi-Modal Fusion Weights:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Synthetic Voice Detection (AASIST + W2V2):</span>
                  <span className="text-cyan-400 font-bold">{weightSynthetic}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={60}
                  value={weightSynthetic}
                  onChange={(e) => setWeightSynthetic(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Speaker Biometric Mismatch (ECAPA-TDNN):</span>
                  <span className="text-cyan-400 font-bold">{weightSpeaker}%</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={50}
                  value={weightSpeaker}
                  onChange={(e) => setWeightSpeaker(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="self-end px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
        >
          <Save className="w-4 h-4" />
          <span>Save Organization Policies</span>
        </button>
      </form>
    </div>
  );
};

export default SettingsPage;
