import React, { useState } from 'react';
import { QuotexSession } from '../types/trading';
import { X, Key, ShieldCheck, Check } from 'lucide-react';

interface QuotexBridgeHookModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: QuotexSession;
  onConnectSsid: (ssid: string, accountType: 'demo' | 'real') => Promise<void>;
  isLoading: boolean;
}

export const QuotexBridgeHookModal: React.FC<QuotexBridgeHookModalProps> = ({
  isOpen,
  onClose,
  session,
  onConnectSsid,
  isLoading,
}) => {
  const [ssidInput, setSsidInput] = useState(session.ssid || '');
  const [accountType, setAccountType] = useState<'demo' | 'real'>(session.accountType);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!ssidInput.trim()) {
      setErrorMsg('Please enter your Quotex session SSID');
      return;
    }
    try {
      await onConnectSsid(ssidInput.trim(), accountType);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Connection failed');
    }
  };

  const handleUseDemo = () => {
    setSsidInput('demo_qx_' + Math.random().toString(36).substring(2, 10) + '_real_sync');
    setAccountType('demo');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#1c1c24] border border-[#282834] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282834] bg-[#131316]">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-[#7c6cef]" />
            <h3 className="text-base font-bold text-white tracking-wide">Quotex Session Bridge</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9e9eb0] hover:text-white hover:bg-[#1c1c24] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleConnect} className="p-6 space-y-4">
          {/* Account Type Selector */}
          <div>
            <label className="text-xs font-medium text-[#9e9eb0] block mb-2">Account Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountType('demo')}
                className={`py-3 px-4 rounded-lg border text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  accountType === 'demo'
                    ? 'bg-[#7c6cef]/15 border-[#7c6cef] text-white'
                    : 'bg-[#131316] border-[#282834] text-[#9e9eb0] hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Demo Sandbox
              </button>

              <button
                type="button"
                onClick={() => setAccountType('real')}
                className={`py-3 px-4 rounded-lg border text-sm font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  accountType === 'real'
                    ? 'bg-[#7c6cef]/15 border-[#7c6cef] text-white'
                    : 'bg-[#131316] border-[#282834] text-[#9e9eb0] hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Real Live Account
              </button>
            </div>
          </div>

          {/* SSID Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-[#9e9eb0]">Session SSID</label>
              <button
                type="button"
                onClick={handleUseDemo}
                className="text-xs text-[#7c6cef] hover:underline cursor-pointer"
              >
                Auto-Fill Demo Sandbox
              </button>
            </div>
            <input
              type="text"
              placeholder="Paste your Quotex SSID cookie here..."
              value={ssidInput}
              onChange={(e) => setSsidInput(e.target.value)}
              className="w-full bg-[#131316] border border-[#282834] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#7c6cef] transition-colors"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#282834]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#9e9eb0] hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-lg bg-[#7c6cef] hover:bg-[#6956e5] text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              Connect Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};