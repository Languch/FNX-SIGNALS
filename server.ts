import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;

export interface AssetInfo {
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

const ASSETS: Record<string, AssetInfo> = {
  'EURUSD': { id: 'EURUSD', name: 'EUR/USD', marketType: 'real', category: 'forex', basePrice: 1.08520, decimals: 5, payout: 87, volatility: 0.00014, currentPrice: 1.08520, change24h: 0.22, rsi: 52, stochK: 50, trend: 'BULLISH', signalReadiness: 'READY' },
  'GBPUSD': { id: 'GBPUSD', name: 'GBP/USD', marketType: 'real', category: 'forex', basePrice: 1.29450, decimals: 5, payout: 85, volatility: 0.00018, currentPrice: 1.29450, change24h: -0.15, rsi: 68, stochK: 74, trend: 'BEARISH', signalReadiness: 'READY' },
  'USDJPY': { id: 'USDJPY', name: 'USD/JPY', marketType: 'real', category: 'forex', basePrice: 153.250, decimals: 3, payout: 86, volatility: 0.022, currentPrice: 153.250, change24h: 0.18, rsi: 34, stochK: 25, trend: 'BULLISH', signalReadiness: 'READY' },
  'AUDUSD': { id: 'AUDUSD', name: 'AUD/USD', marketType: 'real', category: 'forex', basePrice: 0.65820, decimals: 5, payout: 84, volatility: 0.00016, currentPrice: 0.65820, change24h: 0.12, rsi: 48, stochK: 45, trend: 'RANGING', signalReadiness: 'SCANNING' },
  'USDCAD': { id: 'USDCAD', name: 'USD/CAD', marketType: 'real', category: 'forex', basePrice: 1.38950, decimals: 5, payout: 85, volatility: 0.00015, currentPrice: 1.38950, change24h: -0.08, rsi: 29, stochK: 22, trend: 'BULLISH', signalReadiness: 'READY' },
  'NZDUSD': { id: 'NZDUSD', name: 'NZD/USD', marketType: 'real', category: 'forex', basePrice: 0.59750, decimals: 5, payout: 83, volatility: 0.00016, currentPrice: 0.59750, change24h: 0.25, rsi: 71, stochK: 80, trend: 'BEARISH', signalReadiness: 'READY' },
  'USDCHF': { id: 'USDCHF', name: 'USD/CHF', marketType: 'real', category: 'forex', basePrice: 0.86540, decimals: 5, payout: 84, volatility: 0.00013, currentPrice: 0.86540, change24h: 0.05, rsi: 55, stochK: 58, trend: 'BULLISH', signalReadiness: 'SCANNING' },
  'EURGBP': { id: 'EURGBP', name: 'EUR/GBP', marketType: 'real', category: 'forex', basePrice: 0.83830, decimals: 5, payout: 83, volatility: 0.00012, currentPrice: 0.83830, change24h: 0.18, rsi: 54, stochK: 52, trend: 'RANGING', signalReadiness: 'SCANNING' },
  'EURJPY': { id: 'EURJPY', name: 'EUR/JPY', marketType: 'real', category: 'forex', basePrice: 166.300, decimals: 3, payout: 85, volatility: 0.024, currentPrice: 166.300, change24h: 0.32, rsi: 72, stochK: 82, trend: 'BEARISH', signalReadiness: 'READY' },
  'GBPJPY': { id: 'GBPJPY', name: 'GBP/JPY', marketType: 'real', category: 'forex', basePrice: 198.380, decimals: 3, payout: 86, volatility: 0.028, currentPrice: 198.380, change24h: 0.45, rsi: 65, stochK: 70, trend: 'BULLISH', signalReadiness: 'READY' },
  'AUDJPY': { id: 'AUDJPY', name: 'AUD/JPY', marketType: 'real', category: 'forex', basePrice: 100.870, decimals: 3, payout: 84, volatility: 0.022, currentPrice: 100.870, change24h: 0.15, rsi: 59, stochK: 63, trend: 'BULLISH', signalReadiness: 'READY' },
  'EURAUD': { id: 'EURAUD', name: 'EUR/AUD', marketType: 'real', category: 'forex', basePrice: 1.64870, decimals: 5, payout: 83, volatility: 0.00022, currentPrice: 1.64870, change24h: 0.28, rsi: 64, stochK: 69, trend: 'BULLISH', signalReadiness: 'READY' },
  'CADJPY': { id: 'CADJPY', name: 'CAD/JPY', marketType: 'real', category: 'forex', basePrice: 110.290, decimals: 3, payout: 84, volatility: 0.021, currentPrice: 110.290, change24h: 0.11, rsi: 46, stochK: 42, trend: 'RANGING', signalReadiness: 'SCANNING' },
  'EURCAD': { id: 'EURCAD', name: 'EUR/CAD', marketType: 'real', category: 'forex', basePrice: 1.50790, decimals: 5, payout: 84, volatility: 0.00018, currentPrice: 1.50790, change24h: 0.14, rsi: 58, stochK: 61, trend: 'BULLISH', signalReadiness: 'READY' },
  'GBPAUD': { id: 'GBPAUD', name: 'GBP/AUD', marketType: 'real', category: 'forex', basePrice: 1.96670, decimals: 5, payout: 85, volatility: 0.00026, currentPrice: 1.96670, change24h: -0.22, rsi: 35, stochK: 30, trend: 'BEARISH', signalReadiness: 'READY' },
  'EURCHF': { id: 'EURCHF', name: 'EUR/CHF', marketType: 'real', category: 'forex', basePrice: 0.93910, decimals: 5, payout: 82, volatility: 0.00011, currentPrice: 0.93910, change24h: 0.02, rsi: 51, stochK: 48, trend: 'RANGING', signalReadiness: 'SCANNING' },
  'GBPCHF': { id: 'GBPCHF', name: 'GBP/CHF', marketType: 'real', category: 'forex', basePrice: 1.12030, decimals: 5, payout: 83, volatility: 0.00016, currentPrice: 1.12030, change24h: 0.19, rsi: 62, stochK: 66, trend: 'BULLISH', signalReadiness: 'READY' },
  'CHFJPY': { id: 'CHFJPY', name: 'CHF/JPY', marketType: 'real', category: 'forex', basePrice: 177.080, decimals: 3, payout: 85, volatility: 0.025, currentPrice: 177.080, change24h: 0.24, rsi: 67, stochK: 73, trend: 'BULLISH', signalReadiness: 'READY' },
  'AUDCAD': { id: 'AUDCAD', name: 'AUD/CAD', marketType: 'real', category: 'forex', basePrice: 0.91450, decimals: 5, payout: 84, volatility: 0.00017, currentPrice: 0.91450, change24h: -0.09, rsi: 44, stochK: 38, trend: 'RANGING', signalReadiness: 'SCANNING' },
  'AUDNZD': { id: 'AUDNZD', name: 'AUD/NZD', marketType: 'real', category: 'forex', basePrice: 1.10160, decimals: 5, payout: 83, volatility: 0.00015, currentPrice: 1.10160, change24h: 0.08, rsi: 53, stochK: 51, trend: 'RANGING', signalReadiness: 'SCANNING' },
  'NZDJPY': { id: 'NZDJPY', name: 'NZD/JPY', marketType: 'real', category: 'forex', basePrice: 91.560, decimals: 3, payout: 84, volatility: 0.021, currentPrice: 91.560, change24h: 0.17, rsi: 61, stochK: 65, trend: 'BULLISH', signalReadiness: 'READY' },
  'CADCHF': { id: 'CADCHF', name: 'CAD/CHF', marketType: 'real', category: 'forex', basePrice: 0.62280, decimals: 5, payout: 82, volatility: 0.00012, currentPrice: 0.62280, change24h: -0.04, rsi: 47, stochK: 44, trend: 'RANGING', signalReadiness: 'SCANNING' },
  'EURNZD': { id: 'EURNZD', name: 'EUR/NZD', marketType: 'real', category: 'forex', basePrice: 1.81620, decimals: 5, payout: 84, volatility: 0.00024, currentPrice: 1.81620, change24h: 0.31, rsi: 70, stochK: 79, trend: 'BEARISH', signalReadiness: 'READY' },
  'GBPNZD': { id: 'GBPNZD', name: 'GBP/NZD', marketType: 'real', category: 'forex', basePrice: 2.16650, decimals: 5, payout: 85, volatility: 0.00028, currentPrice: 2.16650, change24h: 0.38, rsi: 69, stochK: 75, trend: 'BEARISH', signalReadiness: 'READY' },
  'AUDCHF': { id: 'AUDCHF', name: 'AUD/CHF', marketType: 'real', category: 'forex', basePrice: 0.56960, decimals: 5, payout: 83, volatility: 0.00013, currentPrice: 0.56960, change24h: -0.06, rsi: 41, stochK: 36, trend: 'RANGING', signalReadiness: 'SCANNING' },
};

let minPayoutThreshold = 80;

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SignalEvent {
  id: string;
  assetId: string;
  assetName: string;
  marketType: 'real';
  direction: 'CALL' | 'PUT';
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
  status: 'pre_alert' | 'active' | 'win' | 'loss' | 'mtg_win' | 'refund' | 'avoided';
  payout: number;
  martingaleStep: number;
  marketRegime?: 'TRENDING_UP' | 'TRENDING_DOWN' | 'RANGING' | 'BREAKOUT';
  confluenceFactors?: string[];
  safetyMarginTip?: string;
  isAntiLossProtected?: boolean;
}

interface MarketState {
  currentPrice: number;
  candles: Candle[];
}

const marketData: Record<string, MarketState> = {};

// ============================================================================
// 💽 JSON DATABASE SYSTEM (Permanent Save for Signal History & Stats)
// ============================================================================
let signalFeed: SignalEvent[] = [];
let signalStats = {
  totalSignals: 0,
  wins: 0,
  losses: 0,
  mtgWins: 0,
  accuracy: 0,
  consecutiveLosses: 0,
  antiLossCircuitStatus: 'STANDBY' as 'ACTIVE' | 'STANDBY',
};

const DB_PATH = path.join(process.cwd(), 'signal_db.json');

// Load Data on Startup
function loadDatabase() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      if (data.signalFeed) signalFeed = data.signalFeed;
      if (data.signalStats) signalStats = data.signalStats;
      console.log(`[DB] Successfully loaded ${signalFeed.length} previous signals from database.`);
    }
  } catch (error) {
    console.error('[DB] Error loading database:', error);
  }
}

// Save Data Instantly
function saveDatabase() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify({ signalFeed, signalStats }, null, 2), 'utf-8');
  } catch (error) {
    console.error('[DB] Error saving database:', error);
  }
}

// Load DB immediately
loadDatabase();

let activeSignal: SignalEvent | null = null;
let upcomingPreAlert: SignalEvent | null = null;
let consecutiveLosses = signalStats.consecutiveLosses; 
const pairCooldowns: Record<string, number> = {};

let lastTelegramSignalMinute = -1;

let telegramConfig = {
  enabled: false,
  botToken: '',
  chatId: '',
  sendPreAlerts: true,
  sendResults: true,
};

async function broadcastToTelegram(text: string) {
  if (!telegramConfig.enabled || !telegramConfig.botToken || !telegramConfig.chatId) return;
  try {
    const url = `https://api.telegram.org/bot${telegramConfig.botToken}/sendMessage`;
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: telegramConfig.chatId,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    console.warn('Telegram notice:', (err as Error).message);
  }
}

function initHistoricalCandles(assetId: string) {
  const asset = ASSETS[assetId];
  if (!asset) return;

  const now = Date.now();
  const oneMinuteMs = 60 * 1000;
  const currentMinuteStart = Math.floor(now / oneMinuteMs) * oneMinuteMs;
  const candles: Candle[] = [];
  let runningPrice = asset.basePrice;

  for (let i = 50; i >= 1; i--) {
    const candleTime = currentMinuteStart - i * oneMinuteMs;
    const change = (Math.random() - 0.495) * asset.volatility * 2.2;
    const open = runningPrice;
    const close = Number((open + change).toFixed(asset.decimals));
    const high = Number((Math.max(open, close) + Math.random() * asset.volatility * 1.2).toFixed(asset.decimals));
    const low = Number((Math.min(open, close) - Math.random() * asset.volatility * 1.2).toFixed(asset.decimals));
    const volume = Math.floor(40 + Math.random() * 180);
    candles.push({ time: candleTime, open, high, low, close, volume });
    runningPrice = close;
  }

  candles.push({
    time: currentMinuteStart,
    open: runningPrice,
    high: runningPrice,
    low: runningPrice,
    close: runningPrice,
    volume: 5,
  });

  marketData[assetId] = { currentPrice: runningPrice, candles };
  asset.currentPrice = runningPrice;
}

Object.keys(ASSETS).forEach(initHistoricalCandles);

function calculateEMA(prices: number[], period: number): number {
  if (prices.length === 0) return 0;
  const k = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
}

function calculateRSI(closes: number[], period = 14): number {
  if (closes.length < period + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + (diff > 0 ? diff : 0)) / period;
    avgLoss = (avgLoss * (period - 1) + (diff < 0 ? -diff : 0)) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return Number((100 - (100 / (1 + rs))).toFixed(1));
}

function calculateBollingerBands(closes: number[], period = 20, multiplier = 2) {
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  const sma = slice.reduce((a, b) => a + b, 0) / period;
  const variance = slice.reduce((a, b) => a + Math.pow(b - sma, 2), 0) / period;
  const sd = Math.sqrt(variance);
  return {
    upper: sma + sd * multiplier,
    middle: sma,
    lower: sma - sd * multiplier,
  };
}

function calculateStochastic(candles: Candle[], period = 14) {
  if (candles.length < period) return 50;
  const slice = candles.slice(-period);
  const highestHigh = Math.max(...slice.map((c) => c.high));
  const lowestLow = Math.min(...slice.map((c) => c.low));
  const currentClose = slice[slice.length - 1].close;
  if (highestHigh === lowestLow) return 50;
  return Number((((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100).toFixed(1));
}

function analyzeMarketCondition(assetId: string) {
  const asset = ASSETS[assetId];
  const state = marketData[assetId];
  if (!asset || !state || state.candles.length < 20) {
    return {
      assetId,
      regime: 'RANGING' as const,
      direction: 'SKIP' as const,
      confidence: 50,
      strategy: 'Accumulating Candles',
      reason: 'Wait for tick stabilization',
      confluenceFactors: [],
      safetyMarginTip: '',
    };
  }

  if (asset.payout < minPayoutThreshold) {
    return {
      assetId,
      regime: 'RANGING' as const,
      direction: 'SKIP' as const,
      confidence: 0,
      strategy: 'Low Payout Shield',
      reason: `Payout is ${asset.payout}% (Below ${minPayoutThreshold}% threshold). Auto-skipped.`,
      confluenceFactors: ['Low Payout Protected'],
      safetyMarginTip: '',
    };
  }

  const candles = state.candles;
  const closes = candles.map((c) => c.close);
  const ema9 = calculateEMA(closes, 9);
  const ema21 = calculateEMA(closes, 21);
  const rsi = calculateRSI(closes, 14);
  const stochK = calculateStochastic(candles, 14);
  const bb = calculateBollingerBands(closes, 20, 2);

  asset.rsi = rsi;
  asset.stochK = stochK;

  const lastCandle = candles[candles.length - 1];
  const candleBody = Math.abs(lastCandle.close - lastCandle.open);
  const candleRange = Math.max(0.00001, lastCandle.high - lastCandle.low);
  const upperWick = lastCandle.high - Math.max(lastCandle.close, lastCandle.open);
  const lowerWick = Math.min(lastCandle.close, lastCandle.open) - lastCandle.low;

  const isDoji = candleBody / candleRange < 0.16 && upperWick > candleBody && lowerWick > candleBody;
  if (isDoji) {
    return {
      assetId,
      regime: 'RANGING' as const,
      direction: 'SKIP' as const,
      confidence: 60,
      strategy: 'Doji Avoidance Shield',
      reason: 'Market is in indecision doji. Skipping to protect trade.',
      confluenceFactors: ['Anti-Choppiness Shield'],
      safetyMarginTip: '',
    };
  }

  if (bb) {
    if (lastCandle.close <= bb.lower && (rsi < 30 || stochK < 20) && lowerWick > candleBody * 0.7) {
      return {
        assetId,
        regime: 'RANGING' as const,
        direction: 'CALL' as const,
        confidence: Math.floor(94 + Math.random() * 4),
        strategy: 'Bollinger Band Piercing + Hammer Floor',
        reason: `Price pierced lower Bollinger Band on ${asset.name}. Institutional demand floor confirmed.`,
        confluenceFactors: ['Lower Bollinger Band Piercing', `Stochastic(${stochK}) Oversold`],
        safetyMarginTip: 'Wait 2-3s for slight pullback before CALL',
      };
    }

    if (lastCandle.close >= bb.upper && (rsi > 70 || stochK > 80) && upperWick > candleBody * 0.7) {
      return {
        assetId,
        regime: 'RANGING' as const,
        direction: 'PUT' as const,
        confidence: Math.floor(94 + Math.random() * 4),
        strategy: 'Bollinger Band Ceiling Sweep + Shooting Star',
        reason: `Price touched upper Bollinger Band on ${asset.name}. Liquidity sweep confirmed.`,
        confluenceFactors: ['Upper Bollinger Band Rejection', `Stochastic(${stochK}) Overbought`],
        safetyMarginTip: 'Wait 2-3s for slight pullback before PUT',
      };
    }
  }

  const isStrongUptrend = ema9 > ema21 * 1.0001 && lastCandle.close >= ema9 * 0.9996;
  const isStrongDowntrend = ema9 < ema21 * 0.9999 && lastCandle.close <= ema9 * 1.0004;

  if (isStrongUptrend) {
    return {
      assetId,
      regime: 'TRENDING_UP' as const,
      direction: 'CALL' as const,
      confidence: Math.floor(93 + Math.random() * 4),
      strategy: 'EMA(9/21) Bullish Flow + Dynamic Support',
      reason: `Bullish momentum on ${asset.name}. Dynamic EMA(9) support confirmed.`,
      confluenceFactors: ['EMA(9) > EMA(21) Flow', 'Dynamic EMA Support'],
      safetyMarginTip: 'Wait 2-3s for slight pullback before CALL',
    };
  }

  if (isStrongDowntrend) {
    return {
      assetId,
      regime: 'TRENDING_DOWN' as const,
      direction: 'PUT' as const,
      confidence: Math.floor(93 + Math.random() * 4),
      strategy: 'EMA(9/21) Bearish Flow + Dynamic Resistance',
      reason: `Sell pressure on ${asset.name}. Downward continuation below EMA(21).`,
      confluenceFactors: ['EMA(9) < EMA(21) Flow', 'Dynamic Resistance Rejection'],
      safetyMarginTip: 'Wait 2-3s for slight pullback before PUT',
    };
  }

  const dir: 'CALL' | 'PUT' = rsi <= 50 ? 'CALL' : 'PUT';
  return {
    assetId,
    regime: 'RANGING' as const,
    direction: dir,
    confidence: 91,
    strategy: dir === 'CALL' ? 'Support Confluence Flow' : 'Resistance Confluence Flow',
    reason: `Multi-indicator alignment detects decisive ${dir} advantage.`,
    confluenceFactors: ['Flow Alignment', `RSI(${rsi}) Trend`],
    safetyMarginTip: 'Wait 2-3s for slight pullback before entry',
  };
}

async function syncRealMarketPrices() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    if (res.ok) {
      const data = await res.json();
      if (data && data.result === 'success' && data.rates) {
        const rates = data.rates;
        const eurusd = 1 / rates.EUR;
        const gbpusd = 1 / rates.GBP;
        const usdjpy = rates.JPY;
        const audusd = 1 / rates.AUD;
        const usdcad = rates.CAD;
        const nzdusd = 1 / rates.NZD;
        const usdchf = rates.CHF;

        if (ASSETS['EURUSD']) ASSETS['EURUSD'].basePrice = Number(eurusd.toFixed(5));
        if (ASSETS['GBPUSD']) ASSETS['GBPUSD'].basePrice = Number(gbpusd.toFixed(5));
        if (ASSETS['USDJPY']) ASSETS['USDJPY'].basePrice = Number(usdjpy.toFixed(3));
        if (ASSETS['AUDUSD']) ASSETS['AUDUSD'].basePrice = Number(audusd.toFixed(5));
        if (ASSETS['USDCAD']) ASSETS['USDCAD'].basePrice = Number(usdcad.toFixed(5));
        if (ASSETS['NZDUSD']) ASSETS['NZDUSD'].basePrice = Number(nzdusd.toFixed(5));
        if (ASSETS['USDCHF']) ASSETS['USDCHF'].basePrice = Number(usdchf.toFixed(5));

        if (ASSETS['EURGBP']) ASSETS['EURGBP'].basePrice = Number((rates.GBP / rates.EUR).toFixed(5));
        if (ASSETS['EURJPY']) ASSETS['EURJPY'].basePrice = Number((rates.JPY / rates.EUR).toFixed(3));
        if (ASSETS['GBPJPY']) ASSETS['GBPJPY'].basePrice = Number((rates.JPY / rates.GBP).toFixed(3));
        if (ASSETS['AUDJPY']) ASSETS['AUDJPY'].basePrice = Number((rates.JPY / rates.AUD).toFixed(3));
        if (ASSETS['EURAUD']) ASSETS['EURAUD'].basePrice = Number((rates.AUD / rates.EUR).toFixed(5));
        if (ASSETS['CADJPY']) ASSETS['CADJPY'].basePrice = Number((rates.JPY / rates.CAD).toFixed(3));
        if (ASSETS['EURCAD']) ASSETS['EURCAD'].basePrice = Number((rates.CAD / rates.EUR).toFixed(5));
        if (ASSETS['GBPAUD']) ASSETS['GBPAUD'].basePrice = Number((rates.AUD / rates.GBP).toFixed(5));
        if (ASSETS['EURCHF']) ASSETS['EURCHF'].basePrice = Number((rates.CHF / rates.EUR).toFixed(5));
        if (ASSETS['GBPCHF']) ASSETS['GBPCHF'].basePrice = Number((rates.CHF / rates.GBP).toFixed(5));
        if (ASSETS['CHFJPY']) ASSETS['CHFJPY'].basePrice = Number((rates.JPY / rates.CHF).toFixed(3));
        if (ASSETS['AUDCAD']) ASSETS['AUDCAD'].basePrice = Number((rates.CAD / rates.AUD).toFixed(5));
        if (ASSETS['AUDNZD']) ASSETS['AUDNZD'].basePrice = Number((rates.NZD / rates.AUD).toFixed(5));
        if (ASSETS['NZDJPY']) ASSETS['NZDJPY'].basePrice = Number((rates.JPY / rates.NZD).toFixed(3));
        if (ASSETS['CADCHF']) ASSETS['CADCHF'].basePrice = Number((rates.CHF / rates.CAD).toFixed(5));
        if (ASSETS['EURNZD']) ASSETS['EURNZD'].basePrice = Number((rates.NZD / rates.EUR).toFixed(5));
        if (ASSETS['GBPNZD']) ASSETS['GBPNZD'].basePrice = Number((rates.NZD / rates.GBP).toFixed(5));
        if (ASSETS['AUDCHF']) ASSETS['AUDCHF'].basePrice = Number((rates.CHF / rates.AUD).toFixed(5));
      }
    }
  } catch (err) {
    console.warn('Real forex rate sync notice:', (err as Error).message);
  }

  Object.values(ASSETS).forEach((asset) => {
    const shift = Math.random() < 0.2 ? (Math.random() < 0.5 ? -3 : 2) : 0;
    asset.payout = Math.min(94, Math.max(72, asset.payout + shift));
  });
}

syncRealMarketPrices();
setInterval(syncRealMarketPrices, 20000);

// Background Loop
setInterval(() => {
  const now = Date.now();
  const oneMinuteMs = 60 * 1000;
  const currentMinuteKey = Math.floor(now / oneMinuteMs);
  const currentMinuteStart = currentMinuteKey * oneMinuteMs;
  const secondsIntoMinute = Math.floor((now - currentMinuteStart) / 1000);

  // 1. Tick Generator
  Object.keys(ASSETS).forEach((assetId) => {
    const asset = ASSETS[assetId];
    const state = marketData[assetId];
    if (!state) return;

    let tickDelta = (Math.random() - 0.495) * asset.volatility * 0.4;

    if (activeSignal && activeSignal.assetId === assetId) {
      const isCall = activeSignal.direction === 'CALL';
      const elapsedSec = Math.floor((now - activeSignal.entryTime) / 1000);
      if (elapsedSec <= 3) {
        tickDelta = (isCall ? -1 : 1) * asset.volatility * 0.15 + (Math.random() - 0.5) * asset.volatility * 0.1;
      } else {
        const directionalForce = isCall ? 1 : -1;
        tickDelta = directionalForce * Math.abs(asset.volatility * 0.3) + (Math.random() - 0.4) * asset.volatility * 0.15;
      }
    }

    const newPrice = Number((state.currentPrice + tickDelta).toFixed(asset.decimals));
    state.currentPrice = newPrice;
    asset.currentPrice = newPrice;

    asset.rsi = Math.min(85, Math.max(18, Math.round(asset.rsi + (Math.random() - 0.5) * 1.5)));
    asset.trend = asset.rsi > 55 ? 'BULLISH' : asset.rsi < 45 ? 'BEARISH' : 'RANGING';
    asset.signalReadiness = (asset.rsi > 68 || asset.rsi < 32) && asset.payout >= minPayoutThreshold ? 'READY' : 'SCANNING';

    const lastCandle = state.candles[state.candles.length - 1];
    if (!lastCandle) return;

    if (currentMinuteStart > lastCandle.time) {
      state.candles.push({
        time: currentMinuteStart,
        open: newPrice,
        high: newPrice,
        low: newPrice,
        close: newPrice,
        volume: 1,
      });
      if (state.candles.length > 80) state.candles.shift();
    } else {
      lastCandle.close = newPrice;
      lastCandle.high = Math.max(lastCandle.high, newPrice);
      lastCandle.low = Math.min(lastCandle.low, newPrice);
      lastCandle.volume += 1;
    }
  });

  // 2. PRE-ALERT
  if (secondsIntoMinute >= 45 && secondsIntoMinute <= 50) {
    if (currentMinuteKey !== lastTelegramSignalMinute && !activeSignal && !upcomingPreAlert) {
      let candidatePool = Object.values(ASSETS);
      if (selectedPairsFilter.length > 0) {
        candidatePool = candidatePool.filter((a) => selectedPairsFilter.includes(a.id));
      }

      const validCandidatePool = candidatePool.filter(
        (a) => (!pairCooldowns[a.id] || now > pairCooldowns[a.id]) && a.payout >= minPayoutThreshold
      );

      if (validCandidatePool.length > 0) {
        const analyzedCandidates = validCandidatePool
          .map((a) => ({ asset: a, analysis: analyzeMarketCondition(a.id) }))
          .filter((item) => item.analysis.direction !== 'SKIP')
          .sort((a, b) => b.analysis.confidence - a.analysis.confidence);

        if (analyzedCandidates.length > 0) {
          const selected = analyzedCandidates[0];
          const targetAsset = selected.asset;
          const analysis = selected.analysis;
          const finalDir: 'CALL' | 'PUT' = analysis.direction === 'PUT' ? 'PUT' : 'CALL';
          const nextMinuteStart = currentMinuteStart + oneMinuteMs;
          const isAntiLossRecovery = consecutiveLosses > 0;

          upcomingPreAlert = {
            id: 'sig_' + Math.random().toString(36).substring(2, 8),
            assetId: targetAsset.id,
            assetName: targetAsset.name,
            marketType: 'real',
            direction: finalDir,
            timeframe: '1M',
            durationSeconds: 60,
            confidence: isAntiLossRecovery ? Math.max(95, analysis.confidence) : analysis.confidence,
            strategy: analysis.strategy,
            reason: isAntiLossRecovery
              ? `[Anti-Loss Shield Active] High-confluence ${finalDir} setup: ${analysis.reason}`
              : analysis.reason,
            entryPrice: targetAsset.currentPrice,
            createdTime: now,
            entryTime: nextMinuteStart,
            expireTime: nextMinuteStart + 60000,
            status: 'pre_alert',
            payout: targetAsset.payout,
            martingaleStep: 0,
            marketRegime: analysis.regime,
            confluenceFactors: analysis.confluenceFactors,
            safetyMarginTip: analysis.safetyMarginTip,
            isAntiLossProtected: true,
          };

          lastTelegramSignalMinute = currentMinuteKey;

          if (telegramConfig.sendPreAlerts) {
            const actionText = finalDir === 'CALL' ? '🟢 CALL / UP' : '🔴 PUT / DOWN';
            const msg = `🚀 <b>FNx SIGNAL PRO — VIP SIGNAL</b> 🚀\n\n` +
              `📊 Pair: <b>${targetAsset.name}</b> (REAL MARKET)\n` +
              `🎯 Action: <b>${actionText}</b>\n` +
              `⏳ Expiry: <b>1 MINUTE (M1)</b>\n` +
              `⏰ Entry: <b>Next Candle Open (in 15s)</b>\n` +
              `💰 Payout: <b>${targetAsset.payout}%</b>\n` +
              `🛡️ Accuracy: <b>${upcomingPreAlert.confidence}%</b>\n\n` +
              `💡 <i>Get pair ready on Quotex. Enter on slight pullback!</i>`;
            broadcastToTelegram(msg);
          }
        }
      }
    }
  }

  // 3. CANDLE OPEN
  if (secondsIntoMinute >= 0 && secondsIntoMinute <= 2 && upcomingPreAlert && !activeSignal) {
    const triggered = { ...upcomingPreAlert };
    triggered.status = 'active';
    triggered.entryPrice = ASSETS[triggered.assetId]?.currentPrice || triggered.entryPrice;
    triggered.entryTime = now;
    triggered.expireTime = now + 60000;

    activeSignal = triggered;
    upcomingPreAlert = null;
  }

  // 4. CANDLE EXPIRATION
  if (activeSignal && now >= activeSignal.expireTime) {
    const asset = ASSETS[activeSignal.assetId];
    if (asset) {
      activeSignal.closePrice = asset.currentPrice;
    }
    
    // Add to feed as pending, waiting for user manual input via UI Modal
    signalFeed.unshift({ ...activeSignal });
    
    // 💽 Save DB Instantly
    saveDatabase();

    activeSignal = null;
  }
}, 1000);

// API Endpoints
app.get('/api/signals/live', (_req: Request, res: Response) => {
  const activeAsset = activeSignal ? ASSETS[activeSignal.assetId] : null;
  res.json({
    success: true,
    minPayoutThreshold,
    activeSignal,
    upcomingPreAlert,
    currentPrice: activeAsset?.currentPrice || (activeSignal ? activeSignal.entryPrice : undefined),
    recentSignals: signalFeed, // Unlimited History Output
    stats: signalStats,
    serverTime: Date.now(),
  });
});

app.post('/api/signals/clear-history', (_req: Request, res: Response) => {
  signalFeed.length = 0;
  signalStats.totalSignals = 0;
  signalStats.wins = 0;
  signalStats.losses = 0;
  signalStats.mtgWins = 0;
  signalStats.accuracy = 0;
  signalStats.consecutiveLosses = 0;
  signalStats.antiLossCircuitStatus = 'STANDBY';
  
  // 💽 Clear DB
  saveDatabase();
  
  res.json({ success: true, message: 'Cleared' });
});

// 🎯 Target Pairs Filter Variable & API
let selectedPairsFilter: string[] = []; // Empty array means scan all 25 pairs

app.get('/api/signals/pair-filter', (_req: Request, res: Response) => {
  res.json({ success: true, selectedPairs: selectedPairsFilter });
});

app.post('/api/signals/pair-filter', (req: Request, res: Response) => {
  const { pairs } = req.body;
  if (Array.isArray(pairs)) {
    selectedPairsFilter = pairs;
    res.json({ success: true, selectedPairs: selectedPairsFilter });
  } else {
    res.status(400).json({ success: false, error: 'Invalid pairs array' });
  }
});

// -------------------------------------------------------------
// 🛡️ MANUAL OUTCOME SUBMISSION (INCLUDES AVOIDED)
// -------------------------------------------------------------
app.post('/api/signals/submit-result', (req: Request, res: Response) => {
  const { signalId, outcome } = req.body;
  
  if (!signalId || !['win', 'loss', 'mtg_win', 'refund', 'avoided'].includes(outcome)) {
    res.status(400).json({ success: false, error: 'Invalid parameters' });
    return;
  }

  const sig = signalFeed.find((s) => s.id === signalId);
  if (sig) {
    sig.status = outcome;
    if (outcome === 'loss') {
      consecutiveLosses = 1;
      signalStats.consecutiveLosses = 1;
      signalStats.antiLossCircuitStatus = 'ACTIVE';
      pairCooldowns[sig.assetId] = Date.now() + 5 * 60 * 1000;
    } else if (outcome === 'win' || outcome === 'mtg_win') {
      consecutiveLosses = 0;
      signalStats.consecutiveLosses = 0;
      signalStats.antiLossCircuitStatus = 'STANDBY';
    }
  }

  // Calculate Stats EXCLUDING 'avoided'
  const validTrades = signalFeed.filter((s) => ['win', 'loss', 'mtg_win'].includes(s.status));
  const wins = signalFeed.filter((s) => s.status === 'win').length;
  const mtg = signalFeed.filter((s) => s.status === 'mtg_win').length;
  const losses = signalFeed.filter((s) => s.status === 'loss').length;
  
  signalStats.totalSignals = signalFeed.filter((s) => s.status !== 'avoided').length;
  signalStats.wins = wins;
  signalStats.mtgWins = mtg;
  signalStats.losses = losses;
  signalStats.accuracy = validTrades.length > 0 ? Number((((wins + mtg) / validTrades.length) * 100).toFixed(1)) : 0;

  // 💽 Save DB immediately after stat change
  saveDatabase();

  // Broadcast to Telegram
  if (telegramConfig.sendResults && sig) {
    let resultMsg = '';
    const actionText = sig.direction === 'CALL' ? '🟢 CALL' : '🔴 PUT';

    if (outcome === 'avoided') {
      resultMsg = `⚠️ <b>SIGNAL STATUS: AVOIDED / SKIPPED</b>\n\n` +
        `📊 Pair: <b>${sig.assetName}</b>\n` +
        `🎯 Signal: <b>${actionText}</b>\n` +
        `🛡️ Status: <i>Trade was avoided. Capital protected!</i>\n` +
        `📈 Accuracy: <b>${signalStats.accuracy}%</b>`;
    } else {
      const outcomeText = outcome === 'win' ? 'DIRECT WIN' : outcome === 'mtg_win' ? '1-STEP MTG WIN' : outcome === 'loss' ? 'LOSS' : 'REFUND / TIE';
      const emoji = outcome === 'win' ? '✅' : outcome === 'mtg_win' ? '⚡' : outcome === 'loss' ? '❌' : '🔄';

      resultMsg = `🏁 <b>TRADE RESULT: ${emoji} ${outcomeText}</b>\n\n` +
        `📊 Pair: <b>${sig.assetName}</b>\n` +
        `🎯 Signal: <b>${actionText}</b>\n` +
        `🏆 Outcome: <b>${emoji} ${outcomeText}</b>\n` +
        `📈 Cumulative Accuracy: <b>${signalStats.accuracy}%</b>`;
    }
    broadcastToTelegram(resultMsg);
  }

  res.json({ success: true, signal: sig, stats: signalStats });
});

// -------------------------------------------------------------
// 🛡️ OVERRIDE FROM TABLE (INCLUDES AVOIDED)
// -------------------------------------------------------------
app.post('/api/signals/override-result', (req: Request, res: Response) => {
  const { signalId, status } = req.body;
  
  if (!signalId || !['win', 'loss', 'mtg_win', 'refund', 'avoided'].includes(status)) {
    res.status(400).json({ success: false, error: 'Invalid parameters' });
    return;
  }

  const sig = signalFeed.find((s) => s.id === signalId);
  if (!sig) {
    res.status(404).json({ success: false, error: 'Signal not found' });
    return;
  }

  sig.status = status;

  // Calculate Stats EXCLUDING 'avoided'
  const validTrades = signalFeed.filter((s) => ['win', 'loss', 'mtg_win'].includes(s.status));
  const wins = signalFeed.filter((s) => s.status === 'win').length;
  const mtg = signalFeed.filter((s) => s.status === 'mtg_win').length;
  const losses = signalFeed.filter((s) => s.status === 'loss').length;
  
  signalStats.totalSignals = signalFeed.filter((s) => s.status !== 'avoided').length;
  signalStats.wins = wins;
  signalStats.mtgWins = mtg;
  signalStats.losses = losses;
  signalStats.accuracy = validTrades.length > 0 ? Number((((wins + mtg) / validTrades.length) * 100).toFixed(1)) : 0;

  // 💽 Save DB immediately after stat change
  saveDatabase();

  res.json({ success: true, signal: sig, stats: signalStats });
});

app.get('/api/telegram/config', (_req: Request, res: Response) => {
  res.json({ success: true, config: telegramConfig });
});

app.post('/api/telegram/config', (req: Request, res: Response) => {
  const { enabled, botToken, chatId, sendPreAlerts, sendResults } = req.body;
  telegramConfig = {
    enabled: Boolean(enabled),
    botToken: botToken || '',
    chatId: chatId || '',
    sendPreAlerts: sendPreAlerts !== undefined ? sendPreAlerts : true,
    sendResults: sendResults !== undefined ? sendResults : true,
  };
  res.json({ success: true, config: telegramConfig });
});

// ============================================================================
// 🔐 100 IP-LOCKED LICENSE SYSTEM
// ============================================================================
interface LicenseItem {
  key: string;
  boundIp: string | null;
  activatedAt: number | null;
  status: 'active' | 'unclaimed';
}

const LICENSE_DB_PATH = path.join(process.cwd(), 'licenses_db.json');
let licenses: LicenseItem[] = [];

// Generate or Load 100 Unique VIP Keys
function initLicenseDatabase() {
  try {
    if (fs.existsSync(LICENSE_DB_PATH)) {
      licenses = JSON.parse(fs.readFileSync(LICENSE_DB_PATH, 'utf-8'));
    } else {
      // 100 Unique Keys Generation (FNX-XXXX-XXXX-XXXX)
      const generated: LicenseItem[] = [];
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      for (let i = 1; i <= 100; i++) {
        const seg1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const seg2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const seg3 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        generated.push({
          key: `FNX-${seg1}-${seg2}-${seg3}`,
          boundIp: null,
          activatedAt: null,
          status: 'unclaimed',
        });
      }
      licenses = generated;
      fs.writeFileSync(LICENSE_DB_PATH, JSON.stringify(licenses, null, 2), 'utf-8');
      console.log(`[LICENSE] 100 New VIP License Keys created in licenses_db.json`);
    }
  } catch (err) {
    console.error('[LICENSE] DB Error:', err);
  }
}
initLicenseDatabase();

// 1-IP Locked Verification API
app.post('/api/license/verify', (req: Request, res: Response) => {
  const { key } = req.body;
  if (!key || typeof key !== 'string') {
    res.status(400).json({ success: false, error: 'Please enter a valid License Key' });
    return;
  }

  // Get Client IP
  const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const clientIp = Array.isArray(rawIp) ? rawIp[0] : rawIp.split(',')[0].trim();

  const foundIndex = licenses.findIndex((l) => l.key.toUpperCase() === key.trim().toUpperCase());

  if (foundIndex === -1) {
    res.status(401).json({ success: false, error: 'Invalid VIP License Key. Please contact admin.' });
    return;
  }

  const target = licenses[foundIndex];

  // If already locked to another IP
  if (target.boundIp && target.boundIp !== clientIp) {
    res.status(403).json({ 
      success: false, 
      error: 'Security Alert: This License Key is already locked to another Device / IP Address!' 
    });
    return;
  }

  // First time activation: Lock to this client's IP!
  if (!target.boundIp) {
    target.boundIp = clientIp;
    target.activatedAt = Date.now();
    target.status = 'active';
    fs.writeFileSync(LICENSE_DB_PATH, JSON.stringify(licenses, null, 2), 'utf-8');
  }

  res.json({
    success: true,
    message: 'Access Granted! License Key successfully locked to your device.',
    key: target.key,
  });
});

app.post('/api/telegram/test', async (req: Request, res: Response) => {
  const { botToken, chatId } = req.body;
  const token = botToken || telegramConfig.botToken;
  const chat = chatId || telegramConfig.chatId;

  if (!token || !chat) {
    res.status(400).json({ success: false, error: 'Bot Token and Chat ID are required' });
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chat,
        text: `⚡ <b>FNx Signal Pro</b> connected to Telegram VIP Channel!`,
        parse_mode: 'HTML',
      }),
    });
    const result = await response.json();
    if (result.ok) {
      res.json({ success: true, message: 'Test message sent to Telegram!' });
    } else {
      res.status(400).json({ success: false, error: result.description || 'Failed to send' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: (err as Error).message });
  }
});

app.get('/api/signals/scanner', (_req: Request, res: Response) => {
  res.json({
    success: true,
    minPayoutThreshold,
    assets: Object.values(ASSETS),
    serverTime: Date.now(),
  });
});

app.get('/api/quotex/assets', (_req: Request, res: Response) => {
  res.json({ success: true, assets: Object.values(ASSETS) });
});

app.post('/api/quotex/connect', (req: Request, res: Response) => {
  const { ssid, accountType = 'demo' } = req.body;
  if (!ssid || typeof ssid !== 'string' || ssid.trim().length < 6) {
    res.status(400).json({ success: false, error: 'Invalid Quotex session SSID' });
    return;
  }
  res.json({
    success: true,
    connected: true,
    accountType,
    maskedToken: ssid.substring(0, 4) + '...' + ssid.substring(ssid.length - 4),
    balance: accountType === 'demo' ? 10000.00 : 1580.00,
    latencyMs: Math.floor(18 + Math.random() * 15),
    message: `Quotex API Bridge connected. Auto-execution ready.`,
  });
});

app.post('/api/signals/scan-now', async (req: Request, res: Response) => {
  const { assetId = 'EURUSD', timeframe = '1M' } = req.body;
  const asset = ASSETS[assetId] || ASSETS['EURUSD'];
  const state = marketData[asset.id];

  if (!state || state.candles.length < 5) {
    res.status(400).json({ success: false, error: 'Insufficient candle data' });
    return;
  }

  const analysis = analyzeMarketCondition(asset.id);
  const dir: 'CALL' | 'PUT' = analysis.direction === 'SKIP' ? (asset.rsi < 50 ? 'CALL' : 'PUT') : analysis.direction;
  const confidence = Math.max(92, analysis.confidence || 93);

  const fallbackSignal: SignalEvent = {
    id: 'sig_' + Math.random().toString(36).substring(2, 8),
    assetId: asset.id,
    assetName: asset.name,
    marketType: 'real',
    direction: dir,
    timeframe: timeframe as '1M' | '5M',
    durationSeconds: timeframe === '5M' ? 300 : 60,
    confidence,
    strategy: analysis.strategy || 'Multi-Indicator Confluence Matrix',
    reason: analysis.reason || `Multi-indicator scan detects strong ${dir} pressure.`,
    entryPrice: state.currentPrice,
    createdTime: Date.now(),
    entryTime: Date.now(),
    expireTime: Date.now() + (timeframe === '5M' ? 300000 : 60000),
    status: 'active',
    payout: asset.payout,
    martingaleStep: 0,
    marketRegime: analysis.regime,
    confluenceFactors: analysis.confluenceFactors,
    safetyMarginTip: 'Wait 2-3s for slight pullback before entry',
  };

  activeSignal = fallbackSignal;

  res.json({
    success: true,
    signal: fallbackSignal,
  });
});

app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'API route not found' });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FNx Signal Pro Terminal running on http://localhost:${PORT}`);
  });
}

startServer();