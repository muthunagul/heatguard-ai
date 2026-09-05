import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { MLPrediction } from '../types';
import { RISK_COLORS } from '../utils/risk';

export function ThermalStressChart({ prediction }: { prediction: MLPrediction }) {
  const data = prediction.predictions.map((p) => ({
    time: new Date(p.time).toLocaleTimeString('en-IN', { hour: 'numeric', hour12: true }),
    score: p.score,
    category: p.category,
    fullTime: p.time,
  }));

  const peakTime = prediction.peakTimeStart
    ? new Date(prediction.peakTimeStart).toLocaleTimeString('en-IN', { hour: 'numeric', hour12: true })
    : null;

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">Next 24 Hours</h3>
      <div className="overflow-x-auto">
        <ResponsiveContainer width="100%" height={220} minWidth={300}>
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: '#151d35', border: '1px solid #243052', borderRadius: 8 }}
              labelStyle={{ color: '#e2e8f0' }}
              formatter={(value) => [`${value ?? 0}/100`, 'Thermal Stress']}
            />
            {peakTime && (
              <ReferenceLine x={peakTime} stroke="#f97316" strokeDasharray="4 4" label={{ value: 'Peak', fill: '#f97316', fontSize: 11 }} />
            )}
            <Area type="monotone" dataKey="score" stroke="#ef4444" fill="url(#stressGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {data.filter((_, i) => i % 4 === 0).slice(0, 6).map((d) => (
          <div key={d.fullTime} className="text-xs text-slate-400">
            <span className="text-slate-300">{d.time}</span>{' '}
            <span style={{ color: RISK_COLORS[d.category as keyof typeof RISK_COLORS] }}>{d.category}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
