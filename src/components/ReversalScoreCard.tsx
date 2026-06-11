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

  const getSignalStyle = (sig: string) => {
    if (sig.includes('STRONG BOTTOM')) return { color: 'text-[#059669]', bg: 'bg-[rgba(5,150,105,0.15)]', border: 'border-[rgba(5,150,105,0.3)]', emoji: '🟢' };
    if (sig.includes('WEAK BOTTOM')) return { color: 'text-[#34d399]', bg: 'bg-[rgba(52,211,153,0.1)]', border: 'border-[rgba(52,211,153,0.2)]', emoji: '🟡' };
    if (sig.includes('STRONG TOP')) return { color: 'text-[#DC2626]', bg: 'bg-[rgba(220,38,38,0.15)]', border: 'border-[rgba(220,38,38,0.3)]', emoji: '🔴' };
    if (sig.includes('WEAK TOP')) return { color: 'text-[#f87171]', bg: 'bg-[rgba(248,113,113,0.1)]', border: 'border-[rgba(248,113,113,0.2)]', emoji: '🟠' };
    return { color: 'text-[#C9A227]', bg: 'bg-[rgba(201,162,39,0.1)]', border: 'border-[rgba(201,162,39,0.2)]', emoji: '⚪' };
  };

  const style = getSignalStyle(signal);
  const barPosition = ((score + 100) / 200) * 100;

  if (isLoading) return <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] animate-pulse h-48"/>;

  return (
    <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a]">Combined Reversal Score</h2>
        <span className="text-[10px] text-[#4a4a6a]">30s · live</span>
      </div>

      <div className={`p-4 rounded-xl border mb-4 ${style.bg} ${style.border} flex items-center justify-between`}>
        <div>
          <div className={`text-[22px] font-bold font-mono ${style.color}`}>
            {score >= 0 ? '+' : ''}{score.toFixed(1)}
          </div>
          <div className={`text-[13px] font-bold ${style.color}`}>{style.emoji} {signal}</div>
        </div>
        <div className="text-[40px]">
          {signal.includes('BOTTOM') ? '📉' : signal.includes('TOP') ? '📈' : '➡️'}
        </div>
      </div>

      <div className="relative h-3 bg-[#1a1a2e] rounded-full overflow-hidden mb-2">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-[#059669] to-[#C9A227]"/>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-r from-[#C9A227] to-[#DC2626]"/>
        <div
          className="absolute top-0 w-1 h-full bg-white rounded-full shadow-lg transition-all duration-500"
          style={{left:`${barPosition}%`}}
        />
      </div>
      <div className="flex justify-between text-[9px] text-[#4a4a6a] mb-4">
        <span>-100 Strong Bottom</span>
        <span>0 Neutral</span>
        <span>+100 Strong Top</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between p-2.5 bg-[#1a1a2e] rounded-xl">
          <span className="text-[12px] text-[#4a4a6a]">WSI Score (40%)</span>
          <span className={`text-[12px] font-bold font-mono ${components.wsi_score < 0 ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
            {components.wsi_score >= 0 ? '+' : ''}{components.wsi_score?.toFixed(1)}
          </span>
        </div>
        <div className="flex items-center justify-between p-2.5 bg-[#1a1a2e] rounded-xl">
          <span className="text-[12px] text-[#4a4a6a]">Funding Score (30%)</span>
          <span className={`text-[12px] font-bold font-mono ${components.funding_score < 0 ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
            {components.funding_score >= 0 ? '+' : ''}{components.funding_score?.toFixed(1)}
          </span>
        </div>
        <div className="flex items-center justify-between p-2.5 bg-[#1a1a2e] rounded-xl">
          <span className="text-[12px] text-[#4a4a6a]">Leverage Score (30%)</span>
          <span className="text-[12px] font-bold font-mono text-[#C9A227]">
            {components.avg_leverage?.toFixed(1)}x avg
          </span>
        </div>
      </div>
    </div>
  );
}
