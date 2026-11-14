// ============================================================
// Campus OS — App Registry
// Central configuration for all apps in the OS
// Theme: Deep Space Academy Accents
// ============================================================
import { AppConfig } from '@/types/app';

export const APP_REGISTRY: AppConfig[] = [
  {
    id: 'resume',
    name: 'Resume Analyzer',
    icon: 'FileText',
    color: '#F472B6', // Pink — creativity, standout
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
    color: '#38BDF8', // Sky Blue — clarity, confidence
    description: 'AI-powered mock interviews with real-time feedback',
    category: 'career',
    defaultSize: { width: 980, height: 580 },
    defaultPosition: { x: 70, y: 35 },
    minSize: { width: 680, height: 420 },
  },
  {
    id: 'edu-vault',
    name: 'EduVault',
    icon: 'Wallet',
    color: '#34D399', // Emerald — wealth, growth
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
    color: '#FB923C', // Orange — opportunity, career
    description: 'Job listings, applications and placement tracking',
    category: 'career',
    defaultSize: { width: 860, height: 580 },
    defaultPosition: { x: 90, y: 65 },
    minSize: { width: 520, height: 400 },
  },
  {
    id: 'code-guard',
    name: 'CodeGuard',
    icon: 'ShieldCheck',
    color: '#A78BFA', // Violet — precision, security
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
    color: '#F59E0B', // Amber — markets, trading
    description: 'Learn. Simulate. Trade. The complete financial literacy OS.',
    category: 'finance',
    defaultSize: { width: 1200, height: 800 },
    defaultPosition: { x: 110, y: 75 },
    minSize: { width: 1000, height: 700 },
  },
  {
    id: 'nova-mind',
    name: 'NovaMind',
    icon: 'BrainCircuit',
    color: '#22D3EE', // Cyan — knowledge, digital intelligence
    description: "It doesn't just recommend. It understands. It evolves. It builds you.",
    category: 'learning',
    defaultSize: { width: 1100, height: 750 },
    defaultPosition: { x: 95, y: 68 },
    minSize: { width: 900, height: 600 },
  },
  {
    id: 'campus',
    name: 'Campus Portal',
    icon: 'GraduationCap',
    color: '#6366F1', // Indigo — authority, campus core
    description: 'Student profile, grades, attendance, fees & registration',
    category: 'productivity',
    defaultSize: { width: 1100, height: 750 },
    defaultPosition: { x: 80, y: 50 },
    minSize: { width: 900, height: 600 },
  },
  {
    id: 'weather',
    name: 'Weather',
    icon: 'CloudSun',
    color: '#F59E0B', // Amber
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
    color: '#94A3B8', // Slate — configuration
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
  'nova-mind',
  'campus',
  'weather',
  'settings',
];
