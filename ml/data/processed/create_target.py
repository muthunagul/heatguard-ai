import pandas as pd
import numpy as np

INPUT = r'C:\Users\audha\heatguard-ai\ml\data\processed\era5_india_2023_2025.csv'
OUTPUT = r'C:\Users\audha\heatguard-ai\ml\data\processed\training_dataset.csv'

df = pd.read_csv(INPUT)

temp = df['temperature']
hum = df['humidity']
wind = df['wind_speed']
app = df['apparent_temperature']
rad = df['shortwave_radiation']

# Modeled environmental thermal-stress target, scaled 0-100.
temp_component = np.clip((app - 25) / 15, 0, 1) * 55
humidity_component = np.clip((hum - 50) / 50, 0, 1) * 20
wind_component = np.clip((5 - wind) / 5, 0, 1) * 10
radiation_component = np.clip(rad / 800, 0, 1) * 15

df['thermal_stress_score'] = np.clip(
    temp_component + humidity_component + wind_component + radiation_component,
    0, 100
)

df.to_csv(OUTPUT, index=False)
print(f'Rows: {len(df)}')
print(f'Saved: {OUTPUT}')
print(df['thermal_stress_score'].describe())
