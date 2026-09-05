import { lazy, Suspense } from 'react';
import type { RiskMapData } from '../types';
import { RISK_COLORS } from '../utils/risk';
import { DataSourceBadge, LoadingState } from './common';

const MapInner = lazy(() => import('./RiskMapInner'));

export function RiskMap({ data }: { data: RiskMapData | null }) {
  if (!data) return <LoadingState message="Loading risk map..." />;

  return (
    <div className="glass-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Risk Map</h3>
        <DataSourceBadge badge={data.badge} />
      </div>
      <p className="text-xs text-amber-400/80 mb-3">{data.disclaimer}</p>
      <Suspense fallback={<LoadingState message="Loading map..." />}>
        <MapInner data={data} />
      </Suspense>
      <div className="mt-3 flex flex-wrap gap-3">
        {(['Low', 'Moderate', 'High', 'Very High', 'Extreme'] as const).map((cat) => (
          <div key={cat} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: RISK_COLORS[cat] }} aria-hidden="true" />
            {cat}
          </div>
        ))}
      </div>
    </div>
  );
}
