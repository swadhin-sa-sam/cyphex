import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, ShieldAlert, Info } from 'lucide-react';
import { RiskLevel } from '../types';
import { RISK_LEVELS } from '../utils/constants';

interface RiskScoreCardProps {
  score: number;
  riskLevel: RiskLevel;
  actionRecommended?: string;
  explanation?: string;
  size?: 'normal' | 'large';
}

export const RiskScoreCard: React.FC<RiskScoreCardProps> = ({
  score,
  riskLevel,
  actionRecommended,
  explanation,
  size = 'normal'
}) => {
  const meta = RISK_LEVELS[riskLevel] || RISK_LEVELS.LOW;

  const renderIcon = () => {
    switch (riskLevel) {
      case 'CRITICAL':
        return <AlertOctagon className="w-5 h-5 text-red-400 animate-pulse" />;
      case 'HIGH':
        return <ShieldAlert className="w-5 h-5 text-orange-400" />;
      case 'MEDIUM':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'LOW':
      default:
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
    }
  };

  // SVG Radial Gauge Calculations
  const radius = 64;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  // Arc spans 240 degrees (from 150 deg to 390 deg)
  const arcFraction = 240 / 360;
  const arcLength = circumference * arcFraction;
  const strokeDashoffset = arcLength - ((Math.min(100, Math.max(0, score)) / 100) * arcLength);

  return (
    <div className={`cyber-card p-5 transition-all duration-500 border ${meta.borderColor} ${meta.bgColor} relative overflow-hidden`}>
      {/* Specular Top Glow */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="flex items-center justify-between gap-4">
        {/* Left: Radial Dial Meter */}
        <div className="relative flex items-center justify-center flex-shrink-0">
          <svg
            height={radius * 2}
            width={radius * 2}
            className="transform rotate-[150deg] overflow-visible"
          >
            {/* Background Arc */}
            <circle
              stroke="rgba(255, 255, 255, 0.08)"
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            {/* Active Color Sweep Arc */}
            <circle
              stroke={meta.color}
              fill="transparent"
              strokeWidth={strokeWidth}
              strokeDasharray={`${arcLength} ${circumference}`}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="gauge-transition"
            />
          </svg>

          {/* Center Score Display */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className={`font-mono font-black tracking-tight ${size === 'large' ? 'text-2xl' : 'text-xl'} ${meta.textColor}`}>
              {Math.round(score)}
            </span>
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest -mt-1">
              / 100
            </span>
          </div>
        </div>

        {/* Right: Risk Classification & Verdict Info */}
        <div className="flex-grow flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-navy-950 border border-white/10 shadow-inner">
              {renderIcon()}
            </div>
            <div>
              <span className="text-[9px] font-mono tracking-widest uppercase text-slate-400 block leading-tight">
                VOICE INTEGRITY
              </span>
              <span className={`text-sm font-black tracking-wider uppercase ${meta.textColor}`}>
                {meta.label}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 leading-snug mt-1 line-clamp-2">
            {explanation || meta.description}
          </div>
        </div>
      </div>

      {/* Bottom Protocol Bar */}
      <div className="mt-3.5 pt-2.5 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
        <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-medium font-mono">
          <Info className="w-3 h-3 text-cyan-400" />
          <span>SECURITY PROTOCOL:</span>
        </span>
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${meta.badgeColor}`}>
          {actionRecommended || meta.action}
        </span>
      </div>
    </div>
  );
};

export default RiskScoreCard;
