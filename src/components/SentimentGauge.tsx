import { useMemo } from 'react';
interface Props { wsi: number; longPct: number; shortPct: number; totalNtl: number; }
export default function SentimentGauge({ wsi, longPct, shortPct, totalNtl }: Props) {
  const rotation = useMemo(() => (wsi + 1) * 90, [wsi]);
  const fmt = (v: number) => v>=1e9?`$${(v/1e9).toFixed(2)}B`:v>=1e6?`$${(v/1e6).toFixed(2)}M`:v>=1e3?`$${(v/1e3).toFixed(1)}K`:`$${v.toFixed(2)}`;
  return (
    <div className="flex flex-col items-center p-6 bg-[#FAFAFA] rounded-[20px] border border-[rgba(10,10,10,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280] mb-6">Weighted Sentiment Index</h2>
      <div className="relative w-64 h-32 overflow-hidden">
        <svg className="absolute top-0 left-0 w-full h-[128px]" viewBox="0 0 256 128">
          <path d="M 16 128 A 112 112 0 0 1 240 128" fill="none" stroke="#E5E5E5" strokeWidth="20" strokeLinecap="round"/>
          <path d="M 16 128 A 112 112 0 0 1 56.4 40.4" fill="none" stroke="#DC2626" strokeWidth="20" strokeLinecap="butt"/>
          <path d="M 56.4 40.4 A 112 112 0 0 1 112 16.4" fill="none" stroke="#F59E0B" strokeWidth="20" strokeLinecap="butt"/>
          <path d="M 112 16.4 A 112 112 0 0 1 144 16.4" fill="none" stroke="#6B7280" strokeWidth="20" strokeLinecap="butt"/>
          <path d="M 144 16.4 A 112 112 0 0 1 199.6 40.4" fill="none" stroke="#84CC16" strokeWidth="20" strokeLinecap="butt"/>
          <path d="M 199.6 40.4 A 112 112 0 0 1 240 128" fill="none" stroke="#059669" strokeWidth="20" strokeLinecap="butt"/>
        </svg>
        <div className="absolute bottom-0 left-1/2 origin-bottom needle-transition" style={{width:'4px',height:'100px',marginLeft:'-2px',background:'#C9A227',boxShadow:'0 2px 8px rgba(201,162,39,0.4)',borderRadius:'2px 2px 0 0',transform:`rotate(${rotation-90}deg)`}}/>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-5 h-5 rounded-full bg-[#C9A227] border-4 border-white shadow-md z-10"/>
      </div>
      <div className="mt-8 text-center">
        <div className="text-[40px] font-bold text-[#0A0A0A] font-mono leading-tight tabular-nums">{wsi>=0?'+':''}{wsi.toFixed(3)}</div>
        <div className="flex items-center justify-center gap-3 mt-2 text-[13px] font-semibold">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#059669] inline-block"/><span className="text-[#059669]">LONG {longPct}%</span></span>
          <span className="text-[#9CA3AF]">|</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#DC2626] inline-block"/><span className="text-[#DC2626]">SHORT {shortPct}%</span></span>
        </div>
        <div className="mt-4">
          <div className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-[0.05em]">Total Smart Money Notional</div>
          <div className="text-[16px] font-bold text-[#0A0A0A] font-mono">{fmt(totalNtl)}</div>
        </div>
      </div>
    </div>
  );
}
