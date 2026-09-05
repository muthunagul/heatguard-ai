import axios from 'axios';
import type {
  MLPrediction,
  ExplanationResult,
  WeatherHourly,
  WeatherCurrent,
  TrendDirection,
  RiskCategory,
} from '../types/index.js';
import { computeThermalScore, scoreToCategory, computeTrend } from '../utils/thermal.js';

const ML_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8001';

interface MLForecastRequest {
  current: Record<string, number | null>;
  hourly: Record<string, unknown>[];
  model_version?: string;
}

export async function getMLPrediction(
  current: WeatherCurrent,
  hourly: WeatherHourly[]
): Promise<MLPrediction> {
  try {
    const payload: MLForecastRequest = {
      current: {
        temperature: current.temperature,
        humidity: current.humidity,
        wind_speed: current.windSpeed,
        apparent_temperature: current.apparentTemperature,
        shortwave_radiation: current.shortwaveRadiation,
        direct_radiation: current.directRadiation,
      },
      hourly: hourly.slice(0, 48).map((h) => ({
        time: h.time,
        temperature: h.temperature,
        humidity: h.humidity,
        wind_speed: h.windSpeed,
        apparent_temperature: h.apparentTemperature,
        shortwave_radiation: h.shortwaveRadiation,
        direct_radiation: h.directRadiation,
      })),
      model_version: process.env.ML_MODEL_VERSION || 'heatguard-xgb-v1',
    };

    const { data } = await axios.post(`${ML_URL}/predict`, payload, { timeout: 15000 });
    return {
      predictions: data.predictions.map((p: { time: string; score: number; category: string }) => ({
        time: p.time,
        score: p.score,
        category: p.category as RiskCategory,
      })),
      peakScore: data.peak_score,
      peakCategory: data.peak_category as RiskCategory,
      peakTimeStart: data.peak_time_start,
      peakTimeEnd: data.peak_time_end,
      timeToPeakMinutes: data.time_to_peak_minutes,
      trend: data.trend as TrendDirection,
      trendFactors: data.trend_factors || [],
      modelVersion: data.model_version,
      badge: 'MODELED',
      isFallback: false,
    };
    } catch (error) {
    console.error('ML prediction request failed:', error);
    return getFallbackPrediction(current, hourly);
  }
}

export async function getExplanation(
  current: WeatherCurrent,
  score: number
): Promise<ExplanationResult> {
  try {
    const { data } = await axios.post(
      `${ML_URL}/explain`,
      {
        features: {
          temperature: current.temperature,
          humidity: current.humidity,
          wind_speed: current.windSpeed,
          apparent_temperature: current.apparentTemperature,
          shortwave_radiation: current.shortwaveRadiation,
          direct_radiation: current.directRadiation,
        },
        score,
      },
      { timeout: 10000 }
    );

    return {
      summary: data.summary,
      contributions: data.contributions,
      modelVersion: data.model_version,
      method: data.method || 'SHAP',
      badge: 'MODELED',
    };
  } catch {
    return getPhysicsExplanation(current, score);
  }
}

function getFallbackPrediction(current: WeatherCurrent, hourly: WeatherHourly[]): MLPrediction {
  const predictions = hourly.slice(0, 24).map((h) => {
    const { score } = computeThermalScore({
      temperature: h.temperature,
      humidity: h.humidity,
      windSpeed: h.windSpeed,
      apparentTemperature: h.apparentTemperature,
      shortwaveRadiation: h.shortwaveRadiation,
    });
    return { time: h.time, score, category: scoreToCategory(score) };
  });

  let peakScore = 0;
  let peakIdx = 0;
  predictions.forEach((p, i) => {
    if (p.score > peakScore) {
      peakScore = p.score;
      peakIdx = i;
    }
  });

  const peakTime = predictions[peakIdx]?.time;
  const peakEndIdx = Math.min(peakIdx + 2, predictions.length - 1);
  const timeToPeakMs = peakTime ? new Date(peakTime).getTime() - Date.now() : null;

  const { trend, factors } = computeTrend(predictions.map((p) => p.score));

  return {
    predictions,
    peakScore,
    peakCategory: scoreToCategory(peakScore),
    peakTimeStart: peakTime || null,
    peakTimeEnd: predictions[peakEndIdx]?.time || null,
    timeToPeakMinutes: timeToPeakMs !== null && timeToPeakMs > 0 ? Math.round(timeToPeakMs / 60000) : null,
    trend,
    trendFactors: factors,
    modelVersion: 'physics-fallback-v1',
    badge: 'MODELED',
    isFallback: true,
  };
}

function getPhysicsExplanation(current: WeatherCurrent, score: number): ExplanationResult {
  const contributions = [];
  const tempContrib = Math.min(1, Math.max(0, (current.temperature - 25) / 20));
  const humContrib = Math.min(1, Math.max(0, (current.humidity - 40) / 60));
  const windContrib = Math.min(1, Math.max(0, 1 - current.windSpeed / 10));
  const radContrib = current.shortwaveRadiation
    ? Math.min(1, current.shortwaveRadiation / 900)
    : current.directRadiation
      ? Math.min(1, current.directRadiation / 700)
      : 0.3;

  const total = tempContrib + humContrib + windContrib + radContrib || 1;

  contributions.push({
    feature: 'temperature',
    label: 'Temperature',
    contribution: tempContrib / total,
    direction: tempContrib > 0.5 ? 'increases' as const : 'neutral' as const,
    explanation:
      current.temperature > 35
        ? 'High air temperature reduces the body\'s ability to dissipate heat.'
        : 'Temperature is contributing to overall thermal load.',
  });

  contributions.push({
    feature: 'humidity',
    label: 'Humidity',
    contribution: humContrib / total,
    direction: humContrib > 0.5 ? 'increases' as const : 'neutral' as const,
    explanation:
      current.humidity > 60
        ? 'High humidity reduces the body\'s ability to lose heat through evaporation.'
        : 'Humidity levels are moderate relative to temperature.',
  });

  contributions.push({
    feature: 'wind',
    label: 'Wind',
    contribution: windContrib / total,
    direction: current.windSpeed < 2 ? 'increases' as const : 'decreases' as const,
    explanation:
      current.windSpeed < 2
        ? 'Low wind speed limits convective cooling of the body.'
        : 'Wind is providing some convective cooling effect.',
  });

  contributions.push({
    feature: 'radiation',
    label: 'Radiant Heat',
    contribution: radContrib / total,
    direction: radContrib > 0.4 ? 'increases' as const : 'neutral' as const,
    explanation:
      current.shortwaveRadiation && current.shortwaveRadiation > 400
        ? 'Strong solar/radiant heat adds to total thermal load on exposed surfaces and skin.'
        : current.shortwaveRadiation === null
          ? 'Solar radiation data unavailable — contribution estimated from time of day.'
          : 'Solar radiation is contributing to radiant heat exposure.',
  });

  const category = scoreToCategory(score);
  return {
    summary: `Thermal stress is ${category.toLowerCase()} primarily due to combined environmental heat load from temperature, humidity, wind, and radiant conditions.`,
    contributions,
    modelVersion: 'physics-fallback-v1',
    method: 'physics_based',
    badge: 'MODELED',
  };
}
