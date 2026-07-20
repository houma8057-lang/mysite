import { useState, useEffect } from 'react';
import DepthGauge from './components/DepthGauge';

const COLORS = {
  bgBase: '#0A0E17',
  bgCard: '#141B2E',
  buy: '#00C896',
  steel: '#5B6B85',
};

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: COLORS.bgBase }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: COLORS.buy }}>
        <svg width="32" height="26" viewBox="0 0 18 14" fill="none">
          <path d="M1 13L6 2L9 8L12 4L17 13" stroke={COLORS.bgBase} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="text-center">
        <div className="text-[22px] font-bold text-white mb-1 font-mono">HYPERFLOW</div>
        <div className="text-[12px] font-sans" style={{ color: COLORS.steel }}>Calibrating depth gauge...</div>
      </div>
      <div className="flex gap-1.5">
        <div className="w-2 h-2 rounded-full smooth-bounce" style={{ background: COLORS.buy, animationDelay: '0ms' }}/>
        <div className="w-2 h-2 rounded-full smooth-bounce" style={{ background: COLORS.buy, animationDelay: '150ms' }}/>
        <div className="w-2 h-2 rounded-full smooth-bounce" style={{ background: COLORS.buy, animationDelay: '300ms' }}/>
      </div>
    </div>
  );
}

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen" style={{ background: COLORS.bgBase }}>
      <header className="sticky top-0 z-50 h-14 flex items-center px-4 border-b" style={{ background: COLORS.bgCard, borderColor: 'rgba(91,107,133,0.15)' }}>
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: COLORS.buy }}>
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M1 13L6 2L9 8L12 4L17 13" stroke={COLORS.bgBase} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div className="text-[18px] font-bold text-white leading-tight font-mono tracking-tight">HYPERFLOW</div>
              <div className="text-[9px] font-sans uppercase tracking-[0.15em]" style={{ color: COLORS.steel }}>Smart Money Terminal</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 border" style={{ background: 'rgba(0,200,150,0.08)', borderColor: 'rgba(0,200,150,0.25)' }}>
            <span className="w-1.5 h-1.5 rounded-full live-dot" style={{ background: COLORS.buy }} />
            <span className="text-[10px] font-mono font-semibold" style={{ color: COLORS.buy }}>LIVE</span>
          </div>
        </div>
      </header>

      <div className="w-full max-w-6xl mx-auto px-4 pt-4 pb-8">
        <DepthGauge />
      </div>
    </div>
  );
}
