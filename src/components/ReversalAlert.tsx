import { useState } from 'react';
import { TrendingUp, TrendingDown, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
export default function ReversalAlert() {
  const [dismissed, setDismissed] = useState(false);
  const { data: alerts } = useQuery({ queryKey: ['alerts'], queryFn: api.getAlerts, refetchInterval: 30000 });
  const latest = alerts?.[0];
  if (!latest||dismissed) return null;
  const isBottom = latest.signal_type==='BOTTOM';
  return (
    <div className={`animate-slide-down fixed top-0 left-0 right-0 z-[100] shadow-lg ${isBottom?'bg-gradient-to-r from-[#059669] to-[#047857]':'bg-gradient-to-r from-[#DC2626] to-[#B91C1C]'}`} style={{borderLeft:'4px solid #D4AF37',borderRadius:'0 0 16px 16px'}}>
      <div className="max-w-[430px] mx-auto px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">{isBottom?<TrendingUp className="text-white w-5 h-5"/>:<TrendingDown className="text-white w-5 h-5"/>}</div>
          <div><div className="text-white text-[13px] font-bold">{isBottom?'POTENTIAL BOTTOM ALERT':'POTENTIAL TOP ALERT'}</div><p className="text-white/80 text-[11px] font-medium leading-snug">{isBottom?`Whale sentiment reversing bullish (Score: ${latest.reversal_score.toFixed(2)}) — Shorts covering, longs accumulating`:`Whale sentiment reversing bearish (Score: ${latest.reversal_score.toFixed(2)}) — Longs exiting, shorts stacking`}</p></div>
        </div>
        <button onClick={()=>setDismissed(true)} className="text-white/60 hover:text-white p-1 flex-shrink-0"><X className="w-5 h-5"/></button>
      </div>
    </div>
  );
}
