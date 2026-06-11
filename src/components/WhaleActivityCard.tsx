import { useQuery } from '@tanstack/react-query';

interface Position {
  coin: string;
  side: string;
  notional: number;
  leverage: number;
}

interface WhaleData {
  address: string;
  label: string;
  total_value: number;
  dominant_side: string;
  positions: Position[];
}

const fmt = (v: number) => v >= 1e9 ? `$${(v/1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v/1e6).toFixed(2)}M` : `$${(v/1e3).toFixed(2)}K`;

export default function WhaleActivityCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['whale-changes'],
    queryFn: async () => {
      const res = await fetch('https://hyperflow-backend-3l62.onrender.com/api/sentiment/whale-changes');
      return res.json();
    },
    refetchInterval: 15000
  });

  const flips: WhaleData[] = data?.flips ?? [];
  const totalNotional: number = data?.total_notional ?? 0;

  const totalLong = flips.reduce((acc, w) => acc + w.positions.filter(p => p.side === 'LONG').reduce((a, p) => a + p.notional, 0), 0);
  const totalShort = flips.reduce((acc, w) => acc + w.positions.filter(p => p.side === 'SHORT').reduce((a, p) => a + p.notional, 0), 0);
  const longPct = totalNotional > 0 ? (totalLong / totalNotional * 100).toFixed(1) : '0';
  const shortPct = totalNotional > 0 ? (totalShort / totalNotional * 100).toFixed(1) : '0';

  const avgLeverage = flips.length > 0
    ? (flips.reduce((acc, w) => acc + w.positions.reduce((a, p) => a + p.leverage, 0) / (w.positions.length || 1), 0) / flips.length).toFixed(1)
    : '0';

  const signal = totalShort > totalLong * 1.5
    ? { text: 'Heavy SHORT — Potential Bottom', color: 'text-[#059669]', bg: 'bg-[rgba(5,150,105,0.1)]', border: 'border-[rgba(5,150,105,0.2)]' }
    : totalLong > totalShort * 1.5
    ? { text: 'Heavy LONG — Potential Top', color: 'text-[#DC2626]', bg: 'bg-[rgba(220,38,38,0.1)]', border: 'border-[rgba(220,38,38,0.2)]' }
    : { text: 'Balanced — No Clear Signal', color: 'text-[#C9A227]', bg: 'bg-[rgba(201,162,39,0.1)]', border: 'border-[rgba(201,162,39,0.2)]' };

  if (isLoading) return <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] animate-pulse h-48"/>;

  return (
    <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a]">Whale Activity Monitor</h2>
        <span className="text-[10px] text-[#4a4a6a]">{flips.length} wallets · 15s</span>
      </div>

      <div className={`p-3 rounded-xl border mb-4 ${signal.bg} ${signal.border}`}>
        <p className={`text-[13px] font-bold ${signal.color}`}>{signal.text}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-[#1a1a2e] p-3 rounded-xl text-center">
          <div className="text-[10px] text-[#4a4a6a] mb-1">Total Notional</div>
          <div className="text-[14px] font-bold text-white font-mono">{fmt(totalNotional)}</div>
        </div>
        <div className="bg-[#1a1a2e] p-3 rounded-xl text-center">
          <div className="text-[10px] text-[#4a4a6a] mb-1">LONG / SHORT</div>
          <div className="text-[13px] font-bold font-mono">
            <span className="text-[#059669]">{longPct}%</span>
            <span className="text-[#2a2a3a]"> / </span>
            <span className="text-[#DC2626]">{shortPct}%</span>
          </div>
        </div>
        <div className="bg-[#1a1a2e] p-3 rounded-xl text-center">
          <div className="text-[10px] text-[#4a4a6a] mb-1">Avg Leverage</div>
          <div className={`text-[14px] font-bold font-mono ${parseFloat(avgLeverage) > 10 ? 'text-[#DC2626]' : parseFloat(avgLeverage) > 5 ? 'text-[#C9A227]' : 'text-white'}`}>{avgLeverage}x</div>
        </div>
      </div>

      <div className="relative h-2 bg-[#1a1a2e] rounded-full overflow-hidden mb-4">
        <div className="absolute top-0 left-0 h-full bg-[#059669] rounded-full transition-all duration-500" style={{width:`${longPct}%`}}/>
      </div>

      <div className="space-y-2">
        {flips.map((w) => (
          <div key={w.address} className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-xl">
            <div>
              <div className="text-[13px] font-bold text-[#C9A227]">{w.label}</div>
              <div className="text-[11px] text-[#4a4a6a] font-mono">{w.address.slice(0,6)}...{w.address.slice(-4)}</div>
            </div>
            <div className="text-right">
              <div className="text-[13px] font-bold text-white font-mono">{fmt(w.total_value)}</div>
              <div className={`text-[11px] font-bold ${w.dominant_side === 'LONG' ? 'text-[#059669]' : 'text-[#DC2626]'}`}>{w.dominant_side}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
