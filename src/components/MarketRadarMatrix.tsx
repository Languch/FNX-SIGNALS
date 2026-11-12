import React, { useState, useEffect } from 'react';
import { ScannerAsset } from '../types/trading';
import { TrendingUp, TrendingDown, Search, ShieldAlert, BarChart2 } from 'lucide-react';

interface MarketRadarMatrixProps {
  minPayout: number;
  onInstantScan: (assetId: string) => void;
}

export const MarketRadarMatrix: React.FC<MarketRadarMatrixProps> = ({
  minPayout,
  onInstantScan,
}) => {
  const [assets, setAssets] = useState<ScannerAsset[]>([]);
  const [selectedPair, setSelectedPair] = useState<string>('EURUSD');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchAssets = async () => {
    try {
      const res = await fetch('/api/signals/scanner');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.assets) {
          setAssets(data.assets);
        }
      }
    } catch {
      // Ignore network noise
    }
  };

  useEffect(() => {
    fetchAssets();
    const interval = setInterval(fetchAssets, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePairClick = (id: string) => {
    setSelectedPair(id);
    onInstantScan(id);
  };

  const filtered = assets
    .filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase().trim()));

  return (
    <aside className="w-full flex flex-col gap-3 rounded-xl border border-[#282834] bg-[#1c1c24] p-4 select-none shadow-xl h-full max-h-[860px]">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#282834]">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[#7c6cef]" />
          <h2 className="text-sm font-bold text-white tracking-wide">Real Forex Pairs</h2>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#131316] text-[#7c6cef] border border-[#282834]">
          {filtered.length} PAIRS
        </span>
      </div>

      {/* Search Input */}
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-[#9e9eb0] absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Search pair (EUR, JPY)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#131316] border border-[#282834] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-[#9e9eb0]/50 focus:outline-none focus:border-[#7c6cef] transition-all"
        />
      </div>

      {/* Real Pairs List */}
      <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 flex-1">
        {filtered.map((asset) => {
          const isBull = asset.trend === 'BULLISH';
          const isBear = asset.trend === 'BEARISH';
          const isLowPayout = asset.payout < minPayout;
          const isSelected = selectedPair === asset.id;

          return (
            <div
              key={asset.id}
              onClick={() => handlePairClick(asset.id)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'bg-[#7c6cef]/15 border-[#7c6cef] shadow-sm'
                  : isLowPayout
                  ? 'bg-[#131316]/60 border-[#282834] opacity-60 hover:opacity-100'
                  : 'bg-[#131316] border-[#282834] hover:border-[#7c6cef]/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div>
                  <span className="font-bold text-xs text-white block leading-tight">{asset.name}</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-[#9e9eb0] font-mono mt-0.5">
                    <span>{asset.currentPrice}</span>
                    <span>·</span>
                    <span>RSI: {asset.rsi}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isLowPayout ? (
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                    <ShieldAlert className="w-2.5 h-2.5" /> {asset.payout}%
                  </span>
                ) : (
                  <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    +{asset.payout}%
                  </span>
                )}

                <div className="w-4 flex justify-end">
                  {isBull ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isBear ? (
                    <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};