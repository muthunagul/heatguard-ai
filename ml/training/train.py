"""Train HeatGuard XGBoost model using real ERA5-derived data."""

import os
import json
import numpy as np
import pandas as pd
import xgboost as xgb
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score


BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_PATH = os.path.join(
    BASE_DIR, "data", "processed", "training_dataset.csv"
)

MODEL_DIR = os.path.join(BASE_DIR, "models")
MODEL_PATH = os.path.join(MODEL_DIR, "heatguard_xgb_v1.joblib")
META_PATH = os.path.join(MODEL_DIR, "model_metadata.json")


FEATURE_NAMES = [
    "temperature",
    "humidity",
    "wind_speed",
    "apparent_temperature",
    "shortwave_radiation",
    "hour",
    "day_of_year",
    "temp_humidity_interaction",
    "wind_cooling",
    "radiation_load",
]


def build_features(df):
    """Create model features from the real ERA5 dataset."""

    time = pd.to_datetime(df["time"])

    features = pd.DataFrame({
        "temperature": df["temperature"],
        "humidity": df["humidity"],
        "wind_speed": df["wind_speed"],
        "apparent_temperature": df["apparent_temperature"],
        "shortwave_radiation": df["shortwave_radiation"],
        "hour": time.dt.hour,
        "day_of_year": time.dt.dayofyear,
    })

    features["temp_humidity_interaction"] = (
        features["temperature"] * features["humidity"] / 100.0
    )

    features["wind_cooling"] = np.maximum(
        0, 5 - features["wind_speed"]
    )

    features["radiation_load"] = np.clip(
        features["shortwave_radiation"] / 800.0,
        0,
        1
    )

    return features[FEATURE_NAMES]


def train():

    print("Loading real ERA5-derived dataset...")

    df = pd.read_csv(DATA_PATH)

    print(f"Dataset rows: {len(df)}")

    required = ["temperature", "humidity", "wind_speed", "apparent_temperature", "shortwave_radiation", "thermal_stress_score"]

    missing = [column for column in required if column not in df.columns]

    if missing:
        raise ValueError(f"Missing columns: {missing}")

    df = df.dropna(subset=required).copy()

    X = build_features(df)
    y = df["thermal_stress_score"].astype(float)

    print(f"Training rows after cleaning: {len(df)}")

    # Random split for the first hackathon prototype.
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42
    )

    print("Training XGBoost model...")

    model = xgb.XGBRegressor(
        n_estimators=300,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="reg:squarederror",
        random_state=42,
        n_jobs=4,
    )

    model.fit(
        X_train,
        y_train,
        eval_set=[(X_test, y_test)],
        verbose=False
    )

    predictions = model.predict(X_test)

    mae = mean_absolute_error(y_test, predictions)
    r2 = r2_score(y_test, predictions)

    print()
    print("===== MODEL RESULTS =====")
    print(f"MAE: {mae:.3f}")
    print(f"R2:  {r2:.4f}")
    print("=========================")

    os.makedirs(MODEL_DIR, exist_ok=True)

    joblib.dump(model, MODEL_PATH)

    metadata = {
        "model_version": "heatguard-xgb-v1",
        "model_type": "XGBoost Regressor",
        "data_source": "Open-Meteo historical ERA5",
        "cities": sorted(df["city"].unique().tolist()),
        "training_samples": int(len(df)),
        "features": FEATURE_NAMES,
        "target": "thermal_stress_score (0-100)",
        "target_type": "MODELED environmental thermal-stress index",
        "metrics": {
            "mae": round(float(mae), 3),
            "r2": round(float(r2), 4)
        },
        "limitations": [
            "Target is a modeled environmental thermal-stress index.",
            "Model is not clinically validated.",
            "ERA5 is reanalysis data and is not equivalent to direct station observations.",
            "Regional and occupational calibration is recommended before operational deployment."
        ]
    }

    with open(META_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print()
    print(f"Model saved: {MODEL_PATH}")
    print(f"Metadata saved: {META_PATH}")


if __name__ == "__main__":
    train()
