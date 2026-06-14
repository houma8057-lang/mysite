import { useQuery } from '@tanstack/react-query';

const fmt = (v: number) => `$${v.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

export default function SignalsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['signals'],
    queryFn: async () => {
      const res = await fetch('https://hyperflow-backend-3l62.onrender.com/api/signals/current');
      return res.json();
    },
    refetchInterval: 30000
  });

  const signal = data?.signal ?? 'LOADING';
  const conditions = data?.conditions ?? {};
  const buyMet = data?.buy_conditions_met ?? 0;
  const sellMet = data?.sell_conditions_met ?? 0;

  const getSignalStyle = () => {
    if (signal.includes('STRONG BUY')) return { color: 'text-[#059669]', bg: 'bg-[rgba(5,150,105,0.15)]', border: 'border-[rgba(5,150,105,0.4)]', emoji: '🟢' };
    if (signal.includes('WEAK BUY')) return { color: 'text-[#34d399]', bg: 'bg-[rgba(52,211,153,0.1)]', border: 'border-[rgba(52,211,153,0.3)]', emoji: '🟡' };
    if (signal.includes('STRONG SELL')) return { color: 'text-[#DC2626]', bg: 'bg-[rgba(220,38,38,0.15)]', border: 'border-[rgba(220,38,38,0.4)]', emoji: '🔴' };
    if (signal.includes('WEAK SELL')) return { color: 'text-[#f87171]', bg: 'bg-[rgba(248,113,113,0.1)]', border: 'border-[rgba(248,113,113,0.3)]', emoji: '🟠' };
    return { color: 'text-[#C9A227]', bg: 'bg-[rgba(201,162,39,0.1)]', border: 'border-[rgba(201,162,39,0.2)]', emoji: '⚪' };
  };

  const style = getSignalStyle();

  const buyConditions = [
    { label: 'WSI Extreme SHORT', value: `${conditions.wsi}`, met: conditions.wsi_met_buy, threshold: '< -0.800' },
    { label: 'Funding Negative', value: `${conditions.funding}%`, met: conditions.funding_met_buy, threshold: '< -0.001%' },
    { label: 'Whales Heavy SHORT', value: conditions.whale_short ? 'YES' : 'NO', met: conditions.whale_short, threshold: '> 65% SHORT' },
  ];

  const sellConditions = [
    { label: 'WSI Extreme LONG', value: `${conditions.wsi}`, met: conditions.wsi_met_sell, threshold: '> +0.800' },
    { label: 'Funding Positive', value: `${conditions.funding}%`, met: conditions.funding_met_sell, threshold: '> +0.001%' },
    { label: 'Whales Heavy LONG', value: conditions.whale_long ? 'YES' : 'NO', met: conditions.whale_long, threshold: '> 65% LONG' },
  ];

  if (isLoading) return <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] animate-pulse h-96"/>;

  return (
    <div className="space-y-4">
      <div className={`p-6 rounded-2xl border ${style.bg} ${style.border}`}>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a] mb-4">Current Signal</div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className={`text-[36px] font-bold ${style.color}`}>{style.emoji} {signal}</div>
            <div className="text-[13px] text-[#4a4a6a] mt-1">BTC Price: <span className="text-white font-mono font-bold">{fmt(data?.btc_price ?? 0)}</span></div>
          </div>
          <div className="text-right">
            <div className="text-[12px] text-[#4a4a6a]">BUY conditions</div>
            <div className="text-[28px] font-bold text-[#059669]">{buyMet}/3</div>
          </div>
        </div>
        <div className="text-[11px] text-[#4a4a6a]">Updated: {data?.timestamp ? new Date(data.timestamp).toLocaleTimeString() : '--'}</div>
      </div>

      <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)]">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#059669] mb-4">🟢 BUY Conditions ({buyMet}/3)</h2>
        <div className="space-y-3">
          {buyConditions.map((c, i) => (
            <div key={i} className={`p-3 rounded-xl border ${c.met ? 'bg-[rgba(5,150,105,0.1)] border-[rgba(5,150,105,0.3)]' : 'bg-[#1a1a2e] border-[rgba(255,255,255,0.04)]'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-white">{c.met ? '✅' : '❌'} {c.label}</div>
                  <div className="text-[11px] text-[#4a4a6a] mt-0.5">Threshold: {c.threshold}</div>
                </div>
                <div className={`text-[14px] font-bold font-mono ${c.met ? 'text-[#059669]' : 'text-[#4a4a6a]'}`}>{c.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)]">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#DC2626] mb-4">🔴 SELL Conditions ({sellMet}/3)</h2>
        <div className="space-y-3">
          {sellConditions.map((c, i) => (
            <div key={i} className={`p-3 rounded-xl border ${c.met ? 'bg-[rgba(220,38,38,0.1)] border-[rgba(220,38,38,0.3)]' : 'bg-[#1a1a2e] border-[rgba(255,255,255,0.04)]'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-white">{c.met ? '✅' : '❌'} {c.label}</div>
                  <div className="text-[11px] text-[#4a4a6a] mt-0.5">Threshold: {c.threshold}</div>
                </div>
                <div className={`text-[14px] font-bold font-mono ${c.met ? 'text-[#DC2626]' : 'text-[#4a4a6a]'}`}>{c.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#0d0d1a] p-4 rounded-2xl border border-[rgba(255,255,255,0.06)]">
        <p className="text-[11px] text-[#4a4a6a] leading-relaxed">
          <span className="text-[#059669] font-bold">STRONG BUY</span> = 3/3 conditions met. 
          <span className="text-[#34d399] font-bold"> WEAK BUY</span> = 2/3 conditions met. 
          Recommended Timeframe: 4H / Daily. Signals update every 30 seconds. Based on smart money whale wallets on Hyperliquid.
        </p>
      </div>
    </div>
  );
}
