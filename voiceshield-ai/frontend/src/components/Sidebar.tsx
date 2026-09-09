import React from 'react';
import { 
  LayoutDashboard, PhoneIncoming, Radio, ShieldCheck, 
  ArrowLeftRight, AlertOctagon, UserSquare2, Sliders, PlayCircle, Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { t } = useAuth();

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { path: '/calls', label: t('calls'), icon: PhoneIncoming },
    { path: '/calls/call-sih-001', label: t('liveCall'), icon: Radio, highlight: true },
    { path: '/verification', label: t('verification'), icon: ShieldCheck },
    { path: '/transactions', label: t('transactions'), icon: ArrowLeftRight },
    { path: '/incidents', label: t('incidents'), icon: AlertOctagon },
    { path: '/voice-profiles', label: t('voiceProfiles'), icon: UserSquare2 },
    { path: '/settings', label: t('settings'), icon: Sliders },
    { path: '/demo', label: t('demo'), icon: Flame, special: true },
  ];

  return (
    <aside className="w-64 border-r border-white/[0.08] bg-navy-950/70 p-3 flex flex-col gap-1 hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="text-[10px] font-mono text-slate-500 uppercase px-3 py-2">
        SOC Operations Center
      </div>

      <div className="flex flex-col gap-1 flex-grow">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path === '/calls/call-sih-001' && currentPath.startsWith('/calls/'));

          let btnClasses = "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ";
          if (item.special) {
            btnClasses += isActive 
              ? "bg-red-950/80 text-red-300 border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              : "bg-red-950/30 hover:bg-red-950/60 text-red-400 border border-red-500/40 hover:border-red-400";
          } else if (isActive) {
            btnClasses += "bg-cyan-950/60 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]";
          } else {
            btnClasses += "text-slate-400 hover:text-slate-200 hover:bg-navy-900 border border-transparent";
          }

          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={btnClasses}
            >
              <Icon className={`w-4 h-4 ${item.special ? 'text-red-400' : (isActive ? 'text-cyan-400' : 'text-slate-500')}`} />
              <span className="truncate">{item.label}</span>
              {item.highlight && (
                <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              )}
              {item.special && (
                <span className="ml-auto text-[9px] font-mono bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded">
                  SIH
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Security Clearance Footer */}
      <div className="p-3 rounded-xl bg-navy-900 border border-white/[0.04] text-[10px] text-slate-500 font-mono">
        <div className="text-slate-400 font-semibold mb-0.5">CLEARANCE: LEVEL 4</div>
        <div>AASIST &bull; W2V2-SSL &bull; PRAAT</div>
        <div className="text-emerald-400 mt-1">LATENCY SLA: &lt;300ms</div>
      </div>
    </aside>
  );
};

export default Sidebar;
