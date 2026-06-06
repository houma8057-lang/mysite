import sql from '@/app/api/utils/sql';

export interface HyperliquidPosition {
  coin: string;
  szi: string;
  entryPx: string;
  positionValue: string;
  unrealizedPnl: string;
  leverage: { type: string; value: number };
}

export interface HyperliquidState {
  assetPositions: { position: HyperliquidPosition }[];
  marginSummary: {
    accountValue: string;
    totalNtlPos: string;
    totalRawUsd: string;
  };
}

export class HyperliquidService {
  private baseUrl = 'https://api.hyperliquid.xyz/info';

  async getClearinghouseState(address: string): Promise<HyperliquidState | null> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'clearinghouseState', user: address }),
      });
      if (!response.ok) throw new Error(`HL API error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching state for ${address}:`, error);
      return null;
    }
  }

  async getMetaAndAssetCtxs(): Promise<[any, any[]] | null> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'metaAndAssetCtxs' }),
      });
      if (!response.ok) throw new Error(`HL API error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching HL meta:', error);
      return null;
    }
  }
}

export class DeFiLlamaService {
  private baseUrl = 'https://api.llama.fi';

  async getStablecoinChange(): Promise<{ netChange: number; normalized: number } | null> {
    try {
      const [ethRes, arbRes] = await Promise.all([
        fetch(`${this.baseUrl}/stablecoincharts/Ethereum`).then((r) => r.json()),
        fetch(`${this.baseUrl}/stablecoincharts/Arbitrum`).then((r) => r.json()),
      ]);

      const getChange = (data: any[]) => {
        if (!data || data.length < 2) return 0;
        const sorted = [...data].sort((a, b) => a.date - b.date);
        const today = sorted[sorted.length - 1].totalCirculatingUSD;
        const yesterday = sorted[sorted.length - 2].totalCirculatingUSD;
        return today - yesterday;
      };

      const ethChange = getChange(ethRes);
      const arbChange = getChange(arbRes);
      const netChange = ethChange + arbChange;

      // Dry_Powder_Normalized = tanh(Net_Change / 100,000,000)
      const normalized = Math.tanh(netChange / 100000000);

      return { netChange, normalized };
    } catch (error) {
      console.error('Error fetching DeFiLlama data:', error);
      return { netChange: 0, normalized: 0 };
    }
  }
}

export class WSICalculator {
  calculate(allWalletStates: (HyperliquidState | null)[], metaAndCtxs: [any, any[]]) {
    const meta = metaAndCtxs[0];
    const assetCtxs = metaAndCtxs[1];
    const priceMap: Record<string, number> = {};

    meta.universe.forEach((asset: any, i: number) => {
      priceMap[asset.name] = parseFloat(assetCtxs[i].markPx);
    });

    let totalLong = 0;
    let totalShort = 0;
    const aggregatedPositions: Record<
      string,
      { coin: string; side: string; notional: number; wallets: number }
    > = {};

    allWalletStates.forEach((state, walletIdx) => {
      if (!state) return;
      state.assetPositions.forEach((assetPos) => {
        const pos = assetPos.position;
        const szi = parseFloat(pos.szi);
        const markPx = priceMap[pos.coin] || 0;
        if (markPx === 0) return;

        const notional = Math.abs(szi) * markPx;
        const side = szi > 0 ? 'LONG' : 'SHORT';

        if (szi > 0) totalLong += notional;
        else if (szi < 0) totalShort += notional;

        const key = `${pos.coin}_${side}`;
        if (!aggregatedPositions[key]) {
          aggregatedPositions[key] = { coin: pos.coin, side, notional: 0, wallets: 0 };
        }
        aggregatedPositions[key].notional += notional;
        aggregatedPositions[key].wallets += 1;
      });
    });

    const total = totalLong + totalShort;
    const wsi = total > 0 ? (totalLong - totalShort) / total : 0;

    return {
      wsi: parseFloat(wsi.toFixed(3)),
      totalLong: parseFloat(totalLong.toFixed(2)),
      totalShort: parseFloat(totalShort.toFixed(2)),
      totalNtl: parseFloat(total.toFixed(2)),
      longPct: total > 0 ? parseFloat(((totalLong / total) * 100).toFixed(1)) : 0,
      shortPct: total > 0 ? parseFloat(((totalShort / total) * 100).toFixed(1)) : 0,
      aggregatedPositions: Object.values(aggregatedPositions),
    };
  }

  async calculateReversalScore(
    currentWsi: number,
    deltaWsi24h: number,
    oiDivergence: number,
    dryPowderNormalized: number
  ) {
    // Reversal Score = 0.5 × (ΔWSI_24h) + 0.3 × (OI_Divergence) + 0.2 × (Dry_Powder_Normalized)
    return 0.5 * deltaWsi24h + 0.3 * oiDivergence + 0.2 * dryPowderNormalized;
  }
}
