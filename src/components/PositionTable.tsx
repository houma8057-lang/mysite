import { useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
const fmt = (v: number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(v);
export default function PositionTable() {
  const [expanded, setExpanded] = useState<Record<string,boolean>>({});
  const { data, isLoading } = useQuery({ queryKey: ['positions'], queryFn: api.getPositions, refetchInterval: 10000 });
  const toggle = (addr: string) => setExpanded(p=>({...p,[addr]:!p[addr]}));
  const groups = (data?.detail||[]).reduce((acc: Record<string,any>, pos: any) => { if(!acc[pos.wallet_address])acc[pos.wallet_address]={label:pos.label,address:pos.wallet_address,positions:[],totalValue:0}; acc[pos.wallet_address].positions.push(pos); acc[pos.wallet_address].totalValue+=pos.notional; return acc; },{});
  const sorted = Object.values(groups).sort((a:any,b:any)=>b.totalValue-a.totalValue);
  return (
    <div className="bg-[#FAFAFA] rounded-[20px] border border-[rgba(10,10,10,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="p-5 pb-3"><h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">Whale Positions</h2><p className="text-[12px] text-[#9CA3AF] font-medium mt-1">{sorted.length} wallets · {(data?.detail||[]).length} positions</p></div>
      {isLoading?<div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#C9A227]"/></div>:sorted.length===0?<div className="py-10 text-center text-[13px] text-[#9CA3AF]">No active positions detected</div>:(
        <div className="max-h-[500px] overflow-y-auto">
          {sorted.map((w:any)=>(
            <div key={w.address} className="border-t border-[rgba(10,10,10,0.04)]">
              <button onClick={()=>toggle(w.address)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-[rgba(10,10,10,0.02)] transition-colors">
                <div className="flex items-center gap-3"><ChevronDown className="w-4 h-4 text-[#6B7280] transition-transform" style={{transform:expanded[w.address]?'rotate(180deg)':'none'}}/><div className="text-left"><div className="text-[14px] font-bold text-[#0A0A0A]">{w.label}</div><div className="text-[11px] text-[#9CA3AF] font-mono">{w.address.slice(0,6)}...{w.address.slice(-4)}</div></div></div>
                <div className="text-[14px] font-bold text-[#0A0A0A] font-mono">{fmt(w.totalValue)}</div>
              </button>
              {expanded[w.address]&&<div className="bg-white px-5 pb-3">{w.positions.map((pos:any,i:number)=>(<div key={`${pos.coin}_${i}`} className="flex items-center justify-between py-2.5 border-b border-[rgba(10,10,10,0.03)] last:border-0"><div className="flex items-center gap-3"><span className="text-[14px] font-bold text-[#0A0A0A] min-w-[50px]">{pos.coin}</span><span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-[6px] ${pos.side==='LONG'?'bg-[rgba(5,150,105,0.1)] text-[#059669]':'bg-[rgba(220,38,38,0.1)] text-[#DC2626]'}`}>{pos.side}</span></div><div className="text-right"><div className="text-[13px] font-bold text-[#0A0A0A] font-mono">{fmt(pos.notional)}</div><div className="text-[10px] text-[#9CA3AF]">{pos.leverage}x</div></div></div>))}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
