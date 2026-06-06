'use client';

import React, { useMemo } from 'react';

interface SentimentGaugeProps {
  wsi: number;
  longPct: number;
  shortPct: number;
  totalNtl: number;
}

export default function SentimentGauge({ wsi, longPct, shortPct, totalNtl }: SentimentGaugeProps) {
  // Needle rotation: degrees = (WSI + 1) × 90
  const rotation = useMemo(() => (wsi + 1) * 90, [wsi]);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
    return `$${val.toFixed(2)}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#FAFAFA] rounded-[20px] border border-[rgba(10,10,10,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280] mb-6">
        Weighted Sentiment Index
      </h2>

      <div className="relative w-64 h-32 overflow-hidden">
        {/* Gauge Arc Background */}
        <div className="absolute top-0 left-0 w-64 h-64 border-[16px] border-[#E5E5E5] rounded-full" />

        {/* Color Segments Overlay (Simulated with SVG or CSS) */}
        <svg className="absolute top-0 left-0 w-64 h-64 -rotate-180" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#DC2626"
            strokeWidth="16"
            strokeDasharray="131.95"
            strokeDashoffset="105.56"
          />
          {/* Add more segments for full color scale if needed, or stick to simple logic */}
        </svg>

        {/* Needle */}
        <div
          className="absolute bottom-0 left-1/2 w-1 h-[90%] bg-[#C9A227] origin-bottom transition-transform duration-800 cubic-bezier(0.34, 1.56, 0.64, 1) shadow-[0_2px_8px_rgba(201,162,39,0.4)]"
          style={{ transform: `translateX(-50%) rotate(${rotation - 90}deg)` }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#C9A227] rounded-full" />
        </div>

        {/* Pivot */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-6 h-6 bg-[#C9A227] rounded-full border-4 border-white shadow-md z-10" />
      </div>

      <div className="mt-8 text-center">
        <div className="text-[40px] font-bold text-[#0A0A0A] font-mono leading-tight">
          {wsi > 0 ? '+' : ''}
          {wsi.toFixed(3)}
        </div>

        <div className="flex items-center justify-center gap-3 mt-2 text-[13px] font-semibold">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#059669]" />
            <span className="text-[#059669]">LONG {longPct}%</span>
          </div>
          <span className="text-[#9CA3AF]">|</span>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#DC2626]" />
            <span className="text-[#DC2626]">SHORT {shortPct}%</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-[0.05em]">
            Total Smart Money Notional
          </div>
          <div className="text-[16px] font-bold text-[#0A0A0A]">{formatCurrency(totalNtl)}</div>
        </div>
      </div>
    </div>
  );
}
