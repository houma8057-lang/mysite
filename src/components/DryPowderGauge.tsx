import { useQuery } from '@tanstack/react-query';
export default function DryPowderGauge() {
  const { data, isError } = useQuery({
    queryKey: ['liquidity'],
    queryFn: async () => {
      const res = await fetch('https://hyperflow-backend-3l62.onrender.com/api/liquidity');
      return res.json();
    },
    refetchInterval: 60000
  });

  const pct = data?.dry_powder_pct ?? 0;
  const fillWidth = Math.max(0, Math.min(100, (pct + 100) / 2));
  const barColor = pct > 30 ? '#059669' : pct < -30 ? '#DC2626' : '#C9A227';
  const signal = pct > 30 ? 'Heavy Inflow' : pct < -30 ? 'Heavy Outflow' : 'Neutral';
  const signalColor = pct > 30 ? 'text-[#059669]' : pct < -30 ? 'text-[#DC2626]' : 'text-[#C9A227]';

  return (
    <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] shadow-lg">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a] mb-3">Dry Powder Index</h2>
      <div className={`text-[24px] font-bold font-mono mb-1 ${signalColor}`}>
        {isError ? 'N/A' : `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`}
      </div>
      <div className={`text-[11px] font-semibold mb-3 ${signalColor}`}>{signal}</div>
      <div className="relative h-2 w-full bg-[#1a1a2e] rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
          style={{ width: `${fillWidth}%`, backgroundColor: barColor }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[9px] text-[#4a4a6a]">-100 Outflow</span>
        <span className="text-[9px] text-[#4a4a6a]">0 Neutral</span>
        <span className="text-[9px] text-[#4a4a6a]">+100 Inflow</span>
      </div>
      {data?.oi_volume_ratio && (
        <div className="mt-2 text-[10px] text-[#4a4a6a]">OI/Vol: {data.oi_volume_ratio.toFixed(2)}</div>
      )}
    </div>
  );
}
