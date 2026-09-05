import { useEffect, useState } from 'react';
import { PageHeader } from '../components/Layout';
import { LocationSelector } from '../components/LocationSelector';
import { ExplainabilityPanel } from '../components/ExplainabilityPanel';
import { LoadingState, ErrorState } from '../components/common';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';

export function ExplainPage() {
  const { location, setLocation, demoMode } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Awaited<ReturnType<typeof api.getDashboard>> | null>(null);

  useEffect(() => {
    if (!location) return;
    setLoading(true);
    api.getDashboard(location.latitude, location.longitude, undefined, demoMode)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [location, demoMode]);

  if (!location) {
    return (
      <div>
        <PageHeader title="Explain AI" subtitle="Understand why thermal stress risk is at its current level" />
        <LocationSelector onSelect={setLocation} />
      </div>
    );
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Explain AI" subtitle="SHAP-based explainability for thermal stress predictions" />

      <ExplainabilityPanel explanation={data.explanation} category={data.current.category} />

      <div className="glass-card p-5 space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">How Explainability Works</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-300">
          <div>
            <p className="font-medium text-slate-200 mb-1">SHAP Values</p>
            <p className="text-slate-400">When the ML service is available, SHAP (SHapley Additive exPlanations) quantifies each environmental factor's contribution to the predicted score.</p>
          </div>
          <div>
            <p className="font-medium text-slate-200 mb-1">Physics Fallback</p>
            <p className="text-slate-400">When ML is unavailable, contributions are computed from documented physical relationships between temperature, humidity, wind, and radiation.</p>
          </div>
          <div>
            <p className="font-medium text-slate-200 mb-1">Not Medical Advice</p>
            <p className="text-slate-400">Contributions explain modeled environmental risk — they do not diagnose individual health conditions or predict medical outcomes.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
