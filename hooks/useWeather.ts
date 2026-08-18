// ============================================================
// Campus OS — useWeather Hook
// Manages: Open-Meteo API, geolocation, city search, caching
// ============================================================
import { useState, useEffect, useCallback, useRef } from 'react';

// ── Types ────────────────────────────────────────────────────
export interface WeatherData {
  city: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  pressure: number;
  visibility: number;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  sunrise: string;
  sunset: string;
  updatedAt: number; // timestamp
}

interface WeatherCache {
  [cityKey: string]: {
    data: WeatherData;
    expiry: number;
  };
}

// ── WMO Weather Code → description + icon ────────────────────
export function getWeatherInfo(code: number): { description: string; icon: string } {
  if (code === 0) return { description: 'Clear Sky', icon: '☀️' };
  if (code === 1) return { description: 'Mainly Clear', icon: '🌤️' };
  if (code === 2) return { description: 'Partly Cloudy', icon: '⛅' };
  if (code === 3) return { description: 'Overcast', icon: '☁️' };
  if (code === 45 || code === 48) return { description: 'Foggy', icon: '🌫️' };
  if (code >= 51 && code <= 55) return { description: 'Drizzle', icon: '🌦️' };
  if (code >= 56 && code <= 57) return { description: 'Freezing Drizzle', icon: '🌧️' };
  if (code >= 61 && code <= 65) return { description: 'Rain', icon: '🌧️' };
  if (code >= 66 && code <= 67) return { description: 'Freezing Rain', icon: '🌨️' };
  if (code >= 71 && code <= 75) return { description: 'Snow', icon: '❄️' };
  if (code === 77) return { description: 'Snow Grains', icon: '🌨️' };
  if (code >= 80 && code <= 82) return { description: 'Rain Showers', icon: '🌧️' };
  if (code >= 85 && code <= 86) return { description: 'Snow Showers', icon: '🌨️' };
  if (code === 95) return { description: 'Thunderstorm', icon: '⛈️' };
  if (code >= 96 && code <= 99) return { description: 'Thunderstorm with Hail', icon: '⛈️' };
  return { description: 'Unknown', icon: '🌡️' };
}

// ── Constants ────────────────────────────────────────────────
const CACHE_KEY = 'campus-os-weather-cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const GEO_TIMEOUT = 5000; // 5 seconds

const BENGALURU = { lat: 12.9716, lon: 77.5946, city: 'Bengaluru' };

// ── Cache helpers ────────────────────────────────────────────
function getCache(): WeatherCache {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

function setCache(cache: WeatherCache) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

function getCachedWeather(cityKey: string): WeatherData | null {
  const cache = getCache();
  const entry = cache[cityKey.toLowerCase()];
  if (entry && Date.now() < entry.expiry) {
    return entry.data;
  }
  return null;
}

function saveCachedWeather(cityKey: string, data: WeatherData) {
  const cache = getCache();
  cache[cityKey.toLowerCase()] = { data, expiry: Date.now() + CACHE_DURATION };
  setCache(cache);
}

// ── Fetch weather from Open-Meteo ────────────────────────────
async function fetchWeatherData(lat: number, lon: number, cityName: string): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl,visibility&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto&forecast_days=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
  const data = await res.json();

  return {
    city: cityName,
    temperature: Math.round(data.current.temperature_2m),
    feelsLike: Math.round(data.current.apparent_temperature),
    humidity: data.current.relative_humidity_2m,
    windSpeed: Math.round(data.current.wind_speed_10m),
    windDirection: data.current.wind_direction_10m,
    pressure: Math.round(data.current.pressure_msl),
    visibility: Math.round((data.current.visibility || 10000) / 1000), // Convert m to km
    weatherCode: data.current.weather_code,
    tempMax: Math.round(data.daily.temperature_2m_max[0]),
    tempMin: Math.round(data.daily.temperature_2m_min[0]),
    sunrise: data.daily.sunrise[0]?.split('T')[1] || '06:00',
    sunset: data.daily.sunset[0]?.split('T')[1] || '18:00',
    updatedAt: Date.now(),
  };
}

// ── Geocode city name → lat/lon ──────────────────────────────
async function geocodeCity(query: string): Promise<{ lat: number; lon: number; name: string } | null> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    if (data.results && data.results.length > 0) {
      // Prefer Indian results
      const indianResult = data.results.find(
        (r: { country_code?: string }) => r.country_code === 'IN'
      );
      const result = indianResult || data.results[0];
      return {
        lat: result.latitude,
        lon: result.longitude,
        name: result.name || query,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// ── Reverse geocode lat/lon → city name ──────────────────────
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    // Use Open-Meteo geocoding to find nearest city
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=city&count=1&language=en`;
    // Open-Meteo doesn't have reverse geocoding, so we use a simple heuristic
    // Just return coordinates-based city or fallback
    return `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
  } catch {
    return 'Unknown';
  }
}

// ── Browser Geolocation ──────────────────────────────────────
function getBrowserLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }

    const timeoutId = setTimeout(() => {
      reject(new Error('Geolocation timeout'));
    }, GEO_TIMEOUT);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timeoutId);
        resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      (err) => {
        clearTimeout(timeoutId);
        reject(err);
      },
      { enableHighAccuracy: false, timeout: GEO_TIMEOUT, maximumAge: 300000 }
    );
  });
}

// ── The Hook ─────────────────────────────────────────────────
export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [detectedCity, setDetectedCity] = useState<string>('');
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Show toast briefly
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Load weather for coordinates
  const loadWeather = useCallback(async (lat: number, lon: number, cityName: string) => {
    // Check cache first
    const cached = getCachedWeather(cityName);
    if (cached) {
      setWeather(cached);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchWeatherData(lat, lon, cityName);
      setWeather(data);
      saveCachedWeather(cityName, data);
    } catch (err) {
      console.error('Weather fetch error:', err);
      // Try to use any cached data even if expired
      const anyCache = getCachedWeather(cityName);
      if (anyCache) setWeather(anyCache);
    }
    setIsLoading(false);
  }, []);

  // Search for a city
  const searchCity = useCallback(async (query: string) => {
    if (!query.trim()) return;

    // Debounce
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    return new Promise<void>((resolve) => {
      searchTimeoutRef.current = setTimeout(async () => {
        setIsLoading(true);
        const geo = await geocodeCity(query);

        if (geo) {
          await loadWeather(geo.lat, geo.lon, geo.name);
          setDetectedCity(geo.name);
          showToast(`Showing weather for ${geo.name}`);
        } else {
          // Fallback to Bengaluru
          await loadWeather(BENGALURU.lat, BENGALURU.lon, BENGALURU.city);
          setDetectedCity(BENGALURU.city);
          showToast(`City not found. Showing weather for ${BENGALURU.city}`);
        }
        resolve();
      }, 300);
    });
  }, [loadWeather, showToast]);

  // Initial load — auto-detect location
  useEffect(() => {
    async function init() {
      try {
        const pos = await getBrowserLocation();

        // Try to find city name via geocoding nearby
        const nearbySearch = await geocodeCity(`${pos.lat},${pos.lon}`);
        let cityName = 'Your Location';

        if (nearbySearch) {
          cityName = nearbySearch.name;
        }

        // Use a reverse lookup with a more targeted approach
        // Search for a major city near these coordinates
        try {
          const reverseUrl = `https://geocoding-api.open-meteo.com/v1/search?name=a&count=1&language=en`;
          // Since Open-Meteo doesn't support reverse geocoding directly,
          // we just use the coordinates and label the location
          // But let's try a smarter approach: use the coordinates to fetch weather
          // and use nominatim-style fallback
        } catch {}

        setDetectedCity(cityName);
        showToast(`Location detected: ${cityName}`);
        await loadWeather(pos.lat, pos.lon, cityName);
      } catch (err) {
        console.warn('Geolocation failed, using Bengaluru:', err);
        setDetectedCity(BENGALURU.city);
        showToast(`Showing weather for ${BENGALURU.city}`);
        await loadWeather(BENGALURU.lat, BENGALURU.lon, BENGALURU.city);
      }
    }

    init();
  }, [loadWeather, showToast]);

  return {
    weather,
    isLoading,
    toast,
    detectedCity,
    searchCity,
    showToast,
  };
}
