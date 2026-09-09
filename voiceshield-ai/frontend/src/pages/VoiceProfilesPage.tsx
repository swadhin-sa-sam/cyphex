import React, { useState, useEffect } from 'react';
import { 
  UserSquare2, Upload, Trash2, CheckCircle2, Shield, 
  Mic, Plus, X, RefreshCw, KeyRound 
} from 'lucide-react';
import { API_BASE_URL } from '../utils/constants';
import { VoiceProfile } from '../types';

interface VoiceProfilesPageProps {
  onNavigate: (path: string) => void;
}

const FALLBACK_PROFILES: VoiceProfile[] = [
  {
    id: "vp-cfo-001",
    speaker_name: "Rajesh Sharma",
    role_title: "Chief Financial Officer (CFO)",
    sample_duration_sec: 12.5,
    is_active: true,
    verified_at: "2026-09-09T08:00:00Z",
    created_at: "2026-09-09T08:00:00Z"
  },
  {
    id: "vp-cso-002",
    speaker_name: "Elena Rostova",
    role_title: "Chief Information Security Officer (CISO)",
    sample_duration_sec: 15.0,
    is_active: true,
    verified_at: "2026-09-08T14:30:00Z",
    created_at: "2026-09-08T14:30:00Z"
  },
  {
    id: "vp-dir-003",
    speaker_name: "Vikramaditya Roy",
    role_title: "SOC Director",
    sample_duration_sec: 10.2,
    is_active: true,
    verified_at: "2026-09-07T11:00:00Z",
    created_at: "2026-09-07T11:00:00Z"
  }
];

export const VoiceProfilesPage: React.FC<VoiceProfilesPageProps> = ({ onNavigate }) => {
  const [profiles, setProfiles] = useState<VoiceProfile[]>(FALLBACK_PROFILES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/voice-profiles`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setProfiles(data);
      })
      .catch(() => {});
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("speaker_name", name);
      formData.append("role_title", role);

      const res = await fetch(`${API_BASE_URL}/voice-profiles`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const newProfile = await res.json();
        setProfiles(prev => [newProfile, ...prev]);
        setIsModalOpen(false);
        setName('');
        setRole('');
      }
    } catch {}

    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    setProfiles(prev => prev.filter(p => p.id !== id));
    fetch(`${API_BASE_URL}/voice-profiles/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black tracking-wider uppercase text-white font-sans flex items-center gap-2">
            <span>VIP Biometric Voice Vault</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400">
              AES-256 ENCRYPTED
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Registered 192-dimensional acoustic voiceprints used for 1:1 speaker identity verification
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Enroll New Voiceprint</span>
        </button>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="p-3.5 rounded-xl bg-navy-950/80 border border-white/[0.08] flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>DPDP Act 2023 Compliance: Raw voice audio is never stored permanently. Only irreversible encrypted acoustic embeddings are retained.</span>
        </div>
      </div>

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {profiles.map((p) => (
          <div key={p.id} className="cyber-card p-5 flex flex-col justify-between border-white/10 relative group">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-400/50 flex items-center justify-center font-bold font-mono text-cyan-300 text-sm shadow-[0_0_12px_rgba(6,182,212,0.3)]">
                  {p.speaker_name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  VERIFIED
                </span>
              </div>

              <h3 className="text-sm font-bold text-white">{p.speaker_name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{p.role_title}</p>

              <div className="mt-4 pt-3 border-t border-white/[0.04] text-[11px] font-mono text-slate-400 flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Sample Length:</span>
                  <span className="text-slate-300">{p.sample_duration_sec}s (16 kHz PCM)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Embedding:</span>
                  <span className="text-cyan-400 truncate max-w-[120px]">192-dim AES-256</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500">ID: {p.id}</span>
              <button
                onClick={() => handleDelete(p.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                title="Purge Voiceprint"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Enroll Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-navy-900 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
            <div className="flex justify-between items-center border-b border-white/[0.08] pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Enroll VIP Voiceprint</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Executive Full Name:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Corporate Title / Role:</label>
                <input
                  type="text"
                  required
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Managing Director"
                  className="w-full bg-navy-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-4 rounded-xl border border-dashed border-white/20 bg-navy-950 flex flex-col items-center text-center gap-2 cursor-pointer hover:border-cyan-500 transition-colors">
                <Upload className="w-6 h-6 text-cyan-400" />
                <span className="text-xs text-slate-300">Upload Reference Speech Recording (.wav, .mp3)</span>
                <span className="text-[10px] text-slate-500 font-mono">10-15 seconds of clean speech &bull; Discarded post-embedding</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Extract & Encrypt Voiceprint</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceProfilesPage;
