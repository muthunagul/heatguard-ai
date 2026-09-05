import json
import pandas as pd
from pathlib import Path

raw_dir = Path(r"C:\Users\audha\heatguard-ai\ml\data\raw")
out_file = Path(r"C:\Users\audha\heatguard-ai\ml\data\processed\era5_india_2023_2025.csv")

rows = []

for file in sorted(raw_dir.glob("*_era5_*.json")):
    print(f"Reading: {file.name}")

    with open(file, "r", encoding="utf-8") as f:
        data = json.load(f)

    hourly = data["hourly"]
    city = file.name.split("_era5_")[0]

    for i, time in enumerate(hourly["time"]):
        rows.append({
            "city": city,
            "latitude": data["latitude"],
            "longitude": data["longitude"],
            "time": time,
            "temperature": hourly["temperature_2m"][i],
            "humidity": hourly["relative_humidity_2m"][i],
            "wind_speed": hourly["wind_speed_10m"][i],
            "shortwave_radiation": hourly["shortwave_radiation"][i],
            "apparent_temperature": hourly["apparent_temperature"][i],
        })

df = pd.DataFrame(rows)

df.to_csv(out_file, index=False)

print()
print(f"Rows: {len(df)}")
print(f"Columns: {list(df.columns)}")
print(f"Saved: {out_file}")
