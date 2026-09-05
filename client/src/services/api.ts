const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

export const api = {
  searchLocation: (q: string) =>
    fetchJSON<{ results: import('../types').LocationInfo[] }>(`/location/search?q=${encodeURIComponent(q)}`),

  reverseGeocode: (lat: number, lon: number) =>
    fetchJSON<{ location: import('../types').LocationInfo }>(`/location/reverse?lat=${lat}&lon=${lon}`),

  getDashboard: (lat: number, lon: number, exposure?: string, demo?: boolean) => {
    const params = new URLSearchParams({ lat: String(lat), lon: String(lon) });
    if (exposure) params.set('exposure', exposure);
    if (demo) params.set('demo', 'true');
    return fetchJSON<import('../types').DashboardData>(`/thermal/dashboard?${params}`);
  },

  getForecast: (lat: number, lon: number) =>
    fetchJSON<{ hourly: { time: string; thermal: import('../types').ThermalStressResult; weather: import('../types').WeatherHourly }[] }>(
      `/thermal/forecast?lat=${lat}&lon=${lon}`
    ),

  getRiskMap: (lat: number, lon: number, radius = 0.5) =>
    fetchJSON<import('../types').RiskMapData>(`/thermal/risk-map?lat=${lat}&lon=${lon}&radius=${radius}`),

  getAlerts: (lat?: number, lon?: number, demo?: boolean) => {
    const params = new URLSearchParams();
    if (lat !== undefined) params.set('lat', String(lat));
    if (lon !== undefined) params.set('lon', String(lon));
    if (demo) params.set('demo', 'true');
    return fetchJSON<{ alerts: import('../types').Alert[] }>(`/alerts?${params}`);
  },

  simulate: (params: Record<string, number | null>) =>
    fetchJSON<{ score: number; category: string; disclaimer: string }>('/thermal/simulate', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  health: () => fetchJSON<{ status: string; demoMode: boolean }>('/health'),
};
