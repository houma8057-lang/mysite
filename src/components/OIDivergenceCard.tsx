import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
export default function OIDivergenceCard() {
  const { data } = useQuery({ queryKey: ['sentiment'], queryFn: api.getSentiment, refetchInterval: 10000 });
  const score = data?.reversal_score??0;
  const status = score>0.05?{text:'Strong trend continuation',color:'text-[#059669]',icon:<TrendingUp className="w-5 h-5"/>}:score<-0.05?{text:'Crowded trade — exhaustion risk',color:'text-[#DC2626]',icon:<TrendingDown className="w-5 h-5"/>}:{text:'Neutral — watch for breakout',color:'text-[#6B7280]',icon:<Minus className="w-5 h-5"/>};
  return (
    <div className="bg-[#FAFAFA] p-5 rounded-[20px] border border-[rgba(10,10,10,0.08)] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280] mb-4">OI Divergence</h2>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full bg-white shadow-sm ${status.color}`}>{status.icon}</div>
        <div><div className={`text-[28px] font-bold font-mono leading-none ${status.color}`}>{score>=0?'+':''}{score.toFixed(2)}</div><div className={`text-[13px] font-medium mt-1 ${status.color}`}>{status.text}</div></div>
      </div>
    </div>
  );
}
