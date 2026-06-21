import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

interface FundingRate {
  coin: string;
  funding_rate: number;
  annual_rate: number;
  open_interest_usd: number;
  signal: string;
}

export default function FundingRateCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['funding'],
    queryFn: async () => {
      const res = await fetch('https://hyperflow-backend-3l62.onrender.com/api/sentiment/funding');
      return res.json();
    },
    refetchInterval: 30000
  });

  const rates: FundingRate[] = data?.funding_rates ?? [];

  const getColor = (rate: number) => {
    if (rate > 0.01) return { text: 'text-[#DC2626]', bg: 'bg-[rgba(220,38,38,0.1)]', border: 'border-[rgba(220,38,38,0.2)]', label: 'BEARISH' };
    if (rate < -0.01) return { text: 'text-[#059669]', bg: 'bg-[rgba(5,150,105,0.1)]', border: 'border-[rgba(5,150,105,0.2)]', label: 'BULLISH' };
    return { text: 'text-[#C9A227]', bg: 'bg-[rgba(201,162,39,0.1)]', border: 'border-[rgba(201,162,39,0.2)]', label: 'NEUTRAL' };
  };

  const getBarWidth = (rate: number) => {
    const clamped = Math.max(-0.05, Math.min(0.05, rate));
    return ((clamped + 0.05) / 0.1) * 100;
  };

  const fmt = (v: number) => v >= 1e9 ? `$${(v/1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v/1e6).toFixed(2)}M` : `$${(v/1e3).toFixed(2)}K`;

  if (isLoading) return (
    <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] animate-pulse h-48"/>
  );

  return (
    <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a]">Funding Rate Monitor</h2>
        <span className="text-[10px] text-[#4a4a6a]">per 1h · live</span>
      </div>
      <div className="space-y-3">
        {rates.map((r) => {
          const c = getColor(r.funding_rate);
          const barW = getBarWidth(r.funding_rate);
          return (
            <div key={r.coin} className={`p-3 rounded-xl border ${c.bg} ${c.border}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-white">{r.coin}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>{c.label}</span>
                </div>
                <div className="text-right">
                  <div className={`text-[13px] font-bold font-mono ${c.text}`}>
                    {r.funding_rate >= 0 ? '+' : ''}{r.funding_rate.toFixed(4)}%
                  </div>
                  <div className="text-[10px] text-[#4a4a6a]">{r.annual_rate >= 0 ? '+' : ''}{r.annual_rate.toFixed(1)}% / yr</div>
                </div>
              </div>
              <div className="relative h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
                <div className="absolute top-0 left-1/2 w-px h-full bg-[#2a2a3a]"/>
                <div
                  className={`absolute top-0 h-full rounded-full transition-all duration-500 ${r.funding_rate >= 0 ? 'bg-[#DC2626]' : 'bg-[#059669]'}`}
                  style={r.funding_rate >= 0
                    ? { left: '50%', width: `${(barW - 50)}%` }
                    : { left: `${barW}%`, width: `${50 - barW}%` }
                  }
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-[#4a4a6a]">OI: {fmt(r.open_interest_usd)}</span>
                <span className="text-[9px] text-[#4a4a6a]">
                  {Math.abs(r.annual_rate) > 20 ? '⚠️ Extreme' : Math.abs(r.annual_rate) > 10 ? '⚡ High' : '— Normal'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 p-3 bg-[#1a1a2e] rounded-xl">
        <p className="text-[10px] text-[#4a4a6a] leading-relaxed">
          <span className="text-[#059669] font-bold">BULLISH</span> = negative funding → shorts pay longs → potential bottom. <span className="text-[#DC2626] font-bold">BEARISH</span> = positive funding → longs pay shorts → potential top.
        </p>
      </div>
    </div>
  );
}

