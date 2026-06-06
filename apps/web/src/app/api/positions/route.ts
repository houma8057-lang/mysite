import sql from '@/app/api/utils/sql';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const positions = await sql`
      SELECT 
        coin, 
        side, 
        SUM(notional) as total_notional, 
        COUNT(DISTINCT wallet_address) as wallet_count
      FROM positions_snapshot
      GROUP BY coin, side
      ORDER BY total_notional DESC
    `;

    // Group by wallet for the detail view
    const rawPositions = await sql`
      SELECT ps.*, w.label 
      FROM positions_snapshot ps
      JOIN wallets w ON ps.wallet_address = w.address
      ORDER BY ps.notional DESC
    `;

    return NextResponse.json({ aggregated: positions, detail: rawPositions });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch positions' }, { status: 500 });
  }
}
