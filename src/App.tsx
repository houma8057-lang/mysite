import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { BarChart2, Wallet, Activity, Settings } from 'lucide-react';
import { api } from './lib/api';
import SentimentGauge from './components/SentimentGauge';
import WSIHistoryChart from './components/WSIHistoryChart';
import DryPowderGauge from './components/DryPowderGauge';
import OIDivergenceCard from './components/OIDivergenceCard';
import WalletManager from './components/WalletManager';
import PositionTable from './components/PositionTable';
import ReversalAlert from './components/ReversalAlert';
import SettingsPage from './components/SettingsPage';

type Tab = 'dashboard'|'wallets'|'positions'|'settings';
function Skeleton({ h='h-48' }: { h?: string }) { return <div className={`skeleton ${h} rounded-2xl`} />; }

function DashboardPage() {
  const { data: s, isLoading: ls } = useQuery({ queryKey: ['sentiment'], queryFn: api.getSentiment, refetchInterval: 10000 });
  const { data: h, isLoading: lh } = useQuery({ queryKey: ['history'], queryFn: () => api.getHistory(30), refetchInterval: 60000 });
  return (
    <div className="space-y-4">
      {ls ? <Skeleton h="h-72" /> : <SentimentGauge wsi={s?.wsi??0} longPct={s?.long_pct??0} shortPct={s?.short_pct??0} totalNtl={s?.total_ntl??0} />}
      {lh ? <Skeleton h="h-[300px]" /> : <WSIHistoryChart data={h??[]} />}
      <div className="grid grid-cols-2 gap-4"><DryPowderGauge /><OIDivergenceCard /></div>
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
    <div className="min-h-screen bg-[#0a0a0f]">
      <Toaster position="top-center" />
      <ReversalAlert />
      <header className="sticky top-0 z-50 h-14 bg-[#0d0d1a] border-b border-[rgba(255,255,255,0.06)] flex items-center px-4">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C9A227] rounded-[10px] flex items-center justify-center">
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M1 13L6 2L9 8L12 4L17 13" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div className="text-[20px] font-bold text-white leading-none tracking-tight">HyperFlow</div>
              <div className="text-[10px] font-medium text-[#4a4a6a] uppercase tracking-[0.08em]">{wallets?.length??0} WALLETS TRACKED</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-[rgba(5,150,105,0.1)] border border-[rgba(5,150,105,0.2)] rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] live-dot" />
            <span className="text-[11px] font-semibold text-[#059669]">LIVE</span>
          </div>
        </div>
      </header>

      <div className="w-full max-w-6xl mx-auto px-4 pt-4 pb-24">
        <div className="lg:grid lg:grid-cols-4 lg:gap-6">
          <nav className="hidden lg:flex lg:flex-col gap-1 pt-1">
            {NAV.map(({ id, label, Icon }) => {
              const active = tab===id;
              return (
                <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? 'bg-[#C9A227] text-[#0a0a0f]' : 'text-[#6b6b8a] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'}`}>
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </nav>
          <main className="lg:col-span-3">
            {tab==='dashboard' && <DashboardPage />}
            {tab==='wallets' && <WalletManager />}
            {tab==='positions' && <PositionTable />}
            {tab==='settings' && <SettingsPage />}
          </main>
        </div>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0d0d1a]/95 backdrop-blur border-t border-[rgba(255,255,255,0.06)] z-50">
        <div className="h-full flex items-center justify-around px-2">
          {NAV.map(({ id, label, Icon }) => {
            const active = tab===id;
            return (
              <button key={id} onClick={() => setTab(id)} className="flex flex-col items-center gap-1 min-w-[60px] py-1 relative">
                {active && <span className="absolute -top-4 w-6 h-1 rounded-full bg-[#C9A227]" />}
                <Icon className="w-5 h-5" style={{color:active?'#C9A227':'#4a4a6a'}} />
                <span className="text-[10px] font-semibold" style={{color:active?'#C9A227':'#4a4a6a'}}>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
