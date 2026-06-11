import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function OIDivergenceCard() {
  const { data } = useQuery({
    queryKey: ['oi-divergence'],
    queryFn: async () => {
      const res = await fetch('https://hyperflow-backend-3l62.onrender.com/api/sentiment/oi-divergence-v2');
      return res.json();
    },
    refetchInterval: 60000
  });

  const divergence: number = data?.divergence ?? 0;
  const signal: string = data?.signal ?? 'Collecting data...';

  const getStyle = () => {
    if (divergence > 10) return { color: 'text-[#DC2626]', icon: <TrendingUp className="w-5 h-5"/> };
    if (divergence < -10) return { color: 'text-[#059669]', icon: <TrendingDown className="w-5 h-5"/> };
    return { color: 'text-[#C9A227]', icon: <Minus className="w-5 h-5"/> };
  };

  const style = getStyle();

  return (
    <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] shadow-lg">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a] mb-4">OI Divergence</h2>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-full bg-[#1a1a2e] ${style.color}`}>{style.icon}</div>
        <div className={`text-[28px] font-bold font-mono ${style.color}`}>
          {divergence >= 0 ? '+' : ''}{divergence.toFixed(2)}%
        </div>
      </div>
      <div className="text-[13px] font-medium text-[#4a4a6a]">{signal}</div>
      {data?.details && data.details.length > 0 && (
        <div className="mt-3 space-y-1">
          {data.details.map((d: any) => (
            <div key={d.coin} className="flex justify-between text-[11px]">
              <span className="text-[#4a4a6a]">{d.coin}</span>
              <span className={d.pct_change >= 0 ? 'text-[#DC2626]' : 'text-[#059669]'}>
                {d.pct_change >= 0 ? '+' : ''}{d.pct_change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
