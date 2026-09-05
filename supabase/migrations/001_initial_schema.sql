-- HeatGuard AI Database Schema
-- Supabase / PostgreSQL

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  region TEXT,
  country TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  timezone TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS weather_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  temperature DOUBLE PRECISION,
  humidity DOUBLE PRECISION,
  wind_speed DOUBLE PRECISION,
  apparent_temperature DOUBLE PRECISION,
  precipitation DOUBLE PRECISION,
  shortwave_radiation DOUBLE PRECISION,
  data_source TEXT NOT NULL,
  badge TEXT NOT NULL DEFAULT 'OBSERVED',
  recorded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS forecasts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  forecast_data JSONB NOT NULL,
  forecast_period TEXT,
  data_source TEXT NOT NULL,
  badge TEXT NOT NULL DEFAULT 'FORECAST',
  valid_from TIMESTAMPTZ NOT NULL,
  valid_to TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS model_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version TEXT UNIQUE NOT NULL,
  model_type TEXT NOT NULL,
  metrics JSONB,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS thermal_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  model_version_id UUID REFERENCES model_versions(id),
  score DOUBLE PRECISION NOT NULL,
  category TEXT NOT NULL,
  prediction_data JSONB NOT NULL,
  peak_time TIMESTAMPTZ,
  badge TEXT NOT NULL DEFAULT 'MODELED',
  predicted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  severity TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  explanation TEXT,
  expected_time_start TIMESTAMPTZ,
  expected_time_end TIMESTAMPTZ,
  recommended_actions JSONB,
  data_source TEXT NOT NULL,
  badge TEXT NOT NULL DEFAULT 'MODELED',
  is_official BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  exposure_profile TEXT DEFAULT 'general',
  demo_mode BOOLEAN DEFAULT FALSE,
  notifications_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weather_snapshots_location ON weather_snapshots(location_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_thermal_predictions_location ON thermal_predictions(location_id, predicted_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_location ON alerts(location_id, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status, severity);
