import sql from '@/app/api/utils/sql';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const history = await sql`
      SELECT * FROM wsi_history 
      WHERE timestamp > NOW() - (INTERVAL '1 day' * ${days})
      ORDER BY timestamp ASC
    `;

    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
