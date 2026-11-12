import React from 'react';
import { SignalEvent } from '../types/trading';
import { CheckCircle2, Award, XCircle, RefreshCw, Slash, Percent } from 'lucide-react';

interface TradeCounterBarProps {
  signals: SignalEvent[];
}

export const TradeCounterBar: React.FC<TradeCounterBarProps> = ({ signals }) => {
  // Real-time Counts
  const wins = signals.filter((s) => s.status === 'win').length;
  const mtgWins = signals.filter((s) => s.status === 'mtg_win').length;
  const losses = signals.filter((s) => s.status === 'loss').length;
  const refunds = signals.filter((s) => s.status === 'refund').length;
  const avoided = signals.filter((s) => s.status === 'avoided').length;

  // Real Accuracy: Avoided & Refund do not penalize win-rate
  const totalDecided = wins + mtgWins + losses;
  const winRate = totalDecided > 0 ? (((wins + mtgWins) / totalDecided) * 100).toFixed(1) : '0.0';

  return (
    <div className="shrink-0 grid grid-cols-3 sm:grid-cols-6 gap-2 p-2 sm:p-2.5 rounded-xl bg-[#1c1c24] border border-[#282834] select-none shadow-lg">
      {/* 1. DIRECT WIN */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-[#131316] border border-emerald-500/20">
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-[#9e9eb0] font-mono leading-none uppercase">Win</span>
          <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5 leading-tight">{wins}</span>
        </div>
      </div>

      {/* 2. 1-STEP MTG */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-[#131316] border border-amber-500/20">
        <Award className="w-4 h-4 text-amber-400 shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-[#9e9eb0] font-mono leading-none uppercase">MTG</span>
          <span className="text-sm font-bold text-amber-400 font-mono mt-0.5 leading-tight">{mtgWins}</span>
        </div>
      </div>

      {/* 3. LOSS */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-[#131316] border border-rose-500/20">
        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-[#9e9eb0] font-mono leading-none uppercase">Loss</span>
          <span className="text-sm font-bold text-rose-400 font-mono mt-0.5 leading-tight">{losses}</span>
        </div>
      </div>

      {/* 4. REFUND / TIE */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-[#131316] border border-[#282834]">
        <RefreshCw className="w-4 h-4 text-[#9e9eb0] shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-[#9e9eb0] font-mono leading-none uppercase">Refund</span>
          <span className="text-sm font-bold text-white font-mono mt-0.5 leading-tight">{refunds}</span>
        </div>
      </div>

      {/* 5. AVOIDED / SKIPPED */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-[#131316] border border-amber-500/20">
        <Slash className="w-4 h-4 text-amber-400 shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-[#9e9eb0] font-mono leading-none uppercase">Avoid</span>
          <span className="text-sm font-bold text-amber-300 font-mono mt-0.5 leading-tight">{avoided}</span>
        </div>
      </div>

      {/* 6. REAL ACCURACY */}
      <div className="flex items-center gap-2 p-2 rounded-lg bg-[#7c6cef]/10 border border-[#7c6cef]/30">
        <Percent className="w-4 h-4 text-[#7c6cef] shrink-0" />
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-[#9e9eb0] font-mono leading-none uppercase">Accuracy</span>
          <span className="text-sm font-bold text-[#7c6cef] font-mono mt-0.5 leading-tight">{winRate}%</span>
        </div>
      </div>
    </div>
  );
};