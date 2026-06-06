'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';

export default function DryPowderGauge() {
  const { data, isLoading } = useQuery({
    queryKey: ['liquidity'],
    queryFn: () => fetch('/api/liquidity').then((res) => res.json()),
    refetchInterval: 60000,
  });

  const pct = data?.dry_powder_pct || 0;
  const isError = data?.status === 'error';

  // Map pct (-100 to 100) to gauge width (0 to 100)
  // Formula: (pct + 100) / 2
  const fillWidth = Math.max(0, Math.min(100, (pct + 100) / 2));

  return (
    <div className="bg-[#FAFAFA] p-5 rounded-[20px] border border-[rgba(10,10,10,0.08)] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
            Dry Powder Index
          </h2>
          <div
            className={`text-[24px] font-bold mt-1 ${isError ? 'text-[#9CA3AF]' : pct > 0 ? 'text-[#059669]' : pct < 0 ? 'text-[#DC2626]' : 'text-[#6B7280]'}`}
          >
            {isError ? 'N/A' : `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`}
          </div>
        </div>
      </div>

      <div className="relative h-2 w-full bg-[#E5E5E5] rounded-full overflow-hidden">
        <div
          className={`absolute top-0 bottom-0 transition-all duration-1000 ease-out ${
            pct < 0
              ? 'bg-gradient-to-r from-[#DC2626] to-[#F59E0B]'
              : pct > 0
                ? 'bg-gradient-to-r from-[#F59E0B] to-[#059669]'
                : 'bg-[#C9A227]'
          }`}
          style={{
            left: pct < 0 ? `${fillWidth}%` : '50%',
            right: pct < 0 ? '50%' : `${100 - fillWidth}%`,
          }}
        />
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white z-10" />
      </div>

      <div className="flex justify-between mt-3">
        <span className="text-[10px] font-bold text-[#DC2626] uppercase">Heavy Outflow</span>
        <span className="text-[10px] font-bold text-[#6B7280] uppercase">Neutral</span>
        <span className="text-[10px] font-bold text-[#059669] uppercase">Heavy Inflow</span>
      </div>

      {isError && (
        <p className="text-[10px] text-[#9CA3AF] mt-2 italic">
          Data source unavailable. Check connection.
        </p>
      )}
    </div>
  );
}
