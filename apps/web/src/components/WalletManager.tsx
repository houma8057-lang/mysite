'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function WalletManager() {
  const [address, setAddress] = useState('');
  const [label, setLabel] = useState('');
  const queryClient = useQueryClient();

  const { data: wallets, isLoading } = useQuery({
    queryKey: ['wallets'],
    queryFn: () => fetch('/api/wallets').then((res) => res.json()),
  });

  const addWalletMutation = useMutation({
    mutationFn: (newWallet: { address: string; label: string }) =>
      fetch('/api/wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newWallet),
      }).then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to add wallet');
        }
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      setAddress('');
      setLabel('');
      toast.success('Wallet added successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteWalletMutation = useMutation({
    mutationFn: (addr: string) =>
      fetch(`/api/wallets?address=${addr}`, { method: 'DELETE' }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      toast.success('Wallet removed');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    addWalletMutation.mutate({ address, label: label || 'Unnamed Whale' });
  };

  return (
    <Card className="bg-[#FAFAFA] border-[rgba(10,10,10,0.08)] rounded-[20px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#C9A227]" />
          <CardTitle className="text-[16px] font-bold text-[#0A0A0A]">
            TRACKED SMART WALLETS
          </CardTitle>
        </div>
        <p className="text-[12px] text-[#9CA3AF] font-medium mt-1">
          {wallets?.length || 0} wallets monitored · Manual mode only
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3 mb-6">
          <Input
            placeholder="Address (0x...)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="bg-white border-[rgba(10,10,10,0.12)] rounded-[12px] h-11 focus-visible:ring-[#C9A227] focus-visible:ring-offset-0 focus-visible:border-[#C9A227]"
          />
          <div className="flex gap-2">
            <Input
              placeholder="Label (e.g. Whale A)"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="bg-white border-[rgba(10,10,10,0.12)] rounded-[12px] h-11 focus-visible:ring-[#C9A227] focus-visible:ring-offset-0"
            />
            <Button
              type="submit"
              disabled={addWalletMutation.isPending}
              className="bg-[#0A0A0A] hover:bg-[#1F1F1F] text-white rounded-[12px] h-11 px-6 font-semibold transition-all active:scale-[0.98]"
            >
              {addWalletMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ADD'}
            </Button>
          </div>
        </form>

        <div className="space-y-2">
          {isLoading ? (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-[#C9A227]" />
            </div>
          ) : wallets?.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[13px] text-[#9CA3AF]">
                No wallets tracked. Add elite whale addresses above.
              </p>
            </div>
          ) : (
            wallets?.map((wallet: any) => (
              <div
                key={wallet.address}
                className="flex items-center justify-between p-4 bg-white border border-[rgba(10,10,10,0.06)] rounded-[16px] transition-all hover:border-[rgba(201,162,39,0.3)] hover:-translate-y-[1px]"
              >
                <div>
                  <div className="text-[14px] font-bold text-[#C9A227] uppercase">
                    {wallet.label}
                  </div>
                  <div className="text-[12px] text-[#9CA3AF] font-mono mt-0.5">
                    {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteWalletMutation.mutate(wallet.address)}
                  className="text-[#9CA3AF] hover:text-[#DC2626] hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
