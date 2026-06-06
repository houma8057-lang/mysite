import sql from '@/app/api/utils/sql';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const wallets = await sql`SELECT * FROM wallets ORDER BY created_at DESC`;
    return NextResponse.json(wallets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch wallets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { address, label } = await request.json();

    // Validate 0x format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({ error: 'Invalid wallet address format' }, { status: 400 });
    }

    const [newWallet] = await sql`
      INSERT INTO wallets (address, label)
      VALUES (${address.toLowerCase()}, ${label})
      ON CONFLICT (address) DO UPDATE SET label = ${label}
      RETURNING *
    `;

    return NextResponse.json(newWallet);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add wallet' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    await sql`DELETE FROM wallets WHERE address = ${address.toLowerCase()}`;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete wallet' }, { status: 500 });
  }
}
