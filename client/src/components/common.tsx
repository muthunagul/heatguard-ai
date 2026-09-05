import clsx from 'clsx';
import type { RiskCategory, DataBadge } from '../types';
import { RISK_BG, RISK_COLORS } from '../utils/risk';

export function RiskBadge({ category, size = 'md' }: { category: RiskCategory; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        RISK_BG[category],
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-sm',
        size === 'lg' && 'px-4 py-1.5 text-base'
      )}
      aria-label={`Risk level: ${category}`}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: RISK_COLORS[category] }} aria-hidden="true" />
      {category}
    </span>
  );
}

export function DataSourceBadge({ badge }: { badge: DataBadge }) {
  const styles: Record<DataBadge, string> = {
    LIVE: 'bg-emerald-500/20 text-emerald-400',
    OBSERVED: 'bg-blue-500/20 text-blue-400',
    FORECAST: 'bg-cyan-500/20 text-cyan-400',
    MODELED: 'bg-indigo-500/20 text-indigo-400',
    SIMULATED: 'bg-amber-500/20 text-amber-400',
    OFFICIAL: 'bg-red-500/20 text-red-400',
    DEMO: 'bg-orange-500/20 text-orange-400',
  };

  return (
    <span className={clsx('rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide', styles[badge])}>
      {badge}
    </span>
  );
}

export function DataFreshness({ source, updated }: { source: string; updated: string }) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
      <span>Data source: <strong className="text-slate-300">{source}</strong></span>
      <span>Last updated: <strong className="text-slate-300">{new Date(updated).toLocaleString('en-IN')}</strong></span>
    </div>
  );
}

export function LoadingState({ message = 'Loading environmental data...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16" role="status" aria-live="polite">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-600 border-t-orange-500" />
      <p className="text-slate-400">{message}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="glass-card flex flex-col items-center gap-4 p-8 text-center" role="alert">
      <div className="text-4xl" aria-hidden="true">⚠️</div>
      <h3 className="text-lg font-semibold text-red-400">Unable to Load Data</h3>
      <p className="max-w-md text-slate-400">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-500 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

export function DemoBanner() {
  return (
    <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 text-center text-sm font-medium text-amber-300 pulse-warning">
      DEMO MODE — DATA MAY BE SIMULATED
    </div>
  );
}
