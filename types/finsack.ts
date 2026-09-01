// ============================================================
// Campus OS — FinSack Type Definitions
// Financial Education & Market Intelligence
// ============================================================

export type StrategyCategory = 'investing' | 'swing-trading' | 'options-trading';

export interface Strategy {
  id: string;
  category: StrategyCategory;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  xpReward: number;
  ytSearchTag: string;
  defaultVideoId?: string;
  aiPrompt: string;
  description: string;
}

export interface FinSackUserProgress {
  xp: number;
  streak: number;
  completedLessons: string[];
  lastActiveDate: string;
}

export interface FinSackChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

export interface CategoryInfo {
  name: string;
  icon: string;
  color: string;
}
