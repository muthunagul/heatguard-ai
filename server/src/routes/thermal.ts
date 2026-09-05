import { Router } from 'express';
import { fetchCurrentWeather, fetchForecast, reverseGeocode } from '../providers/openMeteo.js';
import { calculateCurrentThermalStress, calculateHourlyThermalStress, getGuidance } from '../services/thermalEngine.js';
import { getMLPrediction, getExplanation } from '../services/mlClient.js';
import { generateAlerts, getOfficialWarning, getDemoDashboardData } from '../services/alertEngine.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { validateCoordinates, computeThermalScore, scoreToCategory } from '../utils/thermal.js';
import type { ExposureProfile, RiskMapCell } from '../types/index.js';

const router = Router();
const DEMO_MODE = process.env.DEMO_MODE === 'true';

function parseCoords(req: { query: Record<string, unknown> }) {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);
  if (!validateCoordinates(lat, lon)) {
    throw new AppError(400, 'Invalid coordinates', 'INVALID_COORDINATES');
  }
  return { latitude: lat, longitude: lon };
}

router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    if (DEMO_MODE || req.query.demo === 'true') {
      const demo = getDemoDashboardData();
      const location = demo.location!;
      res.json({
        ...demo,
        forecast: {
          hourly: demo.prediction!.predictions.map((p, i) => ({
            time: p.time,
            temperature: demo.weather!.temperature + Math.sin(i / 4) * 3,
            humidity: demo.weather!.humidity + Math.sin(i / 3) * 5,
            windSpeed: demo.weather!.windSpeed,
            apparentTemperature: demo.weather!.apparentTemperature,
            directRadiation: demo.weather!.directRadiation,
            diffuseRadiation: demo.weather!.diffuseRadiation,
            shortwaveRadiation: demo.weather!.shortwaveRadiation,
            precipitation: 0,
          })),
          dailyMax: [],
          dataSource: 'HeatGuard Demo Scenario',
          badge: 'SIMULATED',
          forecastPeriod: '24 hours',
          lastUpdated: new Date().toISOString(),
          unavailableFields: [],
        },
        guidance: getGuidance(demo.current!.category, (req.query.exposure as ExposureProfile) || 'general'),
        officialWarning: getOfficialWarning(),
        lastUpdated: new Date().toISOString(),
        demoMode: true,
      });
      return;
    }

    const coords = parseCoords(req);
    const exposure = (req.query.exposure as ExposureProfile) || 'general';

    const [location, weather, forecast] = await Promise.all([
      reverseGeocode(coords),
      fetchCurrentWeather(coords),
      fetchForecast(coords, 7),
    ]);

    const current = calculateCurrentThermalStress(weather);
    const prediction = await getMLPrediction(weather, forecast.hourly);
    const explanation = await getExplanation(weather, current.score);
    const alerts = generateAlerts(location, current, prediction);
    const guidance = getGuidance(current.category, exposure);
    const officialWarning = getOfficialWarning();

    res.json({
      location,
      current,
      weather,
      forecast,
      prediction,
      explanation,
      alerts,
      officialWarning,
      guidance,
      lastUpdated: new Date().toISOString(),
      demoMode: false,
    });
  })
);

router.get(
  '/current',
  asyncHandler(async (req, res) => {
    const coords = parseCoords(req);
    const weather = await fetchCurrentWeather(coords);
    const thermal = calculateCurrentThermalStress(weather);
    res.json({ thermal, weather });
  })
);

router.get(
  '/forecast',
  asyncHandler(async (req, res) => {
    const coords = parseCoords(req);
    const forecast = await fetchForecast(coords);
    const hourly = forecast.hourly.map((h) => ({
      time: h.time,
      thermal: calculateHourlyThermalStress(h),
      weather: h,
    }));
    res.json({ hourly, dataSource: forecast.dataSource, badge: forecast.badge });
  })
);

router.get(
  '/prediction',
  asyncHandler(async (req, res) => {
    const coords = parseCoords(req);
    const [weather, forecast] = await Promise.all([
      fetchCurrentWeather(coords),
      fetchForecast(coords),
    ]);
    const prediction = await getMLPrediction(weather, forecast.hourly);
    res.json(prediction);
  })
);

router.get(
  '/explanation',
  asyncHandler(async (req, res) => {
    const coords = parseCoords(req);
    const weather = await fetchCurrentWeather(coords);
    const { score } = calculateCurrentThermalStress(weather);
    const explanation = await getExplanation(weather, score);
    res.json(explanation);
  })
);

router.post(
  '/simulate',
  asyncHandler(async (req, res) => {
    const { temperature, humidity, windSpeed, shortwaveRadiation, apparentTemperature } = req.body;
    const { score, heatIndex, primaryMetric } = computeThermalScore({
      temperature: temperature ?? 30,
      humidity: humidity ?? 50,
      windSpeed: windSpeed ?? 3,
      apparentTemperature: apparentTemperature ?? null,
      shortwaveRadiation: shortwaveRadiation ?? null,
    });
    res.json({
      score,
      category: scoreToCategory(score),
      primaryMetric,
      heatIndex,
      badge: 'SIMULATED',
      disclaimer: 'Scenario Simulation — not a forecast. Manual value changes do not affect real weather.',
    });
  })
);

router.get(
  '/risk-map',
  asyncHandler(async (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    const radius = Math.min(2, Math.max(0.2, parseFloat(req.query.radius as string) || 0.5));

    if (!validateCoordinates(lat, lon)) {
      throw new AppError(400, 'Invalid coordinates', 'INVALID_COORDINATES');
    }

    const cells: RiskMapCell[] = [];
    const steps = 5;
    const step = radius / steps;

    for (let i = -steps; i <= steps; i++) {
      for (let j = -steps; j <= steps; j++) {
        const cellLat = lat + i * step;
        const cellLon = lon + j * step;
        try {
          const weather = await fetchCurrentWeather({ latitude: cellLat, longitude: cellLon });
          const { score } = computeThermalScore({
            temperature: weather.temperature,
            humidity: weather.humidity,
            windSpeed: weather.windSpeed,
            apparentTemperature: weather.apparentTemperature,
            shortwaveRadiation: weather.shortwaveRadiation,
          });
          cells.push({
            latitude: cellLat,
            longitude: cellLon,
            score,
            category: scoreToCategory(score),
          });
        } catch {
          // skip failed cells
        }
      }
    }

    res.json({
      cells,
      center: { latitude: lat, longitude: lon },
      dataSource: 'Open-Meteo + HeatGuard Thermal Engine',
      badge: 'MODELED',
      disclaimer: 'Modeled/Forecast Risk — not direct sensor observations.',
      lastUpdated: new Date().toISOString(),
    });
  })
);

export default router;
