'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function ReversalAlert() {
  const [dismissed, setDismissed] = useState(false);
  const { data: alerts } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => fetch('/api/alerts').then((res) => res.json()),
    refetchInterval: 30000,
  });

  const latestAlert = alerts?.[0];
  if (!latestAlert || dismissed) return null;

  const isBottom = latestAlert.signal_type === 'BOTTOM';

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-[100] transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-lg ${
        isBottom
          ? 'bg-gradient-to-r from-[#059669] to-[#047857]'
          : 'bg-gradient-to-r from-[#DC2626] to-[#B91C1C]'
      }`}
      style={{ borderLeft: '4px solid #D4AF37' }}
    >
      <div className="max-w-[430px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            {isBottom ? (
              <TrendingUp className="text-white w-6 h-6" />
            ) : (
              <TrendingDown className="text-white w-6 h-6" />
            )}
          </div>
          <div>
            <div className="text-white text-[14px] font-bold tracking-tight">
              {isBottom ? 'POTENTIAL BOTTOM ALERT' : 'POTENTIAL TOP ALERT'}
            </div>
            <p className="text-white/80 text-[12px] font-medium leading-snug max-w-[260px]">
              {isBottom
                ? `Whale sentiment reversing bullish (Score: ${latestAlert.reversal_score.toFixed(2)}) — Shorts covering, longs accumulating`
                : `Whale sentiment reversing bearish (Score: ${latestAlert.reversal_score.toFixed(2)}) — Longs exiting, shorts stacking`}
            </p>
          </div>
        </div>
        <button onClick={() => setDismissed(true)} className="text-white/60 hover:text-white p-1">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
