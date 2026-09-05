import type { ThermalStressResult } from '../types';
import { RiskBadge } from './common';
import { RISK_COLORS } from '../utils/risk';
import { formatTrend } from '../utils/risk';
import type { TrendDirection } from '../types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RiskCardProps {
  thermal: ThermalStressResult;
  trend?: TrendDirection;
}

export function RiskCard({ thermal, trend }: RiskCardProps) {
  const TrendIcon = trend?.includes('increasing') ? TrendingUp : trend?.includes('decreasing') ? TrendingDown : Minus;

  return (
    <div className="glass-card p-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Thermal Stress</p>
      <div className="flex items-end gap-4 mb-4">
        <span
          className="text-7xl font-black tabular-nums leading-none"
          style={{ color: RISK_COLORS[thermal.category] }}
          aria-label={`Thermal stress score ${thermal.score} out of 100`}
        >
          {thermal.score}
        </span>
        <div className="mb-2">
          <RiskBadge category={thermal.category} size="lg" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <TrendIcon className="h-4 w-4" aria-hidden="true" />
          <span>{formatTrend(trend)}</span>
        </div>
      )}
      <p className="mt-3 text-xs text-slate-500">
        Primary metric: {thermal.primaryMetric} · Modeled risk indicator, not a medical diagnosis
      </p>
    </div>
  );
}
