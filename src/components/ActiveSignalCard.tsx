import React, { useState, useEffect } from 'react';
import { SignalEvent } from '../types/trading';
import { Clock, Copy, Check, Radio } from 'lucide-react';

const CARD_CONFIG = {
  minHeight: '260px',        // 👈 কার্ডের মোট উচ্চতা (বাড়াতে চাইলে 280px, 300px বা 320px দিন)
  paddingTop: '20px',        // 👈 কার্ডের ভেতরের উপরের প্যাডিং
  paddingBottom: '20px',     // 👈 কার্ডের ভেতরের নিচের প্যাডিং
  paddingLeft: '24px',       // 👈 কার্ডের ভেতরের বামের প্যাডিং
  paddingRight: '24px',      // 👈 কার্ডের ভেতরের ডানের প্যাডিং
  imageSize: '54px',         // 👈 CALL / PUT ট্রেড ছবির সাইজ
};

interface ActiveSignalCardProps {
  activeSignal: SignalEvent | null;
  preAlert: SignalEvent | null;
  currentPrice?: number;
  onCopySignal: (signal: SignalEvent) => void;
  onOverrideResult?: (signalId: string, status: 'win' | 'loss' | 'mtg_win' | 'refund' | 'avoided') => void;
}

export const ActiveSignalCard: React.FC<ActiveSignalCardProps> = ({
  activeSignal,
  preAlert,
  onCopySignal,
}) => {
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = (sig: SignalEvent) => {
    onCopySignal(sig);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. LIVE ACTIVE SIGNAL
  if (activeSignal) {
    const isCall = activeSignal.direction === 'CALL';
    const totalDurationMs = activeSignal.durationSeconds * 1000;
    const elapsedMs = Math.max(0, now - activeSignal.entryTime);
    const remainingMs = Math.max(0, activeSignal.expireTime - now);
    const remainingSec = Math.ceil(remainingMs / 1000);
    const progressPercent = Math.min(100, Math.max(0, (elapsedMs / totalDurationMs) * 100));

    const strikePrice = activeSignal.entryPrice;
    const tradeImage = isCall ? '/calltrade.jpg' : '/puttrade.jpg';

    return (
      <div
        style={{
          minHeight: CARD_CONFIG.minHeight,
          paddingTop: CARD_CONFIG.paddingTop,
          paddingBottom: CARD_CONFIG.paddingBottom,
          paddingLeft: CARD_CONFIG.paddingLeft,
          paddingRight: CARD_CONFIG.paddingRight,
        }}
        className={`relative overflow-hidden rounded-xl border bg-[#1c1c24] shadow-2xl select-none transition-all flex flex-col justify-between ${
          isCall 
            ? 'border-emerald-500/40 animate-call-glow' 
            : 'border-rose-500/40 animate-put-glow'
        }`}
      >
        {/* Glow backdrop */}
        <div
          className={`absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-all ${
            isCall ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        />

        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#282834]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7c6cef] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7c6cef]"></span>
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Live Real Market Trade
            </span>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              +{activeSignal.payout}%
            </span>
          </div>

          <button
            onClick={() => handleCopy(activeSignal)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#131316] border border-[#282834] hover:border-[#7c6cef] text-[#9e9eb0] hover:text-white text-xs font-medium transition-all cursor-pointer shadow-sm active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        {/* Signal Body */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center my-auto py-3">
          {/* Left Column: Asset & Trade Image with CALL/PUT */}
          <div className="sm:col-span-7 flex flex-col gap-3">
            <div>
              <span className="text-[11px] text-[#9e9eb0] font-mono uppercase tracking-wider">Target Asset</span>
              <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none mt-1">
                {activeSignal.assetName}
              </h3>
            </div>

            <div
              className={`flex items-center gap-4 p-3.5 rounded-lg border transition-all ${
                isCall
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
              }`}
            >
              <img
                src={tradeImage}
                alt={activeSignal.direction}
                style={{
                  width: CARD_CONFIG.imageSize,
                  height: CARD_CONFIG.imageSize,
                }}
                className="rounded-lg object-cover shrink-0 shadow-md border border-[#282834]"
              />

              <div>
                <span className="text-2xl sm:text-3xl font-black tracking-wide font-sans block text-white leading-tight">
                  {activeSignal.direction}
                </span>
                <span className="text-xs text-[#9e9eb0] font-mono block mt-0.5">
                  1M Expiry · {activeSignal.confidence}% Confluence
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Timer & Strike */}
          <div className="sm:col-span-5 flex flex-col justify-center">
            <div className="p-4 rounded-lg bg-[#131316] border border-[#282834] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#9e9eb0] flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-[#7c6cef]" /> Expiry Countdown
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-black text-white tabular-nums">
                  00:{remainingSec < 10 ? `0${remainingSec}` : remainingSec}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-[#1c1c24] overflow-hidden border border-[#282834]">
                <div
                  className={`h-full transition-all duration-200 ${isCall ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-[#9e9eb0] pt-2 border-t border-[#282834]">
                <span>Strike Price:</span>
                <span className="font-bold text-white text-sm">{strikePrice}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. PRE-ALERT
  if (preAlert) {
    const isCall = preAlert.direction === 'CALL';
    const remainingToEntry = Math.max(0, Math.ceil((preAlert.entryTime - now) / 1000));
    const tradeImage = isCall ? '/calltrade.jpg' : '/puttrade.jpg';

    return (
      <div
        style={{
          minHeight: CARD_CONFIG.minHeight,
          paddingTop: CARD_CONFIG.paddingTop,
          paddingBottom: CARD_CONFIG.paddingBottom,
          paddingLeft: CARD_CONFIG.paddingLeft,
          paddingRight: CARD_CONFIG.paddingRight,
        }}
        className="relative overflow-hidden rounded-xl border border-[#7c6cef]/50 bg-[#1c1c24] select-none shadow-xl transition-all flex flex-col justify-between"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#282834]">
          <div className="flex items-center gap-2 text-[#7c6cef] font-bold text-xs uppercase tracking-wider font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7c6cef] animate-ping" />
            <span>Pre-Alert · Real Market Setup</span>
          </div>
          <span className="px-3 py-1 rounded bg-[#7c6cef]/15 text-[#7c6cef] border border-[#7c6cef]/30 font-mono font-bold text-xs">
            Entry in 00:{remainingToEntry < 10 ? `0${remainingToEntry}` : remainingToEntry}s
          </span>
        </div>

        <div className="py-4 my-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-[#9e9eb0] font-mono uppercase tracking-wider">Setup Detected</span>
            <h3 className="text-3xl font-extrabold text-white leading-tight mt-1">{preAlert.assetName}</h3>
            <span className="text-xs text-[#7c6cef] font-mono mt-1 block">
              Confidence: {preAlert.confidence}% · Payout: {preAlert.payout}%
            </span>
          </div>

          <div
            className={`px-6 py-3 rounded-lg font-black text-base flex items-center gap-3 shadow-md ${
              isCall ? 'bg-emerald-500 text-[#131316]' : 'bg-rose-500 text-white'
            }`}
          >
            <img
              src={tradeImage}
              alt={preAlert.direction}
              className="w-7 h-7 rounded object-cover"
            />
            <span>PREPARE {preAlert.direction}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: CARD_CONFIG.minHeight,
        paddingTop: CARD_CONFIG.paddingTop,
        paddingBottom: CARD_CONFIG.paddingBottom,
        paddingLeft: CARD_CONFIG.paddingLeft,
        paddingRight: CARD_CONFIG.paddingRight,
      }}
      className="relative overflow-hidden rounded-xl border border-[#282834] bg-[#1c1c24] select-none shadow-xl transition-all flex items-center justify-center gap-8"
    >
   
      <div className="relative flex items-center justify-center w-28 h-28 shrink-0">
        <div className="absolute inset-0 rounded-full border border-[#7c6cef]/40 animate-sonar-1 pointer-events-none" />
        <div className="absolute inset-0 rounded-full border border-[#7c6cef]/25 animate-sonar-2 pointer-events-none" />

        <div className="relative w-24 h-24 rounded-full border border-[#282834] bg-[#131316]/90 flex items-center justify-center shadow-xl overflow-hidden">
          <div className="absolute w-full h-[1px] bg-[#282834]" />
          <div className="absolute h-full w-[1px] bg-[#282834]" />

          <div className="absolute inset-0 animate-radar origin-center pointer-events-none">
            <div className="w-1/2 h-1/2 bg-gradient-to-br from-[#7c6cef]/50 via-[#7c6cef]/10 to-transparent rounded-tl-full" />
          </div>

          <div className="relative z-10 w-3 h-3 rounded-full bg-[#7c6cef] shadow-md shadow-[#7c6cef] animate-pulse" />
        </div>
      </div>

      <div className="text-left max-w-md">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#131316] border border-[#282834] text-[11px] font-mono text-[#7c6cef] mb-1.5">
          <Radio className="w-3.5 h-3.5 animate-pulse text-[#7c6cef]" />
          <span>RADAR ACTIVE · 25 REAL PAIRS</span>
        </div>
        <h3 className="text-base sm:text-lg font-bold text-white">Scanning 25 Real Market Pairs</h3>
        <p className="text-xs text-[#9e9eb0] mt-1 leading-relaxed">
          Monitoring Bollinger Bands, EMA 9/21, and order flow. Signal triggers 15 seconds before candle open.
        </p>
      </div>
    </div>
  );
};