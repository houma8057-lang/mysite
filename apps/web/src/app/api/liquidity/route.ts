import sql from '@/app/api/utils/sql';
import { NextResponse } from 'next/server';
import { DeFiLlamaService } from '../services/hyperflow';

export async function GET() {
  const dlService = new DeFiLlamaService();
  try {
    const liquidity = await dlService.getStablecoinChange();
    if (!liquidity) {
      return NextResponse.json({ dry_powder_pct: 0, status: 'error', message: 'API unavailable' });
    }
    return NextResponse.json({
      dry_powder_pct: parseFloat((liquidity.normalized * 100).toFixed(1)),
      net_change: liquidity.netChange,
      status: 'ok',
    });
  } catch (error) {
    return NextResponse.json({ dry_powder_pct: 0, status: 'error', message: 'API unavailable' });
  }
}
