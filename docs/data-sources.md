# Data Sources

## Primary Weather Provider: Open-Meteo

- **URL:** https://open-meteo.com/
- **API Key:** Not required
- **Data types:** Observed current conditions, hourly forecast (up to 16 days), daily summary
- **Variables used:**
  - `temperature_2m` — Air temperature at 2m (°C)
  - `relative_humidity_2m` — Relative humidity (%)
  - `wind_speed_10m` — Wind speed at 10m (m/s)
  - `apparent_temperature` — Feels-like temperature (°C)
  - `precipitation` — Precipitation (mm)
  - `direct_radiation` — Direct solar radiation (W/m²) — hourly/ current where available
  - `diffuse_radiation` — Diffuse solar radiation (W/m²)
  - `shortwave_radiation` — Total shortwave radiation (W/m²)

## Geocoding

- **Forward search:** Open-Meteo Geocoding API (`geocoding-api.open-meteo.com`)
- **Reverse geocoding:** Nominatim / OpenStreetMap (with User-Agent header)

## Maps

- **Tiles:** OpenStreetMap (`tile.openstreetmap.org`)
- **Library:** Leaflet / React Leaflet

## ML Model

- **Training data:** Synthetic data generated from documented physical heat stress relationships
- **Model:** XGBoost Regressor (heatguard-xgb-v1)
- **Explainability:** SHAP TreeExplainer

## Official Warnings

- **IMD (India Meteorological Department):** Not integrated in this prototype
- HeatGuard predictions are clearly labeled as modeled estimates, distinct from official warnings

## Data Badges

| Badge | Meaning |
|-------|---------|
| OBSERVED | Live/current measurement from weather API |
| FORECAST | Predicted future conditions from weather API |
| MODELED | Calculated by HeatGuard thermal engine or ML model |
| SIMULATED | Demo/scenario data |
| OFFICIAL | From official government source (when connected) |

## Missing Data Policy

When a variable is unavailable from the provider:
1. Field is marked in `unavailableFields`
2. UI displays "Unavailable" — never fabricates values
3. Thermal engine uses available factors only
4. Methodology note shown where relevant
