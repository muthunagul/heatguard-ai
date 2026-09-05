import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Zap, Brain, Bell, Map, Shield, Thermometer } from 'lucide-react';
import { LocationSelector } from '../components/LocationSelector';
import { useApp } from '../context/AppContext';
import type { LocationInfo } from '../types';

const FEATURES = [
  { icon: MapPin, title: 'Automatic Location Detection', desc: 'GPS or search — no manual weather entry required' },
  { icon: Thermometer, title: 'Multi-Factor Thermal Stress', desc: 'Temperature, humidity, wind, and radiant heat combined' },
  { icon: Zap, title: 'AI Forecasting', desc: 'XGBoost ML model predicts future thermal stress peaks' },
  { icon: Brain, title: 'Explainable Risk', desc: 'SHAP-based explanations for why risk is changing' },
  { icon: Bell, title: 'Early Warning', desc: 'Alerts before dangerous conditions peak' },
  { icon: Map, title: 'Risk Mapping', desc: 'Spatial visualization of modeled thermal risk zones' },
];

export function HomePage() {
  const { setLocation, setDemoMode } = useApp();

  const handleSelect = (loc: LocationInfo) => {
    setLocation(loc);
    window.location.href = '/dashboard';
  };

  const startDemo = () => {
    setDemoMode(true);
    setLocation({ name: 'Coimbatore', region: 'Tamil Nadu', country: 'India', latitude: 11.0168, longitude: 76.9558 });
    window.location.href = '/dashboard?demo=true';
  };

  return (
    <div className="-mx-4">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 md:py-28">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-transparent to-indigo-600/10 pointer-events-none" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-sm text-orange-300 mb-6">
            <Shield className="h-4 w-4" aria-hidden="true" />
            SIH26083 · Smart India Hackathon 2026
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4">
            Predict Heat.<br /><span className="text-orange-400">Protect People.</span>
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
            HeatGuard AI automatically transforms environmental and forecast data into human thermal-stress intelligence, future risk predictions, explanations and early warnings.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Link to="/dashboard" className="flex items-center gap-2 rounded-xl bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-500 transition-colors">
              <MapPin className="h-5 w-5" /> Check My Location
            </Link>
            <button onClick={startDemo} className="flex items-center gap-2 rounded-xl border border-slate-600 px-6 py-3 font-semibold text-slate-300 hover:border-slate-500 transition-colors">
              Explore Heat Risk <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          {/* Flow diagram */}
          <div className="flex flex-wrap justify-center items-center gap-2 text-xs md:text-sm text-slate-400">
            {['Location', 'Environmental Data', 'AI Processing', 'Prediction', 'Early Warning'].map((step, i, arr) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-lg bg-navy-800 border border-slate-700 px-3 py-1.5 text-slate-300 font-medium">{step}</span>
                {i < arr.length - 1 && <ArrowRight className="h-4 w-4 text-orange-500" aria-hidden="true" />}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Location CTA */}
      <section className="px-4 py-12 bg-navy-900/50">
        <div className="mx-auto max-w-xl">
          <h2 className="text-xl font-bold text-white text-center mb-6">Get Started — Select Your Location</h2>
          <LocationSelector onSelect={handleSelect} />
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-center text-orange-400 font-semibold text-sm uppercase tracking-widest mb-2">Detect → Predict → Explain → Warn</p>
          <h2 className="text-2xl font-bold text-white text-center mb-10">From Weather Data → Human Thermal Stress → Future Risk → Early Warning</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card p-5">
                <Icon className="h-8 w-8 text-orange-400 mb-3" aria-hidden="true" />
                <h3 className="font-semibold text-slate-100 mb-1">{title}</h3>
                <p className="text-sm text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why temperature alone */}
      <section className="px-4 py-16 bg-navy-900/50">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-white mb-4">Why Temperature Alone Is Not Enough</h2>
          <p className="text-slate-300 mb-6">
            Traditional heatwave warnings often focus on air temperature. Human thermal stress — how heat actually affects people — depends on multiple environmental factors working together:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { factor: 'Air Temperature', desc: 'Direct thermal load on the body' },
              { factor: 'Relative Humidity', desc: 'Reduces evaporative cooling efficiency' },
              { factor: 'Wind Speed', desc: 'Affects convective heat dissipation' },
              { factor: 'Solar/Radiant Heat', desc: 'Additional thermal load on exposed skin' },
              { factor: 'Exposure Context', desc: 'Outdoor work, commute, or activity level' },
            ].map(({ factor, desc }) => (
              <div key={factor} className="flex items-start gap-3 glass-card p-4">
                <span className="text-orange-400 font-bold">→</span>
                <div>
                  <p className="font-medium text-slate-200">{factor}</p>
                  <p className="text-sm text-slate-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-6">
            HeatGuard AI combines these factors into a modeled thermal stress index for awareness and planning. This is not a medical diagnosis.
          </p>
        </div>
      </section>
    </div>
  );
}
