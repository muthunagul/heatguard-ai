import type {
  WeatherCurrent,
  WeatherHourly,
  ThermalStressResult,
  ExposureProfile,
  GuidanceResult,
  RiskCategory,
} from '../types/index.js';
import { computeThermalScore, scoreToCategory, THERMAL_DISCLAIMER } from '../utils/thermal.js';

export function calculateCurrentThermalStress(weather: WeatherCurrent): ThermalStressResult {
  const { score, heatIndex, primaryMetric } = computeThermalScore({
    temperature: weather.temperature,
    humidity: weather.humidity,
    windSpeed: weather.windSpeed,
    apparentTemperature: weather.apparentTemperature,
    shortwaveRadiation: weather.shortwaveRadiation,
  });

  return {
    score,
    category: scoreToCategory(score),
    primaryMetric,
    heatIndex,
    apparentTempContribution: weather.apparentTemperature,
    dataSource: 'HeatGuard Thermal Engine',
    badge: 'MODELED',
    disclaimer: THERMAL_DISCLAIMER,
  };
}

export function calculateHourlyThermalStress(hour: WeatherHourly): ThermalStressResult {
  const { score, heatIndex, primaryMetric } = computeThermalScore({
    temperature: hour.temperature,
    humidity: hour.humidity,
    windSpeed: hour.windSpeed,
    apparentTemperature: hour.apparentTemperature,
    shortwaveRadiation: hour.shortwaveRadiation,
  });

  return {
    score,
    category: scoreToCategory(score),
    primaryMetric,
    heatIndex,
    apparentTempContribution: hour.apparentTemperature,
    dataSource: 'HeatGuard Thermal Engine',
    badge: 'MODELED',
    disclaimer: THERMAL_DISCLAIMER,
  };
}

const GUIDANCE: Record<RiskCategory, string[]> = {
  Low: [
    'Normal precautions apply during warm conditions.',
    'Stay hydrated throughout the day.',
    'Be aware that conditions may change — check updates periodically.',
  ],
  Moderate: [
    'Reduce prolonged outdoor exposure where possible.',
    'Take regular breaks in shaded or cooler areas.',
    'Increase fluid intake and avoid dehydration.',
    'Schedule strenuous outdoor activity for cooler parts of the day.',
  ],
  High: [
    'Avoid unnecessary prolonged outdoor exposure.',
    'Take frequent cooling breaks in shade or air-conditioned spaces.',
    'Increase hydration — drink water regularly even if not thirsty.',
    'Schedule strenuous outdoor work carefully around forecast peaks.',
    'Watch for signs of heat-related illness in yourself and others.',
  ],
  'Very High': [
    'Avoid unnecessary outdoor exposure during peak heat periods.',
    'Move to a cooler environment where possible.',
    'Increase hydration significantly and avoid alcohol/caffeine.',
    'Postpone non-essential outdoor physical activity.',
    'Check on vulnerable people — elderly, children, outdoor workers.',
    'Follow official local heat-health guidance.',
  ],
  Extreme: [
    'Avoid outdoor exposure during peak periods unless absolutely essential.',
    'Seek air-conditioned or cooled environments.',
    'Hydrate continuously; do not wait until thirsty.',
    'Do not leave anyone in enclosed vehicles.',
    'Check on vulnerable individuals frequently.',
    'Follow official local heat-health and emergency guidance immediately.',
  ],
};

const EXPOSURE_NOTES: Record<ExposureProfile, Partial<Record<RiskCategory, string>>> = {
  general: {},
  outdoor_worker: {
    High: 'Consider scheduling strenuous work outside the forecast peak period where operationally possible.',
    'Very High': 'Implement work-rest cycles and provide shaded rest areas. Consider rescheduling non-critical outdoor tasks.',
    Extreme: 'Essential outdoor work only with strict heat safety protocols. Mandatory rest breaks in cooled areas.',
  },
  outdoor_commuter: {
    Moderate: 'Plan travel during cooler hours if possible. Carry water during commute.',
    High: 'Avoid peak sun hours for non-essential travel. Use shaded routes where available.',
    'Very High': 'Minimize outdoor waiting at transit stops. Seek air-conditioned transport options.',
    Extreme: 'Avoid unnecessary outdoor commuting during peak heat. Work from home if possible.',
  },
  physically_active: {
    Moderate: 'Reduce exercise intensity during warmer parts of the day.',
    High: 'Move exercise indoors or to early morning/evening hours.',
    'Very High': 'Postpone strenuous outdoor exercise. Choose low-intensity indoor alternatives.',
    Extreme: 'Avoid strenuous physical activity outdoors. Rest and hydrate.',
  },
};

export function getGuidance(category: RiskCategory, exposure: ExposureProfile = 'general'): GuidanceResult {
  const actions = [...GUIDANCE[category]];
  const exposureNote = EXPOSURE_NOTES[exposure]?.[category];

  return {
    level: category,
    actions,
    exposureNote,
    disclaimer: `${THERMAL_DISCLAIMER} Follow local official health/emergency guidance.`,
  };
}
