import { useQuery } from '@tanstack/react-query';

const COLORS = {
  bgBase: '#0A0E17',
  bgCard: '#141B2E',
  buy: '#00C896',
  sell: '#FF5C5C',
  warn: '#E8A33D',
  steel: '#5B6B85',
};

export default function DepthGauge() {
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
  const whaleAlert = data?.whale_alert ?? {};

  const { data: sentimentData } = useQuery({
    queryKey: ['sentiment-current'],
    queryFn: async () => {
      const res = await fetch('https://hyperflow-backend-3l62.onrender.com/api/sentiment/current');
      return res.json();
    },
    refetchInterval: 30000
  });
  const wsi: number = sentimentData?.wsi ?? 0;
  const longPct: number = sentimentData?.long_pct ?? 0;
  const shortPct: number = sentimentData?.short_pct ?? 0;
  const totalNtl: number = sentimentData?.total_ntl ?? 0;
  const longNtl = totalNtl * (longPct / 100);
  const shortNtl = totalNtl * (shortPct / 100);
  const fmt = (v: number) => v >= 1e9 ? `$${(v/1e9).toFixed(2)}B` : v >= 1e6 ? `$${(v/1e6).toFixed(2)}M` : `$${(v/1e3).toFixed(2)}K`;

  const rows = [
    { label: 'WSI', key: 'wsi_score' },
    { label: 'FUNDING', key: 'funding_score' },
    { label: 'MVRV Z', key: 'mvrv_score' },
    { label: 'NUPL', key: 'nupl_score' },
    { label: 'SOPR', key: 'sopr_score' },
    { label: 'OI CHANGE', key: 'oi_change_score' },
  ];

  const getSignalColor = (sig: string) => {
    if (sig.includes('BUY')) return COLORS.buy;
    if (sig.includes('SELL')) return COLORS.sell;
    return COLORS.warn;
  };
  const sigColor = getSignalColor(signal);
  const isStrong = signal.includes('STRONG');

  // depth position: -100 (surface/top) .. 0 (mid) .. +100 (depth/bottom)
  // clamp then map to a 0..100% vertical position, top = sell zone, bottom = buy zone
  const clamped = Math.max(-100, Math.min(100, score));
  // Gauge gradient: red/sell at top (0%), green/buy at bottom (100%).
  // score is negative=buy, positive=sell, so a negative score must map
  // to a HIGH percentage (near bottom/green), not a low one - inverted
  // from the naive (score+100)/200 mapping used here previously.
  const needlePct = 100 - ((clamped + 100) / 200) * 100;

  if (isLoading) {
    return (
      <div className="skeleton h-[420px] rounded-2xl" style={{ background: COLORS.bgCard }} />
    );
  }

  return (
    <div className="space-y-3">
      {whaleAlert.is_major && (
        <div
          className="rounded-xl border p-4"
          style={{
            background: whaleAlert.direction === 'bullish' ? 'rgba(0,200,150,0.1)' : 'rgba(255,92,92,0.1)',
            borderColor: whaleAlert.direction === 'bullish' ? COLORS.buy : COLORS.sell,
          }}
        >
          <div className="text-[13px] font-bold font-mono" style={{ color: whaleAlert.direction === 'bullish' ? COLORS.buy : COLORS.sell }}>
            ⚠ {whaleAlert.alert_type}
          </div>
          <div className="text-[11px] mt-1 font-sans" style={{ color: COLORS.steel }}>
            {whaleAlert.flip_count} / {whaleAlert.total_whales} whales flipped {whaleAlert.direction === 'bullish' ? 'LONG' : 'SHORT'}
          </div>
        </div>
      )}

      <div
        className="rounded-2xl border p-5"
        style={{ background: COLORS.bgCard, borderColor: 'rgba(91,107,133,0.2)' }}
      >
        <div className="mb-5">
          <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.15em]" style={{ color: COLORS.steel }}>
            HyperFlow Depth Gauge
          </span>
        </div>

        <div className="mb-4 pb-4 border-b" style={{ borderColor: 'rgba(91,107,133,0.15)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <div>
              <div className="text-[9px] font-sans tracking-wide" style={{ color: COLORS.steel }}>LONG</div>
              <div className="text-[15px] font-mono font-bold tabular-nums" style={{ color: COLORS.buy }}>{fmt(longNtl)}</div>
            </div>
            <div className="text-right">
              <div className="text-[9px] font-sans tracking-wide" style={{ color: COLORS.steel }}>SHORT</div>
              <div className="text-[15px] font-mono font-bold tabular-nums" style={{ color: COLORS.sell }}>{fmt(shortNtl)}</div>
            </div>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: COLORS.sell }}>
            <div className="h-full" style={{ width: `${longPct}%`, background: COLORS.buy }} />
          </div>
          <div className="text-center mt-1.5 text-[9px] font-mono" style={{ color: COLORS.steel }}>
            WSI {wsi >= 0 ? '+' : ''}{wsi.toFixed(3)}
          </div>
        </div>

        <div className="flex gap-5">
          {/* Vertical depth gauge */}
          <div className="w-14 shrink-0">
            <div className="text-center text-[8px] font-mono tracking-wider" style={{ color: COLORS.steel }}>SELL</div>
            <div className="text-center mb-2 text-[7px] font-mono" style={{ color: COLORS.steel, opacity: 0.5 }}>+100</div>
            <div className="relative w-14 h-[280px]">
              <div
                className="absolute inset-0 rounded-full overflow-hidden"
                style={{ background: 'linear-gradient(180deg, #FF5C5C 0%, #E8A33D 35%, #1a2332 50%, #E8A33D 65%, #00C896 100%)' }}
              />
              <div
                className="absolute left-1/2 -translate-x-1/2 w-full needle-transition"
                style={{ top: `${needlePct}%` }}
              >
                <div
                  className="w-14 h-[3px] -translate-y-1/2"
                  style={{ background: '#fff', boxShadow: `0 0 8px ${sigColor}` }}
                />
              </div>
            </div>
            <div className="text-center mt-2 text-[7px] font-mono" style={{ color: COLORS.steel, opacity: 0.5 }}>-100</div>
            <div className="text-center text-[8px] font-mono tracking-wider" style={{ color: COLORS.steel }}>BUY</div>
          </div>

          {/* Score + signal + components */}
          <div className="flex-1 min-w-0">
            <div className="mb-4">
              <div className="text-[44px] font-bold font-mono leading-none tabular-nums" style={{ color: sigColor }}>
                {score >= 0 ? '+' : ''}{score.toFixed(1)}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                {isStrong && (
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ background: sigColor, color: COLORS.bgBase }}>
                    STRONG
                  </span>
                )}
                <span className="text-[13px] font-mono font-semibold tracking-wide" style={{ color: sigColor }}>
                  {signal.replace('STRONG ', '').replace('WEAK ', '')}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              {rows.map(({ label, key }) => {
                const val: number = components[key] ?? 0;
                const color = val < 0 ? COLORS.buy : val > 0 ? COLORS.sell : COLORS.steel;
                return (
                  <div key={key} className="flex items-center justify-between py-1 border-b" style={{ borderColor: 'rgba(91,107,133,0.12)' }}>
                    <span className="text-[9px] font-sans tracking-wide" style={{ color: COLORS.steel }}>{label}</span>
                    <span className="text-[11px] font-mono font-semibold tabular-nums" style={{ color }}>
                      {val >= 0 ? '+' : ''}{val.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
