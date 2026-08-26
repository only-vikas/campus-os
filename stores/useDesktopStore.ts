// ============================================================
// Campus OS — Desktop Store (Zustand)
// Manages: booting, lock screen, wallpaper, widgets, settings
// ============================================================
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type Wallpaper =
  | 'default'
  | 'aurora'
  | 'cosmos'
  | 'mountains'
  | 'abstract';

export type AccentColor = 'blue' | 'purple' | 'emerald';

export type OllamaModel = 'deepseek-r1:1.5b' | 'mistral' | 'llama3.1';

interface DesktopState {
  isBooting: boolean;
  isLocked: boolean;
  wallpaper: Wallpaper;
  showQuotes: boolean;
  showWeather: boolean;
  accentColor: AccentColor;
  quoteVersion: number;       // Incremented on lock/unlock/restart to trigger new quote
  weatherCity: string | null; // null = auto-detect
  ollamaModel: OllamaModel;
  // Actions
  finishBoot: () => void;
  unlock: () => void;
  lock: () => void;
  setWallpaper: (w: Wallpaper) => void;
  restart: () => void;
  shutdown: () => void;
  setShowQuotes: (v: boolean) => void;
  setShowWeather: (v: boolean) => void;
  setAccentColor: (c: AccentColor) => void;
  bumpQuoteVersion: () => void;
  setWeatherCity: (city: string | null) => void;
  setOllamaModel: (model: OllamaModel) => void;
  clearAllData: () => void;
}

export const useDesktopStore = create<DesktopState>()(
  persist(
    (set, get) => ({
      isBooting: true,
      isLocked: true,
      wallpaper: 'default',
      showQuotes: true,
      showWeather: true,
      accentColor: 'blue',
      quoteVersion: 0,
      weatherCity: null,
      ollamaModel: 'deepseek-r1:1.5b',

      finishBoot: () => set({ isBooting: false }),
      unlock: () => {
        set((s) => ({ isLocked: false, quoteVersion: s.quoteVersion + 1 }));
      },
      lock: () => {
        set((s) => ({ isLocked: true, quoteVersion: s.quoteVersion + 1 }));
      },
      setWallpaper: (wallpaper) => set({ wallpaper }),
      restart: () => {
        set((s) => ({ isBooting: true, isLocked: true, quoteVersion: s.quoteVersion + 1 }));
      },
      shutdown: () => {
        set({ isBooting: true, isLocked: true });
      },
      setShowQuotes: (showQuotes) => set({ showQuotes }),
      setShowWeather: (showWeather) => set({ showWeather }),
      setAccentColor: (accentColor) => set({ accentColor }),
      bumpQuoteVersion: () => set((s) => ({ quoteVersion: s.quoteVersion + 1 })),
      setWeatherCity: (weatherCity) => set({ weatherCity }),
      setOllamaModel: (ollamaModel) => set({ ollamaModel }),
      clearAllData: () => {
        // Wipe all localStorage keys used by the app
        if (typeof window !== 'undefined') {
          localStorage.removeItem('campus-os-desktop');
          localStorage.removeItem('campus-os-windows');
          localStorage.removeItem('campus-os-quotes-cache');
          localStorage.removeItem('campus-os-weather-cache');
        }
        set({
          isBooting: true,
          isLocked: true,
          wallpaper: 'default',
          showQuotes: true,
          showWeather: true,
          accentColor: 'blue',
          quoteVersion: 0,
          weatherCity: null,
          ollamaModel: 'deepseek-r1:1.5b',
        });
      },
    }),
    {
      name: 'campus-os-desktop',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        wallpaper: state.wallpaper,
        showQuotes: state.showQuotes,
        showWeather: state.showWeather,
        accentColor: state.accentColor,
        weatherCity: state.weatherCity,
        ollamaModel: state.ollamaModel,
      }),
    }
  )
);
