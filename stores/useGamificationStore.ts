import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'levelup';
  timestamp: number;
}

interface GamificationState {
  xp: number;
  level: number;
  notifications: ToastNotification[];
  addXP: (amount: number, reason: string) => void;
  addNotification: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
  reset: () => void;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      notifications: [],
      
      addXP: (amount, reason) => {
        const { xp, level, addNotification } = get();
        const newXP = xp + amount;
        
        // Calculate new level (Level = 1 + floor(XP / 100))
        const newLevel = 1 + Math.floor(newXP / 100);
        
        set({ xp: newXP, level: newLevel });
        
        addNotification({
          title: `+${amount} XP Earned!`,
          message: reason,
          type: 'success',
        });

        if (newLevel > level) {
          addNotification({
            title: 'Level Up! 🌟',
            message: `You reached Level ${newLevel}! Keep up the great work!`,
            type: 'levelup',
          });
        }
      },
      
      addNotification: (toast) => {
        const newToast: ToastNotification = {
          ...toast,
          id: Math.random().toString(36).substr(2, 9),
          timestamp: Date.now(),
        };
        set((state) => ({
          notifications: [newToast, ...state.notifications].slice(0, 50), // keep last 50
        }));
      },
      
      dismissNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },
      
      reset: () => set({ xp: 0, level: 1, notifications: [] }),
    }),
    {
      name: 'campus-os-gamification',
    }
  )
);
