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

  const getLabel = () => {
    if (pct > 30) return { left: 'Heavy Inflow', right: 'Heavy Outflow', color: 'text-[#059669]' };
    if (pct < -30) return { left: 'Heavy Outflow', right: 'Heavy Inflow', color: 'text-[#DC2626]' };
    return { left: 'Neutral', right: 'Neutral', color: 'text-[#C9A227]' };
  };

  const label = getLabel();

  return (
    <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] shadow-lg">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a] mb-3">Dry Powder Index</h2>
      <div className={`text-[24px] font-bold font-mono mb-4 ${label.color}`}>
        {isError ? 'N/A' : `${pct > 0 ? '+' : ''}${pct.toFixed(1)}%`}
      </div>
      <div className="relative h-2 w-full bg-[#1a1a2e] rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
          style={{
            width: `${fillWidth}%`,
            background: pct > 30 ? '#059669' : pct < -30 ? '#DC2626' : '#C9A227'
          }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] font-bold text-[#DC2626] uppercase">Heavy Outflow</span>
        <span className="text-[10px] font-bold text-[#4a4a6a] uppercase">Neutral</span>
        <span className="text-[10px] font-bold text-[#059669] uppercase">Heavy Inflow</span>
      </div>
      {data?.oi_volume_ratio && (
        <div className="mt-2 text-[10px] text-[#4a4a6a]">
          OI/Volume ratio: {data.oi_volume_ratio.toFixed(2)}
        </div>
      )}
    </div>
  );
}
