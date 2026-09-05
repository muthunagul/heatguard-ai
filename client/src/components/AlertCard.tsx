import type { Alert } from '../types';
import { SEVERITY_ICONS } from '../utils/risk';
import { DataSourceBadge } from './common';
import { AlertTriangle, X } from 'lucide-react';
import clsx from 'clsx';

export function AlertCard({ alert, onDismiss }: { alert: Alert; onDismiss?: (id: string) => void }) {
  const severityColors: Record<string, string> = {
    low: 'border-green-500/30',
    moderate: 'border-yellow-500/30',
    high: 'border-orange-500/30',
    very_high: 'border-red-500/30',
    extreme: 'border-purple-500/30',
  };

  return (
    <article className={clsx('glass-card p-4 border-l-4', severityColors[alert.severity])}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-xl" aria-hidden="true">{SEVERITY_ICONS[alert.severity]}</span>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-orange-400" aria-hidden="true" />
              <h4 className="font-semibold text-slate-100">{alert.title}</h4>
              <DataSourceBadge badge={alert.badge} />
            </div>
            <p className="text-sm text-slate-300">{alert.message}</p>
            <p className="text-xs text-slate-400 mt-1">{alert.explanation}</p>
            {alert.recommendedActions.length > 0 && (
              <ul className="mt-2 space-y-1">
                {alert.recommendedActions.slice(0, 3).map((a) => (
                  <li key={a} className="text-xs text-slate-400 flex items-start gap-1">
                    <span aria-hidden="true">•</span> {a}
                  </li>
                ))}
              </ul>
            )}
            <p className="text-xs text-slate-500 mt-2">{alert.location} · {new Date(alert.generatedAt).toLocaleString('en-IN')}</p>
          </div>
        </div>
        {onDismiss && (
          <button onClick={() => onDismiss(alert.id)} className="text-slate-500 hover:text-slate-300" aria-label="Dismiss alert">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </article>
  );
}

export function AlertList({ alerts, onDismiss }: { alerts: Alert[]; onDismiss?: (id: string) => void }) {
  if (alerts.length === 0) {
    return <p className="text-sm text-slate-400 py-4">No active alerts for this location.</p>;
  }
  return (
    <div className="space-y-3">
      {alerts.map((a) => <AlertCard key={a.id} alert={a} onDismiss={onDismiss} />)}
    </div>
  );
}
