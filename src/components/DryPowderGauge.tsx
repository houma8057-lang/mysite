import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
export default function DryPowderGauge() {
  const { data, isError } = useQuery({ queryKey: ['liquidity'], queryFn: api.getLiquidity, refetchInterval: 60000 });
  const pct = data?.dry_powder_pct??0;
  const fillWidth = Math.max(0,Math.min(100,(pct+100)/2));
  return (
    <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] shadow-lg">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a] mb-3">Dry Powder Index</h2>
      <div className="text-[24px] font-bold font-mono text-white mb-4">
        {isError?'N/A':`${pct>0?'+':''}${pct.toFixed(1)}%`}
      </div>
      <div className="relative h-2 w-full bg-[#1a1a2e] rounded-full overflow-hidden">
        <div className="duration-1000 bg-gradient-to-r from-[#DC2626] to-[#F59E0B] via-[#C9A227]" style={{left:`${fillWidth}%`,right:`${100-fillWidth}%`,position:'absolute',top:0,bottom:0}}/>
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] font-bold text-[#DC2626] uppercase">Heavy Outflow</span>
        <span className="text-[10px] font-bold text-[#4a4a6a] uppercase">Neutral</span>
        <span className="text-[10px] font-bold text-[#059669] uppercase">Heavy Inflow</span>
      </div>
      {isError&&<p className="text-[10px] text-[#4a4a6a] mt-2 italic">Data source unavailable</p>}
    </div>
  );
}
