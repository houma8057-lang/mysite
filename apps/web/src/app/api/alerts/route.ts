import sql from '@/app/api/utils/sql';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const alerts = await sql`
      SELECT * FROM alerts 
      ORDER BY timestamp DESC 
      LIMIT 50
    `;
    return NextResponse.json(alerts);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}
