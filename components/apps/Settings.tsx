'use client';

// ============================================================
// Campus OS — Settings App (Enhanced)
// Full settings: Desktop, Location, Appearance, System
// ============================================================
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDesktopStore, Wallpaper, AccentColor } from '@/stores/useDesktopStore';
import { useWindowStore } from '@/stores/useWindowStore';
import { useWeather } from '@/hooks/useWeather';
import {
  Image, Layout, RefreshCw, Info, MapPin, Palette,
  Power, Trash2, Eye, EyeOff, Monitor, Search, Sun, Moon, CloudSun
} from 'lucide-react';

type SettingsTab = 'desktop' | 'location' | 'appearance' | 'system';

const TABS: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'desktop', label: 'Desktop', icon: <Monitor size={15} /> },
  { id: 'location', label: 'Location', icon: <MapPin size={15} /> },
  { id: 'appearance', label: 'Appearance', icon: <Palette size={15} /> },
  { id: 'system', label: 'System', icon: <RefreshCw size={15} /> },
];

const WALLPAPERS: { id: Wallpaper; label: string; preview: string }[] = [
  { id: 'default', label: 'Deep Space', preview: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0f172a 100%)' },
  { id: 'aurora', label: 'Aurora', preview: 'linear-gradient(135deg, #0f172a 0%, #064e3b 40%, #1e3a5f 100%)' },
  { id: 'cosmos', label: 'Cosmos', preview: 'radial-gradient(ellipse at 30% 50%, #1a0533 0%, #0f172a 70%)' },
  { id: 'mountains', label: 'Mountains', preview: 'linear-gradient(180deg, #0c1445 0%, #2d3561 60%, #0f172a 100%)' },
  { id: 'abstract', label: 'Abstract', preview: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 33%, #14532d 66%, #0f172a 100%)' },
];

const ACCENT_COLORS: { id: AccentColor; label: string; color: string }[] = [
  { id: 'blue', label: 'Blue', color: '#60a5fa' },
  { id: 'purple', label: 'Purple', color: '#a78bfa' },
  { id: 'emerald', label: 'Emerald', color: '#34d399' },
];

const INDIAN_CITIES = [
  'Bengaluru', 'Mumbai', 'Delhi', 'Chennai', 'Hyderabad', 'Kolkata',
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kochi', 'Bhopal',
  'Visakhapatnam', 'Nagpur', 'Mysuru', 'Bagalkot', 'Hubli', 'Belgaum',
];

export default function Settings() {
  const [tab, setTab] = useState<SettingsTab>('desktop');
  const [citySearch, setCitySearch] = useState('');
  const {
    wallpaper, setWallpaper,
    showQuotes, setShowQuotes,
    showWeather, setShowWeather,
    accentColor, setAccentColor,
    restart, shutdown, clearAllData,
  } = useDesktopStore();
  const { removeAllWindows } = useWindowStore();
  const { detectedCity, searchCity } = useWeather();

  const handleCitySearch = async () => {
    if (citySearch.trim()) {
      await searchCity(citySearch.trim());
      setCitySearch('');
    }
  };

  return (
    <div className="flex h-full bg-[#0a0f1e] text-[#e2e8f0]">
      {/* Sidebar */}
      <div className="w-40 flex flex-col gap-1 p-3 border-r border-[rgba(51,65,85,0.4)] bg-[rgba(15,23,42,0.6)] flex-shrink-0">
        <div className="px-2 py-3 mb-2">
          <h3 className="font-bold text-sm">⚙️ Settings</h3>
          <p className="text-[#475569] text-xs mt-0.5">Customize Campus OS</p>
        </div>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all text-left ${
              tab === t.id
                ? 'bg-[#60a5fa]/20 text-[#60a5fa] font-medium'
                : 'text-[#94a3b8] hover:bg-[rgba(51,65,85,0.3)]'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* ── DESKTOP ─────────────────────────────── */}
        {tab === 'desktop' && (
          <>
            <h2 className="text-lg font-bold">Desktop</h2>

            {/* Wallpaper */}
            <section className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Image className="text-[#60a5fa]" size={18} />
                <h3 className="font-semibold">Wallpaper</h3>
              </div>
              <div className="grid grid-cols-5 gap-3">
                {WALLPAPERS.map((wp) => (
                  <motion.button
                    key={wp.id}
                    onClick={() => setWallpaper(wp.id)}
                    className={`relative rounded-xl overflow-hidden aspect-video cursor-pointer transition-all ${
                      wallpaper === wp.id ? 'ring-2 ring-[#60a5fa] ring-offset-2 ring-offset-[#0a0f1e]' : 'hover:scale-105'
                    }`}
                    style={{ background: wp.preview }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {wallpaper === wp.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-5 h-5 rounded-full bg-[#60a5fa] flex items-center justify-center text-white text-xs">✓</div>
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {WALLPAPERS.map((wp) => (
                  <span key={wp.id} className={`text-xs ${wallpaper === wp.id ? 'text-[#60a5fa]' : 'text-[#475569]'}`}>
                    {wp.label}
                  </span>
                ))}
              </div>
            </section>

            {/* Widget toggles */}
            <section className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Layout className="text-[#a78bfa]" size={18} />
                <h3 className="font-semibold">Widgets</h3>
              </div>

              <div className="space-y-3">
                {/* Quotes toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💡</span>
                    <div>
                      <p className="text-sm font-medium">Daily Quotes</p>
                      <p className="text-xs text-[#475569]">Show motivational quotes on desktop</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowQuotes(!showQuotes)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      showQuotes ? 'bg-[#60a5fa]' : 'bg-[#1e293b]'
                    }`}
                  >
                    <motion.div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
                      animate={{ left: showQuotes ? '22px' : '2px' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                {/* Weather toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🌤</span>
                    <div>
                      <p className="text-sm font-medium">Weather Widget</p>
                      <p className="text-xs text-[#475569]">Show weather on desktop</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowWeather(!showWeather)}
                    className={`relative w-11 h-6 rounded-full transition-colors ${
                      showWeather ? 'bg-[#60a5fa]' : 'bg-[#1e293b]'
                    }`}
                  >
                    <motion.div
                      className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
                      animate={{ left: showWeather ? '22px' : '2px' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* Close all windows */}
            <button
              onClick={removeAllWindows}
              className="w-full py-2.5 rounded-xl bg-[#f472b6]/10 text-[#f472b6] border border-[#f472b6]/20 text-sm font-medium hover:bg-[#f472b6]/20 transition-colors"
            >
              Close All Windows
            </button>
          </>
        )}

        {/* ── LOCATION ────────────────────────────── */}
        {tab === 'location' && (
          <>
            <h2 className="text-lg font-bold">Location</h2>

            {/* Detected location */}
            <section className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="text-[#34d399]" size={18} />
                <h3 className="font-semibold">Current Location</h3>
              </div>
              <div className="glass-dark rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#34d399]/20 flex items-center justify-center">
                  <MapPin className="text-[#34d399]" size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium">{detectedCity || 'Detecting...'}</p>
                  <p className="text-xs text-[#475569]">Auto-detected via browser</p>
                </div>
              </div>
            </section>

            {/* Manual city search */}
            <section className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Search className="text-[#60a5fa]" size={18} />
                <h3 className="font-semibold">Change Location</h3>
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCitySearch()}
                  placeholder="Enter city name..."
                  className="flex-1 bg-[#0f172a] border border-[rgba(51,65,85,0.4)] rounded-xl px-3 py-2 text-sm text-[#e2e8f0] outline-none focus:border-[#60a5fa]/50 placeholder-[#475569]"
                />
                <button
                  onClick={handleCitySearch}
                  className="px-4 py-2 bg-[#60a5fa]/20 text-[#60a5fa] rounded-xl text-sm font-medium hover:bg-[#60a5fa]/30 transition-colors"
                >
                  Set
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {INDIAN_CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => searchCity(city)}
                    className="text-xs glass rounded-lg px-2.5 py-1 text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#60a5fa]/15 transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ── APPEARANCE ──────────────────────────── */}
        {tab === 'appearance' && (
          <>
            <h2 className="text-lg font-bold">Appearance</h2>

            {/* Theme */}
            <section className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sun className="text-[#fbbf24]" size={18} />
                <h3 className="font-semibold">Theme</h3>
              </div>
              <div className="flex gap-3">
                <div className="flex-1 glass-dark rounded-xl p-3 border-2 border-[#60a5fa]/50">
                  <div className="w-full h-12 rounded-lg bg-[#0f172a] mb-2 flex items-center justify-center">
                    <Moon className="text-[#60a5fa]" size={16} />
                  </div>
                  <p className="text-xs text-center text-[#e2e8f0] font-medium">Dark ✓</p>
                </div>
                <div className="flex-1 glass rounded-xl p-3 opacity-40 cursor-not-allowed">
                  <div className="w-full h-12 rounded-lg bg-[#f8fafc] mb-2 flex items-center justify-center">
                    <Sun className="text-[#fbbf24]" size={16} />
                  </div>
                  <p className="text-xs text-center text-[#94a3b8]">Light (Phase 2)</p>
                </div>
              </div>
            </section>

            {/* Accent color */}
            <section className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Palette className="text-[#a78bfa]" size={18} />
                <h3 className="font-semibold">Accent Color</h3>
              </div>
              <div className="flex gap-3">
                {ACCENT_COLORS.map((ac) => (
                  <motion.button
                    key={ac.id}
                    onClick={() => setAccentColor(ac.id)}
                    className={`flex-1 rounded-xl p-3 text-center transition-all ${
                      accentColor === ac.id ? 'ring-2 ring-offset-2 ring-offset-[#0a0f1e]' : 'glass'
                    }`}
                    style={{
                      ringColor: accentColor === ac.id ? ac.color : undefined,
                      borderColor: accentColor === ac.id ? ac.color : 'transparent',
                    }}
                    whileTap={{ scale: 0.96 }}
                  >
                    <div
                      className="w-8 h-8 rounded-full mx-auto mb-2"
                      style={{ background: ac.color }}
                    />
                    <p className="text-xs" style={{ color: accentColor === ac.id ? ac.color : '#94a3b8' }}>
                      {ac.label}
                    </p>
                  </motion.button>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ── SYSTEM ──────────────────────────────── */}
        {tab === 'system' && (
          <>
            <h2 className="text-lg font-bold">System</h2>

            <section className="glass rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Power className="text-[#34d399]" size={18} />
                <h3 className="font-semibold">Power</h3>
              </div>

              <button
                onClick={restart}
                className="w-full py-2.5 rounded-xl bg-[#fbbf24]/10 text-[#fbbf24] border border-[#fbbf24]/20 text-sm font-medium hover:bg-[#fbbf24]/20 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} /> Restart
              </button>

              <button
                onClick={shutdown}
                className="w-full py-2.5 rounded-xl bg-[#94a3b8]/10 text-[#94a3b8] border border-[#94a3b8]/20 text-sm font-medium hover:bg-[#94a3b8]/20 transition-colors flex items-center justify-center gap-2"
              >
                <Power size={14} /> Shut Down
              </button>
            </section>

            {/* Danger zone */}
            <section className="glass rounded-2xl p-5 border border-[#f472b6]/20">
              <div className="flex items-center gap-2 mb-3">
                <Trash2 className="text-[#f472b6]" size={18} />
                <h3 className="font-semibold text-[#f472b6]">Danger Zone</h3>
              </div>
              <p className="text-xs text-[#475569] mb-3">
                This will wipe all saved data including window positions, wallpaper preferences, and cached weather/quote data.
              </p>
              <button
                onClick={() => {
                  if (confirm('Are you sure? This will erase all Campus OS data.')) {
                    clearAllData();
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-[#f472b6]/10 text-[#f472b6] border border-[#f472b6]/20 text-sm font-medium hover:bg-[#f472b6]/20 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Clear All Data & Reset
              </button>
            </section>

            {/* About */}
            <section className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Info className="text-[#94a3b8]" size={18} />
                <h3 className="font-semibold">About Campus OS</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Version', value: '1.5.0' },
                  { label: 'Framework', value: 'Next.js 14' },
                  { label: 'Animations', value: 'Framer Motion' },
                  { label: 'Windows', value: 'react-rnd' },
                  { label: 'Weather', value: 'Open-Meteo' },
                  { label: 'Quotes', value: 'ZenQuotes' },
                ].map((info) => (
                  <div key={info.label} className="flex justify-between">
                    <span className="text-[#475569]">{info.label}</span>
                    <span className="text-[#e2e8f0]">{info.value}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
