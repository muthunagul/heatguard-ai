import type { ExplanationResult, RiskCategory } from '../types';
import { Brain } from 'lucide-react';
import { DataSourceBadge } from './common';
import { RISK_COLORS } from '../utils/risk';

interface ExplainabilityPanelProps {
  explanation: ExplanationResult;
  category: RiskCategory;
}

export function ExplainabilityPanel({ explanation, category }: ExplainabilityPanelProps) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-indigo-400" aria-hidden="true" />
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">
            Why is the risk {category.toLowerCase()}?
          </h3>
        </div>
        <DataSourceBadge badge={explanation.badge} />
      </div>

      <p className="text-sm text-slate-300 mb-5">{explanation.summary}</p>

      <div className="space-y-4">
        {explanation.contributions.map((c) => (
          <div key={c.feature}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300 font-medium">{c.label}</span>
              <span className="text-slate-400 text-xs capitalize">{c.direction === 'increases' ? 'High contribution' : c.direction === 'decreases' ? 'Reduces risk' : 'Moderate'}</span>
            </div>
            <div className="risk-bar" role="meter" aria-valuenow={Math.round(c.contribution * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`${c.label} contribution`}>
              <div
                className="risk-bar-fill"
                style={{ width: `${c.contribution * 100}%`, backgroundColor: RISK_COLORS[category] }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">{c.explanation}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Method: {explanation.method} · Model: {explanation.modelVersion}
      </p>
    </div>
  );
}
