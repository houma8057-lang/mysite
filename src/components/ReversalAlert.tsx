import { useQuery } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';

export default function ReversalAlert() {
  const { data: sentiment } = useQuery({
    queryKey: ['sentiment'],
    queryFn: async () => {
      const res = await fetch('https://hyperflow-backend-3l62.onrender.com/api/sentiment/current');
      return res.json();
    },
    refetchInterval: 10000
  });

  const { data: funding } = useQuery({
    queryKey: ['funding'],
    queryFn: async () => {
      const res = await fetch('https://hyperflow-backend-3l62.onrender.com/api/sentiment/funding');
      return res.json();
    },
    refetchInterval: 30000
  });

  const { data: whales } = useQuery({
    queryKey: ['whale-changes'],
    queryFn: async () => {
      const res = await fetch('https://hyperflow-backend-3l62.onrender.com/api/sentiment/whale-changes');
      return res.json();
    },
    refetchInterval: 15000
  });

  const wsi = sentiment?.wsi ?? 0;
  const avgLeverage = whales?.flips
    ? whales.flips.reduce((acc: number, w: any) => {
        const avgLev = w.positions.reduce((a: number, p: any) => a + p.leverage, 0) / (w.positions.length || 1);
        return acc + avgLev;
      }, 0) / (whales.flips.length || 1)
    : 0;

  const rates = funding?.funding_rates ?? [];
  const btcRate = rates.find((r: any) => r.coin === 'BTC');
  const avgFunding = btcRate ? btcRate.funding_rate : 0;

  const conditions = [
    { met: wsi <= -0.8, label: `WSI ${wsi.toFixed(3)}`, desc: 'Extreme SHORT' },
    { met: avgFunding < -0.001, label: `Funding ${avgFunding.toFixed(4)}%`, desc: 'Negative Funding' },
    { met: avgLeverage >= 12, label: `Leverage ${avgLeverage.toFixed(1)}x`, desc: 'High Leverage' },
  ];

  const metCount = conditions.filter(c => c.met).length;

  if (metCount < 2) return null;

  const isStrong = metCount === 3;

  return (
    <div className={`mx-4 mt-3 p-4 rounded-2xl border animate-slide-down ${
      isStrong
        ? 'bg-[rgba(5,150,105,0.15)] border-[rgba(5,150,105,0.4)]'
        : 'bg-[rgba(201,162,39,0.15)] border-[rgba(201,162,39,0.4)]'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className={`w-5 h-5 ${isStrong ? 'text-[#059669]' : 'text-[#C9A227]'}`} />
        <span className={`text-[14px] font-bold ${isStrong ? 'text-[#059669]' : 'text-[#C9A227]'}`}>
          {isStrong ? '🟢 STRONG BOTTOM SIGNAL' : '🟡 POTENTIAL BOTTOM SIGNAL'}
        </span>
      </div>
      <p className="text-[12px] text-[#4a4a6a] mb-2">
        {metCount} of 3 reversal conditions met:
      </p>
      <div className="flex flex-wrap gap-2">
        {conditions.map((c, i) => (
          <span key={i} className={`text-[11px] px-2 py-1 rounded-full font-semibold ${
            c.met
              ? isStrong ? 'bg-[rgba(5,150,105,0.2)] text-[#059669]' : 'bg-[rgba(201,162,39,0.2)] text-[#C9A227]'
              : 'bg-[rgba(255,255,255,0.05)] text-[#4a4a6a]'
          }`}>
            {c.met ? '✓' : '✗'} {c.label} — {c.desc}
          </span>
        ))}
      </div>
    </div>
  );
}
