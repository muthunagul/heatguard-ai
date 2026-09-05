import { Router } from 'express';
import { generateAlerts, getDemoAlerts } from '../services/alertEngine.js';
import { fetchCurrentWeather, fetchForecast, reverseGeocode } from '../providers/openMeteo.js';
import { calculateCurrentThermalStress } from '../services/thermalEngine.js';
import { getMLPrediction } from '../services/mlClient.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { validateCoordinates } from '../utils/thermal.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    if (req.query.demo === 'true') {
      res.json({ alerts: getDemoAlerts(), badge: 'SIMULATED' });
      return;
    }

    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    if (!validateCoordinates(lat, lon)) {
      throw new AppError(400, 'Invalid coordinates required for live alerts', 'INVALID_COORDINATES');
    }

    const coords = { latitude: lat, longitude: lon };
    const [location, weather, forecast] = await Promise.all([
      reverseGeocode(coords),
      fetchCurrentWeather(coords),
      fetchForecast(coords),
    ]);
    const current = calculateCurrentThermalStress(weather);
    const prediction = await getMLPrediction(weather, forecast.hourly);
    const alerts = generateAlerts(location, current, prediction);

    res.json({ alerts, badge: 'MODELED' });
  })
);

router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['read', 'dismissed', 'active'].includes(status)) {
    throw new AppError(400, 'Invalid status', 'INVALID_STATUS');
  }
  res.json({ id: req.params.id, status, updated: true });
}));

export default router;
