import { useState } from 'react';
import { Plus, Trash2, Shield, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { toast } from 'sonner';
export default function WalletManager() {
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const qc = useQueryClient();
  const { data: wallets, isLoading } = useQuery({ queryKey: ['wallets'], queryFn: api.getWallets });
  const addMutation = useMutation({ mutationFn: ({ address, label }: { address: string; label: string }) => api.addWallet(address, label), onSuccess: () => { qc.invalidateQueries({ queryKey: ['wallets'] }); setAddress(''); setLabel(''); toast.success('Wallet added'); }, onError: (e: Error) => toast.error(e.message) });
  const deleteMutation = useMutation({ mutationFn: api.deleteWallet, onSuccess: () => { qc.invalidateQueries({ queryKey: ['wallets'] }); toast.success('Wallet removed'); } });
  return (
    <div className="bg-[#0d0d1a] rounded-2xl border border-[rgba(255,255,255,0.06)] shadow-lg overflow-hidden">
      <div className="p-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-[#C9A227]"/>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a]">Tracked Smart Wallets</h2>
        </div>
        <p className="text-[12px] text-[#4a4a6a]">{wallets?.length||0} wallets monitored · Manual mode only</p>
      </div>
      <div className="px-5 pb-5">
        <form onSubmit={(e)=>{e.preventDefault();if(!address.trim())return;addMutation.mutate({address:address.trim(),label:label.trim()||'Unnamed Whale'})}} className="space-y-2 mb-5">
          <input className="w-full bg-[#1a1a2e] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-3 text-[14px] text-white placeholder-[#4a4a6a] outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[rgba(201,162,39,0.15)] transition-all" placeholder="Wallet address (0x...)" value={address} onChange={(e)=>setAddress(e.target.value)}/>
          <input className="w-full bg-[#1a1a2e] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-3 text-[14px] text-white placeholder-[#4a4a6a] outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[rgba(201,162,39,0.15)] transition-all" placeholder="Label (e.g. Whale A)" value={label} onChange={(e)=>setLabel(e.target.value)}/>
          <button type="submit" disabled={addMutation.isPending} className="w-full bg-[#C9A227] hover:bg-[#b8911f] text-[#0a0a0f] font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
            {addMutation.isPending?<Loader2 className="w-4 h-4 animate-spin"/>:<Plus className="w-4 h-4"/>}ADD
          </button>
        </form>
        {isLoading?<div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#C9A227]"/></div>:!wallets?.length?
        <div className="py-8 text-center"><p className="text-[13px] text-[#4a4a6a]">No wallets tracked. Add elite whale addresses above.</p></div>:
        <div className="space-y-2">{wallets.map((w:{address:string;label:string})=>(
          <div key={w.address} className="flex items-center justify-between p-4 bg-[#1a1a2e] border border-[rgba(255,255,255,0.04)] rounded-xl hover:border-[rgba(201,162,39,0.2)] transition-all">
            <div>
              <div className="text-[14px] font-bold text-[#C9A227]">{w.label}</div>
              <div className="text-[12px] text-[#4a4a6a] font-mono">{w.address.slice(0,6)}...{w.address.slice(-4)}</div>
            </div>
            <button onClick={()=>deleteMutation.mutate(w.address)} className="p-2 text-[#4a4a6a] hover:text-[#DC2626] hover:bg-[rgba(220,38,38,0.1)] rounded-lg transition-all"><Trash2 className="w-4 h-4"/></button>
          </div>
        ))}</div>}
      </div>
    </div>
  );
}
