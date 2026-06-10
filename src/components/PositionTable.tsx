import { useState } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
const fmt = (v: number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(v);
export default function PositionTable() {
  const [expanded, setExpanded] = useState<Record<string,boolean>>({});
  const { data, isLoading } = useQuery({ queryKey: ['positions'], queryFn: api.getPositions, refetchInterval: 10000 });
  const toggle = (addr: string) => setExpanded(p=>({...p,[addr]:!p[addr]}));
  const groups = (data?.detail||[]).reduce((acc: Record<string,any>, pos: any) => { if(!acc[pos.wallet_address]){acc[pos.wallet_address]={label:pos.label,address:pos.wallet_address,positions:[],totalValue:0};} acc[pos.wallet_address].positions.push(pos); acc[pos.wallet_address].totalValue+=pos.notional; return acc; },{});
  const sorted = Object.values(groups).sort((a:any,b:any)=>b.totalValue-a.totalValue);
  return (
    <div className="bg-[#0d0d1a] rounded-2xl border border-[rgba(255,255,255,0.06)] shadow-lg overflow-hidden">
      <div className="p-5 pb-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a] mb-1">Whale Positions</h2>
        <p className="text-[12px] text-[#4a4a6a]">{data?.summary?.length||0} wallets · {(data?.detail||[]).length} positions</p>
      </div>
      {isLoading?<div className="py-10 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#C9A227]"/></div>:sorted.length===0?
      <div className="py-10 text-center text-[13px] text-[#4a4a6a]">No active positions detected</div>:
      <div className="divide-y divide-[rgba(255,255,255,0.04)]">
        {sorted.map((w:any)=>(
          <div key={w.address} className="border-t border-[rgba(255,255,255,0.04)]">
            <button onClick={()=>toggle(w.address)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-[rgba(255,255,255,0.02)] transition-all">
              <div className="flex items-center gap-3">
                <ChevronDown className="w-4 h-4 text-[#C9A227] transition-transform" style={{transform:expanded[w.address]?'rotate(180deg)':'none'}}/>
                <div className="text-left">
                  <div className="text-[14px] font-bold text-[#C9A227]">{w.label}</div>
                  <div className="text-[11px] text-[#4a4a6a] font-mono">{w.address.slice(0,6)}...{w.address.slice(-4)}</div>
                </div>
              </div>
              <div className="text-[14px] font-bold text-white font-mono">{fmt(w.totalValue)}</div>
            </button>
            {expanded[w.address]&&<div className="bg-[#080810] px-5 pb-3">
              <div className="space-y-2">
                {w.positions.map((pos:any,i:number)=>(
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-[rgba(255,255,255,0.03)] last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-bold text-white">{pos.coin}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pos.side==='LONG'?'bg-[rgba(5,150,105,0.15)] text-[#059669]':'bg-[rgba(220,38,38,0.15)] text-[#DC2626]'}`}>{pos.side}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-[14px] font-bold text-white font-mono">{fmt(pos.notional)}</div>
                      <div className="text-[11px] text-[#4a4a6a]">{pos.leverage}x</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>}
          </div>
        ))}
      </div>}
    </div>
  );
}
