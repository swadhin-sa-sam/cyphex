import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, ShieldAlert, AlertCircle } from 'lucide-react';

interface WhyIsThisRiskyProps {
  factors: string[];
  defaultOpen?: boolean;
}

export const WhyIsThisRisky: React.FC<WhyIsThisRiskyProps> = ({
  factors = [],
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const fallbackFactors = [
    "Voice differs from the registered voice profile",
    "Caller is using an unrecognized number",
    "High-value transaction detected",
    "Urgency language detected",
    "Normal verification procedure is being bypassed"
  ];

  const displayFactors = factors.length > 0 ? factors : fallbackFactors;

  return (
    <div className="cyber-card p-4 border border-orange-500/30 bg-orange-950/20 rounded-xl transition-all">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left focus:outline-none cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-orange-950 border border-orange-500/40 flex items-center justify-center text-orange-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-200">
              Why is this risky?
            </h4>
            <p className="text-[11px] text-slate-400">
              Immediate threat factor breakdown (SOC Telemetry)
            </p>
          </div>
        </div>

        <div className="p-1 rounded bg-slate-900 border border-white/10 text-slate-400">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="mt-3.5 pt-3 border-t border-white/[0.06] flex flex-col gap-2">
          {displayFactors.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 text-xs text-slate-200 bg-navy-950/60 p-2.5 rounded-lg border border-white/[0.04]"
            >
              <CheckCircle2 className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              <span className="leading-snug font-medium">{item}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WhyIsThisRisky;
