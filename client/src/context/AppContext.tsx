import { createContext, useContext, useState, type ReactNode } from 'react';
import type { LocationInfo, ExposureProfile, DashboardData } from '../types';

interface AppState {
  location: LocationInfo | null;
  exposure: ExposureProfile;
  demoMode: boolean;
  dashboard: DashboardData | null;
  setLocation: (loc: LocationInfo | null) => void;
  setExposure: (exp: ExposureProfile) => void;
  setDemoMode: (demo: boolean) => void;
  setDashboard: (data: DashboardData | null) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [exposure, setExposure] = useState<ExposureProfile>('general');
  const [demoMode, setDemoMode] = useState(false);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  return (
    <AppContext.Provider
      value={{
        location,
        exposure,
        demoMode,
        dashboard,
        setLocation,
        setExposure,
        setDemoMode,
        setDashboard,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useLocationDisplay(loc: LocationInfo | null): string {
  if (!loc) return 'No location selected';
  const parts = [loc.name, loc.region, loc.country].filter(Boolean);
  return parts.join(', ');
}
