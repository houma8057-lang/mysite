import { useQuery } from '@tanstack/react-query';
import { Shield } from 'lucide-react';
import { api } from '../lib/api';

export default function WalletManager() {
  const { data: wallets, isLoading } = useQuery({ queryKey: ['wallets'], queryFn: api.getWallets });

  return (
    <div className="bg-[#0d0d1a] rounded-2xl border border-[rgba(255,255,255,0.06)] shadow-lg overflow-hidden">
      <div className="p-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-[#C9A227]"/>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a]">Tracked Smart Wallets</h2>
        </div>
        <p className="text-[12px] text-[#4a4a6a]">{wallets?.length||0} wallets monitored · Read only</p>
      </div>
      <div className="px-5 pb-5">
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="w-6 h-6 border-2 border-[#C9A227] border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : !wallets?.length ? (
          <div className="py-8 text-center">
            <p className="text-[13px] text-[#4a4a6a]">No wallets tracked.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {wallets.map((w: {address: string; label: string}) => (
              <div key={w.address} className="flex items-center justify-between p-4 bg-[#1a1a2e] border border-[rgba(255,255,255,0.04)] rounded-xl">
                <div>
                  <div className="text-[14px] font-bold text-[#C9A227]">{w.label}</div>
                  <div className="text-[12px] text-[#4a4a6a] font-mono">••••••••••••••••••••</div>
                </div>
                <div className="text-[11px] text-[#4a4a6a] bg-[#0d0d1a] px-2 py-1 rounded-lg">Smart Money</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
