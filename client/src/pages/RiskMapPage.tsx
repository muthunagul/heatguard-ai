import { useEffect, useState } from 'react';
import { PageHeader } from '../components/Layout';
import { LocationSelector } from '../components/LocationSelector';
import { RiskMap } from '../components/RiskMap';
import { LoadingState, ErrorState } from '../components/common';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import type { RiskMapData } from '../types';

export function RiskMapPage() {
  const { location, setLocation } = useApp();
  const [data, setData] = useState<RiskMapData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!location) return;
    setLoading(true);
    api.getRiskMap(location.latitude, location.longitude, 0.8)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [location]);

  if (!location) {
    return (
      <div>
        <PageHeader title="Risk Map" subtitle="Spatial visualization of modeled thermal stress" />
        <LocationSelector onSelect={setLocation} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Map"
        subtitle={`Modeled/Forecast Risk — ${location.name}${location.region ? `, ${location.region}` : ''}`}
      />
      {loading && <LoadingState message="Computing spatial risk grid..." />}
      {error && <ErrorState message={error} />}
      {!loading && !error && <RiskMap data={data} />}
    </div>
  );
}
