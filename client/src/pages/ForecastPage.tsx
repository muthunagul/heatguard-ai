import { useState, useEffect } from 'react';
import { PageHeader } from '../components/Layout';
import { LocationSelector } from '../components/LocationSelector';
import { ForecastChart } from '../components/ForecastChart';
import { ThermalStressChart } from '../components/ThermalStressChart';
import { LoadingState, ErrorState, DataSourceBadge } from '../components/common';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import clsx from 'clsx';

export function ForecastPage() {
  const { location, setLocation, demoMode } = useApp();
  const [period, setPeriod] = useState<'24H' | '3D' | '7D'>('24H');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getDashboard>> | null>(null);

  useEffect(() => {
    if (!location) return;
    setLoading(true);
    api.getDashboard(location.latitude, location.longitude, undefined, demoMode)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [location, demoMode]);

  if (!location) {
    return (
      <div>
        <PageHeader title="Forecast" subtitle="Detailed environmental and thermal stress forecast" />
        <LocationSelector onSelect={setLocation} />
      </div>
    );
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Forecast" subtitle={`${location.name}${location.region ? `, ${location.region}` : ''}`} />

      <div className="flex gap-2">
        {(['24H', '3D', '7D'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={clsx(
              'rounded-lg px-4 py-2 text-sm font-medium border transition-colors',
              period === p ? 'bg-orange-600/30 border-orange-500 text-orange-300' : 'border-slate-600 text-slate-400'
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Environmental Forecast</h3>
          <DataSourceBadge badge={data.forecast.badge} />
        </div>
        <ForecastChart hourly={data.forecast.hourly} period={period} />
      </div>

      <ThermalStressChart prediction={data.prediction} />

      {data.forecast.dailyMax.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400 mb-4">Daily Summary</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.forecast.dailyMax.slice(0, period === '7D' ? 7 : period === '3D' ? 3 : 1).map((d) => (
              <div key={d.date} className="rounded-lg bg-navy-800 p-3">
                <p className="text-xs text-slate-400">{new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                <p className="text-lg font-semibold text-slate-100">{d.temperatureMax.toFixed(0)}° / {d.temperatureMin.toFixed(0)}°C</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
