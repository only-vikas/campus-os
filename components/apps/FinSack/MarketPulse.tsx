'use client';

// ============================================================
// Campus OS — FinSack MarketPulse
// Simulated live market ticking with sparklines
// Ported from D:\finsack\components\apps\MarketPulse.tsx
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// ─── Simulated market data ──────────────────────────────────────────────────

interface MarketIndex {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  sparkline: number[];
}

const generateSparkline = (base: number, volatility: number): number[] =>
  Array.from({ length: 24 }, (_, i) => {
    const trend = Math.sin(i / 4) * volatility * 0.5;
    const noise = (Math.random() - 0.5) * volatility;
    return base + trend + noise;
  });

const createMarketData = (): MarketIndex[] => [
  {
    id: 'nifty50',
    name: 'NIFTY 50',
    symbol: '^NSEI',
    price: 22456.8 + (Math.random() - 0.5) * 100,
    change: 0,
    changePercent: 0,
    sparkline: generateSparkline(22456, 120),
  },
  {
    id: 'sensex',
    name: 'SENSEX',
    symbol: '^BSESN',
    price: 73876.44 + (Math.random() - 0.5) * 300,
    change: 0,
    changePercent: 0,
    sparkline: generateSparkline(73876, 400),
  },
  {
    id: 'sp500',
    name: 'S&P 500',
    symbol: '^GSPC',
    price: 5234.18 + (Math.random() - 0.5) * 30,
    change: 0,
    changePercent: 0,
    sparkline: generateSparkline(5234, 40),
  },
  {
    id: 'nasdaq',
    name: 'NASDAQ',
    symbol: '^IXIC',
    price: 16399.52 + (Math.random() - 0.5) * 80,
    change: 0,
    changePercent: 0,
    sparkline: generateSparkline(16399, 100),
  },
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: 'BTC/USD',
    price: 68432.15 + (Math.random() - 0.5) * 1000,
    change: 0,
    changePercent: 0,
    sparkline: generateSparkline(68432, 1200),
  },
  {
    id: 'gold',
    name: 'Gold',
    symbol: 'XAU/USD',
    price: 2338.4 + (Math.random() - 0.5) * 15,
    change: 0,
    changePercent: 0,
    sparkline: generateSparkline(2338, 20),
  },
];

// ─── MiniSparkline SVG ──────────────────────────────────────────────────────

function MiniSparkline({
  data,
  isPositive,
}: {
  data: number[];
  isPositive: boolean;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const h = 40;
  const w = 120;

  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="block opacity-80"
    >
      <defs>
        <linearGradient id={`grad-${isPositive}`} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={isPositive ? '#34d399' : '#f87171'}
            stopOpacity={0.3}
          />
          <stop
            offset="100%"
            stopColor={isPositive ? '#34d399' : '#f87171'}
            stopOpacity={0}
          />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill={`url(#grad-${isPositive})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? '#34d399' : '#f87171'}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── MarketPulse Component ──────────────────────────────────────────────────

export default function MarketPulse() {
  const [markets, setMarkets] = useState<MarketIndex[]>([]);
  const tickCounter = useRef(0);

  // Initialize
  useEffect(() => {
    setMarkets(
      createMarketData().map((m) => ({
        ...m,
        change: +(Math.random() * 400 - 200).toFixed(2),
        changePercent: +(Math.random() * 3 - 1.5).toFixed(2),
      }))
    );
  }, []);

  // Simulate live ticking
  useEffect(() => {
    const interval = setInterval(() => {
      tickCounter.current += 1;
      setMarkets((prev) =>
        prev.map((m) => {
          const delta = (Math.random() - 0.48) * m.price * 0.001;
          const newPrice = +(m.price + delta).toFixed(2);
          const change = +(m.change + delta).toFixed(2);
          const changePercent = +((change / m.price) * 100).toFixed(2);
          // Shift sparkline
          const sparkline = [...m.sparkline.slice(1), newPrice];
          return { ...m, price: newPrice, change, changePercent, sparkline };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[rgba(8,8,20,0.5)] overflow-hidden text-[#e2e8f0]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] flex-shrink-0">
        <div className="flex items-center gap-2">
          <BarChart3 size={20} className="text-violet-400" />
          <h2 className="text-base font-semibold">MarketPulse</h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[#34d399]">
          <Activity size={14} className="animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      {/* Ticker strip */}
      <div className="flex gap-4 px-5 py-2 border-b border-[rgba(255,255,255,0.08)] overflow-x-auto text-[11px] font-medium font-mono whitespace-nowrap bg-[rgba(255,255,255,0.01)] flex-shrink-0 custom-scrollbar">
        {markets.map((m) => (
          <span
            key={m.id}
            className={`flex items-center gap-1 ${
              m.change >= 0 ? 'text-[#34d399]' : 'text-[#f87171]'
            }`}
          >
            {m.symbol}{' '}
            {m.change >= 0 ? (
              <ArrowUpRight size={10} />
            ) : (
              <ArrowDownRight size={10} />
            )}{' '}
            {m.changePercent > 0 ? '+' : ''}
            {m.changePercent}%
          </span>
        ))}
      </div>

      {/* Market cards grid */}
      <div className="flex-1 grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3 p-4 overflow-y-auto custom-scrollbar content-start">
        {markets.map((m) => {
          const isUp = m.change >= 0;
          return (
            <div
              key={m.id}
              className="p-4 border border-[rgba(255,255,255,0.08)] rounded-xl bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.04)] hover:border-[rgba(255,255,255,0.15)] transition-all animate-[fadeIn_0.4s_ease-out_both]"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-[#e2e8f0]">
                    {m.symbol}
                  </span>
                  <span className="text-[11px] text-[#94a3b8]">{m.name}</span>
                </div>
                <div
                  className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                    isUp
                      ? 'bg-[rgba(52,211,153,0.12)] text-[#34d399]'
                      : 'bg-[rgba(248,113,113,0.12)] text-[#f87171]'
                  }`}
                >
                  {isUp ? (
                    <TrendingUp size={12} />
                  ) : (
                    <TrendingDown size={12} />
                  )}
                  {isUp ? '+' : ''}
                  {m.changePercent}%
                </div>
              </div>

              <div className="text-[22px] font-bold font-mono mb-2">
                {m.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>

              <MiniSparkline data={m.sparkline} isPositive={isUp} />

              <div className="text-[12px] text-[#94a3b8] font-mono mt-1.5">
                {isUp ? '+' : ''}
                {m.change.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
