import type { RiskCategory, TrendDirection, AlertSeverity } from '../types';

export const RISK_COLORS: Record<RiskCategory, string> = {
  Low: '#22c55e',
  Moderate: '#eab308',
  High: '#f97316',
  'Very High': '#ef4444',
  Extreme: '#a855f7',
};

export const RISK_BG: Record<RiskCategory, string> = {
  Low: 'bg-green-500/20 text-green-400 border-green-500/30',
  Moderate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  High: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Very High': 'bg-red-500/20 text-red-400 border-red-500/30',
  Extreme: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

export const SEVERITY_ICONS: Record<AlertSeverity, string> = {
  low: '🟢',
  moderate: '🟡',
  high: '🟠',
  very_high: '🔴',
  extreme: '🟣',
};

export function formatTrend(trend: TrendDirection): string {
  const map: Record<TrendDirection, string> = {
    increasing_rapidly: '↑ Increasing rapidly',
    increasing: '↑ Increasing',
    stable: '→ Stable',
    decreasing: '↓ Decreasing',
    decreasing_rapidly: '↓ Decreasing rapidly',
  };
  return map[trend];
}

export function formatTimeToPeak(minutes: number | null): string {
  if (minutes === null || minutes <= 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function formatTimeRange(start: string | null, end: string | null): string {
  if (!start) return 'Could not be determined';
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
