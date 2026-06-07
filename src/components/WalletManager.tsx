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
  const ic = "w-full h-11 px-4 bg-white border border-[rgba(10,10,10,0.12)] rounded-[12px] text-[14px] text-[#0A0A0A] placeholder-[#9CA3AF] outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[rgba(201,162,39,0.15)] transition-all";
  return (
    <div className="bg-[#FAFAFA] rounded-[20px] border border-[rgba(10,10,10,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="p-5 pb-4"><div className="flex items-center gap-2 mb-1"><Shield className="w-5 h-5 text-[#C9A227]"/><h2 className="text-[16px] font-bold text-[#0A0A0A]">TRACKED SMART WALLETS</h2></div><p className="text-[12px] text-[#9CA3AF] font-medium">{wallets?.length||0} wallets monitored · Manual mode only</p></div>
      <div className="px-5 pb-5">
        <form onSubmit={(e)=>{e.preventDefault();if(!address.trim())return;addMutation.mutate({address:address.trim(),label:label.trim()||'Unnamed Whale'});}} className="space-y-2 mb-5">
          <input className={ic} placeholder="Wallet address (0x...)" value={address} onChange={e=>setAddress(e.target.value)}/>
          <div className="flex gap-2">
            <input className={ic} placeholder="Label (e.g. Whale A)" value={label} onChange={e=>setLabel(e.target.value)}/>
            <button type="submit" disabled={addMutation.isPending} className="h-11 px-6 bg-[#0A0A0A] hover:bg-[#1F1F1F] active:scale-[0.98] text-white font-semibold rounded-[12px] transition-all flex items-center gap-2 whitespace-nowrap">
              {addMutation.isPending?<Loader2 className="w-4 h-4 animate-spin"/>:<><Plus className="w-4 h-4"/>ADD</>}
            </button>
          </div>
        </form>
        <div className="space-y-2">
          {isLoading?<div className="py-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-[#C9A227]"/></div>:!wallets?.length?<div className="py-8 text-center"><p className="text-[13px] text-[#9CA3AF]">No wallets tracked. Add elite whale addresses above.</p></div>:wallets.map((w: {address:string;label:string})=>(
            <div key={w.address} className="flex items-center justify-between p-4 bg-white border border-[rgba(10,10,10,0.06)] rounded-[16px] hover:border-[rgba(201,162,39,0.3)] hover:-translate-y-[1px] transition-all">
              <div><div className="text-[14px] font-bold text-[#C9A227]">{w.label}</div><div className="text-[12px] text-[#9CA3AF] font-mono mt-0.5">{w.address.slice(0,6)}...{w.address.slice(-4)}</div></div>
              <button onClick={()=>deleteMutation.mutate(w.address)} className="p-2 text-[#9CA3AF] hover:text-[#DC2626] hover:bg-red-50 rounded-full transition-colors"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
