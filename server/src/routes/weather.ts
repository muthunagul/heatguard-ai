import { Router } from 'express';
import { fetchCurrentWeather, fetchForecast } from '../providers/openMeteo.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { validateCoordinates } from '../utils/thermal.js';

const router = Router();

function parseCoords(req: { query: Record<string, unknown> }) {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);
  if (!validateCoordinates(lat, lon)) {
    throw new AppError(400, 'Invalid coordinates', 'INVALID_COORDINATES');
  }
  return { latitude: lat, longitude: lon };
}

router.get(
  '/current',
  asyncHandler(async (req, res) => {
    const coords = parseCoords(req);
    const weather = await fetchCurrentWeather(coords);
    res.json(weather);
  })
);

router.get(
  '/forecast',
  asyncHandler(async (req, res) => {
    const coords = parseCoords(req);
    const days = Math.min(16, Math.max(1, parseInt(req.query.days as string) || 7));
    const forecast = await fetchForecast(coords, days);
    res.json(forecast);
  })
);

export default router;
