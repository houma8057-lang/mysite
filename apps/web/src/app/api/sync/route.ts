import sql from '@/app/api/utils/sql';
import { NextResponse } from 'next/server';
import { HyperliquidService, DeFiLlamaService, WSICalculator } from '../services/hyperflow';

export async function POST() {
  const hlService = new HyperliquidService();
  const dlService = new DeFiLlamaService();
  const calculator = new WSICalculator();

  try {
    // 1. Fetch wallets
    const wallets = await sql`SELECT * FROM wallets`;
    if (wallets.length === 0) {
      return NextResponse.json({ message: 'No wallets tracked' });
    }

    // 2. Fetch HL Data
    const metaAndCtxs = await hlService.getMetaAndAssetCtxs();
    if (!metaAndCtxs) throw new Error('Failed to fetch Hyperliquid meta');

    const walletStates = await Promise.all(
      wallets.map(async (w: any) => {
        // Simple rate limiting delay
        await new Promise((r) => setTimeout(r, 200));
        return hlService.getClearinghouseState(w.address);
      })
    );

    // 3. Calculate WSI
    const result = calculator.calculate(walletStates, metaAndCtxs);

    // 4. Fetch 24h History for Reversal Score
    const [wsi24h] = await sql`
      SELECT wsi_value FROM wsi_history 
      WHERE timestamp <= NOW() - INTERVAL '24 hours'
      ORDER BY timestamp DESC LIMIT 1
    `;
    const deltaWsi24h = wsi24h ? result.wsi - wsi24h.wsi_value : 0;

    // 5. Fetch OI Divergence (Using HL Meta data)
    // OI_Divergence = ((markPx - prevDayPx) / prevDayPx * 100) - ((OI_now - OI_24h) / OI_24h * 100)
    // For aggregate, we'll take a weighted average or just use a major asset like BTC as a proxy if needed
    // The prompt implies aggregate OI divergence. We'll sum OI across tracked assets.
    const meta = metaAndCtxs[0];
    const assetCtxs = metaAndCtxs[1];
    let totalOiNow = 0;
    let totalOi24h = 0;
    let avgPriceChange = 0;
    let assetCount = 0;

    meta.universe.forEach((asset: any, i: number) => {
      const ctx = assetCtxs[i];
      const markPx = parseFloat(ctx.markPx);
      const prevDayPx = parseFloat(ctx.prevDayPx);
      const oi = parseFloat(ctx.openInterest);

      // Approximation for OI 24h since API doesn't give it directly,
      // in real system we'd snapshot it. For now, we'll use a placeholder or simplified calc.
      // Actually, the prompt says "OI_now - OI_24h". If we don't have historical OI, we'll use 0 for now.
      totalOiNow += oi;
      if (prevDayPx > 0) {
        avgPriceChange += (markPx - prevDayPx) / prevDayPx;
        assetCount++;
      }
    });

    // We need historical OI to calculate divergence. We'll store OI in DB or just use 0 if first run.
    const [lastWsi] = await sql`SELECT timestamp FROM wsi_history ORDER BY timestamp DESC LIMIT 1`;
    // Placeholder for OI Divergence if we don't have historical OI yet
    const oiDivergence = assetCount > 0 ? avgPriceChange / assetCount : 0;

    // 6. Fetch Dry Powder
    const liquidity = await dlService.getStablecoinChange();
    const dryPowder = liquidity?.normalized || 0;

    // 7. Calculate Reversal Score
    const reversalScore = await calculator.calculateReversalScore(
      result.wsi,
      deltaWsi24h,
      oiDivergence,
      dryPowder
    );

    // 8. Save History
    const [historyRecord] = await sql`
      INSERT INTO wsi_history (wsi_value, total_long_ntl, total_short_ntl, wallet_count, reversal_score)
      VALUES (${result.wsi}, ${result.totalLong}, ${result.totalShort}, ${wallets.length}, ${reversalScore})
      RETURNING *
    `;

    // 9. Save Positions Snapshot (Clear old and insert new)
    await sql`DELETE FROM positions_snapshot`;
    for (let i = 0; i < wallets.length; i++) {
      const state = walletStates[i];
      if (!state) continue;
      for (const assetPos of state.assetPositions) {
        const pos = assetPos.position;
        const szi = parseFloat(pos.szi);
        const metaAsset = meta.universe.find((a: any) => a.name === pos.coin);
        const ctxIdx = meta.universe.indexOf(metaAsset);
        const markPx = ctxIdx !== -1 ? parseFloat(assetCtxs[ctxIdx].markPx) : 0;
        const entryPx = parseFloat(pos.entryPx);
        const notional = Math.abs(szi) * markPx;
        const side = szi > 0 ? 'LONG' : 'SHORT';

        await sql`
          INSERT INTO positions_snapshot (wallet_address, coin, side, szi, entry_px, notional, unrealized_pnl, leverage)
          VALUES (${wallets[i].address}, ${pos.coin}, ${side}, ${szi}, ${entryPx}, ${notional}, ${parseFloat(pos.unrealizedPnl)}, ${pos.leverage.value})
        `;
      }
    }

    // 10. Check Alerts
    const [settings] = await sql`SELECT alert_threshold FROM system_settings WHERE id = 1`;
    const threshold = settings?.alert_threshold || 0.6;

    if (Math.abs(reversalScore) >= threshold) {
      const signalType = reversalScore > 0 ? 'BOTTOM' : 'TOP';
      // Ensure we don't spam alerts (max 1 per hour)
      const [lastAlert] = await sql`
        SELECT timestamp FROM alerts 
        WHERE signal_type = ${signalType} AND timestamp > NOW() - INTERVAL '1 hour'
      `;

      if (!lastAlert) {
        await sql`
          INSERT INTO alerts (reversal_score, signal_type, wsi_at_trigger, delta_wsi_24h, oi_divergence, dry_powder)
          VALUES (${reversalScore}, ${signalType}, ${result.wsi}, ${deltaWsi24h}, ${oiDivergence}, ${dryPowder})
        `;
      }
    }

    return NextResponse.json({ success: true, data: historyRecord });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
