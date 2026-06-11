import { useQuery } from '@tanstack/react-query';

const fmt = (v: number) => v >= 1e9 ? `$${(v/1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v/1e6).toFixed(2)}M` : `$${v.toLocaleString()}`;
const fmtPrice = (v: number) => `$${v.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

export default function MarketContextCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['market-context'],
    queryFn: async () => {
      const res = await fetch('https://hyperflow-backend-3l62.onrender.com/api/sentiment/market-context');
      return res.json();
    },
    refetchInterval: 15000
  });

  if (isLoading) return <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] animate-pulse h-32"/>;

  return (
    <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a]">Market Context</h2>
        <span className="text-[10px] text-[#4a4a6a]">live · 15s</span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[#1a1a2e] p-3 rounded-xl">
          <div className="text-[10px] text-[#4a4a6a] mb-1">BTC</div>
          <div className="text-[15px] font-bold text-[#C9A227] font-mono">{fmtPrice(data?.btc_price ?? 0)}</div>
          <div className="text-[9px] text-[#4a4a6a] mt-1">OI: {fmt(data?.btc_oi ?? 0)}</div>
        </div>
        <div className="bg-[#1a1a2e] p-3 rounded-xl">
          <div className="text-[10px] text-[#4a4a6a] mb-1">ETH</div>
          <div className="text-[15px] font-bold text-white font-mono">{fmtPrice(data?.eth_price ?? 0)}</div>
          <div className="text-[9px] text-[#4a4a6a] mt-1">OI: {fmt(data?.eth_oi ?? 0)}</div>
        </div>
        <div className="bg-[#1a1a2e] p-3 rounded-xl">
          <div className="text-[10px] text-[#4a4a6a] mb-1">SOL</div>
          <div className="text-[15px] font-bold text-white font-mono">{fmtPrice(data?.sol_price ?? 0)}</div>
          <div className="text-[9px] text-[#4a4a6a] mt-1">Total OI: {fmt(data?.total_oi ?? 0)}</div>
        </div>
      </div>
    </div>
  );
}
