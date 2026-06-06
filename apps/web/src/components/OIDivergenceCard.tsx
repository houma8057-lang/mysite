'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function OIDivergenceCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['sentiment', 'current'],
    queryFn: () => fetch('/api/sentiment/current').then((res) => res.json()),
    refetchInterval: 10000,
  });

  const reversalScore = data?.reversal_score || 0;

  const getStatus = () => {
    if (reversalScore > 0.05)
      return {
        text: 'Strong trend continuation',
        color: 'text-[#059669]',
        icon: <TrendingUp className="w-5 h-5" />,
      };
    if (reversalScore < -0.05)
      return {
        text: 'Exhaustion risk',
        color: 'text-[#DC2626]',
        icon: <TrendingDown className="w-5 h-5" />,
      };
    return {
      text: 'Watch for breakout',
      color: 'text-[#6B7280]',
      icon: <Minus className="w-5 h-5" />,
    };
  };

  const status = getStatus();

  return (
    <div className="bg-[#FAFAFA] p-5 rounded-[20px] border border-[rgba(10,10,10,0.08)] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
        OI Momentum Divergence
      </h2>

      <div className="flex items-center gap-3 mt-4">
        <div className={`p-2 rounded-full bg-white shadow-sm ${status.color}`}>{status.icon}</div>
        <div>
          <div className={`text-[28px] font-bold font-mono leading-none ${status.color}`}>
            {reversalScore > 0 ? '+' : ''}
            {reversalScore.toFixed(2)}
          </div>
          <div className={`text-[13px] font-medium mt-1 ${status.color}`}>{status.text}</div>
        </div>
      </div>
    </div>
  );
}
