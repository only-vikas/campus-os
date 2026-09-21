// ============================================================
// Campus OS — Window Store (Zustand)
// Manages: all open windows, z-index, minimize, maximize
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WindowState, WindowPosition, WindowSize } from '@/types/window';

let zCounter = 100;
let windowIdCounter = 0;

interface WindowStoreState {
  windows: WindowState[];
  activeWindowId: string | null;
  // Actions
  addWindow: (appId: string, title: string, position: WindowPosition, size: WindowSize) => string;
  removeWindow: (windowId: string) => void;
  minimizeWindow: (windowId: string) => void;
  maximizeWindow: (windowId: string) => void;
  fullMaximizeWindow: (windowId: string) => void;
  restoreWindow: (windowId: string) => void;
  focusWindow: (windowId: string) => void;
  updateWindowPosition: (windowId: string, pos: WindowPosition) => void;
  updateWindowSize: (windowId: string, size: WindowSize) => void;
  removeAllWindows: () => void;
}

export const useWindowStore = create<WindowStoreState>((set, get) => ({
  windows: [],
  activeWindowId: null,

  addWindow: (appId, title, position, size) => {
    const id = `win-${appId}-${++windowIdCounter}`;
    // Check if app already open — bring to front instead of reopening
    const existing = get().windows.find((w) => w.appId === appId);
    if (existing) {
      get().focusWindow(existing.id);
      if (existing.isMinimized) get().restoreWindow(existing.id);
      return existing.id;
    }
    // Fit window within current viewport if running in browser
    let finalSize = { ...size };
    let finalPosition = { ...position };
    if (typeof window !== 'undefined') {
      const maxW = Math.max(320, window.innerWidth - 40);
      const maxH = Math.max(260, window.innerHeight - 80);
      finalSize.width = Math.min(finalSize.width, maxW);
      finalSize.height = Math.min(finalSize.height, maxH);

      if (finalPosition.x + finalSize.width > window.innerWidth - 10) {
        finalPosition.x = Math.max(10, window.innerWidth - finalSize.width - 20);
      }
      if (finalPosition.y + finalSize.height > window.innerHeight - 50) {
        finalPosition.y = Math.max(10, Math.floor((window.innerHeight - finalSize.height - 60) / 2));
      }
    }

    const newWindow: WindowState = {
      id,
      appId,
      title,
      isMinimized: false,
      isMaximized: false,
      isFullMaximized: false,
      isFocused: true,
      position: finalPosition,
      size: finalSize,
      zIndex: ++zCounter,
    };
    set((s) => ({
      windows: [...s.windows, newWindow],
      activeWindowId: id,
    }));
    return id;
  },

  removeWindow: (windowId) => {
    set((s) => {
      const remaining = s.windows.filter((w) => w.id !== windowId);
      const lastActive = remaining.length > 0 ? remaining[remaining.length - 1].id : null;
      return { windows: remaining, activeWindowId: lastActive };
    });
  },

  minimizeWindow: (windowId) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === windowId ? { ...w, isMinimized: true, isFocused: false, isFullMaximized: false } : w
      ),
      activeWindowId: null,
    }));
  },

  maximizeWindow: (windowId) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === windowId ? { ...w, isMaximized: !w.isMaximized, isFullMaximized: false } : w
      ),
    }));
  },

  fullMaximizeWindow: (windowId) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === windowId ? { ...w, isFullMaximized: !w.isFullMaximized, isMaximized: false } : w
      ),
    }));
  },

  restoreWindow: (windowId) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === windowId ? { ...w, isMinimized: false } : w
      ),
    }));
    get().focusWindow(windowId);
  },

  focusWindow: (windowId) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === windowId
          ? { ...w, isFocused: true, zIndex: ++zCounter }
          : { ...w, isFocused: false }
      ),
      activeWindowId: windowId,
    }));
  },

  updateWindowPosition: (windowId, pos) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === windowId ? { ...w, position: pos } : w
      ),
    }));
  },

  updateWindowSize: (windowId, size) => {
    set((s) => ({
      windows: s.windows.map((w) =>
        w.id === windowId ? { ...w, size } : w
      ),
    }));
  },

  removeAllWindows: () => set({ windows: [], activeWindowId: null }),
}));
