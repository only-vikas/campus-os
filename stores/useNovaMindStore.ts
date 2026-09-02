// ============================================================
// Campus OS — NovaMind Zustand Store
// Skill mastery, BKT knowledge tracing, learning paths, chat
// ============================================================
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  SkillMastery,
  KnowledgeNode,
  LearningPath,
  Recommendation,
  NovaMindChatMessage,
  UserProfile,
  CrossAppInsight,
  BKTState,
} from '@/types/novamind';

type NovaMindTab = 'dashboard' | 'skillmap' | 'knowledge' | 'recommendations' | 'tutor' | 'predict' | 'gamification';

// Default BKT params (from literature)
const DEFAULT_BKT: BKTState = {
  pKnown:  0.3,
  pLearn:  0.1,
  pSlip:   0.1,
  pGuess:  0.2,
};

// Bayesian Knowledge Tracing update
function bktUpdate(state: BKTState, correct: boolean): BKTState {
  const { pKnown, pLearn, pSlip, pGuess } = state;
  // P(correct | known) = 1 - pSlip
  // P(correct | unknown) = pGuess
  const pCorrectGivenKnown   = 1 - pSlip;
  const pCorrectGivenUnknown = pGuess;

  const pKnownGivenObs = correct
    ? (pKnown * pCorrectGivenKnown) / (pKnown * pCorrectGivenKnown + (1 - pKnown) * pCorrectGivenUnknown)
    : (pKnown * pSlip) / (pKnown * pSlip + (1 - pKnown) * (1 - pGuess));

  // Learning opportunity: P(know after) = P(know | obs) + P(learn | not know)
  const pKnownAfter = pKnownGivenObs + (1 - pKnownGivenObs) * pLearn;

  return { ...state, pKnown: Math.min(0.99, pKnownAfter) };
}

interface NovaMindState {
  // UI
  activeTab: NovaMindTab;
  hasSeenSplash: boolean;

  // User profile
  userProfile: UserProfile;

  // Skill mastery map: skillId → SkillMastery
  skillMastery: Record<string, SkillMastery>;

  // BKT knowledge nodes: skillId → KnowledgeNode
  knowledgeNodes: Record<string, KnowledgeNode>;

  // Personalized learning path
  activePath: LearningPath | null;

  // Recommendations
  recommendations: Recommendation[];

  // AI Tutor chat
  tutorMessages: NovaMindChatMessage[];

  // Cross-app insights
  insights: CrossAppInsight[];

  // Career readiness (0–100)
  careerReadiness: number;

  // XP
  xp: number;
  streak: number;

  // Actions
  setActiveTab: (tab: NovaMindTab) => void;
  markSplashSeen: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  updateSkillMastery: (skillId: string, delta: number) => void;
  recordQuizAnswer: (skillId: string, correct: boolean) => void;
  setActivePath: (path: LearningPath | null) => void;
  setRecommendations: (recs: Recommendation[]) => void;
  addTutorMessage: (msg: NovaMindChatMessage) => void;
  clearTutorChat: () => void;
  addInsight: (insight: CrossAppInsight) => void;
  getSkillMastery: (skillId: string) => number;
  completeMilestone: (milestoneId: string) => void;
}

const WELCOME_MSG: NovaMindChatMessage = {
  role: 'assistant',
  content: "Hi! I'm **Nova**, your AI learning coach 🧠\n\nI can help you learn concepts, quiz you on topics, and build your personalized study plan.\n\nTry asking:\n- *\"Quiz me on Python closures\"*\n- *\"Explain how React hooks work\"*\n- *\"What should I learn next for a frontend role?\"*",
  timestamp: Date.now(),
};

// Sample cross-app insights to seed the experience
const SEED_INSIGHTS: CrossAppInsight[] = [
  {
    source: 'resume',
    message: 'Your resume lacks Docker experience — it appears in 62% of target job postings.',
    skillId: 'docker',
    actionLabel: 'Learn Docker',
    timestamp: Date.now() - 86400000 * 2,
  },
  {
    source: 'interview',
    message: 'You struggled with System Design questions in your last mock interview.',
    skillId: 'system-design',
    actionLabel: 'Practice System Design',
    timestamp: Date.now() - 86400000,
  },
  {
    source: 'code-guard',
    message: 'CodeGuard detected repeated async/await misuse — time to solidify this concept.',
    skillId: 'javascript',
    actionLabel: 'Review Async JS',
    timestamp: Date.now() - 3600000 * 4,
  },
];

// Seed mastery with realistic starting values
const SEED_MASTERY: Record<string, SkillMastery> = {
  python:        { skillId: 'python',        mastery: 72, confidence: 80, practiceCount: 12, lastPracticed: new Date().toISOString().slice(0, 10) },
  javascript:    { skillId: 'javascript',    mastery: 65, confidence: 70, practiceCount: 8,  lastPracticed: new Date().toISOString().slice(0, 10) },
  react:         { skillId: 'react',         mastery: 55, confidence: 60, practiceCount: 5,  lastPracticed: new Date().toISOString().slice(0, 10) },
  git:           { skillId: 'git',           mastery: 85, confidence: 90, practiceCount: 20, lastPracticed: new Date().toISOString().slice(0, 10) },
  sql:           { skillId: 'sql',           mastery: 45, confidence: 50, practiceCount: 4,  lastPracticed: new Date().toISOString().slice(0, 10) },
  communication: { skillId: 'communication', mastery: 68, confidence: 65, practiceCount: 7,  lastPracticed: new Date().toISOString().slice(0, 10) },
  dsa:           { skillId: 'dsa',           mastery: 38, confidence: 40, practiceCount: 6,  lastPracticed: new Date().toISOString().slice(0, 10) },
};

const SEED_BKT: Record<string, KnowledgeNode> = Object.fromEntries(
  Object.keys(SEED_MASTERY).map((id) => [
    id,
    {
      skillId: id,
      bkt: { ...DEFAULT_BKT, pKnown: SEED_MASTERY[id].mastery / 100 },
      history: [],
    },
  ])
);

export const useNovaMindStore = create<NovaMindState>()(
  persist(
    (set, get) => ({
      activeTab: 'dashboard',
      hasSeenSplash: false,
      userProfile: {
        careerGoal: 'Full-Stack Developer',
        targetRole: 'Software Engineer',
        weeklyHours: 10,
        learningStyle: 'mixed',
        currentLevel: 'student',
      },
      skillMastery: SEED_MASTERY,
      knowledgeNodes: SEED_BKT,
      activePath: null,
      recommendations: [],
      tutorMessages: [WELCOME_MSG],
      insights: SEED_INSIGHTS,
      careerReadiness: 42,
      xp: 350,
      streak: 5,

      setActiveTab: (tab) => set({ activeTab: tab }),
      markSplashSeen: () => set({ hasSeenSplash: true }),

      updateProfile: (profile) =>
        set((s) => ({ userProfile: { ...s.userProfile, ...profile } })),

      updateSkillMastery: (skillId, delta) =>
        set((s) => {
          const current = s.skillMastery[skillId] ?? {
            skillId,
            mastery: 0,
            confidence: 0,
            practiceCount: 0,
            lastPracticed: new Date().toISOString().slice(0, 10),
          };
          const newMastery = Math.min(100, Math.max(0, current.mastery + delta));
          const updated: SkillMastery = {
            ...current,
            mastery: newMastery,
            lastPracticed: new Date().toISOString().slice(0, 10),
          };
          return { skillMastery: { ...s.skillMastery, [skillId]: updated } };
        }),

      recordQuizAnswer: (skillId, correct) =>
        set((s) => {
          // BKT update
          const nodeState = s.knowledgeNodes[skillId] ?? {
            skillId,
            bkt: { ...DEFAULT_BKT },
            history: [],
          };
          const newBkt = bktUpdate(nodeState.bkt, correct);
          const newHistory = [...nodeState.history, { correct, timestamp: Date.now() }];
          const newNode: KnowledgeNode = { skillId, bkt: newBkt, history: newHistory };

          // Update mastery from BKT
          const masteryVal = Math.round(newBkt.pKnown * 100);
          const currentMastery = s.skillMastery[skillId] ?? {
            skillId, mastery: 0, confidence: 0, practiceCount: 0,
            lastPracticed: new Date().toISOString().slice(0, 10),
          };
          const correctCount = newHistory.filter((h) => h.correct).length;
          const confidence = newHistory.length > 0 ? Math.round((correctCount / newHistory.length) * 100) : 0;

          const updatedMastery: SkillMastery = {
            ...currentMastery,
            mastery: masteryVal,
            confidence,
            practiceCount: currentMastery.practiceCount + 1,
            lastPracticed: new Date().toISOString().slice(0, 10),
          };

          return {
            knowledgeNodes: { ...s.knowledgeNodes, [skillId]: newNode },
            skillMastery: { ...s.skillMastery, [skillId]: updatedMastery },
            xp: s.xp + (correct ? 15 : 5),
          };
        }),

      setActivePath: (path) => set({ activePath: path }),
      setRecommendations: (recommendations) => set({ recommendations }),

      addTutorMessage: (msg) =>
        set((s) => ({ tutorMessages: [...s.tutorMessages, msg] })),

      clearTutorChat: () => set({ tutorMessages: [WELCOME_MSG] }),
      addInsight: (insight) =>
        set((s) => ({ insights: [insight, ...s.insights].slice(0, 20) })),

      getSkillMastery: (skillId) => {
        const m = get().skillMastery[skillId];
        return m?.mastery ?? 0;
      },

      completeMilestone: (milestoneId) =>
        set((s) => {
          if (!s.activePath) return s;
          const milestones = s.activePath.milestones.map((m) =>
            m.id === milestoneId ? { ...m, completed: true } : m
          );
          return {
            activePath: { ...s.activePath, milestones },
            xp: s.xp + 100,
          };
        }),
    }),
    {
      name: 'campus-os-novamind',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        hasSeenSplash: s.hasSeenSplash,
        userProfile: s.userProfile,
        skillMastery: s.skillMastery,
        knowledgeNodes: s.knowledgeNodes,
        activePath: s.activePath,
        recommendations: s.recommendations,
        insights: s.insights,
        careerReadiness: s.careerReadiness,
        xp: s.xp,
        streak: s.streak,
      }),
    }
  )
);
