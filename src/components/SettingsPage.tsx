import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { toast } from 'sonner';
export default function SettingsPage() {
  const qc = useQueryClient();
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: api.getSettings });
  const [threshold, setThreshold] = useState<number|null>(null);
  const updateMutation = useMutation({ mutationFn: api.updateSettings, onSuccess: () => { qc.invalidateQueries({ queryKey: ['settings'] }); toast.success('Settings saved'); } });
  const currentThreshold = threshold??settings?.alert_threshold??0.60;
  const rows = [['Sentiment polling','10s'],['History chart','60s'],['Position data','10s'],['Alert check','30s'],['Dry Powder','60s'],['WSI snapshot','5min'],['Data source','Hyperliquid + DeFiLlama']];
  return (
    <div className="space-y-4">
      <div className="bg-[#FAFAFA] p-5 rounded-[20px] border border-[rgba(10,10,10,0.08)]">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280] mb-4">WSI Alert Threshold</h2>
        <div className="mb-4"><div className="flex justify-between text-[13px] font-semibold text-[#0A0A0A] mb-2"><span>Threshold</span><span className="text-[#C9A227] font-mono">{currentThreshold.toFixed(2)}</span></div><input type="range" min={0.30} max={0.90} step={0.05} value={currentThreshold} onChange={e=>setThreshold(parseFloat(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{accentColor:'#C9A227'}}/><div className="flex justify-between mt-2 text-[10px] text-[#9CA3AF] font-medium"><span>0.30 Sensitive</span><span>0.60 Default</span><span>0.90 Extreme</span></div></div>
        <button onClick={()=>updateMutation.mutate({alert_threshold:currentThreshold})} className="w-full h-10 bg-[#0A0A0A] hover:bg-[#1F1F1F] text-white text-[13px] font-semibold rounded-[12px] transition-colors">Save Threshold</button>
      </div>
      <div className="bg-[#FAFAFA] p-5 rounded-[20px] border border-[rgba(10,10,10,0.08)]"><h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280] mb-4">System Info</h2><div className="space-y-3">{rows.map(([l,v])=>(<div key={l} className="flex items-center justify-between"><span className="text-[13px] text-[#6B7280]">{l}</span><span className="text-[13px] font-medium text-[#0A0A0A] font-mono">{v}</span></div>))}</div></div>
      <div className="bg-[#FAFAFA] p-5 rounded-[20px] border border-[rgba(10,10,10,0.08)]"><h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280] mb-4">Data Management</h2><div className="space-y-2"><button onClick={()=>toast.info('CSV export coming soon')} className="w-full h-10 bg-white border border-[#0A0A0A] text-[#0A0A0A] text-[13px] font-semibold rounded-[12px] hover:bg-[#0A0A0A] hover:text-white transition-colors">Export WSI History (CSV)</button><button onClick={()=>toast.error('Clear history — coming soon')} className="w-full h-10 bg-white border border-[#DC2626] text-[#DC2626] text-[13px] font-semibold rounded-[12px] hover:bg-[#DC2626] hover:text-white transition-colors">Clear All WSI History</button></div></div>
    </div>
  );
}
