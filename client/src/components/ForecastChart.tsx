import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { WeatherHourly } from '../types';

interface ForecastChartProps {
  hourly: WeatherHourly[];
  period: '24H' | '3D' | '7D';
}

export function ForecastChart({ hourly, period }: ForecastChartProps) {
  const limits = { '24H': 24, '3D': 72, '7D': 168 };
  const data = hourly.slice(0, limits[period]).map((h) => ({
    time: new Date(h.time).toLocaleString('en-IN', {
      month: period === '24H' ? undefined : 'short',
      day: period === '24H' ? undefined : 'numeric',
      hour: 'numeric',
      hour12: true,
    }),
    temperature: h.temperature,
    humidity: h.humidity,
    wind: h.windSpeed,
  }));

  return (
    <div className="overflow-x-auto">
      <ResponsiveContainer width="100%" height={280} minWidth={400}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip contentStyle={{ background: '#151d35', border: '1px solid #243052', borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
          <Line type="monotone" dataKey="temperature" stroke="#f97316" strokeWidth={2} dot={false} name="Temp (°C)" />
          <Line type="monotone" dataKey="humidity" stroke="#38bdf8" strokeWidth={2} dot={false} name="Humidity (%)" />
          <Line type="monotone" dataKey="wind" stroke="#a78bfa" strokeWidth={2} dot={false} name="Wind (m/s)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
