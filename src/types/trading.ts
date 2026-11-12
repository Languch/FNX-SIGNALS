export type SignalDirection = 'CALL' | 'PUT';
export type SignalStatus = 'pre_alert' | 'active' | 'win' | 'loss' | 'mtg_win' | 'refund' | 'avoided';
export type MarketMode = 'all' | 'real';
export type VoiceLanguage = 'bn' | 'en';
export type ActiveSystem = 'binary' | 'forex';

export interface SignalEvent {
  id: string;
  assetId: string;
  assetName: string;
  marketType: 'real';
  direction: SignalDirection;
  timeframe: '1M' | '5M';
  durationSeconds: number;
  confidence: number;
  strategy: string;
  reason: string;
  entryPrice: number;
  closePrice?: number;
  createdTime: number;
  entryTime: number;
  expireTime: number;
  status: SignalStatus;
  payout: number;
  martingaleStep: number;
  marketRegime?: 'TRENDING_UP' | 'TRENDING_DOWN' | 'RANGING' | 'BREAKOUT';
  confluenceFactors?: string[];
  safetyMarginTip?: string;
  isAntiLossProtected?: boolean;
}

export interface SignalStats {
  totalSignals: number;
  wins: number;
  losses: number;
  mtgWins: number;
  accuracy: number;
  consecutiveLosses: number;
  antiLossCircuitStatus: 'ACTIVE' | 'STANDBY';
}

export interface ScannerAsset {
  id: string;
  name: string;
  marketType: 'real';
  category: 'forex';
  basePrice: number;
  decimals: number;
  payout: number;
  volatility: number;
  currentPrice: number;
  change24h: number;
  rsi: number;
  stochK?: number;
  trend: 'BULLISH' | 'BEARISH' | 'RANGING';
  signalReadiness: 'READY' | 'SCANNING' | 'NEUTRAL';
}

export interface QuotexSession {
  isConnected: boolean;
  accountType: 'demo' | 'real';
  ssid: string;
  maskedToken: string;
  balance: number;
  latencyMs: number;
}

export interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
  sendPreAlerts: boolean;
  sendResults: boolean;
}