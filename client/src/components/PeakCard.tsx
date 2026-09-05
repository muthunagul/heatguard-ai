import type { MLPrediction } from '../types';
import { Clock } from 'lucide-react';
import { formatTimeToPeak, formatTimeRange } from '../utils/risk';

export function PeakCard({ prediction }: { prediction: MLPrediction }) {
  const hasPeak = prediction.peakTimeStart !== null;

  return (
    <div className="glass-card p-5">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-5 w-5 text-orange-400" aria-hidden="true" />
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Time to Peak</h3>
      </div>

      {hasPeak ? (
        <>
          <p className="text-4xl font-black text-orange-400 tabular-nums mb-2" aria-label="Time to peak">
            {formatTimeToPeak(prediction.timeToPeakMinutes)}
          </p>
          <p className="text-sm text-slate-300 mb-1">
            Expected peak: <strong>{formatTimeRange(prediction.peakTimeStart, prediction.peakTimeEnd)}</strong>
          </p>
          <p className="text-xs text-slate-400">
            Thermal stress is expected to increase before the peak period.
          </p>
        </>
      ) : (
        <p className="text-sm text-slate-400">
          Peak period could not be determined from available forecast data.
        </p>
      )}
    </div>
  );
}
