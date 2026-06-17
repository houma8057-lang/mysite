import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const fmt = (v: number) => `$${v.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

const API = 'https://hyperflow-backend-3l62.onrender.com/api';

export default function SignalsPage() {
  const [showHistory, setShowHistory] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['signals'],
    queryFn: async () => {
      const res = await fetch(`${API}/signals/current`);
      return res.json();
    },
    refetchInterval: 30000
  });

  const { data: historyData } = useQuery({
    queryKey: ['signals-history'],
    queryFn: async () => {
      const res = await fetch(`${API}/signals/history`);
      return res.json();
    },
    refetchInterval: 60000
  });

  const signal = data?.signal ?? 'LOADING';
  const conditions = data?.conditions ?? {};
  const buyMet = data?.buy_conditions_met ?? 0;
  const sellMet = data?.sell_conditions_met ?? 0;
  const confidence = Math.round(Math.max(buyMet, sellMet) / 3 * 100);
  const whaleDelta = conditions.whale_delta ?? {};

  const getSignalStyle = () => {
    if (signal.includes('STRONG BUY')) return { color: 'text-[#059669]', bg: 'bg-[rgba(5,150,105,0.15)]', border: 'border-[rgba(5,150,105,0.4)]', emoji: '🟢', bar: 'bg-[#059669]' };
    if (signal.includes('WEAK BUY')) return { color: 'text-[#34d399]', bg: 'bg-[rgba(52,211,153,0.1)]', border: 'border-[rgba(52,211,153,0.3)]', emoji: '🟡', bar: 'bg-[#34d399]' };
    if (signal.includes('STRONG SELL')) return { color: 'text-[#DC2626]', bg: 'bg-[rgba(220,38,38,0.15)]', border: 'border-[rgba(220,38,38,0.4)]', emoji: '🔴', bar: 'bg-[#DC2626]' };
    if (signal.includes('WEAK SELL')) return { color: 'text-[#f87171]', bg: 'bg-[rgba(248,113,113,0.1)]', border: 'border-[rgba(248,113,113,0.3)]', emoji: '🟠', bar: 'bg-[#f87171]' };
    return { color: 'text-[#C9A227]', bg: 'bg-[rgba(201,162,39,0.1)]', border: 'border-[rgba(201,162,39,0.2)]', emoji: '⚪', bar: 'bg-[#C9A227]' };
  };

  const style = getSignalStyle();

  const buyConditions = [
    { label: 'WSI Extreme SHORT', value: `${conditions.wsi}`, met: conditions.wsi_met_buy, threshold: '< -0.800' },
    { label: 'Funding Negative', value: `${conditions.funding}%`, met: conditions.funding_met_buy, threshold: '< -0.001%' },
    { label: 'Whales Closing SHORT', value: conditions.whale_closing_short ? 'YES' : 'NO', met: conditions.whale_closing_short, threshold: 'Shorts ↓ 10%+' },
  ];

  const sellConditions = [
    { label: 'WSI Extreme LONG', value: `${conditions.wsi}`, met: conditions.wsi_met_sell, threshold: '> +0.800' },
    { label: 'Funding Positive', value: `${conditions.funding}%`, met: conditions.funding_met_sell, threshold: '> +0.001%' },
    { label: 'Whales Closing LONG', value: conditions.whale_closing_long ? 'YES' : 'NO', met: conditions.whale_closing_long, threshold: 'Longs ↓ 10%+' },
  ];

  const history = historyData?.history ?? [];

  const getSignalBadge = (s: string) => {
    if (s.includes('STRONG BUY')) return 'bg-[#059669] text-white';
    if (s.includes('WEAK BUY')) return 'bg-[#34d399] text-[#0d0d1a]';
    if (s.includes('STRONG SELL')) return 'bg-[#DC2626] text-white';
    if (s.includes('WEAK SELL')) return 'bg-[#f87171] text-[#0d0d1a]';
    return 'bg-[#4a4a6a] text-white';
  };

  if (isLoading) return <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] animate-pulse h-96"/>;

  return (
    <div className="space-y-4">
      {/* Current Signal */}
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

      {/* Confidence Score */}
      <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a]">Confidence Score</div>
          <div className={`text-[20px] font-bold ${style.color}`}>{confidence === 0 ? "—" : `${confidence}%`}</div>
        </div>
        <div className="h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
          <div className={`h-full ${style.bar} rounded-full transition-all duration-500`} style={{width: `${confidence === 0 ? "—" : `${confidence}%`}`}}/>
        </div>
        <div className="text-[11px] text-[#4a4a6a] mt-2">
          {confidence >= 100 ? 'Maximum confidence — all conditions met.' :
           confidence >= 66 ? 'Strong signal — most conditions met.' :
           confidence >= 33 ? 'Moderate signal — some conditions met.' :
           'No signal — conditions inactive.'}
        </div>
      </div>

      {/* Whale Delta Info */}
      {whaleDelta.has_history && (
        <div className="bg-[#0d0d1a] p-4 rounded-2xl border border-[rgba(255,255,255,0.06)]">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a] mb-3">Whale Position Delta (24h)</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1a1a2e] p-3 rounded-xl">
              <div className="text-[11px] text-[#4a4a6a]">Short Delta</div>
              <div className={`text-[16px] font-bold font-mono ${whaleDelta.short_delta_pct < 0 ? 'text-[#059669]' : whaleDelta.short_delta_pct > 0 ? 'text-[#DC2626]' : 'text-[#4a4a6a]'}`}>
                {whaleDelta.short_delta_pct > 0 ? '+' : ''}{whaleDelta.short_delta_pct}%
              </div>
              <div className="text-[10px] text-[#4a4a6a] mt-1">
                {whaleDelta.short_delta_pct < -10 ? 'Closing shorts 🟢' : whaleDelta.short_delta_pct > 10 ? 'Adding shorts 🔴' : 'No change'}
              </div>
            </div>
            <div className="bg-[#1a1a2e] p-3 rounded-xl">
              <div className="text-[11px] text-[#4a4a6a]">Long Delta</div>
              <div className={`text-[16px] font-bold font-mono ${whaleDelta.long_delta_pct < 0 ? 'text-[#DC2626]' : whaleDelta.long_delta_pct > 0 ? 'text-[#059669]' : 'text-[#4a4a6a]'}`}>
                {whaleDelta.long_delta_pct > 0 ? '+' : ''}{whaleDelta.long_delta_pct}%
              </div>
              <div className="text-[10px] text-[#4a4a6a] mt-1">
                {whaleDelta.long_delta_pct < -10 ? 'Closing longs 🔴' : whaleDelta.long_delta_pct > 10 ? 'Adding longs 🟢' : 'No change'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BUY Conditions */}
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

      {/* SELL Conditions */}
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

      {/* Signal History Toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full bg-[#1a1a2e] hover:bg-[#252540] text-white text-[13px] font-semibold py-3 px-5 rounded-2xl border border-[rgba(255,255,255,0.06)] transition-colors flex items-center justify-between"
      >
        <span>📜 Signal History ({history.length})</span>
        <span className="text-[#4a4a6a]">{showHistory ? '▲' : '▼'}</span>
      </button>

      {/* Signal History List */}
      {showHistory && (
        <div className="bg-[#0d0d1a] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
          {history.length === 0 ? (
            <div className="p-5 text-center text-[#4a4a6a] text-[13px]">No history yet. Signals will be saved automatically.</div>
          ) : (
            <div className="max-h-[400px] overflow-y-auto">
              {history.map((h: any) => (
                <div key={h.id} className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.04)] hover:bg-[#1a1a2e]">
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${getSignalBadge(h.signal)}`}>{h.signal}</span>
                    <div>
                      <div className="text-[13px] text-white font-mono">{fmt(h.btc_price)}</div>
                      <div className="text-[11px] text-[#4a4a6a]">{new Date(h.timestamp).toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] text-[#4a4a6a]">WSI: <span className="text-white font-mono">{h.wsi}</span></div>
                    <div className="text-[12px] text-[#4a4a6a]">Conf: <span className={`font-bold ${h.confidence >= 66 ? 'text-[#059669]' : h.confidence >= 33 ? 'text-[#C9A227]' : 'text-[#4a4a6a]'}`}>{h.confidence}%</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
