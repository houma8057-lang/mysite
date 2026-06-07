const API_BASE = "https://hyperflow-backend-3l62.onrender.com";

export const api = {
  getWallets: () => fetch(`${API_BASE}/api/wallets`).then(r => r.json()),
  addWallet: (address: string, label: string) => fetch(`${API_BASE}/api/wallets`, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({address, label})}).then(r => r.json()),
  deleteWallet: (address: string) => fetch(`${API_BASE}/api/wallets/${address}`, {method: "DELETE"}).then(r => r.json()),
  getSentiment: () => fetch(`${API_BASE}/api/sentiment/current`).then(r => r.json()),
  getHistory: (days = 30) => fetch(`${API_BASE}/api/sentiment/history?days=${days}`).then(r => r.json()),
  getPositions: () => fetch(`${API_BASE}/api/positions`).then(r => r.json()),
  getAlerts: () => fetch(`${API_BASE}/api/alerts`).then(r => r.json()),
  getLiquidity: () => fetch(`${API_BASE}/api/liquidity`).then(r => r.json()),
  getSettings: () => fetch(`${API_BASE}/api/settings`).then(r => r.json()),
  updateSettings: (data: object) => fetch(`${API_BASE}/api/settings`, {method: "PUT", headers: {"Content-Type": "application/json"}, body: JSON.stringify(data)}).then(r => r.json()),
};
