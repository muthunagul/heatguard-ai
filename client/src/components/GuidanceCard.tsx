import type { GuidanceResult } from '../types';
import { ShieldCheck } from 'lucide-react';
import { RiskBadge } from './common';

export function GuidanceCard({ guidance }: { guidance: GuidanceResult }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="h-5 w-5 text-green-400" aria-hidden="true" />
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">What Should You Do?</h3>
        <RiskBadge category={guidance.level} size="sm" />
      </div>
      <ul className="space-y-2">
        {guidance.actions.map((action) => (
          <li key={action} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="text-orange-400 mt-0.5" aria-hidden="true">→</span>
            {action}
          </li>
        ))}
      </ul>
      {guidance.exposureNote && (
        <p className="mt-3 text-sm text-orange-300/80 border-t border-slate-700 pt-3">{guidance.exposureNote}</p>
      )}
      <p className="mt-3 text-xs text-slate-500">{guidance.disclaimer}</p>
    </div>
  );
}

export function OfficialWarningCard({ warning }: { warning: import('../types').OfficialWarning }) {
  return (
    <div className="glass-card p-5 border border-red-500/20">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg" aria-hidden="true">🇮🇳</span>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Official Weather Warning</h3>
      </div>
      <p className="text-xs text-slate-400 mb-2">Source: <strong className="text-slate-300">{warning.source}</strong></p>
      {warning.available ? (
        <>
          <p className="text-sm font-medium text-red-400">Status: {warning.status}</p>
          <p className="text-sm text-slate-300 mt-1">{warning.message}</p>
        </>
      ) : (
        <p className="text-sm text-slate-400">{warning.message}</p>
      )}
      <p className="text-xs text-slate-500 mt-3">
        HeatGuard AI predictions are modeled estimates and are visually distinct from official government warnings.
      </p>
    </div>
  );
}

export function ExposureSelector({ value, onChange }: {
  value: import('../types').ExposureProfile;
  onChange: (v: import('../types').ExposureProfile) => void;
}) {
  const options: { value: import('../types').ExposureProfile; label: string }[] = [
    { value: 'general', label: 'General Public' },
    { value: 'outdoor_worker', label: 'Outdoor Worker' },
    { value: 'outdoor_commuter', label: 'Outdoor Commuter' },
    { value: 'physically_active', label: 'Physically Active' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
            value === o.value
              ? 'bg-orange-600/30 border-orange-500 text-orange-300'
              : 'border-slate-600 text-slate-400 hover:border-slate-500'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
