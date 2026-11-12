import React, { useState, useEffect } from 'react';
import { TelegramConfig } from '../types/trading';
import { X, Send, Check } from 'lucide-react';

interface TelegramBotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TelegramBotModal: React.FC<TelegramBotModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<TelegramConfig>({
    enabled: false,
    botToken: '',
    chatId: '',
    sendPreAlerts: true,
    sendResults: true,
  });
  const [statusMsg, setStatusMsg] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    fetch('/api/telegram/config')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.config) setConfig(d.config);
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('');
    try {
      const res = await fetch('/api/telegram/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('Settings saved successfully.');
        setTimeout(() => onClose(), 800);
      }
    } catch {
      setStatusMsg('Failed to save settings.');
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setStatusMsg('');
    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botToken: config.botToken,
          chatId: config.chatId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('Test signal sent to Telegram.');
      } else {
        setStatusMsg(data.error || 'Connection failed.');
      }
    } catch (err: any) {
      setStatusMsg(err.message || 'Connection error.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-[#1c1c24] border border-[#282834] rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#282834] bg-[#131316]">
          <div className="flex items-center gap-2.5">
            <Send className="w-5 h-5 text-[#7c6cef]" />
            <h3 className="text-base font-bold text-white tracking-wide">Telegram VIP Channel</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9e9eb0] hover:text-white hover:bg-[#1c1c24] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4 text-sm">
          {/* Active Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-[#131316] border border-[#282834]">
            <span className="font-semibold text-white">Enable Telegram Broadcast</span>
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="w-4 h-4 accent-[#7c6cef] cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#9e9eb0] block mb-1.5">Bot Token</label>
            <input
              type="text"
              placeholder="7123456789:AAH..."
              value={config.botToken}
              onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
              className="w-full bg-[#131316] border border-[#282834] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#7c6cef] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-[#9e9eb0] block mb-1.5">Channel / Group ID</label>
            <input
              type="text"
              placeholder="-1001234567890 or @channel_name"
              value={config.chatId}
              onChange={(e) => setConfig({ ...config, chatId: e.target.value })}
              className="w-full bg-[#131316] border border-[#282834] rounded-lg px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-[#7c6cef] transition-colors"
            />
          </div>

          {/* Broadcast Options */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2 text-xs text-[#9e9eb0] cursor-pointer">
              <input
                type="checkbox"
                checked={config.sendPreAlerts}
                onChange={(e) => setConfig({ ...config, sendPreAlerts: e.target.checked })}
                className="w-4 h-4 accent-[#7c6cef]"
              />
              <span>Send Pre-Alerts</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-[#9e9eb0] cursor-pointer">
              <input
                type="checkbox"
                checked={config.sendResults}
                onChange={(e) => setConfig({ ...config, sendResults: e.target.checked })}
                className="w-4 h-4 accent-[#7c6cef]"
              />
              <span>Send Trade Outcomes</span>
            </label>
          </div>

          {statusMsg && (
            <div className="p-3 rounded-lg bg-[#131316] border border-[#282834] text-xs text-white">
              {statusMsg}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#282834]">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting || !config.botToken || !config.chatId}
              className="px-4 py-2 rounded-lg bg-[#131316] border border-[#282834] hover:border-[#7c6cef] text-white text-xs font-medium disabled:opacity-40 cursor-pointer transition-colors"
            >
              {isTesting ? 'Sending...' : 'Test Signal'}
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-[#9e9eb0] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#7c6cef] hover:bg-[#6956e5] text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};