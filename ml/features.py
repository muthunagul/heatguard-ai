"""Feature engineering for HeatGuard AI ML model."""
import numpy as np
from datetime import datetime

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


def parse_time_features(time_str: str) -> tuple[int, int]:
    dt = datetime.fromisoformat(time_str.replace("Z", "+00:00"))
    return dt.hour, dt.timetuple().tm_yday


def engineer_features(row: dict) -> np.ndarray:
    temp = row.get("temperature", 30) or 30
    humidity = row.get("humidity", 50) or 50
    wind = row.get("wind_speed", 3) or 3
    apparent = row.get("apparent_temperature") or temp + 2
    sw_rad = row.get("shortwave_radiation") or 0

    hour, doy = 12, 180

    if "time" in row and row["time"]:
        hour, doy = parse_time_features(row["time"])

    return np.array([
        temp,
        humidity,
        wind,
        apparent,
        sw_rad,
        hour,
        doy,
        temp * humidity / 100,
        max(0, 5 - wind),
        sw_rad / 800,
    ], dtype=float)


def compute_target(row: dict) -> float:
    """Reference modeled target used for training documentation."""

    temp = row.get("temperature", 30)
    humidity = row.get("humidity", 50)
    wind = row.get("wind_speed", 3)
    apparent = row.get("apparent_temperature") or temp
    sw_rad = row.get("shortwave_radiation") or 0

    base = max(0, min(100, ((apparent - 25) / 15) * 70))
    hum_factor = max(0, (humidity - 50) / 50) * 15
    wind_mit = max(0, min(10, (5 - wind) * 2))
    rad_factor = min(15, (sw_rad / 800) * 15) if sw_rad else 0

    return float(max(0, min(100, base + hum_factor + wind_mit + rad_factor)))