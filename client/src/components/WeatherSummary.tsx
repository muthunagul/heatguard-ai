import type { WeatherCurrent } from '../types';
import { DataSourceBadge } from './common';
import { Thermometer, Droplets, Wind, Sun } from 'lucide-react';

export function WeatherSummary({ weather }: { weather: WeatherCurrent }) {
  const items = [
    { icon: Thermometer, label: 'Temperature', value: `${weather.temperature.toFixed(1)}°C`, unavailable: false },
    { icon: Droplets, label: 'Humidity', value: `${weather.humidity.toFixed(0)}%`, unavailable: weather.unavailableFields.includes('humidity') },
    { icon: Wind, label: 'Wind', value: `${weather.windSpeed.toFixed(1)} m/s`, unavailable: weather.unavailableFields.includes('windSpeed') },
    {
      icon: Sun,
      label: 'Radiation',
      value: weather.shortwaveRadiation !== null ? `${weather.shortwaveRadiation.toFixed(0)} W/m²` : 'Unavailable',
      unavailable: weather.shortwaveRadiation === null,
    },
  ];

  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Weather Conditions</h3>
        <DataSourceBadge badge={weather.badge} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map(({ icon: Icon, label, value, unavailable }) => (
          <div key={label} className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              {label}
            </div>
            <p className={`text-lg font-semibold ${unavailable ? 'text-slate-500' : 'text-slate-100'}`}>
              {value}
            </p>
          </div>
        ))}
      </div>
      {weather.apparentTemperature !== null && (
        <p className="mt-3 text-xs text-slate-400">
          Apparent temperature: {weather.apparentTemperature.toFixed(1)}°C
        </p>
      )}
    </div>
  );
}
