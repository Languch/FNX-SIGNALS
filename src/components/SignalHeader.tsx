import React, { useState, useRef, useEffect } from 'react';
import { SignalStats, VoiceLanguage } from '../types/trading';
import { Volume2, VolumeX, Mic, MicOff, Key, Globe, Send, Calculator, ShieldCheck, ChevronDown, Check, SlidersHorizontal } from 'lucide-react';

const HEADER_CONFIG = {
  paddingTop: '1px',
  paddingBottom: '1px',
  paddingLeft: '24px',
  paddingRight: '24px',
  minHeight: '64px',
  iconSize: '50px',
};

interface SignalHeaderProps {
  stats: SignalStats;
  minPayout: number;
  onChangeMinPayout: (payout: number) => void;
  selectedPairsCount: number;
  onOpenPairModal: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  voiceLang: VoiceLanguage;
  onToggleVoiceLang: () => void;
  isQuotexConnected: boolean;
  onOpenQuotexModal: () => void;
  onOpenTelegramModal: () => void;
  onOpenMtgModal: () => void;
}

export const SignalHeader: React.FC<SignalHeaderProps> = ({
  stats,
  minPayout,
  onChangeMinPayout,
  selectedPairsCount,
  onOpenPairModal,
  soundEnabled,
  onToggleSound,
  voiceEnabled,
  onToggleVoice,
  voiceLang,
  onToggleVoiceLang,
  isQuotexConnected,
  onOpenQuotexModal,
  onOpenTelegramModal,
  onOpenMtgModal,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const payoutOptions = [75, 80, 85, 90];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      style={{
        paddingTop: HEADER_CONFIG.paddingTop,
        paddingBottom: HEADER_CONFIG.paddingBottom,
        paddingLeft: HEADER_CONFIG.paddingLeft,
        paddingRight: HEADER_CONFIG.paddingRight,
        minHeight: HEADER_CONFIG.minHeight,
      }}
      className="flex flex-wrap items-center justify-between gap-3 border-b border-[#282834] bg-[#131316]/95 backdrop-blur sticky top-0 z-40 transition-all"
    >
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-3 shrink-0">
        <img
          src="/quotex.png"
          alt="Quotex Logo"
          style={{ width: HEADER_CONFIG.iconSize, height: HEADER_CONFIG.iconSize }}
          className="object-contain shrink-0"
        />
        <div>
          <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight leading-none">
            FNX SIGNALS
          </h1>
          <span className="text-[10px] text-[#9e9eb0] font-mono tracking-wider uppercase mt-1 flex items-center gap-1">
            <Globe className="w-2.5 h-2.5 text-[#7c6cef]" /> 100% Real Forex Market
          </span>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* 🎯 Pairs Filter Button */}
        <button
          onClick={onOpenPairModal}
          title="Filter specific pairs to trade"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#282834] bg-[#1c1c24] hover:border-[#7c6cef] text-xs font-mono transition-all cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#7c6cef]" />
          <span className="text-[#9e9eb0] font-sans">Pairs:</span>
          <span className="font-bold text-white">
            {selectedPairsCount === 0 || selectedPairsCount === 25 ? 'All (25)' : `${selectedPairsCount} Active`}
          </span>
        </button>

        {/* Custom Min Payout Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#7c6cef]/30 bg-[#7c6cef]/10 text-[#7c6cef] text-xs font-mono font-medium hover:bg-[#7c6cef]/20 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#7c6cef]" />
            <span className="text-[11px] font-sans">Min Payout:</span>
            <span className="font-bold text-white">{minPayout}%+</span>
            <ChevronDown className={`w-3 h-3 text-[#9e9eb0] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-36 bg-[#1c1c24] border border-[#282834] rounded-lg shadow-xl p-1 z-50 animate-in fade-in">
              {payoutOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onChangeMinPayout(opt);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                    minPayout === opt
                      ? 'bg-[#7c6cef]/15 text-[#7c6cef] font-bold'
                      : 'text-[#9e9eb0] hover:bg-[#131316] hover:text-white'
                  }`}
                >
                  <span>{opt}% Payout</span>
                  {minPayout === opt && <Check className="w-3.5 h-3.5 text-[#7c6cef]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Win Rate Stats */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#282834] bg-[#1c1c24] text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[#9e9eb0] text-[11px]">Win:</span>
          <span className="font-bold text-white">{stats.accuracy}%</span>
        </div>

        {/* MTG Tool */}
        <button
          onClick={onOpenMtgModal}
          title="Martingale Calculator"
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1c1c24] border border-[#282834] text-[#9e9eb0] hover:text-white hover:border-[#7c6cef] transition-colors cursor-pointer"
        >
          <Calculator className="w-3.5 h-3.5 text-[#7c6cef]" />
          <span className="hidden sm:inline">MTG</span>
        </button>

        {/* Telegram VIP */}
        <button
          onClick={onOpenTelegramModal}
          title="Telegram VIP Bridge"
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1c1c24] border border-[#282834] text-[#9e9eb0] hover:text-white hover:border-[#7c6cef] transition-colors cursor-pointer"
        >
          <Send className="w-3.5 h-3.5 text-[#7c6cef]" />
          <span className="hidden sm:inline">VIP</span>
        </button>

        {/* Voice Toggle */}
        <button
          onClick={onToggleVoice}
          title="Toggle Voice"
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            voiceEnabled
              ? 'bg-[#7c6cef]/15 border-[#7c6cef] text-[#7c6cef]'
              : 'bg-[#1c1c24] border-[#282834] text-[#9e9eb0] hover:text-white'
          }`}
        >
          {voiceEnabled ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          title="Toggle Sound"
          className={`p-2 rounded-lg border transition-all cursor-pointer ${
            soundEnabled
              ? 'bg-[#1c1c24] border-[#282834] text-[#7c6cef]'
              : 'bg-[#1c1c24] border-[#282834] text-[#9e9eb0] hover:text-white'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>

        {/* Quotex SSID */}
        <button
          onClick={onOpenQuotexModal}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
            isQuotexConnected
              ? 'bg-[#1c1c24] border border-[#7c6cef]/60 text-[#7c6cef]'
              : 'bg-[#7c6cef] hover:bg-[#6956e5] text-white'
          }`}
        >
          <Key className="w-3 h-3" />
          <span className="hidden sm:inline">{isQuotexConnected ? 'Connected' : 'SSID'}</span>
        </button>
      </div>
    </header>
  );
};