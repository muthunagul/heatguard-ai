import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import type { LocationInfo } from '../types';

interface LocationSelectorProps {
  onSelect: (location: LocationInfo) => void;
  current?: LocationInfo | null;
  compact?: boolean;
}

export function LocationSelector({ onSelect, current, compact }: LocationSelectorProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.searchLocation(query);
        setResults(data.results);
        setShowResults(true);
      } catch {
        setError('Location search failed');
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const useMyLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setGeoLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await api.reverseGeocode(pos.coords.latitude, pos.coords.longitude);
          onSelect(data.location);
          setQuery('');
          setShowResults(false);
        } catch {
          setError('Could not resolve your location');
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === 1) setError('Location permission denied. Please search for your location instead.');
        else setError('Could not get your location. Please try searching.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const selectResult = (loc: LocationInfo) => {
    onSelect(loc);
    setQuery('');
    setShowResults(false);
    setError(null);
  };

  if (compact && current) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-300">
        <MapPin className="h-4 w-4 text-orange-400 shrink-0" aria-hidden="true" />
        <span>{current.name}{current.region ? `, ${current.region}` : ''}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={useMyLocation}
          disabled={geoLoading}
          className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-500 disabled:opacity-60 transition-colors"
          aria-label="Use my current location"
        >
          {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          Use My Location
        </button>
      </div>

      <div className="relative">
        <div className="flex items-center gap-2 rounded-lg border border-slate-600 bg-navy-800 px-3 py-2.5 focus-within:border-orange-500">
          <Search className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search city or region..."
            className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
            aria-label="Search location"
            onFocus={() => results.length > 0 && setShowResults(true)}
          />
          {loading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
        </div>

        {showResults && results.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full rounded-lg border border-slate-600 bg-navy-800 shadow-xl overflow-hidden" role="listbox">
            {results.map((r, i) => (
              <li key={`${r.latitude}-${r.longitude}-${i}`}>
                <button
                  onClick={() => selectResult(r)}
                  className="flex w-full items-start gap-2 px-4 py-3 text-left text-sm hover:bg-navy-700 transition-colors"
                  role="option"
                >
                  <MapPin className="h-4 w-4 mt-0.5 text-orange-400 shrink-0" />
                  <span>
                    <span className="font-medium text-slate-200">{r.name}</span>
                    {(r.region || r.country) && (
                      <span className="block text-xs text-slate-400">{[r.region, r.country].filter(Boolean).join(', ')}</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-sm text-red-400" role="alert">{error}</p>}

      {current && (
        <div className="glass-card p-4 space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-orange-400" aria-hidden="true" />
            <span className="font-medium text-slate-200">
              {current.name}{current.region ? `, ${current.region}` : ''}{current.country ? `, ${current.country}` : ''}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            {current.latitude.toFixed(4)}°N, {current.longitude.toFixed(4)}°E
          </p>
        </div>
      )}
    </div>
  );
}
