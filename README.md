# HeatGuard AI

**Automated Human Thermal-Stress Early Warning & Prediction System**

Smart India Hackathon 2026 · SIH26083 – Extreme Heatwave Early Warning and Human Thermal Stress Index

> Predict Heat. Protect People.

## Overview

HeatGuard AI automatically converts environmental conditions into human thermal-stress risk assessments and provides early warnings before dangerous conditions peak.

**Core flow:** Location → Environmental Data → Thermal Engine → ML Prediction → Explainability → Early Warning → Actionable Guidance

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- (Optional) Supabase account for database persistence

### 1. Install dependencies

```bash
# Root
npm install

# Client
cd client && npm install && cd ..

# Server
cd server && npm install && cd ..

# ML service
cd ml && pip install -r requirements.txt && cd ..
```

### 2. Train ML model

```bash
cd ml
python training/train.py
cd ..
```

### 3. Configure environment

```bash
cp .env.example .env
```

### 4. Run all services

```bash
# Terminal 1 — API server
cd server && npm run dev

# Terminal 2 — ML service
cd ml && python -m uvicorn inference.app:app --reload --port 8001

# Terminal 3 — Frontend
cd client && npm run dev
```

Or from root (after `npm install`):

```bash
npm run dev
```

Open **http://localhost:5173**

### Demo Mode

Click **Demo OFF/ON** in the navigation bar, or use **Explore Heat Risk** on the home page for a pre-configured Coimbatore scenario.

## Architecture

```
client/          React + TypeScript + Vite + Tailwind
server/          Node.js + Express API
ml/              Python XGBoost + SHAP + FastAPI
supabase/        PostgreSQL schema migrations
docs/            Architecture and methodology docs
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/location/search?q=` | Location autocomplete |
| `GET /api/location/reverse?lat=&lon=` | Reverse geocoding |
| `GET /api/weather/current` | Current weather |
| `GET /api/weather/forecast` | Weather forecast |
| `GET /api/thermal/dashboard` | Full dashboard data |
| `GET /api/thermal/prediction` | ML predictions |
| `GET /api/thermal/explanation` | SHAP explanations |
| `GET /api/thermal/risk-map` | Spatial risk grid |
| `POST /api/thermal/simulate` | What-if simulator |
| `GET /api/alerts` | Alert history |
| `GET /api/official-warnings` | Official warnings (placeholder) |

## Data Sources

- **Open-Meteo** — Weather observations and forecasts (no API key required)
- **OpenStreetMap** — Map tiles
- **HeatGuard Thermal Engine** — Modeled thermal stress (Heat Index + multi-factor)
- **HeatGuard ML Service** — XGBoost predictions with SHAP explainability

## Disclaimer

HeatGuard AI provides modeled environmental risk information for awareness and planning. It is not a medical diagnosis and does not replace official warnings or professional medical advice.
