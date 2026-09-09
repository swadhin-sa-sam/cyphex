export const API_BASE_URL = 'http://localhost:8000/api/v1';
export const WS_BASE_URL = 'ws://localhost:8000/api/v1';

export const RISK_LEVELS = {
  LOW: {
    label: 'LOW RISK',
    color: '#22C55E',
    bgColor: 'bg-emerald-950/40',
    borderColor: 'border-emerald-500/40',
    textColor: 'text-emerald-400',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    action: 'Continue / Allow Action',
    description: 'Voice signals and caller metadata are within authentic parameters.'
  },
  MEDIUM: {
    label: 'MEDIUM RISK',
    color: '#EAB308',
    bgColor: 'bg-amber-950/40',
    borderColor: 'border-amber-500/40',
    textColor: 'text-amber-400',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    action: 'Monitor Active Session',
    description: 'Minor acoustic variance or unverified caller lineage detected.'
  },
  HIGH: {
    label: 'HIGH RISK',
    color: '#F97316',
    bgColor: 'bg-orange-950/40',
    borderColor: 'border-orange-500/40',
    textColor: 'text-orange-400',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    action: 'Secondary Verification Required',
    description: 'Significant synthetic voice indicators or identity deviation detected.'
  },
  CRITICAL: {
    label: 'CRITICAL THREAT',
    color: '#EF4444',
    bgColor: 'bg-red-950/50',
    borderColor: 'border-red-500/60',
    textColor: 'text-red-400',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/40',
    action: 'Block Action & Hold Transaction',
    description: 'Confirmed neural voice cloning signature with high-pressure social engineering.'
  }
};
