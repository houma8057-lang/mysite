import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, Zap, Target, Shield, BarChart3 } from 'lucide-react';

interface Dimension {
  active: boolean;
  value: number;
  label: string;
  [key: string]: any;
}

interface RegimeData {
  regime: string;
  score: number;
  data_completeness: number;
  signal_confidence: number;
  active_dimensions: number;
  dimensions: Record<string, Dimension>;
  raw_wsi: number;
  timestamp: string;
  recommendation: string;
  warnings?: string[];
}

interface Props {
  data: RegimeData;
}

const REGIME_COLORS: Record<string, string> = {
  'EXTREME_BULLISH': '#059669',
  'BULLISH': '#10B981',
  'SLIGHTLY_BULLISH': '#34D399',
  'NEUTRAL': '#6b6b8a',
  'SLIGHTLY_BEARISH': '#F87171',
  'BEARISH': '#EF4444',
  'EXTREME_BEARISH': '#DC2626',
};

const REGIME_LABELS: Record<string, string> = {
  'EXTREME_BULLISH': 'Extreme Bullish',
  'BULLISH': 'Bullish',
  'SLIGHTLY_BULLISH': 'Slightly Bullish',
  'NEUTRAL': 'Neutral',
  'SLIGHTLY_BEARISH': 'Slightly Bearish',
  'BEARISH': 'Bearish',
  'EXTREME_BEARISH': 'Extreme Bearish',
};

export default function RegimeCard({ data }: Props) {
  const color = REGIME_COLORS[data.regime] || '#6b6b8a';
  const label = REGIME_LABELS[data.regime] || data.regime;

  const scoreBar = useMemo(() => {
    const pct = Math.max(0, Math.min(100, (data.score + 1) * 50));
    return pct;
  }, [data.score]);

  const activeDims = useMemo(() => {
    return Object.entries(data.dimensions || {}).filter(([key, d]) => d.active && key !== 'mvrv_cycle');
  }, [data.dimensions]);

  const inactiveDims = useMemo(() => {
    return Object.entries(data.dimensions || {}).filter(([key, d]) => !d.active && key !== 'mvrv_cycle');
  }, [data.dimensions]);

  const dimIcon = (key: string) => {
    if (key === 'funding_divergence') return <Target className="w-3 h-3" />;
    if (key === 'velocity') return <Zap className="w-3 h-3" />;
    if (key === 'wallet_dry_powder') return <Activity className="w-3 h-3" />;
    return <AlertTriangle className="w-3 h-3" />;
  };

  const dimName = (key: string) => {
    if (key === 'funding_divergence') return 'Funding Divergence';
    if (key === 'velocity') return 'Velocity';
    if (key === 'wallet_dry_powder') return 'Dry Powder';
    if (key === 'position_extremity') return 'Position Extremity';
    return key;
  };

  return (
    <div className="bg-[#0d0d1a] rounded-2xl border border-[rgba(255,255,255,0.06)] shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a]">Whale Regime Detector</span>
          </div>
          <span className="text-[10px] font-mono text-[#4a4a6a]">{data.active_dimensions}/5 active</span>
        </div>
      </div>

      {/* Main Score */}
      <div className="px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[28px] font-bold font-mono leading-tight" style={{ color }}>
              {data.score >= 0 ? '+' : ''}{data.score.toFixed(2)}
            </div>
            <div className="text-[12px] font-semibold mt-1" style={{ color }}>
              {label}
            </div>
          </div>
          <div className="text-right space-y-1">
            <div>
              <div className="flex items-center gap-1 justify-end">
                <Shield className="w-3 h-3 text-[#4a4a6a]" />
                <span className="text-[10px] font-medium text-[#4a4a6a] uppercase tracking-[0.05em]">Data</span>
              </div>
              <div className="text-[14px] font-bold font-mono text-white">{data.data_completeness || 0}%</div>
            </div>
            <div>
              <div className="flex items-center gap-1 justify-end">
                <BarChart3 className="w-3 h-3 text-[#4a4a6a]" />
                <span className="text-[10px] font-medium text-[#4a4a6a] uppercase tracking-[0.05em]">Signal</span>
              </div>
              <div className={`text-[14px] font-bold font-mono ${(data.signal_confidence || 0) > 50 ? 'text-[#C9A227]' : 'text-[#4a4a6a]'}`}>
                {data.signal_confidence || 0}%
              </div>
            </div>
          </div>
        </div>

        {/* Score Bar */}
        <div className="relative h-2 bg-[#1a1a2e] rounded-full overflow-hidden mb-4">
          <div className="absolute top-0 left-1/2 w-[1px] h-full bg-[#4a4a6a] z-10" />
          <div 
            className="absolute top-0 h-full rounded-full transition-all duration-700"
            style={{ 
              left: data.score < 0 ? `${scoreBar}%` : '50%',
              width: `${Math.abs(scoreBar - 50)}%`,
              backgroundColor: color,
              opacity: 0.8
            }}
          />
        </div>



        {/* Recommendation */}
        <div className="bg-[rgba(255,255,255,0.03)] rounded-xl px-4 py-3 mb-4">
          <div className="text-[10px] font-medium text-[#4a4a6a] uppercase tracking-[0.05em] mb-1">Recommendation</div>
          <div className="text-[13px] font-semibold text-white leading-snug">{data.recommendation}</div>
        </div>

        {/* Raw WSI Reference */}
        <div className="flex items-center justify-between text-[11px] text-[#4a4a6a] mb-3">
          <span>Legacy WSI: <span className="font-mono text-white">{data.raw_wsi >= 0 ? '+' : ''}{data.raw_wsi.toFixed(3)}</span></span>
          <span>{(data.data_completeness || 0) >= 75 ? '✓ Sufficient data' : '⚠ Building data'}</span>
        </div>

        {/* Active Dimensions */}
        {activeDims.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-medium text-[#4a4a6a] uppercase tracking-[0.05em]">Active Dimensions</div>
            {activeDims.map(([key, dim]) => (
              <div key={key} className="flex items-center gap-2 bg-[rgba(255,255,255,0.03)] rounded-lg px-3 py-2">
                <span style={{ color: dim.value > 0 ? '#059669' : dim.value < 0 ? '#DC2626' : '#6b6b8a' }}>
                  {dimIcon(key)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-white truncate">{dimName(key)}</span>
                    <span className="text-[11px] font-mono" style={{ 
                      color: dim.value > 0 ? '#059669' : dim.value < 0 ? '#DC2626' : '#6b6b8a'
                    }}>
                      {dim.value >= 0 ? '+' : ''}{dim.value.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#4a4a6a] truncate">{dim.label}</div>
                  {/* Show time span for Position Extremity */}
                  {key === 'position_extremity' && dim.time_span_days && (
                    <div className="text-[9px] text-[#4a4a6a]">{dim.time_span_days} days of history</div>
                  )}
                  {/* Show wallet details for Dry Powder */}
                  {key === 'wallet_dry_powder' && dim.wallet_details && (
                    <div className="text-[9px] text-[#4a4a6a] mt-1">
                      Top wallet util: {dim.wallet_details[0]?.utilization || 'N/A'}x
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inactive Dimensions */}
        {inactiveDims.length > 0 && (
          <div className="mt-3 space-y-1">
            <div className="text-[10px] font-medium text-[#4a4a6a] uppercase tracking-[0.05em]">Building Data</div>
            {inactiveDims.map(([key, dim]) => (
              <div key={key} className="flex items-center gap-2 px-3 py-1.5 opacity-50">
                <span className="text-[#4a4a6a]">{dimIcon(key)}</span>
                <span className="text-[11px] text-[#4a4a6a]">{dimName(key)}</span>
                <span className="text-[10px] text-[#4a4a6a] ml-auto">{dim.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
