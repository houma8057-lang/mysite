import { useQuery } from '@tanstack/react-query';

export default function ReversalScoreCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['reversal-score'],
    queryFn: async () => {
      const res = await fetch('https://hyperflow-backend-3l62.onrender.com/api/sentiment/reversal-score');
      return res.json();
    },
    refetchInterval: 30000
  });

  const score: number = data?.score ?? 0;
  const signal: string = data?.signal ?? 'LOADING';
  const components = data?.components ?? {};
  const raw = data?.raw ?? {};
  const whaleAlert = data?.whale_alert ?? {};

  const getSignalStyle = (sig: string) => {
    if (sig.includes('STRONG BUY'))  return { color: 'text-[#059669]', bg: 'bg-[rgba(5,150,105,0.15)]',   border: 'border-[rgba(5,150,105,0.3)]',   emoji: '🟢' };
    if (sig.includes('WEAK BUY'))    return { color: 'text-[#34d399]', bg: 'bg-[rgba(52,211,153,0.1)]',   border: 'border-[rgba(52,211,153,0.2)]',   emoji: '🟡' };
    if (sig.includes('STRONG SELL')) return { color: 'text-[#DC2626]', bg: 'bg-[rgba(220,38,38,0.15)]',   border: 'border-[rgba(220,38,38,0.3)]',   emoji: '🔴' };
    if (sig.includes('WEAK SELL'))   return { color: 'text-[#f87171]', bg: 'bg-[rgba(248,113,113,0.1)]',  border: 'border-[rgba(248,113,113,0.2)]',  emoji: '🟠' };
    return                                  { color: 'text-[#C9A227]', bg: 'bg-[rgba(201,162,39,0.1)]',   border: 'border-[rgba(201,162,39,0.2)]',   emoji: '⚪' };
  };

  const style = getSignalStyle(signal);
  const barPosition = ((score + 100) / 200) * 100;

  const componentRows = [
    { label: 'WSI',        key: 'wsi_score' },
    { label: 'Funding',    key: 'funding_score' },
    { label: 'MVRV Z',     key: 'mvrv_score' },
    { label: 'NUPL',       key: 'nupl_score' },
    { label: 'SOPR',       key: 'sopr_score' },
    { label: 'OI Change',  key: 'oi_change_score' },
  ];

  if (isLoading) return (
    <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] animate-pulse h-48"/>
  );

  return (
    <div className="space-y-3">

      {/* Whale Major Alert — shows only when triggered */}
      {whaleAlert.is_major && (
        <div className={`rounded-2xl border p-4 ${
          whaleAlert.direction === 'bullish'
            ? 'bg-[rgba(5,150,105,0.15)] border-[rgba(5,150,105,0.4)]'
            : 'bg-[rgba(220,38,38,0.15)] border-[rgba(220,38,38,0.4)]'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[18px]">
              {whaleAlert.direction === 'bullish' ? '🚨🟢' : '🚨🔴'}
            </span>
            <span className={`text-[13px] font-bold ${
              whaleAlert.direction === 'bullish' ? 'text-[#059669]' : 'text-[#DC2626]'
            }`}>
              {whaleAlert.alert_type}
            </span>
          </div>
          <div className="text-[11px] text-[#a0a0c0]">
            {whaleAlert.flip_count} من {whaleAlert.total_whales} حيتان غيّروا اتجاههم إلى{' '}
            <span className="font-bold">
              {whaleAlert.direction === 'bullish' ? 'LONG 🟢' : 'SHORT 🔴'}
            </span>
          </div>
          {whaleAlert.flipped_whales?.length > 0 && (
            <div className="mt-1 text-[10px] text-[#6a6a8a]">
              {whaleAlert.flipped_whales.join(' · ')}
            </div>
          )}
        </div>
      )}

      {/* Main Score Card */}
      <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a]">
            HyperFlow Signal
          </h2>
          <span className="text-[10px] text-[#4a4a6a]">30s · live</span>
        </div>

        {/* Score */}
        <div className={`p-4 rounded-xl border mb-4 ${style.bg} ${style.border} flex items-center justify-between`}>
          <div>
            <div className={`text-[28px] font-bold font-mono ${style.color}`}>
              {score >= 0 ? '+' : ''}{score.toFixed(1)}
            </div>
            <div className={`text-[13px] font-bold ${style.color}`}>
              {style.emoji} {signal}
            </div>
          </div>
          <div className="text-[40px]">
            {signal.includes('BUY') ? '📉' : signal.includes('SELL') ? '📈' : '➡️'}
          </div>
        </div>

        {/* Bar */}
        <div className="relative h-3 bg-[#1a1a2e] rounded-full overflow-hidden mb-2">
          <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#059669] to-[#C9A227]"/>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-r from-[#C9A227] to-[#DC2626]"/>
          <div
            className="absolute top-0 w-1 h-full bg-white rounded-full shadow-lg transition-all duration-500"
            style={{ left: `${barPosition}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] text-[#4a4a6a] mb-4">
          <span>-100 Strong Buy</span>
          <span>0 Neutral</span>
          <span>+100 Strong Sell</span>
        </div>

        {/* Components */}
        <div className="space-y-1.5">
          {componentRows.map(({ label, key }) => {
            const val: number = components[key] ?? 0;
            const isPositive = val > 0;
            const isNegative = val < 0;
            return (
              <div key={key} className="flex items-center justify-between p-2 bg-[#1a1a2e] rounded-xl">
                <span className="text-[11px] text-[#4a4a6a]">{label}</span>
                <span className={`text-[11px] font-bold font-mono ${
                  isNegative ? 'text-[#059669]' : isPositive ? 'text-[#DC2626]' : 'text-[#4a4a6a]'
                }`}>
                  {val >= 0 ? '+' : ''}{val.toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
