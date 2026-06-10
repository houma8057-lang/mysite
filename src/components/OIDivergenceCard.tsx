import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
export default function OIDivergenceCard() {
  const { data } = useQuery({ queryKey: ['sentiment'], queryFn: api.getSentiment, refetchInterval: 10000 });
  const score = data?.reversal_score??0;
  const status = score>0.57?{text:'Strong trend continuation',color:'text-[#059669]',icon:<TrendingUp className="w-5 h-5"/>}:score<-0.57?{text:'Crowded trade — exhaustion risk',color:'text-[#DC2626]',icon:<TrendingDown className="w-5 h-5"/>}:{text:'Neutral — watch for breakout',color:'text-[#6b6b8a]',icon:<Minus className="w-5 h-5"/>};
  return (
    <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] shadow-lg">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a] mb-4">OI Divergence</h2>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-full bg-[#1a1a2e] shadow-sm ${status.color}">{status.icon}</div>
        <div className="text-[28px] font-bold font-mono leading-none text-white">{score>=0?'+':''}{score.toFixed(2)}</div>
      </div>
      <div className="text-[13px] font-medium mt-1 ${status.color}">{status.text}</div>
    </div>
  );
}
