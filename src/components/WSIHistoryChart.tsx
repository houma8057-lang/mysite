import { useMemo } from 'react';
import { AreaChart,Area,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,ReferenceLine } from 'recharts';
import { format } from 'date-fns';
interface Props { data: { timestamp: string; wsi_value: number }[]; }
export default function WSIHistoryChart({ data }: Props) {
  const chartData = useMemo(() => !data?[]:(data.map(d=>({...d,time:format(new Date(d.timestamp),'MMM d HH:mm')}))), [data]);
  if (!data||data.length<2) return (
    <div className="h-[280px] w-full flex items-center justify-center bg-[#0d0d1a] rounded-2xl border border-[rgba(255,255,255,0.06)]">
      <div className="text-center"><p className="text-[12px] font-medium text-[#4a4a6a] tracking-wider">Collecting 30-day momentum data...</p><p className="text-[11px] text-[#4a4a6a] mt-1">Check back in 5 minutes</p></div>
    </div>
  );
  return (
    <div className="bg-[#0d0d1a] p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] shadow-lg">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#4a4a6a] mb-6">30-Day Sentiment Momentum</h2>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{top:10,right:10,left:-20,bottom:0}}>
            <defs><linearGradient id="wsiGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#C9A227" stopOpacity={0.15}/><stop offset="95%" stopColor="#C9A227" stopOpacity={0.02}/></linearGradient></defs>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" vertical={false}/>
            <XAxis dataKey="time" tick={{fill:'#4a4a6a',fontSize:10}} axisLine={false} tickLine={false} minTickGap={30}/>
            <YAxis domain={[-1,1]} tick={{fill:'#4a4a6a',fontSize:10}} axisLine={false} tickLine={false} ticks={[-1,-0.6,0,0.6,1]}/>
            <Tooltip contentStyle={{backgroundColor:'#0d0d1a',borderRadius:'12px',border:'1px solid rgba(255,255,255,0.08)',padding:'12px'}} labelStyle={{color:'#4a4a6a',fontSize:'11px'}} itemStyle={{color:'#C9A227',fontSize:'16px',fontWeight:700}} formatter={(v:number)=>[v.toFixed(3),'WSI']}/>
            <ReferenceLine y={0} stroke="#2a2a3a" strokeDasharray="6 4" label={{value:'NEUTRAL',position:'right',fontSize:9,fill:'#4a4a6a'}}/>
            <ReferenceLine y={0.6} stroke="#059669" strokeDasharray="6 4" label={{value:'BOTTOM',position:'right',fontSize:9,fill:'#059669'}}/>
            <ReferenceLine y={-0.6} stroke="#DC2626" strokeDasharray="6 4" label={{value:'TOP',position:'right',fontSize:9,fill:'#DC2626'}}/>
            <Area type="monotone" dataKey="wsi_value" stroke="#C9A227" strokeWidth={2.5} fill="url(#wsiGrad)" dot={false} activeDot={{r:6,fill:'#C9A227',stroke:'#fff',strokeWidth:2}}/>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
