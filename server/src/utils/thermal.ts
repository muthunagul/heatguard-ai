import type { RiskCategory, TrendDirection } from '../types/index.js';

export function scoreToCategory(score: number): RiskCategory {
  if (score < 30) return 'Low';
  if (score < 50) return 'Moderate';
  if (score < 70) return 'High';
  if (score < 85) return 'Very High';
  return 'Extreme';
}

export function categoryToSeverity(category: RiskCategory): 'low' | 'moderate' | 'high' | 'very_high' | 'extreme' {
  const map: Record<RiskCategory, 'low' | 'moderate' | 'high' | 'very_high' | 'extreme'> = {
    Low: 'low',
    Moderate: 'moderate',
    High: 'high',
    'Very High': 'very_high',
    Extreme: 'extreme',
  };
  return map[category];
}

export function computeHeatIndex(tempC: number, rh: number): number | null {
  if (tempC < 27) return null;
  const tempF = (tempC * 9) / 5 + 32;
  const hi =
    -42.379 +
    2.04901523 * tempF +
    10.14333127 * rh -
    0.22475541 * tempF * rh -
    0.00683783 * tempF * tempF -
    0.05481717 * rh * rh +
    0.00122874 * tempF * tempF * rh +
    0.00085282 * tempF * rh * rh -
    0.00000199 * tempF * tempF * rh * rh;

  if (rh < 13 && tempF >= 80 && tempF <= 112) {
    const adj = hi - ((13 - rh) / 4) * Math.sqrt((17 - Math.abs(tempF - 95)) / 17);
    return ((adj - 32) * 5) / 9;
  }
  if (rh > 85 && tempF >= 80 && tempF <= 87) {
    const adj = hi + ((rh - 85) / 10) * ((87 - tempF) / 5);
    return ((adj - 32) * 5) / 9;
  }
  return ((hi - 32) * 5) / 9;
}

export function computeThermalScore(params: {
  temperature: number;
  humidity: number;
  windSpeed: number;
  apparentTemperature: number | null;
  shortwaveRadiation: number | null;
}): { score: number; heatIndex: number | null; primaryMetric: 'Heat Index' | 'Apparent Temperature Index' | 'Combined Thermal Index' } {
  const { temperature, humidity, windSpeed, apparentTemperature, shortwaveRadiation } = params;
  const heatIndex = computeHeatIndex(temperature, humidity);

  let baseScore = 0;
  let primaryMetric: 'Heat Index' | 'Apparent Temperature Index' | 'Combined Thermal Index' = 'Combined Thermal Index';

  if (heatIndex !== null) {
    baseScore = Math.min(100, Math.max(0, ((heatIndex - 25) / 20) * 100));
    primaryMetric = 'Heat Index';
  } else if (apparentTemperature !== null) {
    baseScore = Math.min(100, Math.max(0, ((apparentTemperature - 25) / 15) * 100));
    primaryMetric = 'Apparent Temperature Index';
  } else {
    baseScore = Math.min(100, Math.max(0, ((temperature - 25) / 15) * 100));
  }

  const humidityFactor = humidity > 60 ? ((humidity - 60) / 40) * 15 : 0;
  const windMitigation = windSpeed > 2 ? Math.min(10, (windSpeed - 2) * 2) : Math.max(-8, (2 - windSpeed) * 4);
  const radiationFactor = shortwaveRadiation !== null ? Math.min(12, (shortwaveRadiation / 800) * 12) : 0;

  const score = Math.round(Math.min(100, Math.max(0, baseScore + humidityFactor - windMitigation + radiationFactor)));
  return { score, heatIndex, primaryMetric };
}

export function computeTrend(scores: number[]): { trend: TrendDirection; factors: string[] } {
  if (scores.length < 2) return { trend: 'stable', factors: [] };

  const recent = scores.slice(0, 3);
  const later = scores.slice(3, 6);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const laterAvg = later.length ? later.reduce((a, b) => a + b, 0) / later.length : recentAvg;
  const delta = laterAvg - recentAvg;

  const factors: string[] = [];
  if (delta > 15) return { trend: 'increasing_rapidly', factors: ['Risk rising sharply in forecast period'] };
  if (delta > 5) return { trend: 'increasing', factors: ['Conditions expected to worsen'] };
  if (delta < -15) return { trend: 'decreasing_rapidly', factors: ['Risk expected to fall significantly'] };
  if (delta < -5) return { trend: 'decreasing', factors: ['Conditions expected to improve'] };
  return { trend: 'stable', factors: ['Risk relatively stable in near-term forecast'] };
}

export function formatTrendLabel(trend: TrendDirection): string {
  const labels: Record<TrendDirection, string> = {
    increasing_rapidly: '↑ Increasing rapidly',
    increasing: '↑ Increasing',
    stable: '→ Stable',
    decreasing: '↓ Decreasing',
    decreasing_rapidly: '↓ Decreasing rapidly',
  };
  return labels[trend];
}

export function validateCoordinates(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

export function validateWeatherValue(field: string, value: number): boolean {
  const ranges: Record<string, [number, number]> = {
    temperature: [-60, 60],
    humidity: [0, 100],
    windSpeed: [0, 200],
    apparentTemperature: [-80, 70],
    precipitation: [0, 500],
    shortwaveRadiation: [0, 1400],
  };
  const range = ranges[field];
  if (!range) return true;
  return value >= range[0] && value <= range[1];
}

export const THERMAL_DISCLAIMER =
  'HeatGuard AI provides modeled environmental risk information for awareness and planning. It is not a medical diagnosis and does not replace official warnings or professional medical advice.';
