const API_BASE = 'https://hyperflow-backend-3l62.onrender.com';

const fetchWithFallback = async (url: string, fallback: any, timeout = 10000) => {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const r = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!r.ok) return fallback;
    return await r.json();
  } catch {
    return fallback;
  }
};

const DEFAULTS = {
  sentiment: { wsi: 0, long_pct: 0, short_pct: 0, total_ntl: 0, wallet_count: 0 },
  history: [],
  positions: { summary: [], detail: [] },
  liquidity: { dry_powder_pct: 35.2, total_oi: 0, total_volume: 0, oi_volume_ratio: 1.0 },
  settings: { alert_threshold: 0.60 },
  wallets: [],
  regime: { regime: 'NEUTRAL', score: 0, confidence: 0, active_dimensions: 0, dimensions: {}, raw_wsi: 0, timestamp: '', recommendation: 'NEUTRAL — Loading...' },
};

export const api = {
  getWallets: () => fetchWithFallback(`${API_BASE}/api/wallets`, DEFAULTS.wallets),
  addWallet: (address: string, label: string) => fetch(`${API_BASE}/api/wallets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, label })
  }).then(async r => {
    if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Failed'); }
    return r.json();
  }),
  deleteWallet: (address: string) => fetch(`${API_BASE}/api/wallets/${address}`, { method: 'DELETE' }).then(r => r.json()),
  getSentiment: () => fetchWithFallback(`${API_BASE}/api/sentiment/current`, DEFAULTS.sentiment),
  getHistory: (days = 30) => fetchWithFallback(`${API_BASE}/api/sentiment/history?days=${days}`, DEFAULTS.history),
  getPositions: () => fetchWithFallback(`${API_BASE}/api/positions`, DEFAULTS.positions),
  getAlerts: () => fetchWithFallback(`${API_BASE}/api/alerts?limit=50`, []),
  getLiquidity: () => fetchWithFallback(`${API_BASE}/api/liquidity`, DEFAULTS.liquidity),
  getSettings: () => fetchWithFallback(`${API_BASE}/api/settings`, DEFAULTS.settings),
  updateSettings: (data: object) => fetch(`${API_BASE}/api/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  getRegime: () => fetchWithFallback(`${API_BASE}/api/regime/current`, DEFAULTS.regime),
};
