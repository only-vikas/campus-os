// ============================================================
// Campus OS — Interview Store (Zustand)
// Full interview state machine with persistence
// ============================================================
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type InterviewType = 'technical' | 'behavioral' | 'resume' | 'stress';

export type InterviewStatus =
  | 'idle'
  | 'setup'
  | 'ready'
  | 'ai-speaking'
  | 'user-speaking'
  | 'evaluating'
  | 'completed';

// Speech vs writing-only
export type InterviewMode = 'speech' | 'writing';

// Interviewer persona
export type InterviewerPersona = 'alex' | 'raj' | 'sofia' | 'priya';

export interface QAPair {
  question: string;
  answer: string;
  score: number;
  feedback: string;
  dimension: string;
  timestamp: number;
}

export interface DimensionScore {
  communication: number;
  technicalDepth: number;
  problemSolving: number;
  culturalFit: number;
  confidence: number;
  starUsage: number;
}

export interface FillerWords {
  um: number;
  uh: number;
  like: number;
  basically: number;
  actually: number;
}

export interface FinalReport {
  overallScore: number;
  dimensions: DimensionScore;
  strengths: string[];
  weaknesses: string[];
  improvements: { title: string; description: string; resource?: string }[];
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface InterviewState {
  // Session identity
  sessionId: string | null;
  status: InterviewStatus;
  interviewType: InterviewType | null;
  company: string | null;

  // NEW: Document context
  jdText: string;         // Job description (pasted or extracted)
  resumeText: string;     // Resume text (pasted or extracted)

  // NEW: Mode + persona
  interviewMode: InterviewMode;
  interviewerPersona: InterviewerPersona;

  // Live interview data
  currentQuestion: string;
  currentAnswer: string;
  questionHistory: QAPair[];
  questionNumber: number;
  totalQuestions: number;

  // Scoring
  runningScore: number;
  dimensions: DimensionScore;
  fillerWords: FillerWords;
  difficulty: number;

  // Timer
  startTime: number | null;
  duration: number;

  // Modes
  voiceEnabled: boolean;
  ttsEnabled: boolean;

  // Results
  finalReport: FinalReport | null;

  // Resume structured data (fetched from API)
  resumeData: any | null;

  // Loading states
  isGenerating: boolean;
  isEvaluating: boolean;
  aiStatus: string;

  // ---- Actions ----
  startInterview: (type: InterviewType, company?: string) => void;
  setCurrentQuestion: (q: string) => void;
  setCurrentAnswer: (a: string) => void;
  addQAPair: (pair: QAPair) => void;
  updateDimensions: (dims: Partial<DimensionScore>) => void;
  incrementFiller: (word: keyof FillerWords) => void;
  setStatus: (status: InterviewStatus) => void;
  setDifficulty: (d: number) => void;
  setDuration: (d: number) => void;
  toggleVoice: () => void;
  toggleTTS: () => void;
  setResumeData: (data: any) => void;
  setJdText: (text: string) => void;
  setResumeText: (text: string) => void;
  setInterviewMode: (mode: InterviewMode) => void;
  setInterviewerPersona: (persona: InterviewerPersona) => void;
  setIsGenerating: (v: boolean) => void;
  setIsEvaluating: (v: boolean) => void;
  setAiStatus: (s: string) => void;
  setFinalReport: (report: FinalReport) => void;
  endInterview: () => void;
  resetInterview: () => void;
}

const initialDimensions: DimensionScore = {
  communication: 0,
  technicalDepth: 0,
  problemSolving: 0,
  culturalFit: 0,
  confidence: 0,
  starUsage: 0,
};

const initialFillers: FillerWords = {
  um: 0,
  uh: 0,
  like: 0,
  basically: 0,
  actually: 0,
};

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set, get) => ({
      sessionId: null,
      status: 'idle',
      interviewType: null,
      company: null,
      jdText: '',
      resumeText: '',
      interviewMode: 'speech',
      interviewerPersona: 'alex',
      currentQuestion: '',
      currentAnswer: '',
      questionHistory: [],
      questionNumber: 0,
      totalQuestions: 10,
      runningScore: 0,
      dimensions: { ...initialDimensions },
      fillerWords: { ...initialFillers },
      difficulty: 5,
      startTime: null,
      duration: 0,
      voiceEnabled: false,
      ttsEnabled: true,
      finalReport: null,
      resumeData: null,
      isGenerating: false,
      isEvaluating: false,
      aiStatus: '',

      startInterview: (type, company) => {
        set({
          sessionId: `interview-${Date.now()}`,
          status: 'ready',
          interviewType: type,
          company: company || null,
          currentQuestion: '',
          currentAnswer: '',
          questionHistory: [],
          questionNumber: 0,
          runningScore: 0,
          dimensions: { ...initialDimensions },
          fillerWords: { ...initialFillers },
          difficulty: 5,
          startTime: Date.now(),
          duration: 0,
          finalReport: null,
          isGenerating: false,
          isEvaluating: false,
          aiStatus: '',
        });
      },

      setCurrentQuestion: (q) => set({ currentQuestion: q }),
      setCurrentAnswer: (a) => set({ currentAnswer: a }),

      addQAPair: (pair) =>
        set((s) => {
          const history = [...s.questionHistory, pair];
          const totalScore = history.reduce((sum, q) => sum + q.score, 0);
          return {
            questionHistory: history,
            questionNumber: history.length,
            runningScore: Math.round(totalScore / history.length),
            currentAnswer: '',
          };
        }),

      updateDimensions: (dims) =>
        set((s) => ({
          dimensions: { ...s.dimensions, ...dims },
        })),

      incrementFiller: (word) =>
        set((s) => ({
          fillerWords: { ...s.fillerWords, [word]: s.fillerWords[word] + 1 },
        })),

      setStatus: (status) => set({ status }),
      setDifficulty: (d) => set({ difficulty: Math.min(10, Math.max(1, d)) }),
      setDuration: (d) => set({ duration: d }),
      toggleVoice: () => set((s) => ({ voiceEnabled: !s.voiceEnabled })),
      toggleTTS: () => set((s) => ({ ttsEnabled: !s.ttsEnabled })),
      setResumeData: (data) => set({ resumeData: data }),
      setJdText: (text) => set({ jdText: text }),
      setResumeText: (text) => set({ resumeText: text }),
      setInterviewMode: (mode) => set({ interviewMode: mode }),
      setInterviewerPersona: (persona) => set({ interviewerPersona: persona }),
      setIsGenerating: (v) => set({ isGenerating: v }),
      setIsEvaluating: (v) => set({ isEvaluating: v }),
      setAiStatus: (s) => set({ aiStatus: s }),
      setFinalReport: (report) => set({ finalReport: report }),

      endInterview: () => {
        set({ status: 'completed' });
      },

      resetInterview: () => {
        set({
          sessionId: null,
          status: 'idle',
          interviewType: null,
          company: null,
          jdText: '',
          resumeText: '',
          interviewMode: 'speech',
          interviewerPersona: 'alex',
          currentQuestion: '',
          currentAnswer: '',
          questionHistory: [],
          questionNumber: 0,
          totalQuestions: 10,
          runningScore: 0,
          dimensions: { ...initialDimensions },
          fillerWords: { ...initialFillers },
          difficulty: 5,
          startTime: null,
          duration: 0,
          voiceEnabled: false,
          ttsEnabled: true,
          finalReport: null,
          resumeData: null,
          isGenerating: false,
          isEvaluating: false,
          aiStatus: '',
        });
      },
    }),
    {
      name: 'campus-os-interview',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        sessionId: state.sessionId,
        status: state.status,
        interviewType: state.interviewType,
        company: state.company,
        jdText: state.jdText,
        resumeText: state.resumeText,
        interviewMode: state.interviewMode,
        interviewerPersona: state.interviewerPersona,
        questionHistory: state.questionHistory,
        questionNumber: state.questionNumber,
        runningScore: state.runningScore,
        dimensions: state.dimensions,
        fillerWords: state.fillerWords,
        difficulty: state.difficulty,
        duration: state.duration,
        finalReport: state.finalReport,
      }),
    }
  )
);
