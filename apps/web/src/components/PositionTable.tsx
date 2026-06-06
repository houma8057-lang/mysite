'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function PositionTable() {
  const { data, isLoading } = useQuery({
    queryKey: ['positions'],
    queryFn: () => fetch('/api/positions').then((res) => res.json()),
    refetchInterval: 10000,
  });

  const [expandedWallets, setExpandedWallets] = useState<Record<string, boolean>>({});

  const toggleWallet = (address: string) => {
    setExpandedWallets((prev) => ({ ...prev, [address]: !prev[address] }));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full rounded-[20px]" />;
  }

  // Group by wallet address
  const walletGroups = (data?.detail || []).reduce((acc: any, pos: any) => {
    if (!acc[pos.wallet_address]) {
      acc[pos.wallet_address] = {
        label: pos.label,
        address: pos.wallet_address,
        positions: [],
        totalValue: 0,
      };
    }
    acc[pos.wallet_address].positions.push(pos);
    acc[pos.wallet_address].totalValue += pos.notional;
    return acc;
  }, {});

  const sortedWallets = Object.values(walletGroups).sort(
    (a: any, b: any) => b.totalValue - a.totalValue
  );

  return (
    <div className="bg-[#FAFAFA] rounded-[20px] border border-[rgba(10,10,10,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
      <div className="p-5 border-bottom border-[rgba(10,10,10,0.04)]">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
          Whale Positions
        </h2>
        <p className="text-[12px] text-[#9CA3AF] mt-1 font-medium">
          {sortedWallets.length} wallets · {(data?.detail || []).length} positions
        </p>
      </div>

      <div className="max-h-[500px] overflow-y-auto">
        {sortedWallets.length === 0 ? (
          <div className="p-10 text-center text-[13px] text-[#9CA3AF]">
            No active positions detected
          </div>
        ) : (
          sortedWallets.map((wallet: any) => (
            <div
              key={wallet.address}
              className="border-b border-[rgba(10,10,10,0.04)] last:border-0"
            >
              <button
                onClick={() => toggleWallet(wallet.address)}
                className="w-full flex items-center justify-between p-4 hover:bg-[rgba(10,10,10,0.02)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`transition-transform duration-200 ${expandedWallets[wallet.address] ? 'rotate-180' : ''}`}
                  >
                    <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                  </div>
                  <div className="text-left">
                    <div className="text-[14px] font-bold text-[#0A0A0A]">{wallet.label}</div>
                    <div className="text-[11px] text-[#9CA3AF] font-mono leading-none mt-0.5">
                      {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                    </div>
                  </div>
                </div>
                <div className="text-[14px] font-bold text-[#0A0A0A]">
                  {formatCurrency(wallet.totalValue)}
                </div>
              </button>

              {expandedWallets[wallet.address] && (
                <div className="bg-white px-4 pb-4">
                  <div className="space-y-1 pt-2">
                    {wallet.positions.map((pos: any, idx: number) => (
                      <div
                        key={`${pos.coin}_${idx}`}
                        className="flex items-center justify-between py-2.5 border-b border-[rgba(10,10,10,0.03)] last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[14px] font-bold text-[#0A0A0A] min-w-[50px]">
                            {pos.coin}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded-[6px] border-none ${
                              pos.side === 'LONG'
                                ? 'bg-[rgba(5,150,105,0.1)] text-[#059669]'
                                : 'bg-[rgba(220,38,38,0.1)] text-[#DC2626]'
                            }`}
                          >
                            {pos.side}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-[13px] font-bold text-[#0A0A0A] font-mono">
                            {formatCurrency(pos.notional)}
                          </div>
                          <div className="text-[10px] text-[#9CA3AF] font-medium">
                            {pos.leverage}x Leverage
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
