/**
 * FNx Signal Pro - Single Viewport Fit Binary Terminal (With Live Trade Counter Bar)
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SignalEvent, SignalStats, QuotexSession, VoiceLanguage } from './types/trading';
import { SignalHeader } from './components/SignalHeader';
import { ActiveSignalCard } from './components/ActiveSignalCard';
import { TradeCounterBar } from './components/TradeCounterBar';
import { SignalHistoryFeed } from './components/SignalHistoryFeed';
import { TradeResultModal } from './components/TradeResultModal';
import { QuotexBridgeHookModal } from './components/QuotexBridgeHookModal';
import { TelegramBotModal } from './components/TelegramBotModal';
import { MartingaleCalculatorModal } from './components/MartingaleCalculatorModal';
import { PairSelectorModal } from './components/PairSelectorModal';
import { LandingPage } from './components/LandingPage';
import { CheckCircle, AlertCircle, Zap, Globe } from 'lucide-react';

export default function App() {
  const [showLanding, setShowLanding] = useState<boolean>(false);

  const [showQuotexModal, setShowQuotexModal] = useState<boolean>(false);
  const [showTelegramModal, setShowTelegramModal] = useState<boolean>(false);
  const [showMtgModal, setShowMtgModal] = useState<boolean>(false);
  const [showPairModal, setShowPairModal] = useState<boolean>(false);

  const [selectedPairs, setSelectedPairs] = useState<string[]>([]);
  const [tradeForOutcomeModal, setTradeForOutcomeModal] = useState<SignalEvent | null>(null);

  const [minPayout, setMinPayout] = useState<number>(80);

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [voiceLang, setVoiceLang] = useState<VoiceLanguage>('en');

  const [activeSignal, setActiveSignal] = useState<SignalEvent | null>(null);
  const [preAlert, setPreAlert] = useState<SignalEvent | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | undefined>(undefined);
  const [signalsFeed, setSignalsFeed] = useState<SignalEvent[]>([]);
  const [stats, setStats] = useState<SignalStats>({
    totalSignals: 18,
    wins: 15,
    losses: 1,
    mtgWins: 2,
    accuracy: 94.8,
    consecutiveLosses: 0,
    antiLossCircuitStatus: 'STANDBY',
  });

  const clearedBeforeRef = useRef<number>(0);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('fnx_cleared_time');
      if (saved) clearedBeforeRef.current = parseInt(saved, 10);
    } catch {}
  }, []);

  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const [session, setSession] = useState<QuotexSession>({
    isConnected: true,
    accountType: 'demo',
    ssid: 'demo_qx_session_real_sync',
    maskedToken: 'demo...sync',
    balance: 10000.0,
    latencyMs: 22,
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 3500);
  };

  const handleClearHistory = async () => {
    const now = Date.now();
    clearedBeforeRef.current = now;
    try {
      localStorage.setItem('fnx_cleared_time', now.toString());
    } catch {}

    setSignalsFeed([]);
    setStats({
      totalSignals: 0,
      wins: 0,
      losses: 0,
      mtgWins: 0,
      accuracy: 0,
      consecutiveLosses: 0,
      antiLossCircuitStatus: 'STANDBY',
    });
    showToast('All signal history deleted successfully!', 'info');

    try {
      await fetch('/api/signals/clear-history', { method: 'POST' });
    } catch {}
  };

  const handleSavePairFilter = async (pairs: string[]) => {
    setSelectedPairs(pairs);
    showToast(pairs.length === 0 ? 'Scanning All 25 Pairs' : `Scanning ${pairs.length} Specific Pairs`, 'info');
    try {
      await fetch('/api/signals/pair-filter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pairs }),
      });
    } catch {}
  };

  const handleSubmitOutcome = async (
    signalId: string,
    outcome: 'win' | 'loss' | 'mtg_win' | 'refund' | 'avoided'
  ) => {
    try {
      const res = await fetch('/api/signals/submit-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signalId, outcome }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.stats) setStats(data.stats);
        setSignalsFeed((prev) =>
          prev.map((s) => (s.id === signalId ? { ...s, status: outcome } : s))
        );
        showToast(`Result (${outcome.toUpperCase()}) sent to Telegram!`, 'success');
      } else {
        showToast(data.error || 'Submission failed', 'error');
      }
    } catch {
      showToast('Failed to submit result to Telegram', 'error');
    }
  };

  const handleChangeMinPayout = async (payout: number) => {
    setMinPayout(payout);
    showToast(`Min Payout Filter set to ${payout}%`, 'info');
    try {
      await fetch('/api/signals/payout-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minPayout: payout }),
      });
    } catch {}
  };

  const playChime = useCallback((type: 'pre_alert' | 'signal_now' | 'win') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'pre_alert') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'signal_now') {
        osc.frequency.setValueAtTime(700, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'win') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {}
  }, [soundEnabled]);

  const speakVoice = useCallback((enText: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(enText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch {}
  }, [voiceEnabled]);

  const lastTrackedActiveRef = useRef<SignalEvent | null>(null);
  const lastAnnouncedActiveIdRef = useRef<string | null>(null);
  const lastAnnouncedPreAlertIdRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLiveFeed = async () => {
      try {
        const res = await fetch('/api/signals/live');
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const data = await res.json();
          if (isMounted && data.success) {
            if (lastTrackedActiveRef.current && !data.activeSignal) {
              setTradeForOutcomeModal(lastTrackedActiveRef.current);
            }
            lastTrackedActiveRef.current = data.activeSignal;

            setActiveSignal(data.activeSignal);
            setPreAlert(data.upcomingPreAlert);
            setCurrentPrice(data.currentPrice);

            const filteredSignals = (data.recentSignals || []).filter(
              (sig: SignalEvent) => sig.createdTime > clearedBeforeRef.current
            );
            setSignalsFeed(filteredSignals);

            if (data.stats && clearedBeforeRef.current === 0) {
              setStats(data.stats);
            }

            if (data.minPayoutThreshold) {
              setMinPayout(data.minPayoutThreshold);
            }

            if (data.upcomingPreAlert && data.upcomingPreAlert.id !== lastAnnouncedPreAlertIdRef.current) {
              lastAnnouncedPreAlertIdRef.current = data.upcomingPreAlert.id;
              playChime('pre_alert');
              speakVoice(`Signal. ${data.upcomingPreAlert.assetName}, prepare ${data.upcomingPreAlert.direction}.`);
              showToast(`Signal: ${data.upcomingPreAlert.assetName} prepare ${data.upcomingPreAlert.direction}`, 'info');
            }

            if (data.activeSignal && data.activeSignal.id !== lastAnnouncedActiveIdRef.current) {
              lastAnnouncedActiveIdRef.current = data.activeSignal.id;
              playChime('signal_now');
            }
          }
        }
      } catch {}
    };

    fetchLiveFeed();
    const interval = setInterval(fetchLiveFeed, 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [playChime, speakVoice]);

  const handleCopySignal = (sig: SignalEvent) => {
    const text = `📊 FNx SIGNAL PRO — REAL MARKET 📊
Asset: ${sig.assetName} (Real Forex)
Payout: ${sig.payout}%
Action: ${sig.direction === 'CALL' ? '🟢 CALL / UP' : '🔴 PUT / DOWN'}
Expiry: ${sig.timeframe} (60s)
Confluence: ${sig.confidence}%
Protection: Zero-Consecutive-Loss Shield Active`;
    navigator.clipboard.writeText(text);
    showToast(`Copied ${sig.assetName} signal!`, 'success');
  };

  const handleConnectSsid = async (ssid: string, accountType: 'demo' | 'real') => {
    const res = await fetch('/api/quotex/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ssid, accountType }),
    });
    const data = await res.json();
    if (data.success) {
      setSession({
        isConnected: true,
        accountType: data.accountType,
        ssid,
        maskedToken: data.maskedToken,
        balance: data.balance,
        latencyMs: data.latencyMs,
      });
      showToast(data.message, 'success');
    } else {
      throw new Error(data.error || 'Connection error');
    }
  };

  if (showLanding) {
    return <LandingPage onLaunchApp={() => setShowLanding(false)} />;
  }

  return (
    <div className="h-screen w-screen bg-[#131316] text-white flex flex-col overflow-hidden font-sans select-none">
      {/* Top Header */}
      <div className="shrink-0 flex items-center justify-between">
        <div className="flex-1">
          <SignalHeader
            stats={stats}
            minPayout={minPayout}
            onChangeMinPayout={handleChangeMinPayout}
            selectedPairsCount={selectedPairs.length}
            onOpenPairModal={() => setShowPairModal(true)}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            voiceEnabled={voiceEnabled}
            onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
            voiceLang={voiceLang}
            onToggleVoiceLang={() => setVoiceLang(voiceLang === 'bn' ? 'en' : 'bn')}
            isQuotexConnected={session.isConnected}
            onOpenQuotexModal={() => setShowQuotexModal(true)}
            onOpenTelegramModal={() => setShowTelegramModal(true)}
            onOpenMtgModal={() => setShowMtgModal(true)}
          />
        </div>

        {/* Landing Page Switcher */}
        <div className="bg-[#131316]/95 border-b border-[#282834] py-3 pr-6">
          <button
            onClick={() => setShowLanding(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1c1c24] border border-[#7c6cef]/40 hover:bg-[#7c6cef] text-xs font-bold text-white transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#7c6cef]" />
            <span>Landing Page</span>
          </button>
        </div>
      </div>

      {/* Floating Minimal Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg shadow-2xl text-xs font-medium border border-[#282834] bg-[#1c1c24]/95 text-white backdrop-blur animate-in fade-in">
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : notification.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <Zap className="w-4 h-4 text-[#7c6cef] shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Single Screen Layout */}
      <main className="flex-1 w-full max-w-[1200px] mx-auto p-3 sm:p-4 flex flex-col gap-2.5 min-h-0 overflow-hidden">
        {/* 1. Active Signal / Live Radar Scanner */}
        <div className="shrink-0">
          <ActiveSignalCard
            activeSignal={activeSignal}
            preAlert={preAlert}
            currentPrice={currentPrice}
            selectedPairsCount={selectedPairs.length}
            onCopySignal={handleCopySignal}
          />
        </div>

        {/* 2. 🌟 LIVE TRADE COUNTER BAR (Win, MTG, Loss, Refund, Avoid, Accuracy) */}
        <TradeCounterBar signals={signalsFeed} />

        {/* 3. Live Signal Feed */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <SignalHistoryFeed
            signals={signalsFeed}
            onCopySignal={handleCopySignal}
            onClearHistory={handleClearHistory}
            onOverrideResult={(id, outcome) => handleSubmitOutcome(id, outcome)}
          />
        </div>
      </main>

      {/* Target Pairs Selection Modal */}
      <PairSelectorModal
        isOpen={showPairModal}
        onClose={() => setShowPairModal(false)}
        selectedPairs={selectedPairs}
        onSavePairs={handleSavePairFilter}
      />

      {/* Trade Outcome Modal */}
      <TradeResultModal
        isOpen={Boolean(tradeForOutcomeModal)}
        signal={tradeForOutcomeModal}
        onClose={() => setTradeForOutcomeModal(null)}
        onSubmitResult={handleSubmitOutcome}
      />

      {/* Quotex SSID Modal */}
      <QuotexBridgeHookModal
        isOpen={showQuotexModal}
        onClose={() => setShowQuotexModal(false)}
        session={session}
        onConnectSsid={handleConnectSsid}
        isLoading={false}
      />

      {/* Telegram VIP Modal */}
      <TelegramBotModal
        isOpen={showTelegramModal}
        onClose={() => setShowTelegramModal(false)}
      />

      {/* Martingale Calculator Modal */}
      <MartingaleCalculatorModal
        isOpen={showMtgModal}
        onClose={() => setShowMtgModal(false)}
      />
    </div>
  );
}