import { randomUUID } from 'crypto';
import type {
  Alert,
  MLPrediction,
  ThermalStressResult,
  LocationInfo,
  AlertSeverity,
  RiskCategory,
} from '../types/index.js';
import { categoryToSeverity, formatTrendLabel } from '../utils/thermal.js';

function formatTimeRange(start: string | null, end: string | null): string {
  if (!start) return 'upcoming period';
  const s = new Date(start);
  const e = end ? new Date(end) : null;
  const fmt = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
  return e ? `${fmt(s)} – ${fmt(e)}` : fmt(s);
}

function severityActions(severity: AlertSeverity): string[] {
  const map: Record<AlertSeverity, string[]> = {
    low: ['Stay hydrated', 'Monitor conditions'],
    moderate: ['Reduce prolonged exposure', 'Take regular breaks', 'Stay hydrated'],
    high: ['Avoid unnecessary outdoor exposure', 'Take cooling breaks', 'Increase hydration'],
    very_high: ['Avoid outdoor exposure during peak', 'Move to cooler environment', 'Check on vulnerable people'],
    extreme: ['Seek cooled environment immediately', 'Avoid all non-essential outdoor activity', 'Follow emergency guidance'],
  };
  return map[severity];
}

export function generateAlerts(
  location: LocationInfo,
  current: ThermalStressResult,
  prediction: MLPrediction
): Alert[] {
  const alerts: Alert[] = [];
  const locName = `${location.name}${location.region ? `, ${location.region}` : ''}`;
  const now = new Date().toISOString();

  const currentSeverity = categoryToSeverity(current.category);
  if (current.category !== 'Low') {
    alerts.push({
      id: randomUUID(),
      severity: currentSeverity,
      title: `Current ${current.category} Thermal Stress`,
      message: `Current conditions indicate ${current.category.toLowerCase()} human thermal stress (score: ${current.score}/100).`,
      explanation: `Based on current environmental conditions at ${locName}. Primary metric: ${current.primaryMetric}.`,
      expectedTimeStart: now,
      expectedTimeEnd: null,
      recommendedActions: severityActions(currentSeverity),
      location: locName,
      generatedAt: now,
      dataSource: 'HeatGuard Alert Engine',
      badge: 'MODELED',
      status: 'active',
      isOfficial: false,
    });
  }

  if (prediction.peakCategory === 'Very High' || prediction.peakCategory === 'Extreme') {
    const peakSeverity = categoryToSeverity(prediction.peakCategory);
    alerts.push({
      id: randomUUID(),
      severity: peakSeverity,
      title: `${prediction.peakCategory} Thermal Stress Expected`,
      message: `${prediction.peakCategory} thermal stress is forecast between ${formatTimeRange(prediction.peakTimeStart, prediction.peakTimeEnd)}.`,
      explanation: `ML model (${prediction.modelVersion}) predicts peak score of ${prediction.peakScore}/100.${prediction.isFallback ? ' Using physics-based fallback — ML service unavailable.' : ''}`,
      expectedTimeStart: prediction.peakTimeStart,
      expectedTimeEnd: prediction.peakTimeEnd,
      recommendedActions: severityActions(peakSeverity),
      location: locName,
      generatedAt: now,
      dataSource: prediction.isFallback ? 'HeatGuard Physics Fallback' : 'HeatGuard ML Prediction',
      badge: prediction.isFallback ? 'MODELED' : 'FORECAST',
      status: 'active',
      isOfficial: false,
    });
  }

  if (prediction.timeToPeakMinutes !== null && prediction.timeToPeakMinutes <= 120 && prediction.trend.includes('increasing')) {
    alerts.push({
      id: randomUUID(),
      severity: categoryToSeverity(prediction.peakCategory),
      title: 'Rapid Risk Increase Expected',
      message: `High thermal stress expected within the next ${Math.ceil(prediction.timeToPeakMinutes / 60)} hour(s).`,
      explanation: `Risk trend: ${formatTrendLabel(prediction.trend)}. ${prediction.trendFactors.join('. ')}`,
      expectedTimeStart: prediction.peakTimeStart,
      expectedTimeEnd: prediction.peakTimeEnd,
      recommendedActions: severityActions(categoryToSeverity(prediction.peakCategory)),
      location: locName,
      generatedAt: now,
      dataSource: 'HeatGuard Alert Engine',
      badge: 'FORECAST',
      status: 'active',
      isOfficial: false,
    });
  }

  return alerts;
}

export function getOfficialWarning(): { available: boolean; source: string; status: string | null; message: string | null; badge: 'OFFICIAL' } {
  return {
    available: false,
    source: 'India Meteorological Department (IMD)',
    status: null,
    message: 'Official IMD heatwave warnings are not connected in this prototype. HeatGuard predictions are modeled estimates, not official government warnings.',
    badge: 'OFFICIAL',
  };
}

export function getDemoAlerts(): Alert[] {
  const now = new Date().toISOString();
  const peakStart = new Date();
  peakStart.setHours(14, 0, 0, 0);
  const peakEnd = new Date();
  peakEnd.setHours(16, 0, 0, 0);

  return [
    {
      id: 'demo-1',
      severity: 'very_high',
      title: 'Very High Thermal Stress Expected',
      message: 'Very high thermal stress is forecast between 2:00 PM – 4:00 PM.',
      explanation: 'Demo scenario: Combined high temperature, humidity, and solar radiation driving rapid thermal stress increase.',
      expectedTimeStart: peakStart.toISOString(),
      expectedTimeEnd: peakEnd.toISOString(),
      recommendedActions: [
        'Avoid outdoor exposure during peak period',
        'Move to cooled environment where possible',
        'Increase hydration',
        'Check on vulnerable people',
      ],
      location: 'Coimbatore, Tamil Nadu',
      generatedAt: now,
      dataSource: 'HeatGuard Demo Scenario',
      badge: 'SIMULATED',
      status: 'active',
      isOfficial: false,
    },
    {
      id: 'demo-2',
      severity: 'high',
      title: 'Risk Increasing Rapidly',
      message: 'Thermal stress is expected to increase before the peak period.',
      explanation: 'Demo scenario: Humidity rising and wind weakening in forecast window.',
      expectedTimeStart: now,
      expectedTimeEnd: peakStart.toISOString(),
      recommendedActions: ['Plan activities around peak period', 'Stay hydrated', 'Take breaks in shade'],
      location: 'Coimbatore, Tamil Nadu',
      generatedAt: now,
      dataSource: 'HeatGuard Demo Scenario',
      badge: 'SIMULATED',
      status: 'active',
      isOfficial: false,
    },
  ];
}

export function getDemoDashboardData(): Partial<import('../types/index.js').DashboardData> {
  const now = new Date();
  const hourly = Array.from({ length: 24 }, (_, i) => {
    const t = new Date(now);
    t.setHours(t.getHours() + i, 0, 0, 0);
    const hour = t.getHours();
    const temp = 32 + Math.sin(((hour - 6) / 12) * Math.PI) * 8;
    const humidity = 55 + Math.sin(((hour - 8) / 10) * Math.PI) * 25;
    const score = Math.min(100, Math.max(20, ((temp - 25) / 15) * 60 + (humidity - 50) * 0.5 + (hour >= 11 && hour <= 16 ? 20 : 0)));
    return { time: t.toISOString(), temp, humidity, score };
  });

  const peak = hourly.reduce((max, h) => (h.score > max.score ? h : max), hourly[0]);

  return {
    location: {
      name: 'Coimbatore',
      region: 'Tamil Nadu',
      country: 'India',
      latitude: 11.0168,
      longitude: 76.9558,
      timezone: 'Asia/Kolkata',
    },
    current: {
      score: 84,
      category: 'Very High' as RiskCategory,
      primaryMetric: 'Combined Thermal Index',
      heatIndex: 42,
      apparentTempContribution: 44,
      dataSource: 'HeatGuard Demo Scenario',
      badge: 'SIMULATED',
      disclaimer: 'DEMO MODE — DATA IS SIMULATED FOR PRESENTATION',
    },
    weather: {
      temperature: 38.5,
      humidity: 72,
      windSpeed: 1.2,
      apparentTemperature: 44,
      precipitation: 0,
      directRadiation: 650,
      diffuseRadiation: 120,
      shortwaveRadiation: 770,
      timestamp: now.toISOString(),
      dataSource: 'HeatGuard Demo Scenario',
      badge: 'SIMULATED',
      unavailableFields: [],
    },
    prediction: {
      predictions: hourly.map((h) => ({
        time: h.time,
        score: Math.round(h.score),
        category: (h.score < 30 ? 'Low' : h.score < 50 ? 'Moderate' : h.score < 70 ? 'High' : h.score < 85 ? 'Very High' : 'Extreme') as RiskCategory,
      })),
      peakScore: Math.round(peak.score),
      peakCategory: 'Extreme' as RiskCategory,
      peakTimeStart: peak.time,
      peakTimeEnd: new Date(new Date(peak.time).getTime() + 2 * 3600000).toISOString(),
      timeToPeakMinutes: 95,
      trend: 'increasing_rapidly' as const,
      trendFactors: ['Temperature rising', 'Humidity increasing', 'Wind weakening', 'Radiant heat increasing'],
      modelVersion: 'demo-scenario-v1',
      badge: 'SIMULATED',
      isFallback: false,
    },
    explanation: {
      summary: 'Thermal stress is very high primarily due to high temperature combined with elevated humidity and strong solar radiation. Low wind limits convective cooling.',
      contributions: [
        { feature: 'temperature', label: 'Temperature', contribution: 0.32, direction: 'increases', explanation: 'High air temperature (38.5°C) significantly increases thermal load.' },
        { feature: 'humidity', label: 'Humidity', contribution: 0.28, direction: 'increases', explanation: 'High humidity (72%) reduces evaporative cooling efficiency.' },
        { feature: 'wind', label: 'Wind', contribution: 0.15, direction: 'increases', explanation: 'Low wind speed (1.2 m/s) limits convective heat dissipation.' },
        { feature: 'radiation', label: 'Radiant Heat', contribution: 0.25, direction: 'increases', explanation: 'Strong solar radiation (770 W/m²) adds substantial radiant heat load.' },
      ],
      modelVersion: 'demo-scenario-v1',
      method: 'physics_based',
      badge: 'SIMULATED',
    },
    alerts: getDemoAlerts(),
    demoMode: true,
  };
}
