import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Toaster } from 'sonner';

const API = 'https://hyperflow-backend-3l62.onrender.com';

export default function SignalsPage() {
  const [showHistory, setShowHistory] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['signals'],
    queryFn: async () => {
      const res = await fetch(`${API}/api/signals/current`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    refetchInterval: 60000,
    staleTime: 300000,
    enabled: true,
  });

  const { data: historyData } = useQuery({
    queryKey: ['signal-history'],
    queryFn: async () => {
      const res = await fetch(`${API}/api/signals/history?limit=50`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    refetchInterval: 300000,
    enabled: showHistory,
  });

  if (isLoading) return <LoadingScreen />;

  const conditions = data?.conditions || {};
  const signal = data?.signal || 'NEUTRAL';
  const confidence = data?.confidence ?? 0;
  const buyMet = conditions.buy_conditions_met ?? 0;
  const sellMet = conditions.sell_conditions_met ?? 0;
  const whaleDelta = conditions.whale_delta ?? {};
  const whaleConviction = conditions.whale_conviction ?? {};

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

  const getConfidenceDisplay = () => {
    if (confidence === 0) return { value: '—', label: 'No signal — waiting for confirmation', bar: 0 };
    if (confidence < 30) return { value: `${confidence}%`, label: 'Weak signal — needs more confirmation', bar: confidence };
    if (confidence < 70) return { value: `${confidence}%`, label: 'Moderate signal — partial confirmation', bar: confidence };
    return { value: `${confidence}%`, label: 'Strong signal — high confidence', bar: confidence };
  };

  const conf = getConfidenceDisplay();

  const getSignalHistoryStyle = (s: string) => {
    if (s.includes('STRONG BUY')) return 'text-[#059669] bg-[rgba(5,150,105,0.15)]';
    if (s.includes('WEAK BUY')) return 'text-[#34d399] bg-[rgba(52,211,153,0.1)]';
    if (s.includes('STRONG SELL')) return 'text-[#DC2626] bg-[rgba(220,38,38,0.15)]';
    if (s.includes('WEAK SELL')) return 'text-[#f87171] bg-[rgba(248,113,113,0.1)]';
    return 'text-[#C9A227] bg-[rgba(201,162,39,0.1)]';
  };

  const getConvictionColor = (level: string) => {
    if (level === 'STRONG') return 'text-[#059669]';
    if (level === 'WEAKENING') return 'text-[#C9A227]';
    if (level === 'REVERSING') return 'text-[#DC2626]';
    return 'text-[#4a4a6a]';
  };

  return (
    <div className="min-h-screen bg-[#050510] text-white pb-24">
      <Toaster position="top-center" richColors />
      
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#C9A227] flex items-center justify-center">
            <span className="text-[14px]">⚡</span>
          </div>
          <div>
            <h1 className="text-[16px] font-bold text-white leading-tight">HyperFlow</h1>
            <p className="text-[10px] text-[#4a4a6a]">Smart Money Tracker</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#059669] animate-pulse" />
            <span className="text-[10px] text-[#4a4a6a]">LIVE</span>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4 mt-2">
        {/* Current Signal */}
        <div className={`p-5 rounded-2xl border ${style.bg} ${style.border}`}>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a] mb-2">Current Signal</div>
          <div className="flex items-center gap-3">
            <span className="text-[28px]">{style.emoji}</span>
            <div>
              <div className={`text-[22px] font-bold ${style.color}`}>{signal}</div>
              <div className="text-[12px] text-[#4a4a6a]">BTC Price ${conditions.btc_price?.toLocaleString()}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-[11px] text-[#4a4a6a]">BUY conditions</div>
              <div className="text-[18px] font-bold text-[#059669]">{buyMet}/3</div>
            </div>
          </div>
        </div>

        {/* Confidence Score */}
        <div className="bg-[#0d0d1a] p-4 rounded-2xl border border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a]">Confidence Score</div>
            <div className={`text-[16px] font-bold ${confidence > 0 ? style.color : 'text-[#4a4a6a]'}`}>{conf.value}</div>
          </div>
          <div className="w-full h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
            <div className={`h-full ${style.bar} transition-all duration-500`} style={{ width: `${conf.bar}%` }} />
          </div>
          <div className="text-[10px] text-[#4a4a6a] mt-1.5">{conf.label}</div>
        </div>

        {/* Whale Conviction Meter - NEW */}
        {whaleConviction.hold_time_days && (
          <div className="bg-[#0d0d1a] p-4 rounded-2xl border border-[rgba(255,255,255,0.06)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a] mb-3">🐋 Whale Conviction</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1a1a2e] p-3 rounded-xl">
                <div className="text-[10px] text-[#4a4a6a]">Direction Hold Time</div>
                <div className="text-[16px] font-bold text-white">{whaleConviction.hold_time_days} days</div>
                <div className="text-[10px] text-[#4a4a6a] mt-1">Since {whaleConviction.direction_since}</div>
              </div>
              <div className="bg-[#1a1a2e] p-3 rounded-xl">
                <div className="text-[10px] text-[#4a4a6a]">Unrealized PnL</div>
                <div className={`text-[16px] font-bold ${whaleConviction.unrealized_pnl_pct >= 0 ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
                  {whaleConviction.unrealized_pnl_pct > 0 ? '+' : ''}{whaleConviction.unrealized_pnl_pct}%
                </div>
                <div className="text-[10px] text-[#4a4a6a] mt-1">
                  {whaleConviction.pnl_status}
                </div>
              </div>
            </div>
            <div className="mt-3 p-3 rounded-xl bg-[#1a1a2e]">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-[#4a4a6a]">Conviction Level</div>
                  <div className={`text-[14px] font-bold ${getConvictionColor(whaleConviction.level)}`}>
                    {whaleConviction.level}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[#4a4a6a]">Recent Action</div>
                  <div className="text-[12px] text-white">{whaleConviction.recent_action}</div>
                </div>
              </div>
              <div className="mt-2 text-[10px] text-[#4a4a6a] leading-relaxed">
                {whaleConviction.level === 'STRONG' && 'Whales holding firm. Trend likely continues.'}
                {whaleConviction.level === 'WEAKENING' && 'Some profit-taking detected. Watch for reversal signs.'}
                {whaleConviction.level === 'REVERSING' && 'Whales changing direction. Reversal may be near.'}
              </div>
            </div>
          </div>
        )}

        {/* Whale Position Delta */}
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
                  {whaleDelta.short_delta_pct < -10 ? 'Closing shorts 🟢' : whaleDelta.short_delta_pct > 10 ? 'Adding shorts 🔴' : whaleDelta.short_delta_pct < 0 ? 'Slightly reducing ↘️' : whaleDelta.short_delta_pct > 0 ? 'Slightly adding ↗️' : 'No change ➡️'}
                </div>
              </div>
              <div className="bg-[#1a1a2e] p-3 rounded-xl">
                <div className="text-[11px] text-[#4a4a6a]">Long Delta</div>
                <div className={`text-[16px] font-bold font-mono ${whaleDelta.long_delta_pct < 0 ? 'text-[#DC2626]' : whaleDelta.long_delta_pct > 0 ? 'text-[#059669]' : 'text-[#4a4a6a]'}`}>
                  {whaleDelta.long_delta_pct > 0 ? '+' : ''}{whaleDelta.long_delta_pct}%
                </div>
                <div className="text-[10px] text-[#4a4a6a] mt-1">
                  {whaleDelta.long_delta_pct < -10 ? 'Closing longs 🔴' : whaleDelta.long_delta_pct > 10 ? 'Adding longs 🟢' : whaleDelta.long_delta_pct < 0 ? 'Slightly reducing ↘️' : whaleDelta.long_delta_pct > 0 ? 'Slightly adding ↗️' : 'No change ➡️'}
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

        {/* Signal History */}
        <div className="bg-[#0d0d1a] rounded-2xl border border-[rgba(255,255,255,0.06)] overflow-hidden">
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="w-full p-4 flex items-center justify-between text-left"
          >
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a]">📋 Signal History</div>
              <div className="text-[10px] text-[#4a4a6a] mt-0.5">({historyData?.history?.length ?? 0}) entries</div>
            </div>
            <span className="text-[#4a4a6a]">{showHistory ? '▲' : '▼'}</span>
          </button>
          
          {showHistory && historyData?.history && (
            <div className="px-4 pb-4 space-y-2 max-h-[400px] overflow-y-auto">
              {historyData.history.map((h: any, i: number) => (
                <div key={i} className="p-3 rounded-xl bg-[#1a1a2e] border border-[rgba(255,255,255,0.04)]">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${getSignalHistoryStyle(h.signal)}`}>{h.signal}</span>
                    <span className="text-[10px] text-[#4a4a6a]">{h.btc_price?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-[#4a4a6a]">{new Date(h.timestamp).toLocaleString()}</span>
                    <span className="text-[10px] text-[#4a4a6a]">WSI: {h.wsi} | Conf: {h.confidence}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="p-4 rounded-2xl bg-[#0d0d1a] border border-[rgba(255,255,255,0.06)]">
          <div className="text-[10px] text-[#4a4a6a] leading-relaxed">
            <span className="text-[#059669] font-semibold">STRONG BUY</span> — 3/3 conditions met. 
            <span className="text-[#34d399] font-semibold"> WEAK BUY</span> — 2/3 conditions met. 
            Recommended Timeframe: 4H / Daily. Signals update every 30 seconds. Based on smart money whale wallets on Hyperliquid.
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <div className="text-[14px] text-[#4a4a6a]">Loading signals...</div>
      </div>
    </div>
  );
}
