import { useEffect, useState, useCallback } from 'react';
import { PageHeader } from '../components/Layout';
import { LocationSelector } from '../components/LocationSelector';
import { RiskCard } from '../components/RiskCard';
import { WeatherSummary } from '../components/WeatherSummary';
import { PeakCard } from '../components/PeakCard';
import { ExplainabilityPanel } from '../components/ExplainabilityPanel';
import { ThermalStressChart } from '../components/ThermalStressChart';
import { AlertList } from '../components/AlertCard';
import { GuidanceCard, OfficialWarningCard, ExposureSelector } from '../components/GuidanceCard';
import { RiskMap } from '../components/RiskMap';
import { LoadingState, ErrorState, DataFreshness } from '../components/common';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { LocationInfo, RiskMapData } from '../types';
import { formatTrend } from '../utils/risk';

export function DashboardPage() {
  const { location, setLocation, exposure, setExposure, demoMode, dashboard, setDashboard } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [riskMap, setRiskMap] = useState<RiskMapData | null>(null);

  const loadDashboard = useCallback(async (loc: LocationInfo) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getDashboard(loc.latitude, loc.longitude, exposure, demoMode);
      setDashboard(data);
      try {
        const mapData = await api.getRiskMap(loc.latitude, loc.longitude);
        setRiskMap(mapData);
      } catch {
        setRiskMap(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [exposure, demoMode, setDashboard]);

  useEffect(() => {
    if (location) loadDashboard(location);
  }, [location, loadDashboard]);

  const handleLocationSelect = (loc: LocationInfo) => {
    setLocation(loc);
  };

  if (!location) {
    return (
      <div>
        <PageHeader title="Dashboard" subtitle="Select a location to view thermal stress intelligence" />
        <LocationSelector onSelect={handleLocationSelect} />
      </div>
    );
  }

 if (loading && !dashboard) return <LoadingState />;

if (error && !dashboard) {
  return <ErrorState message={error} onRetry={() => loadDashboard(location)} />;
}

if (!dashboard) {
  return <LoadingState />;
}

const data = dashboard;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title="HeatGuard Dashboard" subtitle="Automated thermal stress intelligence" />
        <LocationSelector onSelect={handleLocationSelect} current={location} compact />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <ExposureSelector value={exposure} onChange={setExposure} />
        {data.prediction.isFallback && (
          <span className="text-xs text-amber-400 border border-amber-500/30 rounded px-2 py-1">
            ML fallback active — physics-based predictions
          </span>
        )}
      </div>

      {/* Early Warning Banner */}
      {data.alerts.length > 0 && (
        <div className="glass-card border border-red-500/30 p-4 pulse-warning">
          <p className="text-sm font-semibold text-red-400 mb-1">⚠️ Early Warning</p>
          <p className="text-slate-200">{data.alerts[0].message}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <RiskCard thermal={data.current} trend={data.prediction.trend} />
          <ThermalStressChart prediction={data.prediction} />
          <ExplainabilityPanel explanation={data.explanation} category={data.current.category} />
        </div>
        <div className="space-y-4">
          <PeakCard prediction={data.prediction} />
          <WeatherSummary weather={data.weather} />
          <div className="glass-card p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Risk Trend</p>
            <p className="text-lg font-semibold text-slate-200">{formatTrend(data.prediction.trend)}</p>
            {data.prediction.trendFactors.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-slate-400 mb-1">Why is it changing?</p>
                <ul className="text-xs text-slate-300 space-y-1">
                  {data.prediction.trendFactors.map((f) => <li key={f}>• {f}</li>)}
                </ul>
              </div>
            )}
          </div>
          <AlertList alerts={data.alerts.slice(0, 2)} />
        </div>
      </div>

      <RiskMap data={riskMap} />
      <GuidanceCard guidance={data.guidance} />
      <OfficialWarningCard warning={data.officialWarning} />

      <DataFreshness source={data.weather.dataSource} updated={data.lastUpdated} />
    </div>
  );
}
