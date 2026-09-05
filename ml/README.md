# HeatGuard AI — ML Model

## Overview

HeatGuard AI uses an **XGBoost Regressor** to predict future human thermal stress scores (0–100) from environmental time-series features.

## Model Architecture

- **Type:** Gradient Boosting (XGBoost)
- **Version:** heatguard-xgb-v1
- **Target:** Thermal stress score (0–100), derived from physical heat stress relationships during training

## Features

| Feature | Description |
|---------|-------------|
| temperature | Air temperature (°C) |
| humidity | Relative humidity (%) |
| wind_speed | Wind speed (m/s) |
| apparent_temperature | Feels-like temperature (°C) |
| shortwave_radiation | Solar radiation (W/m²) |
| direct_radiation | Direct solar radiation (W/m²) |
| hour | Hour of day (0–23) |
| day_of_year | Day of year (1–365) |
| temp_humidity_interaction | Temperature × humidity interaction |
| wind_cooling | Wind cooling deficit |
| radiation_load | Normalized radiation load |

## Training

```bash
cd ml
pip install -r requirements.txt
python training/train.py
```

Training uses synthetic data generated from documented physical heat stress relationships. **This is a prototype model — not validated against clinical outcomes.**

## Inference

```bash
python -m uvicorn inference.app:app --reload --port 8001
```

Endpoints:
- `POST /predict` — Future thermal stress predictions
- `POST /explain` — SHAP-based feature contributions
- `GET /health` — Service health check

## Explainability

SHAP (SHapley Additive exPlanations) TreeExplainer provides per-feature contribution values for each prediction.

## Evaluation Metrics

See `models/model_metadata.json` after training for MAE and R² on held-out test set.

## Limitations

1. Trained on synthetic data — real-world calibration needed
2. Not validated against heat illness or mortality outcomes
3. Regional tuning recommended for Indian subcontinent conditions
4. Does not account for individual health factors or acclimatization
5. Solar radiation unavailable in some regions — fallback estimates used

## Disclaimer

This model provides **modeled environmental risk indicators**, not medical diagnoses.
