import sql from '@/app/api/utils/sql';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [settings] = await sql`SELECT * FROM system_settings WHERE id = 1`;
    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { alert_threshold, polling_interval, history_days } = await request.json();

    const [updated] = await sql`
      UPDATE system_settings 
      SET 
        alert_threshold = COALESCE(${alert_threshold}, alert_threshold),
        polling_interval = COALESCE(${polling_interval}, polling_interval),
        history_days = COALESCE(${history_days}, history_days)
      WHERE id = 1
      RETURNING *
    `;

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
