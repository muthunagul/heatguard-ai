import axios from 'axios';
import NodeCache from 'node-cache';
import type { Coordinates, LocationInfo, WeatherCurrent, WeatherForecast, WeatherHourly } from '../types/index.js';
import { validateWeatherValue } from '../utils/thermal.js';

const cache = new NodeCache({ stdTTL: parseInt(process.env.WEATHER_CACHE_TTL || '600', 10) });

const GEO_URL = process.env.OPEN_METEO_GEOCODING_URL || 'https://geocoding-api.open-meteo.com/v1';
const WEATHER_URL = process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com/v1';

export async function searchLocations(query: string): Promise<LocationInfo[]> {
  const cacheKey = `geo:${query.toLowerCase()}`;
  const cached = cache.get<LocationInfo[]>(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get(`${GEO_URL}/search`, {
    params: { name: query, count: 8, language: 'en', format: 'json' },
    timeout: 10000,
  });

  const results: LocationInfo[] = (data.results || []).map((r: Record<string, unknown>) => ({
    name: r.name as string,
    region: r.admin1 as string | undefined,
    country: r.country as string | undefined,
    latitude: r.latitude as number,
    longitude: r.longitude as number,
    timezone: r.timezone as string | undefined,
  }));

  cache.set(cacheKey, results, 3600);
  return results;
}

export async function reverseGeocode(coords: Coordinates): Promise<LocationInfo> {
  const cacheKey = `rev:${coords.latitude.toFixed(3)},${coords.longitude.toFixed(3)}`;
  const cached = cache.get<LocationInfo>(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: coords.latitude,
        lon: coords.longitude,
        format: 'json',
        addressdetails: 1,
      },
      headers: { 'User-Agent': 'HeatGuardAI/1.0 (SIH2026 hackathon project)' },
      timeout: 10000,
    });

    const addr = data.address || {};
    const location: LocationInfo = {
      name: addr.city || addr.town || addr.village || addr.county || data.display_name?.split(',')[0] || 'Unknown',
      region: addr.state || addr.region,
      country: addr.country,
      latitude: coords.latitude,
      longitude: coords.longitude,
      timezone: undefined,
    };

    cache.set(cacheKey, location, 3600);
    return location;
  } catch {
    const location: LocationInfo = {
      name: `${coords.latitude.toFixed(2)}°, ${coords.longitude.toFixed(2)}°`,
      latitude: coords.latitude,
      longitude: coords.longitude,
    };
    cache.set(cacheKey, location, 3600);
    return location;
  }
}

function parseHourly(data: Record<string, unknown>): WeatherHourly[] {
  const hourly = data.hourly as Record<string, unknown[]>;
  if (!hourly?.time) return [];

  const times = hourly.time as string[];
  return times.map((time, i) => ({
    time,
    temperature: (hourly.temperature_2m as number[])?.[i] ?? 0,
    humidity: (hourly.relative_humidity_2m as number[])?.[i] ?? 0,
    windSpeed: (hourly.wind_speed_10m as number[])?.[i] ?? 0,
    apparentTemperature: (hourly.apparent_temperature as number[] | undefined)?.[i] ?? null,
    directRadiation: (hourly.direct_radiation as number[] | undefined)?.[i] ?? null,
    diffuseRadiation: (hourly.diffuse_radiation as number[] | undefined)?.[i] ?? null,
    shortwaveRadiation: (hourly.shortwave_radiation as number[] | undefined)?.[i] ?? null,
    precipitation: (hourly.precipitation as number[] | undefined)?.[i] ?? null,
  }));
}

export async function fetchCurrentWeather(coords: Coordinates): Promise<WeatherCurrent> {
  const cacheKey = `current:${coords.latitude},${coords.longitude}`;
  const cached = cache.get<WeatherCurrent>(cacheKey);
  if (cached) return cached;

  const unavailableFields: string[] = [];
  const { data } = await axios.get(`${WEATHER_URL}/forecast`, {
    params: {
      latitude: coords.latitude,
      longitude: coords.longitude,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'wind_speed_10m',
        'apparent_temperature',
        'precipitation',
        'direct_radiation',
        'diffuse_radiation',
        'shortwave_radiation',
      ].join(','),
      timezone: 'auto',
    },
    timeout: 15000,
  });

  const current = data.current as Record<string, number | string>;
  const fields: Record<string, number | null> = {
    temperature: (current.temperature_2m as number) ?? null,
    humidity: (current.relative_humidity_2m as number) ?? null,
    windSpeed: (current.wind_speed_10m as number) ?? null,
    apparentTemperature: (current.apparent_temperature as number | undefined) ?? null,
    precipitation: (current.precipitation as number | undefined) ?? null,
    directRadiation: (current.direct_radiation as number | undefined) ?? null,
    diffuseRadiation: (current.diffuse_radiation as number | undefined) ?? null,
    shortwaveRadiation: (current.shortwave_radiation as number | undefined) ?? null,
  };

  for (const [key, val] of Object.entries(fields)) {
    if (val === null || val === undefined) unavailableFields.push(key);
    else if (!validateWeatherValue(key, val)) unavailableFields.push(`${key}_invalid`);
  }

  const result: WeatherCurrent = {
    temperature: fields.temperature ?? 0,
    humidity: fields.humidity ?? 0,
    windSpeed: fields.windSpeed ?? 0,
    apparentTemperature: fields.apparentTemperature,
    precipitation: fields.precipitation,
    directRadiation: fields.directRadiation,
    diffuseRadiation: fields.diffuseRadiation,
    shortwaveRadiation: fields.shortwaveRadiation,
    timestamp: (current.time as string) || new Date().toISOString(),
    dataSource: 'Open-Meteo',
    badge: 'OBSERVED',
    unavailableFields,
  };

  cache.set(cacheKey, result, 300);
  return result;
}

export async function fetchForecast(coords: Coordinates, days = 7): Promise<WeatherForecast> {
  const cacheKey = `forecast:${coords.latitude},${coords.longitude}:${days}`;
  const cached = cache.get<WeatherForecast>(cacheKey);
  if (cached) return cached;

  const { data } = await axios.get(`${WEATHER_URL}/forecast`, {
    params: {
      latitude: coords.latitude,
      longitude: coords.longitude,
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'wind_speed_10m',
        'apparent_temperature',
        'direct_radiation',
        'diffuse_radiation',
        'shortwave_radiation',
        'precipitation',
      ].join(','),
      daily: ['temperature_2m_max', 'temperature_2m_min'],
      forecast_days: days,
      timezone: 'auto',
    },
    timeout: 15000,
  });

  const hourly = parseHourly(data);
  const daily = data.daily as Record<string, unknown[]>;
  const unavailableFields: string[] = [];

  if (!hourly.some((h) => h.apparentTemperature !== null)) unavailableFields.push('apparentTemperature');
  if (!hourly.some((h) => h.shortwaveRadiation !== null)) unavailableFields.push('shortwaveRadiation');

  const result: WeatherForecast = {
    hourly,
    dailyMax: ((daily.time as string[]) || []).map((date, i) => ({
      date,
      temperatureMax: (daily.temperature_2m_max as number[])?.[i] ?? 0,
      temperatureMin: (daily.temperature_2m_min as number[])?.[i] ?? 0,
    })),
    dataSource: 'Open-Meteo',
    badge: 'FORECAST',
    forecastPeriod: `${days} days`,
    lastUpdated: new Date().toISOString(),
    unavailableFields,
  };

  cache.set(cacheKey, result, 600);
  return result;
}
