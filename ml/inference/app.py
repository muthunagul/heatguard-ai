"""HeatGuard AI ML Inference Service — XGBoost + SHAP."""
import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import joblib
import numpy as np
import shap
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from features import FEATURE_NAMES, engineer_features

MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "heatguard_xgb_v1.joblib")
MODEL_VERSION = "heatguard-xgb-v1"

app = FastAPI(title="HeatGuard ML Service", version=MODEL_VERSION)

model = None
explainer = None


def score_to_category(score: float) -> str:
    if score < 30:
        return "Low"
    if score < 50:
        return "Moderate"
    if score < 70:
        return "High"
    if score < 85:
        return "Very High"
    return "Extreme"


def load_model():
    global model, explainer
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}. Run: python training/train.py")
    model = joblib.load(MODEL_PATH)
    explainer = shap.TreeExplainer(model)


@app.on_event("startup")
async def startup():
    try:
        load_model()
        print(f"ML model loaded: {MODEL_VERSION}")
    except FileNotFoundError as e:
        print(f"WARNING: {e}")


class PredictRequest(BaseModel):
    current: dict
    hourly: list[dict]
    model_version: str | None = None


class ExplainRequest(BaseModel):
    features: dict
    score: float


@app.get("/health")
def health():
    return {
        "status": "ok" if model else "model_not_loaded",
        "model_version": MODEL_VERSION,
        "model_loaded": model is not None,
    }


@app.post("/predict")
def predict(req: PredictRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="ML model not loaded. Run training first.")

    predictions = []
    for hour_data in req.hourly[:48]:
        features = engineer_features(hour_data)
        score = float(np.clip(model.predict(features.reshape(1, -1))[0], 0, 100))
        predictions.append({
            "time": hour_data.get("time", ""),
            "score": round(score, 1),
            "category": score_to_category(score),
        })

    peak = max(predictions, key=lambda p: p["score"]) if predictions else None
    peak_idx = predictions.index(peak) if peak else 0

    peak_end_idx = min(peak_idx + 2, len(predictions) - 1)
    now = datetime.now(timezone.utc)

    time_to_peak = None
    if peak and peak.get("time"):
        try:
            peak_time = datetime.fromisoformat(peak["time"].replace("Z", "+00:00"))
            if peak_time.tzinfo is None:
                peak_time = peak_time.replace(tzinfo=timezone.utc)
            delta = (peak_time - now).total_seconds() / 60
            if delta > 0:
                time_to_peak = int(delta)
        except ValueError:
            pass

    scores = [p["score"] for p in predictions[:6]]
    trend = "stable"
    trend_factors = []
    if len(scores) >= 4:
        early = np.mean(scores[:2])
        late = np.mean(scores[2:4])
        delta = late - early
        if delta > 15:
            trend = "increasing_rapidly"
            trend_factors = ["Temperature rising", "Humidity increasing", "Radiant heat increasing"]
        elif delta > 5:
            trend = "increasing"
            trend_factors = ["Conditions expected to worsen"]
        elif delta < -15:
            trend = "decreasing_rapidly"
            trend_factors = ["Risk expected to fall significantly"]
        elif delta < -5:
            trend = "decreasing"
            trend_factors = ["Conditions expected to improve"]

    return {
        "predictions": predictions[:24],
        "peak_score": peak["score"] if peak else 0,
        "peak_category": peak["category"] if peak else "Low",
        "peak_time_start": peak["time"] if peak else None,
        "peak_time_end": predictions[peak_end_idx]["time"] if predictions else None,
        "time_to_peak_minutes": time_to_peak,
        "trend": trend,
        "trend_factors": trend_factors,
        "model_version": MODEL_VERSION,
    }


@app.post("/explain")
def explain(req: ExplainRequest):
    if model is None or explainer is None:
        raise HTTPException(status_code=503, detail="ML model not loaded.")

    features = engineer_features(req.features)
    shap_values = explainer.shap_values(features.reshape(1, -1))[0]

    labels = {
        "temperature": "Temperature",
        "humidity": "Humidity",
        "wind_speed": "Wind",
        "apparent_temperature": "Apparent Temperature",
        "shortwave_radiation": "Radiant Heat",
        "direct_radiation": "Direct Radiation",
        "hour": "Time of Day",
        "day_of_year": "Season",
        "temp_humidity_interaction": "Heat-Humidity Interaction",
        "wind_cooling": "Wind Cooling Deficit",
        "radiation_load": "Radiation Load",
    }

    explanations = {
        "temperature": "High air temperature reduces the body's ability to dissipate heat.",
        "humidity": "High humidity reduces evaporative cooling efficiency.",
        "wind_speed": "Higher wind aids convective cooling; low wind increases concern.",
        "apparent_temperature": "Feels-like temperature accounts for combined thermal perception.",
        "shortwave_radiation": "Solar radiation adds radiant heat load on exposed surfaces.",
        "direct_radiation": "Direct solar radiation increases thermal exposure.",
        "hour": "Time of day affects solar angle and typical peak heat periods.",
        "day_of_year": "Seasonal patterns influence baseline thermal conditions.",
        "temp_humidity_interaction": "Combined high temperature and humidity amplifies stress.",
        "wind_cooling": "Insufficient wind limits convective heat dissipation.",
        "radiation_load": "Radiation load contributes to total thermal exposure.",
    }

    abs_shap = np.abs(shap_values)
    total = abs_shap.sum() or 1

    contributions = []
    for i, name in enumerate(FEATURE_NAMES):
        if name in ("hour", "day_of_year", "temp_humidity_interaction"):
            continue
        contrib = float(abs_shap[i] / total)
        if contrib < 0.05:
            continue
        val = req.features.get(name.replace("wind_speed", "wind_speed"), 0)
        direction = "increases" if shap_values[i] > 0 else "decreases"
        contributions.append({
            "feature": name,
            "label": labels.get(name, name),
            "contribution": round(contrib, 3),
            "direction": direction if direction == "increases" else "decreases",
            "explanation": explanations.get(name, f"{labels.get(name, name)} affects thermal stress."),
        })

    contributions.sort(key=lambda x: x["contribution"], reverse=True)
    contributions = contributions[:4]

    category = score_to_category(req.score)
    summary = f"Thermal stress is {category.lower()} with primary drivers being "
    summary += ", ".join(c["label"].lower() for c in contributions[:3])
    summary += ". These factors combine to increase human heat exposure beyond temperature alone."

    return {
        "summary": summary,
        "contributions": contributions,
        "model_version": MODEL_VERSION,
        "method": "SHAP",
    }
