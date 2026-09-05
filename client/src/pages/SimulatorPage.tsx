import { useState } from 'react';
import { PageHeader } from '../components/Layout';
import { RiskBadge } from '../components/common';
import { api } from '../services/api';
import type { RiskCategory } from '../types';
import { FlaskConical } from 'lucide-react';

export function SimulatorPage() {
  const [temperature, setTemperature] = useState(35);
  const [humidity, setHumidity] = useState(65);
  const [windSpeed, setWindSpeed] = useState(2);
  const [radiation, setRadiation] = useState(600);
  const [result, setResult] = useState<{ score: number; category: RiskCategory } | null>(null);
  const [baseline] = useState({ score: 84, category: 'Very High' as RiskCategory });
  const [loading, setLoading] = useState(false);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.simulate({ temperature, humidity, windSpeed, shortwaveRadiation: radiation, apparentTemperature: null });
      setResult({ score: res.score, category: res.category as RiskCategory });
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="What-If Simulator"
        subtitle="Advanced scenario exploration — not a forecast"
      />

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex items-start gap-3">
        <FlaskConical className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-300">Scenario Simulation — not a forecast</p>
          <p className="text-xs text-slate-400 mt-1">Manually changing values here does not affect real weather. The main HeatGuard workflow is fully automatic via location selection.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 space-y-5">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Scenario Parameters</h3>

          {[
            { label: 'Temperature (°C)', value: temperature, set: setTemperature, min: 20, max: 50 },
            { label: 'Humidity (%)', value: humidity, set: setHumidity, min: 10, max: 100 },
            { label: 'Wind Speed (m/s)', value: windSpeed, set: setWindSpeed, min: 0, max: 20 },
            { label: 'Solar Radiation (W/m²)', value: radiation, set: setRadiation, min: 0, max: 1000 },
          ].map(({ label, value, set, min, max }) => (
            <div key={label}>
              <div className="flex justify-between text-sm mb-1">
                <label>{label}</label>
                <span className="text-orange-400 font-mono">{value}</span>
              </div>
              <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => set(Number(e.target.value))}
                className="w-full accent-orange-500"
                aria-label={label}
              />
            </div>
          ))}

          <button
            onClick={runSimulation}
            disabled={loading}
            className="w-full rounded-lg bg-orange-600 py-2.5 font-medium text-white hover:bg-orange-500 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Computing...' : 'Run Scenario'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <p className="text-xs text-slate-400 mb-2">Reference (Demo Baseline)</p>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-black text-red-400">{baseline.score}</span>
              <RiskBadge category={baseline.category} />
            </div>
          </div>

          {result && (
            <div className="glass-card p-5 border border-orange-500/30">
              <p className="text-xs text-slate-400 mb-2">Scenario Result</p>
              <div className="flex items-center gap-4 mb-3">
                <span className="text-4xl font-black text-orange-400">{result.score}</span>
                <RiskBadge category={result.category} />
              </div>
              <p className="text-sm text-slate-300">
                Change: {result.score > baseline.score ? '↑' : result.score < baseline.score ? '↓' : '→'}{' '}
                {Math.abs(result.score - baseline.score)} points vs baseline
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
