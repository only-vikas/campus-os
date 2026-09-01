// ============================================================
// Campus OS — FinSack Zustand Store
// Manages XP, streaks, lessons, active tab, chat history
// ============================================================
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { FinSackChatMessage } from '@/types/finsack';

type FinSackTab = 'dashboard' | 'finlearn' | 'marketpulse' | 'nova';

interface FinSackState {
  // Progress
  xp: number;
  streak: number;
  completedLessons: string[];
  lastActiveDate: string;

  // UI
  activeTab: FinSackTab;

  // Nova Terminal chat
  chatMessages: FinSackChatMessage[];

  // Actions
  setActiveTab: (tab: FinSackTab) => void;
  addXp: (amount: number) => void;
  completeLesson: (strategyId: string) => void;
  isLessonComplete: (strategyId: string) => boolean;
  addChatMessage: (msg: FinSackChatMessage) => void;
  clearChat: () => void;
}

const WELCOME_MSG: FinSackChatMessage = {
  role: 'assistant',
  content:
    "Welcome to **Nova Terminal** 🚀\n\nI'm your FinTech AI assistant. Ask me anything about trading strategies, market analysis, financial concepts, or portfolio management.\n\nTry: *\"Explain RSI divergence\"* or *\"What's a covered call?\"*",
  timestamp: Date.now(),
};

export const useFinSackStore = create<FinSackState>()(
  persist(
    (set, get) => ({
      xp: 0,
      streak: 1,
      completedLessons: [],
      lastActiveDate: new Date().toISOString().slice(0, 10),
      activeTab: 'dashboard',
      chatMessages: [WELCOME_MSG],

      setActiveTab: (tab) => set({ activeTab: tab }),

      addXp: (amount) =>
        set((s) => ({ xp: s.xp + amount })),

      completeLesson: (strategyId) =>
        set((s) => {
          if (s.completedLessons.includes(strategyId)) return s;
          return { completedLessons: [...s.completedLessons, strategyId] };
        }),

      isLessonComplete: (strategyId) =>
        get().completedLessons.includes(strategyId),

      addChatMessage: (msg) =>
        set((s) => ({ chatMessages: [...s.chatMessages, msg] })),

      clearChat: () => set({ chatMessages: [WELCOME_MSG] }),
    }),
    {
      name: 'campus-os-finsack',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        xp: state.xp,
        streak: state.streak,
        completedLessons: state.completedLessons,
        lastActiveDate: state.lastActiveDate,
      }),
    }
  )
);
