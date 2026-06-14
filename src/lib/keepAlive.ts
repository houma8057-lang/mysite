const BACKEND_URL = 'https://hyperflow-backend-3l62.onrender.com';
const INTERVAL = 14 * 60 * 1000;

export function startKeepAlive() {
  const ping = async () => {
    try {
      await fetch(`${BACKEND_URL}/`);
      console.log('Keep-alive ping sent');
    } catch (e) {
      console.log('Keep-alive failed:', e);
    }
  };
  ping();
  setInterval(ping, INTERVAL);
}
