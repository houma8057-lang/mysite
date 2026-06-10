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
      <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] shadow-lg">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a] mb-4">WSI Alert Threshold</h2>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-semibold text-[#4a4a6a]">Threshold</span>
          <span className="text-[13px] font-bold text-[#C9A227]">{currentThreshold.toFixed(2)}</span>
        </div>
        <input type="range" min={0.30} max={0.90} step={0.05} value={currentThreshold} onChange={(e)=>setThreshold(parseFloat(e.target.value))} className="w-full h-1.5 rounded-full appearance-none cursor-pointer" style={{accentColor:'#C9A227'}}/>
        <div className="flex justify-between mt-2 text-[10px] font-medium text-[#4a4a6a]">
          <span>0.30 Sensitive</span>
          <span>0.60 Default</span>
          <span>0.90 Extreme</span>
        </div>
        <button onClick={()=>updateMutation.mutate({alert_threshold:currentThreshold})} className="w-full h-10 bg-[#C9A227] hover:bg-[#b8911f] text-[#0a0a0f] font-bold rounded-xl mt-4 transition-colors">Save Threshold</button>
      </div>
      <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] shadow-lg">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a] mb-4">System Info</h2>
        <div className="space-y-3">
          {rows.map(([k,v])=>(
            <div key={k} className="flex items-center justify-between">
              <span className="text-[13px] text-[#4a4a6a]">{k}</span>
              <span className="text-[13px] font-medium text-white">{v}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#0d0d1a] p-5 rounded-2xl border border-[rgba(255,255,255,0.06)] shadow-lg">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a] mb-4">Data Management</h2>
        <div className="space-y-3">
          <button onClick={()=>{toast.info('CSV export coming soon')}} className="w-full h-10 bg-[#1a1a2e] border border-[rgba(255,255,255,0.06)] text-white font-semibold rounded-xl hover:border-[rgba(201,162,39,0.3)] transition-colors">Export WSI History (CSV)</button>
          <button onClick={()=>{if(confirm('Clear history — coming soon?'))toast.info('Coming soon')}} className="w-full h-10 bg-[rgba(220,38,38,0.1)] border border-[rgba(220,38,38,0.2)] text-[#DC2626] font-semibold rounded-xl hover:bg-[rgba(220,38,38,0.15)] transition-colors">Clear All WSI History</button>
        </div>
      </div>
    </div>
  );
}
