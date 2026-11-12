import React, { useState } from 'react';
import { X, Check, SlidersHorizontal, Search } from 'lucide-react';

interface PairSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPairs: string[];
  onSavePairs: (pairs: string[]) => void;
}

const ALL_PAIRS = [
  { id: 'EURUSD', name: 'EUR/USD' },
  { id: 'GBPUSD', name: 'GBP/USD' },
  { id: 'USDJPY', name: 'USD/JPY' },
  { id: 'AUDUSD', name: 'AUD/USD' },
  { id: 'USDCAD', name: 'USD/CAD' },
  { id: 'NZDUSD', name: 'NZD/USD' },
  { id: 'USDCHF', name: 'USD/CHF' },
  { id: 'EURGBP', name: 'EUR/GBP' },
  { id: 'EURJPY', name: 'EUR/JPY' },
  { id: 'GBPJPY', name: 'GBP/JPY' },
  { id: 'AUDJPY', name: 'AUD/JPY' },
  { id: 'EURAUD', name: 'EUR/AUD' },
  { id: 'CADJPY', name: 'CAD/JPY' },
  { id: 'EURCAD', name: 'EUR/CAD' },
  { id: 'GBPAUD', name: 'GBP/AUD' },
  { id: 'EURCHF', name: 'EUR/CHF' },
  { id: 'GBPCHF', name: 'GBP/CHF' },
  { id: 'CHFJPY', name: 'CHF/JPY' },
  { id: 'AUDCAD', name: 'AUD/CAD' },
  { id: 'AUDNZD', name: 'AUD/NZD' },
  { id: 'NZDJPY', name: 'NZD/JPY' },
  { id: 'CADCHF', name: 'CAD/CHF' },
  { id: 'EURNZD', name: 'EUR/NZD' },
  { id: 'GBPNZD', name: 'GBP/NZD' },
  { id: 'AUDCHF', name: 'AUD/CHF' },
];

export const PairSelectorModal: React.FC<PairSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedPairs,
  onSavePairs,
}) => {
  const [currentSelection, setCurrentSelection] = useState<string[]>(selectedPairs);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const togglePair = (id: string) => {
    if (currentSelection.includes(id)) {
      setCurrentSelection(currentSelection.filter((p) => p !== id));
    } else {
      setCurrentSelection([...currentSelection, id]);
    }
  };

  const handleSelectAll = () => {
    setCurrentSelection(ALL_PAIRS.map((p) => p.id));
  };

  const handleClearAll = () => {
    setCurrentSelection([]);
  };

  const handleApply = () => {
    onSavePairs(currentSelection);
    onClose();
  };

  const filteredPairs = ALL_PAIRS.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-[#1c1c24] border border-[#282834] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282834] bg-[#131316]">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-[#7c6cef]" />
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">Target Pairs Filter</h3>
              <p className="text-xs text-[#9e9eb0]">Bot will strictly scan & signal only selected pairs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9e9eb0] hover:text-white hover:bg-[#1c1c24] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Search */}
        <div className="p-4 border-b border-[#282834] flex flex-wrap items-center justify-between gap-3 bg-[#131316]/40">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAll}
              className="px-3 py-1.5 rounded-lg bg-[#1c1c24] border border-[#282834] hover:border-[#7c6cef] text-xs font-semibold text-white transition-all cursor-pointer"
            >
              Select All (25)
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-lg bg-[#131316] border border-[#282834] hover:text-rose-400 text-xs font-semibold text-[#9e9eb0] transition-all cursor-pointer"
            >
              Clear
            </button>
          </div>

          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#9e9eb0] absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search pair..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#131316] border border-[#282834] rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#9e9eb0]/50 focus:outline-none focus:border-[#7c6cef] w-40 sm:w-48"
            />
          </div>
        </div>

        {/* Pairs Checkbox Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5 flex-1">
          {filteredPairs.map((pair) => {
            const isSelected = currentSelection.includes(pair.id);
            return (
              <div
                key={pair.id}
                onClick={() => togglePair(pair.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-[#7c6cef]/15 border-[#7c6cef] text-white shadow-sm'
                    : 'bg-[#131316] border-[#282834] text-[#9e9eb0] hover:text-white hover:border-[#7c6cef]/40'
                }`}
              >
                <span className="font-bold text-xs">{pair.name}</span>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                    isSelected ? 'bg-[#7c6cef] border-[#7c6cef]' : 'border-[#282834] bg-[#1c1c24]'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#282834] flex items-center justify-between bg-[#131316]">
          <span className="text-xs font-mono text-[#9e9eb0]">
            {currentSelection.length === 0 || currentSelection.length === 25
              ? 'Status: Scanning All 25 Pairs'
              : `Status: Scanning ${currentSelection.length} Pairs Only`}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#9e9eb0] hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-lg bg-[#7c6cef] hover:bg-[#6956e5] text-white text-xs font-bold shadow-md shadow-[#7c6cef]/20 transition-all cursor-pointer"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};