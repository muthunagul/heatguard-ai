import { Router } from 'express';
import { searchLocations, reverseGeocode } from '../providers/openMeteo.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { validateCoordinates } from '../utils/thermal.js';

const router = Router();

router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const query = (req.query.q as string)?.trim();
    if (!query || query.length < 2) {
      throw new AppError(400, 'Search query must be at least 2 characters', 'INVALID_QUERY');
    }
    const results = await searchLocations(query);
    res.json({ results, dataSource: 'Open-Meteo Geocoding', badge: 'OBSERVED' });
  })
);

router.get(
  '/reverse',
  asyncHandler(async (req, res) => {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);
    if (!validateCoordinates(lat, lon)) {
      throw new AppError(400, 'Invalid coordinates', 'INVALID_COORDINATES');
    }
    const location = await reverseGeocode({ latitude: lat, longitude: lon });
    res.json({ location, dataSource: 'Open-Meteo Geocoding', badge: 'OBSERVED' });
  })
);

export default router;
