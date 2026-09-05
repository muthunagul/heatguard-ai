# HeatGuard AI Architecture

## System Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Client    │────▶│  Express API │────▶│  Open-Meteo API │
│  React/Vite │     │   (Node.js)  │     │   (Weather)     │
└─────────────┘     └──────┬───────┘     └─────────────────┘
                           │
                    ┌──────┴───────┐
                    │              │
             ┌──────▼──────┐ ┌─────▼──────┐
             │  Thermal    │ │  ML Service │
             │   Engine    │ │  (FastAPI)  │
             └─────────────┘ └─────────────┘
                    │              │
             ┌──────▼──────────────▼──────┐
             │     Alert Engine + SHAP     │
             └────────────────────────────┘
                           │
                    ┌──────▼───────┐
                    │   Supabase   │
                    │  PostgreSQL  │
                    └──────────────┘
```

## Pipeline

1. **Location** — GPS or search → coordinates
2. **Weather API** — Open-Meteo current + forecast
3. **Validation** — Range checks, unit normalization, staleness detection
4. **Feature Engineering** — Time features, interactions, lag features
5. **Thermal Stress** — Heat Index + multi-factor score (0–100)
6. **ML Prediction** — XGBoost future risk + peak detection
7. **Explanation** — SHAP feature contributions
8. **Alert Engine** — Threshold-based early warnings
9. **Guidance** — Risk-level safety recommendations

## Service Boundaries

- Weather provider is abstracted (`providers/openMeteo.ts`) — swappable
- ML client (`services/mlClient.ts`) — falls back to physics if ML unavailable
- All API keys server-side only
- Demo mode clearly labeled throughout

## Deployment Notes

- Frontend: static build via `npm run build --prefix client`
- API: `npm run build --prefix server && npm start --prefix server`
- ML: `uvicorn inference.app:app --host 0.0.0.0 --port 8001`
- Set `ML_SERVICE_URL`, `SUPABASE_URL`, etc. in production `.env`
