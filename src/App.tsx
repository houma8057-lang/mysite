import { useState, useEffect } from 'react';
import ReversalScoreCard from './components/ReversalScoreCard';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-6">
      <div className="w-16 h-16 bg-[#C9A227] rounded-2xl flex items-center justify-center">
        <svg width="32" height="26" viewBox="0 0 18 14" fill="none">
          <path d="M1 13L6 2L9 8L12 4L17 13" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <div className="text-center">
        <div className="text-[24px] font-bold text-white mb-1">HyperFlow</div>
        <div className="text-[13px] text-[#4a4a6a]">Loading smart money data...</div>
      </div>
      <div className="flex gap-1.5">
        <div className="w-2 h-2 rounded-full bg-[#C9A227] smooth-bounce" style={{animationDelay:'0ms'}}/>
        <div className="w-2 h-2 rounded-full bg-[#C9A227] smooth-bounce" style={{animationDelay:'150ms'}}/>
        <div className="w-2 h-2 rounded-full bg-[#C9A227] smooth-bounce" style={{animationDelay:'300ms'}}/>
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
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="sticky top-0 z-50 h-14 bg-[#0d0d1a] border-b border-[rgba(255,255,255,0.06)] flex items-center px-4">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C9A227] rounded-[10px] flex items-center justify-center">
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none"><path d="M1 13L6 2L9 8L12 4L17 13" stroke="#0a0a0f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <div>
              <div className="text-[20px] font-bold text-white leading-tight tracking-tight">HyperFlow</div>
              <div className="text-[10px] font-medium text-[#4a4a6a] uppercase tracking-[0.08em] mt-0.5">Smart Money Tracker</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-[rgba(5,150,105,0.1)] border border-[rgba(5,150,105,0.2)] rounded-full px-2.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#059669] live-dot" />
            <span className="text-[11px] font-semibold text-[#059669]">LIVE</span>
          </div>
        </div>
      </header>

      <div className="w-full max-w-6xl mx-auto px-4 pt-4 pb-8">
        <ReversalScoreCard />
      </div>
    </div>
  );
}
