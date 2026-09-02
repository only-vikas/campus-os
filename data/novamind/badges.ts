// ============================================================
// Campus OS — NovaMind Badge & Gamification Data
// Phase 6: Badges, achievements, XP milestones
// ============================================================
import type { SkillCategory } from '@/types/novamind';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'skill' | 'streak' | 'quiz' | 'career' | 'special';
  xpReward: number;
  requirement: { type: 'xp' | 'streak' | 'mastery' | 'quiz_count' | 'skill_count'; value: number; skillId?: string };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  color: string;
}

export const BADGES: Badge[] = [
  // ── Learning Badges ───────────────────────────────────────
  { id: 'first-quiz',     name: 'First Steps',     description: 'Complete your first quiz',          icon: '🎯', category: 'quiz',    xpReward: 50,  requirement: { type: 'quiz_count', value: 1  }, rarity: 'common',    color: '#60a5fa' },
  { id: 'quiz-10',        name: 'Quiz Addict',      description: 'Complete 10 quizzes',               icon: '🧩', category: 'quiz',    xpReward: 150, requirement: { type: 'quiz_count', value: 10 }, rarity: 'common',    color: '#60a5fa' },
  { id: 'quiz-50',        name: 'Knowledge Seeker', description: 'Complete 50 quizzes',               icon: '📚', category: 'quiz',    xpReward: 500, requirement: { type: 'quiz_count', value: 50 }, rarity: 'rare',      color: '#a78bfa' },
  // ── Streak Badges ─────────────────────────────────────────
  { id: 'streak-3',  name: 'Getting Warm',    description: '3-day learning streak',    icon: '🔥', category: 'streak', xpReward: 100, requirement: { type: 'streak', value: 3  }, rarity: 'common',    color: '#fb923c' },
  { id: 'streak-7',  name: 'Week Warrior',    description: '7-day learning streak',    icon: '⚡', category: 'streak', xpReward: 300, requirement: { type: 'streak', value: 7  }, rarity: 'rare',      color: '#fbbf24' },
  { id: 'streak-30', name: 'On Fire!',        description: '30-day learning streak',   icon: '🌟', category: 'streak', xpReward: 1000,requirement: { type: 'streak', value: 30 }, rarity: 'legendary', color: '#f59e0b' },
  // ── Skill Badges ──────────────────────────────────────────
  { id: 'skill-5',       name: 'Skill Explorer',  description: 'Track 5 skills',                    icon: '🗺️', category: 'skill',   xpReward: 100, requirement: { type: 'skill_count', value: 5  }, rarity: 'common',    color: '#34d399' },
  { id: 'skill-20',      name: 'Skill Hunter',    description: 'Track 20 skills',                   icon: '🏹', category: 'skill',   xpReward: 400, requirement: { type: 'skill_count', value: 20 }, rarity: 'rare',      color: '#34d399' },
  { id: 'python-master', name: 'Python Master',   description: 'Reach 80% Python mastery',          icon: '🐍', category: 'skill',   xpReward: 500, requirement: { type: 'mastery', value: 80, skillId: 'python' }, rarity: 'epic', color: '#60a5fa' },
  { id: 'js-ninja',      name: 'JS Ninja',        description: 'Reach 80% JavaScript mastery',      icon: '⚡', category: 'skill',   xpReward: 500, requirement: { type: 'mastery', value: 80, skillId: 'javascript' }, rarity: 'epic', color: '#fbbf24' },
  { id: 'full-stack',    name: 'Full Stack Hero',  description: 'Master React, Node.js and SQL',     icon: '🦸', category: 'skill',   xpReward: 800, requirement: { type: 'skill_count', value: 3 }, rarity: 'epic',      color: '#a78bfa' },
  // ── XP / Career Badges ────────────────────────────────────
  { id: 'xp-500',   name: 'Rising Star',    description: 'Earn 500 XP',    icon: '⭐', category: 'career', xpReward: 50,   requirement: { type: 'xp', value: 500  }, rarity: 'common',    color: '#fbbf24' },
  { id: 'xp-2000',  name: 'Achiever',       description: 'Earn 2,000 XP',  icon: '🏆', category: 'career', xpReward: 200,  requirement: { type: 'xp', value: 2000 }, rarity: 'rare',      color: '#f59e0b' },
  { id: 'xp-10000', name: 'Legend',         description: 'Earn 10,000 XP', icon: '👑', category: 'career', xpReward: 1000, requirement: { type: 'xp', value: 10000}, rarity: 'legendary', color: '#a78bfa' },
  // ── Special ───────────────────────────────────────────────
  { id: 'path-complete', name: 'Roadmap Hero', description: 'Complete your first learning path', icon: '🗺️', category: 'special', xpReward: 500, requirement: { type: 'skill_count', value: 1 }, rarity: 'legendary', color: '#c084fc' },
];

export const RARITY_CONFIG = {
  common:    { label: 'Common',    color: '#94a3b8', glow: 'rgba(148,163,184,0.3)' },
  rare:      { label: 'Rare',     color: '#60a5fa', glow: 'rgba(96,165,250,0.4)'  },
  epic:      { label: 'Epic',     color: '#a78bfa', glow: 'rgba(167,139,250,0.5)' },
  legendary: { label: 'Legendary', color: '#f59e0b', glow: 'rgba(245,158,11,0.5)' },
};

// XP milestones for leveling
export const LEVEL_THRESHOLDS = [0, 500, 1500, 3000, 5500, 9000, 14000, 21000, 30000, 42000];

export function getLevel(xp: number): number {
  let level = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

export function getLevelProgress(xp: number): { level: number; current: number; next: number; pct: number } {
  const level = getLevel(xp);
  const current = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const next = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const pct = next > current ? Math.round(((xp - current) / (next - current)) * 100) : 100;
  return { level, current, next, pct };
}
