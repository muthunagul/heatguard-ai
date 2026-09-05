import { PageHeader } from '../components/Layout';
import { Flame } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="About HeatGuard AI" subtitle="Automated Human Thermal-Stress Early Warning & Prediction System" />

      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Flame className="h-10 w-10 text-orange-500" />
          <div>
            <h2 className="text-xl font-bold text-white">HeatGuard AI</h2>
            <p className="text-sm text-slate-400">Smart India Hackathon 2026 · SIH26083</p>
          </div>
        </div>
        <p className="text-slate-300 mb-4">
          Extreme heatwaves pose a growing public health challenge in India. Traditional warnings often focus on air temperature alone, while human thermal stress depends on the combined effects of temperature, humidity, wind, and solar radiation.
        </p>
        <p className="text-slate-300 mb-4">
          HeatGuard AI addresses this gap by automatically collecting environmental data for any location, computing multi-factor thermal stress, predicting future risk using machine learning, explaining why risk is changing, and issuing early warnings before peak conditions.
        </p>
        <p className="text-orange-300 font-medium">Detect → Predict → Explain → Warn</p>
      </div>

      <div className="glass-card p-5">
        <h3 className="font-semibold text-slate-100 mb-3">Technology Stack</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm text-slate-400">
          <div><strong className="text-slate-300">Frontend:</strong> React, TypeScript, Vite, Tailwind CSS, Recharts, Leaflet</div>
          <div><strong className="text-slate-300">Backend:</strong> Node.js, Express, TypeScript</div>
          <div><strong className="text-slate-300">ML:</strong> Python, XGBoost, SHAP, FastAPI</div>
          <div><strong className="text-slate-300">Database:</strong> Supabase / PostgreSQL</div>
          <div><strong className="text-slate-300">Weather:</strong> Open-Meteo API</div>
          <div><strong className="text-slate-300">Maps:</strong> OpenStreetMap, React Leaflet</div>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="font-semibold text-slate-100 mb-3">Problem Statement</h3>
        <p className="text-sm text-slate-400">
          SIH26083 – Extreme Heatwave Early Warning and Human Thermal Stress Index. Ministry/Education track, Smart India Hackathon 2026.
        </p>
      </div>

      <div className="glass-card p-5 border border-slate-600">
        <h3 className="font-semibold text-slate-100 mb-2">Disclaimer</h3>
        <p className="text-sm text-slate-400">
          HeatGuard AI provides modeled environmental risk information for awareness and planning purposes. It is not a medical diagnosis, does not predict individual health outcomes, and does not replace official government warnings or professional medical advice.
        </p>
      </div>
    </div>
  );
}
