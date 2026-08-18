'use client';

// ============================================================
// Campus OS — Weather App (Full Dashboard)
// Real-time weather with city search across India
// ============================================================
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud, Droplets, Wind, Eye, Thermometer, Sunrise, Sunset,
  MapPin, Search, ArrowUp, Gauge, Navigation
} from 'lucide-react';
import { useWeather, getWeatherInfo } from '@/hooks/useWeather';

// Popular Indian cities for quick selection
const POPULAR_CITIES = [
  'Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
  'Chandigarh', 'Kochi', 'Bhopal', 'Visakhapatnam', 'Nagpur',
  'Mysuru', 'Bagalkot', 'Hubli', 'Belgaum', 'Mangalore',
];

function windDirectionToArrow(degrees: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(degrees / 45) % 8;
  return dirs[idx];
}

function timeAgo(timestamp: number): string {
  const minutes = Math.floor((Date.now() - timestamp) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes === 1) return '1 min ago';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function WeatherApp() {
  const { weather, isLoading, toast, detectedCity, searchCity } = useWeather();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCities, setShowCities] = useState(false);

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim()) {
      await searchCity(searchQuery.trim());
      setSearchQuery('');
      setShowCities(false);
    }
  }, [searchQuery, searchCity]);

  const handleCitySelect = useCallback(async (city: string) => {
    await searchCity(city);
    setSearchQuery('');
    setShowCities(false);
  }, [searchCity]);

  const weatherInfo = weather ? getWeatherInfo(weather.weatherCode) : null;

  return (
    <div className="h-full bg-[#0a0f1e] text-[#e2e8f0] overflow-y-auto">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-2 left-1/2 -translate-x-1/2 glass rounded-xl px-4 py-2 text-xs text-[#60a5fa] z-50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-5 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <div className="glass rounded-xl flex items-center px-3 gap-2">
            <Search className="text-[#475569]" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowCities(e.target.value.length > 0);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              onFocus={() => setShowCities(true)}
              placeholder="Search any Indian city..."
              className="flex-1 bg-transparent text-sm text-[#e2e8f0] py-2.5 outline-none placeholder-[#475569]"
            />
            <button
              onClick={handleSearch}
              className="text-xs bg-[#60a5fa]/20 text-[#60a5fa] px-3 py-1 rounded-lg hover:bg-[#60a5fa]/30 transition-colors"
            >
              Search
            </button>
          </div>

          {/* City suggestions dropdown */}
          <AnimatePresence>
            {showCities && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full mt-1 left-0 right-0 glass rounded-xl py-2 max-h-48 overflow-y-auto z-40"
              >
                {POPULAR_CITIES
                  .filter((c) => c.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 8)
                  .map((city) => (
                    <button
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      className="w-full text-left px-4 py-1.5 text-sm text-[#94a3b8] hover:bg-[#60a5fa]/15 hover:text-[#e2e8f0] transition-colors flex items-center gap-2"
                    >
                      <MapPin size={12} /> {city}
                    </button>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Close dropdown on outside click */}
        {showCities && (
          <div className="fixed inset-0 z-30" onClick={() => setShowCities(false)} />
        )}

        {/* Loading state */}
        {isLoading && !weather && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#60a5fa] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Main weather display */}
        {weather && weatherInfo && (
          <>
            {/* Current location & conditions */}
            <div className="glass rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[#94a3b8] text-sm mb-1">
                    <MapPin size={14} />
                    <span>{weather.city}</span>
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="text-6xl font-bold text-[#e2e8f0]">{weather.temperature}°</span>
                    <div className="mb-2">
                      <p className="text-lg text-[#94a3b8]">{weatherInfo.description}</p>
                      <p className="text-sm text-[#475569]">
                        Feels like {weather.feelsLike}° · H:{weather.tempMax}° L:{weather.tempMin}°
                      </p>
                    </div>
                  </div>
                </div>
                <span className="text-7xl">{weatherInfo.icon}</span>
              </div>

              {/* Updated time */}
              <p className="text-xs text-[#475569] mt-3 text-right">
                Updated {timeAgo(weather.updatedAt)}
              </p>
            </div>

            {/* Weather details grid */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: <Droplets size={16} />, label: 'Humidity', value: `${weather.humidity}%`, color: '#60a5fa' },
                { icon: <Wind size={16} />, label: 'Wind', value: `${weather.windSpeed} km/h`, color: '#34d399' },
                { icon: <Navigation size={16} style={{ transform: `rotate(${weather.windDirection}deg)` }} />, label: 'Direction', value: windDirectionToArrow(weather.windDirection), color: '#34d399' },
                { icon: <Gauge size={16} />, label: 'Pressure', value: `${weather.pressure} hPa`, color: '#a78bfa' },
                { icon: <Eye size={16} />, label: 'Visibility', value: `${weather.visibility} km`, color: '#fbbf24' },
                { icon: <Thermometer size={16} />, label: 'Feels Like', value: `${weather.feelsLike}°C`, color: '#f472b6' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                  className="glass rounded-xl p-3 text-center"
                >
                  <div className="flex justify-center mb-1.5" style={{ color: item.color }}>
                    {item.icon}
                  </div>
                  <div className="text-lg font-bold text-[#e2e8f0]">{item.value}</div>
                  <div className="text-xs text-[#475569]">{item.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Sunrise & Sunset */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-xl p-4 flex items-center gap-3">
                <Sunrise className="text-[#fbbf24]" size={24} />
                <div>
                  <p className="text-sm font-semibold text-[#e2e8f0]">{weather.sunrise}</p>
                  <p className="text-xs text-[#475569]">Sunrise</p>
                </div>
              </div>
              <div className="glass rounded-xl p-4 flex items-center gap-3">
                <Sunset className="text-[#f472b6]" size={24} />
                <div>
                  <p className="text-sm font-semibold text-[#e2e8f0]">{weather.sunset}</p>
                  <p className="text-xs text-[#475569]">Sunset</p>
                </div>
              </div>
            </div>

            {/* Temperature range visual */}
            <div className="glass rounded-xl p-4">
              <p className="text-xs text-[#94a3b8] uppercase tracking-wider mb-3">Temperature Range</p>
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#60a5fa] font-medium">{weather.tempMin}°</span>
                <div className="flex-1 h-2 bg-[#1e293b] rounded-full overflow-hidden relative">
                  <motion.div
                    className="absolute inset-y-0 rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, #60a5fa, #fbbf24, #f472b6)',
                      left: `${Math.max(0, ((weather.tempMin + 10) / 60) * 100)}%`,
                      right: `${Math.max(0, 100 - ((weather.tempMax + 10) / 60) * 100)}%`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                  />
                  {/* Current temp marker */}
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#60a5fa]"
                    style={{ left: `${Math.max(0, Math.min(100, ((weather.temperature + 10) / 60) * 100))}%` }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                  />
                </div>
                <span className="text-sm text-[#f472b6] font-medium">{weather.tempMax}°</span>
              </div>
            </div>

            {/* Detected location info */}
            {detectedCity && (
              <div className="glass rounded-xl p-3 flex items-center gap-2 text-xs text-[#475569]">
                <MapPin size={12} className="text-[#34d399]" />
                <span>Auto-detected: <span className="text-[#e2e8f0]">{detectedCity}</span></span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
