'use client';

// ============================================================
// Campus OS — Weather Widget (Real-Time Data)
// Uses Open-Meteo API with geolocation auto-detect
// Click to open Weather App
// ============================================================
import { motion } from 'framer-motion';
import { useWeather, getWeatherInfo } from '@/hooks/useWeather';
import { useAppStore } from '@/stores/useAppStore';

export default function WeatherWidget() {
  const { weather, isLoading } = useWeather();
  const { launchApp } = useAppStore();

  const handleClick = () => {
    launchApp('weather');
  };

  if (isLoading && !weather) {
    return (
      <motion.div
        className="absolute top-4 right-56 glass rounded-2xl p-4 w-52 select-none cursor-pointer z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, transition: { delay: 0.5 } }}
        drag
        dragMomentum={false}
        style={{ touchAction: 'none' }}
        onClick={handleClick}
      >
        <p className="text-[#a78bfa] text-xs font-medium mb-2 uppercase tracking-wider">🌤 Weather</p>
        <div className="space-y-2 animate-pulse">
          <div className="h-6 bg-[#1e293b] rounded w-16" />
          <div className="h-3 bg-[#1e293b] rounded w-24" />
          <div className="h-3 bg-[#1e293b] rounded w-20" />
        </div>
      </motion.div>
    );
  }

  const weatherInfo = weather ? getWeatherInfo(weather.weatherCode) : { description: 'Loading', icon: '🌡️' };

  return (
    <motion.div
      className="absolute top-4 right-56 glass rounded-2xl p-4 w-52 select-none cursor-pointer z-10 hover:border-[#a78bfa]/30 transition-colors"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, transition: { delay: 0.5 } }}
      drag
      dragMomentum={false}
      style={{ touchAction: 'none' }}
      onClick={handleClick}
    >
      <p className="text-[#a78bfa] text-xs font-medium mb-2 uppercase tracking-wider">🌤 Weather</p>
      {weather && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#e2e8f0] text-3xl font-bold leading-none">{weather.temperature}°</p>
              <p className="text-[#94a3b8] text-xs mt-1">{weatherInfo.description}</p>
              <p className="text-[#475569] text-xs">{weather.city}</p>
            </div>
            <span className="text-5xl">{weatherInfo.icon}</span>
          </div>
          <div className="flex gap-3 mt-3 text-xs text-[#475569]">
            <span>💧 {weather.humidity}%</span>
            <span>💨 {weather.windSpeed} km/h</span>
            <span>🌡 {weather.feelsLike}° feels</span>
          </div>
        </>
      )}
    </motion.div>
  );
}
