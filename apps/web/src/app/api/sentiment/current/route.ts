import sql from '@/app/api/utils/sql';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [latest] = await sql`
      SELECT * FROM wsi_history 
      ORDER BY timestamp DESC LIMIT 1
    `;

    if (!latest) {
      return NextResponse.json({ message: 'No data available' }, { status: 404 });
    }

    const [wallets] = await sql`SELECT count(*) FROM wallets`;

    // Add long/short pct for UI
    const total = latest.total_long_ntl + latest.total_short_ntl;
    const result = {
      ...latest,
      wsi: parseFloat(latest.wsi_value.toFixed(3)),
      long_pct: total > 0 ? parseFloat(((latest.total_long_ntl / total) * 100).toFixed(1)) : 0,
      short_pct: total > 0 ? parseFloat(((latest.total_short_ntl / total) * 100).toFixed(1)) : 0,
      total_ntl: total,
      wallet_count: parseInt(wallets.count),
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sentiment' }, { status: 500 });
  }
}
