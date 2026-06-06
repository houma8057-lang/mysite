import sql from '@/app/api/utils/sql';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await sql`DELETE FROM wsi_history`;
    await sql`DELETE FROM alerts`;
    await sql`DELETE FROM positions_snapshot`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear history' }, { status: 500 });
  }
}
