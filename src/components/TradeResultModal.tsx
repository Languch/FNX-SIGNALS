import React from 'react';
import { SignalEvent } from '../types/trading';
import { CheckCircle2, Award, XCircle, RefreshCw, X, TrendingUp, TrendingDown, Slash } from 'lucide-react';

interface TradeResultModalProps {
  isOpen: boolean;
  signal: SignalEvent | null;
  onClose: () => void;
  onSubmitResult: (signalId: string, outcome: 'win' | 'loss' | 'mtg_win' | 'refund' | 'avoided') => Promise<void>;
}

export const TradeResultModal: React.FC<TradeResultModalProps> = ({
  isOpen,
  signal,
  onClose,
  onSubmitResult,
}) => {
  if (!isOpen || !signal) return null;

  const isCall = signal.direction === 'CALL';

  const handleSelect = async (outcome: 'win' | 'loss' | 'mtg_win' | 'refund' | 'avoided') => {
    await onSubmitResult(signal.id, outcome);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-[#1c1c24] border border-[#282834] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#282834] bg-[#131316]">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">Trade Ended · Select Outcome</h3>
            <span className="text-xs text-[#9e9eb0]">Selected outcome will be sent to Telegram VIP</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9e9eb0] hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trade Details Badge */}
        <div className="p-4 border-b border-[#282834] flex items-center justify-between bg-[#131316]/50">
          <div>
            <span className="text-[10px] text-[#9e9eb0] font-mono block">ASSET</span>
            <span className="text-base font-bold text-white">{signal.assetName}</span>
          </div>

          <div
            className={`px-3 py-1 rounded-md font-bold text-xs flex items-center gap-1.5 ${
              isCall ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
            }`}
          >
            {isCall ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{signal.direction}</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#9e9eb0] font-mono block">STRIKE</span>
            <span className="text-xs font-bold text-white font-mono">{signal.entryPrice}</span>
          </div>
        </div>

        {/* 5 Clean Outcome Selection Buttons */}
        <div className="p-5 flex flex-col gap-2.5">
          {/* Direct Win */}
          <button
            onClick={() => handleSelect('win')}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-[#131316] border border-emerald-500/30 text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>DIRECT WIN</span>
            </div>
            <span className="text-[11px] opacity-75 font-mono">1st Candle</span>
          </button>

          {/* 1-Step MTG Win */}
          <button
            onClick={() => handleSelect('mtg_win')}
            className="w-full py-2.5 px-4 rounded-lg bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-[#131316] border border-amber-500/30 text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>1-STEP MTG WIN</span>
            </div>
            <span className="text-[11px] opacity-75 font-mono">2nd Candle</span>
          </button>

          {/* Loss */}
          <button
            onClick={() => handleSelect('loss')}
            className="w-full py-2.5 px-4 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-300 hover:text-white border border-rose-500/30 text-xs font-bold flex items-center justify-between transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <div className="flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>LOSS</span>
            </div>
            <span className="text-[11px] opacity-75 font-mono">OTM</span>
          </button>

          {/* Refund */}
          <button
            onClick={() => handleSelect('refund')}
            className="w-full py-2.5 px-4 rounded-lg bg-[#131316] hover:bg-[#282834] text-[#9e9eb0] hover:text-white border border-[#282834] text-xs font-bold flex items-center justify-between transition-all cursor-pointer active:scale-95"
          >
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#9e9eb0]" />
              <span>REFUND / TIE</span>
            </div>
            <span className="text-[11px] opacity-75 font-mono">Doji Strike</span>
          </button>

          {/* ⚡ AVOID / SKIP BUTTON */}
          <button
            onClick={() => handleSelect('avoided')}
            className="w-full py-2.5 px-4 rounded-lg bg-[#131316] hover:bg-amber-500/15 text-[#9e9eb0] hover:text-amber-300 border border-[#282834] hover:border-amber-500/40 text-xs font-bold flex items-center justify-between transition-all cursor-pointer active:scale-95"
          >
            <div className="flex items-center gap-2">
              <Slash className="w-4 h-4 text-amber-400" />
              <span>AVOIDED</span>
            </div>
            <span className="text-[11px] opacity-75 font-mono">Trade Not Taken</span>
          </button>
        </div>
      </div>
    </div>
  );
};