import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import locationRoutes from './routes/location.js';
import weatherRoutes from './routes/weather.js';
import thermalRoutes from './routes/thermal.js';
import alertRoutes from './routes/alerts.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://heatguard-frontend.onrender.com'
  ],
  credentials: true
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'HeatGuard AI API',
    demoMode: process.env.DEMO_MODE === 'true',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/location', locationRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/thermal', thermalRoutes);
app.use('/api/alerts', alertRoutes);

app.use('/api/official-warnings', (_req, res) => {
  res.json({
    available: false,
    source: 'India Meteorological Department (IMD)',
    status: null,
    message: 'Official IMD heatwave warnings are not connected in this prototype. HeatGuard predictions are modeled estimates, not official government warnings.',
    badge: 'OFFICIAL',
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`HeatGuard AI API running on http://localhost:${PORT}`);
});
