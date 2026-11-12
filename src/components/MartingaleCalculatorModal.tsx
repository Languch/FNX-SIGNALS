import React, { useState } from 'react';
import { X, Calculator, DollarSign } from 'lucide-react';

interface MartingaleCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MartingaleCalculatorModal: React.FC<MartingaleCalculatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [balance, setBalance] = useState<number>(100);
  const [baseTrade, setBaseTrade] = useState<number>(1);
  const [payout, setPayout] = useState<number>(85);

  if (!isOpen) return null;

  const multiplier = 2.3;
  const mtg1 = Number((baseTrade * multiplier).toFixed(1));
  const mtg2 = Number((mtg1 * multiplier).toFixed(1));

  const totalRiskMtg1 = Number((baseTrade + mtg1).toFixed(1));
  const totalRiskMtg2 = Number((totalRiskMtg1 + mtg2).toFixed(1));

  const profitBase = Number(((baseTrade * payout) / 100).toFixed(2));
  const profitMtg1 = Number(((mtg1 * payout) / 100 - baseTrade).toFixed(2));
  const profitMtg2 = Number(((mtg2 * payout) / 100 - totalRiskMtg1).toFixed(2));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#1c1c24] border border-[#282834] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282834] bg-[#131316]">
          <div className="flex items-center gap-2.5">
            <Calculator className="w-5 h-5 text-[#7c6cef]" />
            <h3 className="text-base font-bold text-white tracking-wide">Martingale Calculator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9e9eb0] hover:text-white hover:bg-[#1c1c24] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-[#9e9eb0] block mb-1.5">Balance ($)</label>
              <input
                type="number"
                value={balance}
                onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#131316] border border-[#282834] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#7c6cef] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#9e9eb0] block mb-1.5">Base Stake ($)</label>
              <input
                type="number"
                value={baseTrade}
                onChange={(e) => setBaseTrade(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#131316] border border-[#282834] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#7c6cef] transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[#9e9eb0] block mb-1.5">Payout Rate (%)</label>
              <input
                type="number"
                value={payout}
                onChange={(e) => setPayout(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#131316] border border-[#282834] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#7c6cef] transition-colors"
              />
            </div>
          </div>

          {/* Results Table */}
          <div className="rounded-lg border border-[#282834] bg-[#131316] overflow-hidden">
            <div className="grid grid-cols-4 px-4 py-3 border-b border-[#282834] text-xs font-semibold text-[#9e9eb0] font-mono uppercase">
              <span>Step</span>
              <span>Stake</span>
              <span>Total Risk</span>
              <span className="text-right">Net Profit</span>
            </div>

            <div className="divide-y divide-[#282834] text-sm font-mono">
              <div className="grid grid-cols-4 px-4 py-3 items-center">
                <span className="font-semibold text-white">Base Trade</span>
                <span className="text-white">${baseTrade}</span>
                <span className="text-[#9e9eb0]">${baseTrade}</span>
                <span className="text-right text-emerald-400 font-bold">+${profitBase}</span>
              </div>

              <div className="grid grid-cols-4 px-4 py-3 items-center">
                <span className="font-semibold text-[#7c6cef]">1-Step MTG</span>
                <span className="text-white">${mtg1}</span>
                <span className="text-[#9e9eb0]">${totalRiskMtg1}</span>
                <span className="text-right text-emerald-400 font-bold">+${profitMtg1}</span>
              </div>

              <div className="grid grid-cols-4 px-4 py-3 items-center">
                <span className="font-semibold text-rose-400">2-Step MTG</span>
                <span className="text-white">${mtg2}</span>
                <span className="text-[#9e9eb0]">${totalRiskMtg2}</span>
                <span className="text-right text-emerald-400 font-bold">+${profitMtg2}</span>
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg bg-[#7c6cef] hover:bg-[#6956e5] text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};