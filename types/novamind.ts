// ============================================================
// Campus OS — NovaMind Type Definitions
// Personalized Learning & Career Intelligence Engine
// ============================================================

export type SkillCategory =
  | 'programming'
  | 'frameworks'
  | 'data-science'
  | 'soft-skills'
  | 'finance'
  | 'devops';

export type MasteryLevel = 'novice' | 'beginner' | 'intermediate' | 'proficient' | 'expert';

export type ResourceType = 'video' | 'article' | 'course' | 'project' | 'practice';

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  icon: string;
  color: string;
  prerequisites: string[]; // other skill IDs
  description: string;
  tags: string[];
}

export interface SkillMastery {
  skillId: string;
  mastery: number;         // 0–100
  confidence: number;      // 0–100 — consistency of performance
  practiceCount: number;   // number of quiz attempts
  lastPracticed: string;   // ISO date string
}

// Bayesian Knowledge Tracing params
export interface BKTState {
  pKnown: number;      // P(known): probability user knows the skill
  pLearn: number;      // P(learn): probability of learning after practice
  pSlip: number;       // P(slip): probability of wrong answer even if known
  pGuess: number;      // P(guess): probability of right answer even if unknown
}

export interface KnowledgeNode {
  skillId: string;
  bkt: BKTState;
  history: { correct: boolean; timestamp: number }[];
}

export interface LearningResource {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
  skillIds: string[];
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  relevanceScore: number; // 0–100, computed per user
}

export interface Recommendation {
  id: string;
  skillId: string;
  resource: LearningResource;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
}

export interface PathMilestone {
  id: string;
  title: string;
  description: string;
  skillIds: string[];
  estimatedDays: number;
  completed: boolean;
  project?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  careerGoal: string;
  totalDays: number;
  milestones: PathMilestone[];
  generatedAt: string;
}

export interface UserProfile {
  careerGoal: string;
  targetRole: string;
  weeklyHours: number;
  learningStyle: 'visual' | 'reading' | 'practice' | 'mixed';
  currentLevel: 'student' | 'junior' | 'mid' | 'senior';
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  skillId: string;
}

export interface NovaMindChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface CrossAppInsight {
  source: 'resume' | 'interview' | 'code-guard' | 'edu-vault' | 'placement';
  message: string;
  skillId?: string;
  actionLabel: string;
  timestamp: number;
}
