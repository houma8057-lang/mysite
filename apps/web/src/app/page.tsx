'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RefreshCw,
  LayoutDashboard,
  Wallet,
  Settings as SettingsIcon,
  Activity,
  Sliders,
  Download,
  Trash2,
} from 'lucide-react';
import SentimentGauge from '@/components/SentimentGauge';
import WSIHistoryChart from '@/components/WSIHistoryChart';
import WalletManager from '@/components/WalletManager';
import PositionTable from '@/components/PositionTable';
import DryPowderGauge from '@/components/DryPowderGauge';
import OIDivergenceCard from '@/components/OIDivergenceCard';
import ReversalAlert from '@/components/ReversalAlert';
import { toast } from 'sonner';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data: current, isLoading: isSentimentLoading } = useQuery({
    queryKey: ['sentiment', 'current'],
    queryFn: () => fetch('/api/sentiment/current').then((res) => res.json()),
    refetchInterval: 10000,
  });

  const { data: history } = useQuery({
    queryKey: ['sentiment', 'history'],
    queryFn: () => fetch('/api/sentiment/history?days=30').then((res) => res.json()),
    refetchInterval: 60000,
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => fetch('/api/settings').then((res) => res.json()),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings) =>
      fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated');
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: () =>
      fetch('/api/sentiment/history/clear', { method: 'POST' }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sentiment'] });
      toast.success('History cleared');
    },
  });

  const exportCsv = React.useCallback(() => {
    if (!history || history.length === 0) return;
    const headers = 'Timestamp,WSI,Long Notional,Short Notional,Reversal Score\n';
    const rows = history
      .map(
        (h: any) =>
          `${h.timestamp},${h.wsi_value},${h.total_long_ntl},${h.total_short_ntl},${h.reversal_score || 0}`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hyperflow_wsi_history_export.csv`;
    a.click();
  }, [history]);

  const syncMutation = useMutation({
    mutationFn: () => fetch('/api/sync', { method: 'POST' }).then((res) => res.json()),
    onSuccess: (data) => {
      if (data.error) {
        toast.error(`Sync failed: ${data.details || data.error}`);
      } else {
        queryClient.invalidateQueries({ queryKey: ['sentiment'] });
        queryClient.invalidateQueries({ queryKey: ['positions'] });
        toast.success('Terminal synced with Hyperliquid mainnet');
      }
    },
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'wallets':
        return <WalletManager />;
      case 'settings':
        return (
          <div className="space-y-4 pb-24 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="bg-[#FAFAFA] p-6 rounded-[20px] border border-[rgba(10,10,10,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 mb-6">
                <Sliders className="w-5 h-5 text-[#C9A227]" />
                <h2 className="text-[16px] font-bold text-[#0A0A0A]">Alert Configuration</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280]">
                      WSI Alert Threshold
                    </label>
                    <span className="text-[14px] font-bold text-[#C9A227]">
                      {settings?.alert_threshold?.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="0.9"
                    step="0.05"
                    value={settings?.alert_threshold || 0.6}
                    onChange={(e) =>
                      updateSettingsMutation.mutate({ alert_threshold: parseFloat(e.target.value) })
                    }
                    className="w-full h-1.5 bg-[#E5E5E5] rounded-lg appearance-none cursor-pointer accent-[#C9A227]"
                  />
                  <div className="flex justify-between mt-2 text-[10px] font-bold text-[#9CA3AF]">
                    <span>0.30 SENSITIVE</span>
                    <span>0.60 DEFAULT</span>
                    <span>0.90 EXTREME</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#FAFAFA] p-6 rounded-[20px] border border-[rgba(10,10,10,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-4">
                Data Management
              </h2>
              <div className="space-y-3">
                <button
                  onClick={exportCsv}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-white border border-[#0A0A0A] text-[#0A0A0A] font-bold rounded-[12px] hover:bg-[#0A0A0A] hover:text-white transition-all"
                >
                  <Download className="w-4 h-4" /> EXPORT WSI HISTORY (CSV)
                </button>
                <button
                  onClick={() => {
                    if (confirm('Confirm deletion of all historical data?'))
                      clearHistoryMutation.mutate();
                  }}
                  className="w-full h-12 flex items-center justify-center gap-2 bg-white border border-[#DC2626] text-[#DC2626] font-bold rounded-[12px] hover:bg-[#DC2626] hover:text-white transition-all"
                >
                  <Trash2 className="w-4 h-4" /> CLEAR ALL WSI HISTORY
                </button>
              </div>
            </div>

            <div className="bg-[#FAFAFA] p-6 rounded-[20px] border border-[rgba(10,10,10,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-[#6B7280] mb-4">
                System Information
              </h2>
              <div className="space-y-2 text-[13px]">
                <div className="flex justify-between border-b border-[rgba(10,10,10,0.04)] py-2">
                  <span className="text-[#6B7280]">Sentiment Polling</span>
                  <span className="text-[#0A0A0A] font-mono font-medium">10s</span>
                </div>
                <div className="flex justify-between border-b border-[rgba(10,10,10,0.04)] py-2">
                  <span className="text-[#6B7280]">History Snapshot</span>
                  <span className="text-[#0A0A0A] font-mono font-medium">5min</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-[#6B7280]">Data Sources</span>
                  <span className="text-[#0A0A0A] font-mono font-medium text-right">
                    Hyperliquid + DeFiLlama
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      case 'dashboard':
      default:
        return (
          <div className="space-y-4 pb-24">
            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
              <SentimentGauge
                wsi={current?.wsi || 0}
                longPct={current?.long_pct || 0}
                shortPct={current?.short_pct || 0}
                totalNtl={current?.total_ntl || 0}
              />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-100 fill-mode-both">
              <WSIHistoryChart data={history || []} />
            </div>

            <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-bottom-3 duration-500 delay-200 fill-mode-both">
              <DryPowderGauge />
              <OIDivergenceCard />
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 delay-300 fill-mode-both">
              <PositionTable />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white max-w-[430px] mx-auto overflow-x-hidden selection:bg-[#C9A227] selection:text-white">
      <ReversalAlert />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[rgba(10,10,10,0.06)] h-14 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#0A0A0A] rounded-[10px] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#C9A227] opacity-0 group-hover:opacity-10 transition-opacity" />
            <div className="w-4 h-0.5 bg-white rounded-full animate-pulse" />
          </div>
          <div>
            <h1 className="text-[18px] font-bold tracking-tight text-[#0A0A0A]">HyperFlow</h1>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[10px] font-medium text-[#9CA3AF] uppercase tracking-wider">
                {current?.wallet_count || 0} Wallets Tracked
              </span>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-[rgba(5,150,105,0.08)] rounded-full border border-[rgba(5,150,105,0.15)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#059669] animate-pulse" />
                <span className="text-[9px] font-bold text-[#059669] uppercase">Live</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          className={`p-2 rounded-full hover:bg-[rgba(10,10,10,0.04)] transition-all ${syncMutation.isPending ? 'animate-spin' : ''}`}
        >
          <RefreshCw className="w-5 h-5 text-[#C9A227]" />
        </button>
      </header>

      {/* Main Content */}
      <main className="px-4 pt-6">{renderContent()}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] h-16 bg-white/95 backdrop-blur-lg border-t border-[rgba(10,10,10,0.08)] flex items-center justify-around px-8 z-40">
        <NavButton
          active={activeTab === 'dashboard'}
          onClick={() => setActiveTab('dashboard')}
          icon={<LayoutDashboard size={22} />}
          label="Terminal"
        />
        <NavButton
          active={activeTab === 'wallets'}
          onClick={() => setActiveTab('wallets')}
          icon={<Wallet size={22} />}
          label="Wallets"
        />
        <NavButton
          active={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
          icon={<SettingsIcon size={22} />}
          label="System"
        />
      </nav>

      {/* Animation Definitions */}
      <style jsx global>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: slideInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .delay-100 {
          animation-delay: 100ms;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
        .fill-mode-both {
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all relative ${active ? 'text-[#C9A227]' : 'text-[#9CA3AF]'}`}
    >
      {active && (
        <div className="absolute -top-6 w-1 h-1 bg-[#C9A227] rounded-full shadow-[0_0_8px_rgba(201,162,39,0.8)]" />
      )}
      <div className={`${active ? 'scale-110' : 'scale-100'} transition-transform`}>{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}
