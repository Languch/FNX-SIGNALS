import React, { useState } from 'react';
import { 
  ShieldCheck, Zap, ArrowRight, Globe, Lock, Key, CheckCircle2, AlertCircle, Send, ExternalLink, HelpCircle
} from 'lucide-react';

interface LandingPageProps {
  onUnlockApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onUnlockApp }) => {
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [licenseInput, setLicenseInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const QUOTEX_SIGNUP_URL = 'https://broker-qx.pro/sign-up/?lid=2425010';
  const TELEGRAM_ADMIN_URL = 'https://t.me/'; // 👈 আপনার টেলিগ্রাম ইউজারনেম বসিয়ে দিন (যেমন: https://t.me/your_username)

  const handleVerifyKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!licenseInput.trim()) {
      setErrorMsg('Please enter your License Key');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch('/api/license/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: licenseInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('fnx_vip_license', data.key);
        setShowKeyModal(false);
        onUnlockApp();
      } else {
        setErrorMsg(data.error || 'Activation failed');
      }
    } catch {
      setErrorMsg('Connection error. Make sure server is running.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131316] text-white flex flex-col font-sans selection:bg-[#7c6cef]/30 selection:text-white">
      {/* 1. TOP NAVBAR */}
      <nav className="sticky top-0 z-40 border-b border-[#282834] bg-[#131316]/90 backdrop-blur px-6 py-4">
        <div className="max-w-[1240px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/quotex.png" alt="FNx Pro" className="w-8 h-8 object-contain" />
            <span className="font-extrabold text-lg text-white tracking-tight">
              FNx SIGNAL <span className="text-[#7c6cef]">PRO</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowKeyModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1c1c24] border border-[#282834] hover:border-[#7c6cef] text-sm font-semibold text-white transition-all cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-[#7c6cef]" />
              <span>Enter Key</span>
            </button>

            <a
              href={QUOTEX_SIGNUP_URL}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg bg-[#7c6cef] hover:bg-[#6956e5] text-sm font-bold text-white shadow-lg shadow-[#7c6cef]/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Register Quotex</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative px-6 pt-20 pb-16 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[300px] bg-[#7c6cef]/15 rounded-full blur-[130px] pointer-events-none" />

        <div className="max-w-[920px] mx-auto text-center relative z-10 flex flex-col items-center gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1c1c24] border border-[#282834] text-xs font-mono text-[#7c6cef]">
            <ShieldCheck className="w-4 h-4 text-[#7c6cef]" />
            <span>FREE VIP ACCESS · 100% REAL FOREX INTERBANK SIGNALS</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.12]">
            Get 100% Free VIP Bot Access with <span className="text-[#7c6cef]">Quotex</span>
          </h1>

          <p className="text-base sm:text-lg text-[#9e9eb0] max-w-[680px] leading-relaxed">
            No monthly subscription fees. Simply create your new Quotex account using our official partner link below, send us your Trader ID, and receive your 1-IP locked VIP License Key!
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <a
              href={QUOTEX_SIGNUP_URL}
              target="_blank"
              rel="noreferrer"
              className="px-8 py-4 rounded-xl bg-[#7c6cef] hover:bg-[#6956e5] text-white font-extrabold text-base shadow-xl shadow-[#7c6cef]/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
            >
              <span>1. Create Quotex Account</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <button
              onClick={() => setShowKeyModal(true)}
              className="px-7 py-4 rounded-xl bg-[#1c1c24] border border-[#282834] hover:border-[#7c6cef] text-white font-bold text-base flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
            >
              <Lock className="w-4 h-4 text-[#7c6cef]" />
              <span>2. I Have A Key</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-xs font-mono text-[#9e9eb0] border-t border-[#282834]/60 w-full mt-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>94.8% Algorithmic Accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#7c6cef]" />
              <span>25 Real Market Pairs</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#7c6cef]" />
              <span>1-IP Hardware Lock Security</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 3-STEP ACCESS FUNNEL */}
      <section className="px-6 py-20 border-t border-[#282834] bg-[#1c1c24]/30">
        <div className="max-w-[1100px] mx-auto flex flex-col gap-12">
          <div className="text-center max-w-[600px] mx-auto">
            <span className="text-xs font-mono uppercase tracking-wider text-[#7c6cef] font-bold">Fast Setup</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">How To Unlock Full Access in 3 Steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-xl bg-[#1c1c24] border border-[#282834] flex flex-col justify-between gap-6 hover:border-[#7c6cef]/50 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#7c6cef]/15 border border-[#7c6cef]/40 flex items-center justify-center font-bold text-base text-[#7c6cef] font-mono">
                  01
                </div>
                <h3 className="text-lg font-bold text-white">Create Account</h3>
                <p className="text-xs text-[#9e9eb0] leading-relaxed">
                  Click our official link and register a new Quotex account. Make sure to use clean cookies or incognito.
                </p>
              </div>
              <a
                href={QUOTEX_SIGNUP_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-lg bg-[#131316] hover:bg-[#7c6cef] border border-[#282834] text-xs font-bold text-center text-white transition-all"
              >
                Open Quotex Link
              </a>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-xl bg-[#1c1c24] border border-[#282834] flex flex-col justify-between gap-6 hover:border-[#7c6cef]/50 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#7c6cef]/15 border border-[#7c6cef]/40 flex items-center justify-center font-bold text-base text-[#7c6cef] font-mono">
                  02
                </div>
                <h3 className="text-lg font-bold text-white">Message on Telegram</h3>
                <p className="text-xs text-[#9e9eb0] leading-relaxed">
                  Send your new Quotex Trader ID to our admin Telegram for instant verification and approval.
                </p>
              </div>
              <a
                href={TELEGRAM_ADMIN_URL}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-lg bg-[#131316] hover:bg-[#7c6cef] border border-[#282834] text-xs font-bold text-center text-white flex items-center justify-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Message Admin</span>
              </a>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-xl bg-[#1c1c24] border border-[#282834] flex flex-col justify-between gap-6 hover:border-[#7c6cef]/50 transition-all">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#7c6cef]/15 border border-[#7c6cef]/40 flex items-center justify-center font-bold text-base text-[#7c6cef] font-mono">
                  03
                </div>
                <h3 className="text-lg font-bold text-white">Activate & Profit</h3>
                <p className="text-xs text-[#9e9eb0] leading-relaxed">
                  Admin sends you a 1-IP locked VIP License Key. Paste it in the activation box to unlock the live bot forever.
                </p>
              </div>
              <button
                onClick={() => setShowKeyModal(true)}
                className="w-full py-2.5 rounded-lg bg-[#7c6cef] hover:bg-[#6956e5] text-xs font-bold text-white shadow-md transition-all cursor-pointer"
              >
                Enter License Key
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="border-t border-[#282834] bg-[#131316] px-6 py-8 mt-auto">
        <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9e9eb0]">
          <div className="flex items-center gap-2">
            <img src="/quotex.png" alt="FNx Pro" className="w-5 h-5 object-contain" />
            <span className="font-bold text-white">FNx SIGNAL PRO</span>
            <span>© {new Date().getFullYear()} Official Quotex Partner Bot.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href={QUOTEX_SIGNUP_URL} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Sign Up Quotex</a>
            <a href={TELEGRAM_ADMIN_URL} target="_blank" rel="noreferrer" className="hover:text-[#7c6cef] transition-colors">Contact Admin</a>
          </div>
        </div>
      </footer>

      {/* 5. LICENSE KEY ACTIVATION MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-[#1c1c24] border border-[#282834] rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[#282834] bg-[#131316] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Key className="w-5 h-5 text-[#7c6cef]" />
                <h3 className="text-base font-bold text-white">VIP License Key Unlock</h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-[#9e9eb0] hover:text-white text-xs cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleVerifyKey} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-[#9e9eb0] block mb-1.5">
                  Your VIP License Key
                </label>
                <input
                  type="text"
                  placeholder="FNX-XXXX-XXXX-XXXX"
                  value={licenseInput}
                  onChange={(e) => setLicenseInput(e.target.value)}
                  className="w-full bg-[#131316] border border-[#282834] rounded-lg px-3.5 py-3 text-sm text-white font-mono uppercase focus:outline-none focus:border-[#7c6cef] tracking-wider"
                />
                <span className="text-[11px] text-[#9e9eb0] mt-1.5 block">
                  🔒 Locked to your device IP upon activation. Non-transferable.
                </span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-between">
                <a
                  href={TELEGRAM_ADMIN_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#7c6cef] hover:underline flex items-center gap-1"
                >
                  Need a Key? Msg Admin
                </a>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="px-6 py-2.5 rounded-lg bg-[#7c6cef] hover:bg-[#6956e5] text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? 'Checking IP Lock...' : 'Unlock VIP Terminal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};