import { NavLink, Link } from 'react-router-dom';
import { Flame, Menu, X } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/forecast', label: 'Forecast' },
  { to: '/risk-map', label: 'Risk Map' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/explain', label: 'Explain AI' },
  { to: '/simulator', label: 'Simulator' },
  { to: '/methodology', label: 'Methodology' },
  { to: '/authority', label: 'Authority' },
  { to: '/about', label: 'About' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { demoMode, setDemoMode } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-navy-950">
      {demoMode && (
        <div className="bg-amber-500/20 border-b border-amber-500/30 px-4 py-2 text-center text-sm font-medium text-amber-300">
          DEMO MODE — DATA MAY BE SIMULATED
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-slate-800 bg-navy-900/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg text-white">
            <Flame className="h-6 w-6 text-orange-500" aria-hidden="true" />
            <span>HeatGuard <span className="text-orange-400">AI</span></span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    isActive ? 'bg-orange-600/20 text-orange-300' : 'text-slate-400 hover:text-slate-200'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDemoMode(!demoMode)}
              className={clsx(
                'hidden sm:block rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors',
                demoMode ? 'border-amber-500 text-amber-300 bg-amber-500/10' : 'border-slate-600 text-slate-400 hover:border-slate-500'
              )}
            >
              Demo {demoMode ? 'ON' : 'OFF'}
            </button>
            <button
              className="lg:hidden text-slate-400"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav className="lg:hidden border-t border-slate-800 px-4 py-3 space-y-1" aria-label="Mobile navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  clsx('block px-3 py-2 rounded-lg text-sm', isActive ? 'bg-orange-600/20 text-orange-300' : 'text-slate-400')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6">{children}</main>

      <footer className="border-t border-slate-800 bg-navy-900 px-4 py-4 text-center text-xs text-slate-500">
        HeatGuard AI · SIH26083 · Modeled environmental risk information — not a medical diagnosis
      </footer>
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}
