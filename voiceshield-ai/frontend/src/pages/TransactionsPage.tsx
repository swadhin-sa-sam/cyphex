import React, { useState, useEffect } from 'react';
import { 
  ArrowLeftRight, ShieldAlert, CheckCircle2, XCircle, 
  AlertTriangle, ShieldCheck, DollarSign, Clock, Plus, RefreshCw 
} from 'lucide-react';
import MfaModal from '../components/MfaModal';
import { API_BASE_URL } from '../utils/constants';
import { Transaction } from '../types';

interface TransactionsPageProps {
  onNavigate: (path: string) => void;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-sih-001",
    call_id: "call-sih-001",
    amount: 2500000.0,
    currency: "INR",
    beneficiary_name: "ABC Trading Pvt Ltd",
    beneficiary_account: "HDFC000123456789",
    requested_by: "Rajesh Sharma (CFO)",
    risk_score: 94.0,
    status: "ON_HOLD",
    notes: "Auto-held: High risk voice cloning signature detected (Risk: 94/100).",
    created_at: "2026-09-09T10:14:28Z"
  },
  {
    id: "tx-sih-002",
    call_id: "call-sih-002",
    amount: 750000.0,
    currency: "INR",
    beneficiary_name: "SwiftLogistics India",
    beneficiary_account: "ICIC000987654321",
    requested_by: "Vendor Accounts Payable",
    risk_score: 78.0,
    status: "VERIFICATION_REQUIRED",
    notes: "Secondary callback verification required.",
    created_at: "2026-09-09T09:32:00Z"
  },
  {
    id: "tx-sih-003",
    call_id: "call-sih-004",
    amount: 150000.0,
    currency: "INR",
    beneficiary_name: "TCS Enterprise Services",
    beneficiary_account: "SBIN000456123789",
    requested_by: "Rajesh Sharma (CFO)",
    risk_score: 12.0,
    status: "APPROVED",
    notes: "Approved: Routine verified operational vendor payout.",
    created_at: "2026-09-09T08:16:00Z"
  }
];

export const TransactionsPage: React.FC<TransactionsPageProps> = ({ onNavigate }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isMfaOpen, setIsMfaOpen] = useState(false);
  const [activeMfaTxId, setActiveMfaTxId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/transactions`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setTransactions(data);
      })
      .catch(() => {});
  }, []);

  const handleApprove = async (txId: string) => {
    setTransactions(prev => prev.map(tx => tx.id === txId ? { ...tx, status: 'APPROVED', notes: 'Approved by SOC Operations' } : tx));
    fetch(`${API_BASE_URL}/transactions/${txId}/approve`, { method: 'POST' }).catch(() => {});
  };

  const handleReject = async (txId: string) => {
    setTransactions(prev => prev.map(tx => tx.id === txId ? { ...tx, status: 'REJECTED', notes: 'Rejected: Fraudulent request confirmed' } : tx));
    fetch(`${API_BASE_URL}/transactions/${txId}/reject`, { method: 'POST' }).catch(() => {});
  };

  const handleMfaComplete = (newRisk: number) => {
    if (activeMfaTxId) {
      setTransactions(prev => prev.map(tx => {
        if (tx.id === activeMfaTxId) {
          return {
            ...tx,
            risk_score: newRisk,
            status: 'PENDING',
            notes: 'MFA Verified: Authorized for processing.'
          };
        }
        return tx;
      }));
    }
  };

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black tracking-wider uppercase text-white font-sans flex items-center gap-2">
            <span>Transaction Protection & Quarantine</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/30 text-cyan-400">
              POLICY: ₹10 LAKH THRESHOLD
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time automated financial circuit-breakers triggered by voice cloning risk
          </p>
        </div>
      </div>

      {/* Flagship Wire Transfer Feature Card (CFO ₹25 Lakh Attack) */}
      <div className="cyber-card p-6 border-red-500/40 bg-gradient-to-br from-red-950/40 via-navy-950 to-navy-900 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-500/50 flex items-center justify-center text-red-400 animate-pulse">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-red-400 font-bold block">
                FLAGGED TRANSACTION &bull; AUTOMATIC HOLD ENFORCED
              </span>
              <h3 className="text-sm font-bold text-white">
                Wire Transfer Request &bull; ₹25,00,000 (Twenty-Five Lakh INR)
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Voice Integrity Score:</span>
            <span className="text-xl font-black font-mono text-red-400">94 / 100 (CRITICAL)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-500 block text-[10px]">REQUESTED BY:</span>
            <span className="text-white font-bold">Rajesh Sharma (CFO)</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">BENEFICIARY NAME:</span>
            <span className="text-white font-bold">ABC Trading Pvt Ltd</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">TARGET ACCOUNT:</span>
            <span className="text-slate-300">HDFC000123456789</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">HOLD POLICY:</span>
            <span className="text-red-400 font-bold">BLOCKED (Risk &ge; 80)</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 bg-navy-950/80 p-3 rounded-xl border border-white/[0.06]">
          ⚠️ <strong>Defense Safeguard:</strong> This high-value transaction was automatically suspended because the caller's voice exhibited strong neural vocoder artifacts (86%) and mismatched the enrolled CFO voiceprint (78%).
        </p>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={() => {
              setActiveMfaTxId('tx-sih-001');
              setIsMfaOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center gap-2 transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verify Identity</span>
          </button>
          <button
            onClick={() => handleReject('tx-sih-001')}
            className="px-5 py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-300 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject Transaction</span>
          </button>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="cyber-card p-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
          Financial Transaction Queue & Audit Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-500 font-mono text-[10px] uppercase">
                <th className="pb-3">Reference ID</th>
                <th className="pb-3">Requested By</th>
                <th className="pb-3">Beneficiary</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3 text-center">Voice Risk</th>
                <th className="pb-3 text-center">Quarantine Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {transactions.map((tx) => {
                let statusBadge = "bg-emerald-950/60 text-emerald-400 border-emerald-500/30";
                if (tx.status === 'ON_HOLD') statusBadge = "bg-red-950/60 text-red-400 border-red-500/40 font-bold animate-pulse";
                else if (tx.status === 'VERIFICATION_REQUIRED') statusBadge = "bg-amber-950/60 text-amber-400 border-amber-500/30 font-bold";
                else if (tx.status === 'REJECTED') statusBadge = "bg-slate-900 text-slate-500 border-white/10";

                return (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 font-mono text-slate-400">{tx.id}</td>
                    <td className="py-3.5 font-semibold text-white">{tx.requested_by}</td>
                    <td className="py-3.5 text-slate-300">
                      <div>{tx.beneficiary_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{tx.beneficiary_account}</div>
                    </td>
                    <td className="py-3.5 font-mono font-bold text-white">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 text-center font-mono font-bold">
                      <span className={tx.risk_score >= 80 ? 'text-red-400' : (tx.risk_score >= 60 ? 'text-amber-400' : 'text-emerald-400')}>
                        {tx.risk_score} / 100
                      </span>
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${statusBadge}`}>
                        {tx.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {tx.status === 'APPROVED' ? (
                        <span className="text-emerald-400 font-mono text-xs font-semibold">Cleared</span>
                      ) : tx.status === 'REJECTED' ? (
                        <span className="text-slate-500 font-mono text-xs">Voided</span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setActiveMfaTxId(tx.id);
                              setIsMfaOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold hover:bg-cyan-900"
                          >
                            Verify
                          </button>
                          {tx.risk_score < 80 && (
                            <button
                              onClick={() => handleApprove(tx.id)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold hover:bg-emerald-900"
                            >
                              Approve
                            </button>
                          )}
                          <button
                            onClick={() => handleReject(tx.id)}
                            className="px-2.5 py-1 rounded-lg bg-red-950 border border-red-500/30 text-red-300 text-[11px] font-semibold hover:bg-red-900"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <MfaModal
        isOpen={isMfaOpen}
        onClose={() => setIsMfaOpen(false)}
        transactionId={activeMfaTxId || undefined}
        onVerificationComplete={handleMfaComplete}
      />
    </div>
  );
};

export default TransactionsPage;
