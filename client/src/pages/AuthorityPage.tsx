import { useEffect, useState } from 'react';
import { PageHeader } from '../components/Layout';
import { RiskBadge, LoadingState } from '../components/common';
import { formatTimeRange } from '../utils/risk';
import { MapPin, AlertTriangle } from 'lucide-react';

const MONITOR_LOCATIONS = [
  { name: 'Coimbatore', region: 'Tamil Nadu', lat: 11.0168, lon: 76.9558 },
  { name: 'Madurai', region: 'Tamil Nadu', lat: 9.9252, lon: 78.1198 },
  { name: 'Chennai', region: 'Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  { name: 'Delhi', region: 'NCR', lat: 28.6139, lon: 77.209 },
  { name: 'Ahmedabad', region: 'Gujarat', lat: 23.0225, lon: 72.5714 },
  { name: 'Hyderabad', region: 'Telangana', lat: 17.385, lon: 78.4867 },
];

interface LocationStatus {
  name: string;
  region: string;
  score: number;
  category: import('../types').RiskCategory;
  peakTime: string | null;
  peakEnd: string | null;
  trend: string;
  alerts: number;
  error?: string;
}

export function AuthorityPage() {
  const [locations, setLocations] = useState<LocationStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API = import.meta.env.VITE_API_URL || '/api';
    Promise.all(
      MONITOR_LOCATIONS.map(async (loc) => {
        try {
          const res = await fetch(`${API}/thermal/dashboard?lat=${loc.lat}&lon=${loc.lon}`);
          if (!res.ok) throw new Error('Failed');
          const data = await res.json();
          return {
            name: loc.name,
            region: loc.region,
            score: data.current.score,
            category: data.current.category,
            peakTime: data.prediction.peakTimeStart,
            peakEnd: data.prediction.peakTimeEnd,
            trend: data.prediction.trend,
            alerts: data.alerts.length,
          };
        } catch {
          return { name: loc.name, region: loc.region, score: 0, category: 'Low' as const, peakTime: null, peakEnd: null, trend: 'stable', alerts: 0, error: 'Data unavailable' };
        }
      })
    ).then(setLocations).finally(() => setLoading(false));
  }, []);

  const highRisk = locations.filter((l) => ['High', 'Very High', 'Extreme'].includes(l.category) && !l.error);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Authority Dashboard"
        subtitle="Multi-location thermal stress monitoring for disaster management authorities"
      />

      {loading ? (
        <LoadingState message="Loading multi-location status..." />
      ) : (
        <>
          {highRisk.length > 0 && (
            <div className="glass-card border border-red-500/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h3 className="font-semibold text-red-400">{highRisk.length} High-Risk Location(s)</h3>
              </div>
              <p className="text-sm text-slate-400">Locations with High, Very High, or Extreme modeled thermal stress</p>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <div key={loc.name} className={`glass-card p-4 ${loc.error ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-orange-400" />
                      <span className="font-semibold text-slate-100">{loc.name}</span>
                    </div>
                    <p className="text-xs text-slate-400">{loc.region}</p>
                  </div>
                  {!loc.error && <RiskBadge category={loc.category} size="sm" />}
                </div>
                {loc.error ? (
                  <p className="text-xs text-red-400">{loc.error}</p>
                ) : (
                  <>
                    <p className="text-3xl font-black text-slate-100 mb-1">{loc.score}</p>
                    {loc.peakTime && (
                      <p className="text-xs text-slate-400">Peak: {formatTimeRange(loc.peakTime, loc.peakEnd)}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">{loc.alerts} active alert(s)</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <p className="text-xs text-slate-500">
        All values are modeled from Open-Meteo forecast data. Not official IMD warnings. Data freshness varies by location API response time.
      </p>
    </div>
  );
}
