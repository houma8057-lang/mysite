import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart2, Wallet, Activity, Settings } from 'lucide-react';
import { Toaster } from 'sonner';
import { api } from './lib/api';
import SentimentGauge from './components/SentimentGauge';
import WSIHistoryChart from './components/WSIHistoryChart';
import WalletManager from './components/WalletManager';
import PositionTable from './components/PositionTable';
import DryPowderGauge from './components/DryPowderGauge';
import OIDivergenceCard from './components/OIDivergenceCard';
import ReversalAlert from './components/ReversalAlert';
import SettingsPage from './components/SettingsPage';
type Tab = 'dashboard'|'wallets'|'positions'|'settings';
function Skeleton({ h='h-48' }: { h?: string }) { return <div className={`skeleton ${h} rounded-[20px]`} />; }
function DashboardPage() {
  const { data: s, isLoading: ls } = useQuery({ queryKey: ['sentiment'], queryFn: api.getSentiment, refetchInterval: 10000 });
  const { data: h, isLoading: lh } = useQuery({ queryKey: ['history'], queryFn: () => api.getHistory(30), refetchInterval: 60000 });
  return (
    <div className="space-y-3">
      {ls ? <Skeleton h="h-72" /> : <SentimentGauge wsi={s?.wsi??0} longPct={s?.long_pct??0} shortPct={s?.short_pct??0} totalNtl={s?.total_ntl??0} />}
      {lh ? <Skeleton h="h-[300px]" /> : <WSIHistoryChart data={h??[]} />}
      <div className="grid grid-cols-2 gap-3"><DryPowderGauge /><OIDivergenceCard /></div>
    </div>
  );
}
const NAV = [
  { id:'dashboard' as Tab, label:'Dashboard', Icon:BarChart2 },
  { id:'wallets' as Tab, label:'Wallets', Icon:Wallet },
  { id:'positions' as Tab, label:'Positions', Icon:Activity },
  { id:'settings' as Tab, label:'Settings', Icon:Settings },
];
export default function App() {
  const [tab, setTab] = useState<Tab>('dashboard');
  const { data: wallets } = useQuery({ queryKey: ['wallets'], queryFn: api.getWallets });
  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" richColors />
      <ReversalAlert />
      <header className="sticky top-0 z-50 h-14 bg-white border-b border-[rgba(10,10,10,0.06)] flex items-center px-4">
        <div className="max-w-[430px] mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#0A0A0A] rounded-[10px] flex items-center justify-center">
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M1 13L6 2L9 8L12 4L17 13" stroke="#C9A227" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div className="text-[20px] font-bold text-[#0A0A0A] leading-none tracking-tight">HyperFlow</div>
              <div className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-[0.08em]">{wallets?.length??0} WALLETS TRACKED</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-[rgba(5,150,105,0.1)] border border-[rgba(5,150,105,0.2)] rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] live-dot" />
            <span className="text-[11px] font-semibold text-[#059669]">LIVE</span>
          </div>
        </div>
      </header>
      <main className="max-w-[430px] mx-auto px-4 pt-4 pb-24">
        {tab==='dashboard' && <DashboardPage />}
        {tab==='wallets' && <WalletManager />}
        {tab==='positions' && <PositionTable />}
        {tab==='settings' && <SettingsPage />}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur border-t border-[rgba(10,10,10,0.08)] z-50">
        <div className="max-w-[430px] mx-auto h-full flex items-center justify-around px-2">
          {NAV.map(({ id, label, Icon }) => {
            const active = tab===id;
            return (
              <button key={id} onClick={() => setTab(id)} className="flex flex-col items-center gap-1 min-w-[60px] py-1 relative">
                {active && <span className="absolute -top-4 w-6 h-1 rounded-full bg-[#C9A227]" style={{boxShadow:'0 0 8px rgba(201,162,39,0.4)'}} />}
                <Icon className="w-5 h-5" style={{color:active?'#C9A227':'#9CA3AF'}} />
                <span className="text-[10px] font-semibold" style={{color:active?'#C9A227':'#9CA3AF'}}>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
