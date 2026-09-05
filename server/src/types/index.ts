export type RiskCategory = 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
export type DataBadge = 'LIVE' | 'OBSERVED' | 'FORECAST' | 'MODELED' | 'SIMULATED' | 'OFFICIAL' | 'DEMO';
export type ExposureProfile = 'general' | 'outdoor_worker' | 'outdoor_commuter' | 'physically_active';
export type TrendDirection = 'increasing_rapidly' | 'increasing' | 'stable' | 'decreasing' | 'decreasing_rapidly';
export type AlertSeverity = 'low' | 'moderate' | 'high' | 'very_high' | 'extreme';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationInfo extends Coordinates {
  name: string;
  region?: string;
  country?: string;
  timezone?: string;
}

export interface WeatherCurrent {
  temperature: number;
  humidity: number;
  windSpeed: number;
  apparentTemperature: number | null;
  precipitation: number | null;
  directRadiation: number | null;
  diffuseRadiation: number | null;
  shortwaveRadiation: number | null;
  timestamp: string;
  dataSource: string;
  badge: DataBadge;
  unavailableFields: string[];
}

export interface WeatherHourly {
  time: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  apparentTemperature: number | null;
  directRadiation: number | null;
  diffuseRadiation: number | null;
  shortwaveRadiation: number | null;
  precipitation: number | null;
}

export interface WeatherForecast {
  hourly: WeatherHourly[];
  dailyMax: { date: string; temperatureMax: number; temperatureMin: number }[];
  dataSource: string;
  badge: DataBadge;
  forecastPeriod: string;
  lastUpdated: string;
  unavailableFields: string[];
}

export interface ThermalStressResult {
  score: number;
  category: RiskCategory;
  primaryMetric: 'Heat Index' | 'Apparent Temperature Index' | 'Combined Thermal Index';
  heatIndex: number | null;
  apparentTempContribution: number | null;
  dataSource: string;
  badge: DataBadge;
  disclaimer: string;
}

export interface FeatureContribution {
  feature: string;
  label: string;
  contribution: number;
  direction: 'increases' | 'decreases' | 'neutral';
  explanation: string;
}

export interface MLPrediction {
  predictions: {
    time: string;
    score: number;
    category: RiskCategory;
  }[];
  peakScore: number;
  peakCategory: RiskCategory;
  peakTimeStart: string | null;
  peakTimeEnd: string | null;
  timeToPeakMinutes: number | null;
  trend: TrendDirection;
  trendFactors: string[];
  modelVersion: string;
  badge: DataBadge;
  isFallback: boolean;
}

export interface ExplanationResult {
  summary: string;
  contributions: FeatureContribution[];
  modelVersion: string;
  method: 'SHAP' | 'feature_importance' | 'physics_based';
  badge: DataBadge;
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  explanation: string;
  expectedTimeStart: string | null;
  expectedTimeEnd: string | null;
  recommendedActions: string[];
  location: string;
  generatedAt: string;
  dataSource: string;
  badge: DataBadge;
  status: 'active' | 'read' | 'dismissed';
  isOfficial: boolean;
}

export interface OfficialWarning {
  available: boolean;
  source: string;
  status: string | null;
  message: string | null;
  badge: DataBadge;
}

export interface RiskMapCell {
  latitude: number;
  longitude: number;
  score: number;
  category: RiskCategory;
}

export interface GuidanceResult {
  level: RiskCategory;
  actions: string[];
  exposureNote?: string;
  disclaimer: string;
}

export interface DashboardData {
  location: LocationInfo;
  current: ThermalStressResult;
  weather: WeatherCurrent;
  forecast: WeatherForecast;
  prediction: MLPrediction;
  explanation: ExplanationResult;
  alerts: Alert[];
  officialWarning: OfficialWarning;
  guidance: GuidanceResult;
  lastUpdated: string;
  demoMode: boolean;
}
