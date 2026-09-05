import { PageHeader } from '../components/Layout';

const SECTIONS = [
  {
    title: '1. Location Detection',
    content: 'Users provide GPS coordinates or search for a location. Coordinates are reverse-geocoded via Open-Meteo Geocoding API. No manual weather data entry is required.',
  },
  {
    title: '2. Weather Data Collection',
    content: 'Open-Meteo API provides current conditions and hourly/daily forecasts including temperature, humidity, wind speed, apparent temperature, and solar radiation where available. Missing variables are marked unavailable — never fabricated.',
  },
  {
    title: '3. Data Validation',
    content: 'All incoming values are validated for range plausibility, unit consistency, and freshness. Stale or invalid data triggers error states rather than silent use.',
  },
  {
    title: '4. Thermal Stress Calculation',
    content: 'A dedicated thermal engine computes a 0–100 Thermal Stress Score using Heat Index (Steadman, when T≥27°C), apparent temperature, humidity amplification, wind mitigation, and solar radiation load. Primary metric is labeled per calculation.',
  },
  {
    title: '5. ML Prediction',
    content: 'An XGBoost regressor (heatguard-xgb-v1) predicts future thermal stress from time-series environmental features including lag/rolling features, time of day, and seasonal indicators. Served via a separate Python inference service.',
  },
  {
    title: '6. Explainability',
    content: 'SHAP TreeExplainer provides per-feature contribution values. When ML is unavailable, physics-based fallback contributions are used and labeled accordingly.',
  },
  {
    title: '7. Risk Classification',
    content: 'Scores map to five categories: Low (0–29), Moderate (30–49), High (50–69), Very High (70–84), Extreme (85–100). Categories use both color and text labels.',
  },
  {
    title: '8. Early Warning',
    content: 'Alert engine generates warnings based on current risk, predicted peaks, and trend analysis. Alerts include severity, explanation, expected timing, and recommended actions. Not presented as official government warnings.',
  },
  {
    title: '9. Guidance',
    content: 'Risk-level-appropriate safety guidance is provided with optional exposure profile customization (general public, outdoor worker, commuter, physically active).',
  },
];

export function MethodologyPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Methodology" subtitle="Transparent documentation of the HeatGuard AI pipeline" />

      <div className="space-y-4">
        {SECTIONS.map(({ title, content }) => (
          <div key={title} className="glass-card p-5">
            <h3 className="font-semibold text-slate-100 mb-2">{title}</h3>
            <p className="text-sm text-slate-400">{content}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-5 border border-slate-600">
        <h3 className="font-semibold text-slate-100 mb-3">Data Sources</h3>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• <strong className="text-slate-300">Open-Meteo</strong> — Weather observations and forecasts (no API key required)</li>
          <li>• <strong className="text-slate-300">OpenStreetMap</strong> — Map tiles for risk visualization</li>
          <li>• <strong className="text-slate-300">HeatGuard Thermal Engine</strong> — Modeled thermal stress calculations</li>
          <li>• <strong className="text-slate-300">HeatGuard ML Service</strong> — XGBoost predictions and SHAP explanations</li>
        </ul>
      </div>

      <div className="glass-card p-5 border border-amber-500/20">
        <h3 className="font-semibold text-amber-300 mb-3">Model Limitations</h3>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• ML model trained on synthetic data — real-world calibration needed</li>
          <li>• Not validated against clinical heat illness outcomes</li>
          <li>• Does not account for individual health, acclimatization, or clothing</li>
          <li>• Solar radiation unavailable in some regions/times</li>
          <li>• Official IMD warnings not integrated in this prototype</li>
        </ul>
      </div>

      <div className="glass-card p-5 border border-red-500/20">
        <h3 className="font-semibold text-red-400 mb-2">Important Disclaimer</h3>
        <p className="text-sm text-slate-300">
          HeatGuard AI provides modeled environmental risk information for awareness and planning. It is not a medical diagnosis and does not replace official warnings or professional medical advice. Follow local official health and emergency guidance.
        </p>
      </div>
    </div>
  );
}
