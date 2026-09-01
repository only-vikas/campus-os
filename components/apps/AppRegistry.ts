// ============================================================
// Campus OS — App Registry
// Central configuration for all apps in the OS
// To add a new app: just add an entry here.
// ============================================================
import { AppConfig } from '@/types/app';

export const APP_REGISTRY: AppConfig[] = [
  {
    id: 'resume',
    name: 'Resume Analyzer',
    icon: 'FileText',
    color: '#60a5fa', // blue-400
    description: 'AI-powered resume analysis and optimization',
    category: 'career',
    defaultSize: { width: 800, height: 560 },
    defaultPosition: { x: 80, y: 60 },
    minSize: { width: 500, height: 400 },
  },
  {
    id: 'interview',
    name: 'Interview Prep',
    icon: 'Mic',
    color: '#60a5fa', // blue-400
    description: 'AI-powered mock interviews with real-time feedback',
    category: 'career',
    defaultSize: { width: 1200, height: 800 },
    defaultPosition: { x: 60, y: 40 },
    minSize: { width: 1000, height: 700 },
  },
  {
    id: 'edu-vault',
    name: 'EduVault',
    icon: '🏗️',
    color: '#34d399', // emerald-400
    description: 'Track. Learn. Grow. Your AI-powered financial companion.',
    category: 'finance',
    defaultSize: { width: 1100, height: 750 },
    defaultPosition: { x: 100, y: 50 },
    minSize: { width: 900, height: 600 },
  },
  {
    id: 'placement',
    name: 'Placement Portal',
    icon: 'Briefcase',
    color: '#fbbf24', // amber-400
    description: 'Job listings, applications and placement tracking',
    category: 'career',
    defaultSize: { width: 860, height: 580 },
    defaultPosition: { x: 90, y: 65 },
    minSize: { width: 520, height: 400 },
  },
  {
    id: 'code-guard',
    name: 'CodeGuard',
    icon: 'Shield',
    color: '#fbbf24', // amber-400
    description: 'AI-powered code analysis and automated fixes',
    category: 'productivity',
    defaultSize: { width: 1200, height: 800 },
    defaultPosition: { x: 70, y: 55 },
    minSize: { width: 900, height: 500 },
  },
  {
    id: 'finsack',
    name: 'FinSack',
    icon: 'Landmark',
    color: '#10b981', // emerald-500
    description: 'Learn. Simulate. Trade. The complete financial literacy OS.',
    category: 'finance',
    defaultSize: { width: 1200, height: 800 },
    defaultPosition: { x: 110, y: 75 },
    minSize: { width: 1000, height: 700 },
  },
  {
    id: 'learning',
    name: 'Learning Engine',
    icon: 'BookOpen',
    color: '#60a5fa', // blue-400
    description: 'Adaptive learning paths and course materials',
    category: 'learning',
    defaultSize: { width: 800, height: 560 },
    defaultPosition: { x: 95, y: 68 },
    minSize: { width: 500, height: 380 },
  },
  {
    id: 'campus',
    name: 'Campus Portal',
    icon: 'GraduationCap',
    color: '#a78bfa', // purple-400
    description: 'Student profile, notices, timetable and attendance',
    category: 'productivity',
    defaultSize: { width: 920, height: 620 },
    defaultPosition: { x: 60, y: 50 },
    minSize: { width: 580, height: 440 },
  },
  {
    id: 'weather',
    name: 'Weather',
    icon: 'CloudSun',
    color: '#fbbf24', // amber-400
    description: 'Real-time weather with city search across India',
    category: 'utility',
    defaultSize: { width: 600, height: 560 },
    defaultPosition: { x: 200, y: 50 },
    minSize: { width: 420, height: 400 },
  },
  {
    id: 'settings',
    name: 'Settings',
    icon: 'Settings',
    color: '#94a3b8', // slate-400
    description: 'Customize your Campus OS experience',
    category: 'system',
    defaultSize: { width: 720, height: 520 },
    defaultPosition: { x: 200, y: 100 },
    minSize: { width: 560, height: 400 },
  },
];

// Quick lookup map
export const APP_MAP = new Map(APP_REGISTRY.map((a) => [a.id, a]));

// Dock apps (shown in taskbar) — ordered
export const DOCK_APP_IDS = [
  'resume',
  'interview',
  'edu-vault',
  'placement',
  'code-guard',
  'finsack',
  'learning',
  'campus',
  'weather',
  'settings',
];
