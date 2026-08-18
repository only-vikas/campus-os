import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AnalysisResult } from '@/services/aiService';

export interface ResumeFile {
  id: string;
  name: string;
  text: string;
  lastEdited: number;
}

export interface ResumeSession {
  id: string;
  date: number;
  resumeName: string;
  resumeText: string;
  targetRole: string; // From JD or manual
  company: string;
  jdText: string;
  analysis: AnalysisResult | null;
  keywordAnalysis: { matched: string[], missing: string[], score: number } | null;
}

interface ResumeAnalyzerState {
  // Uploaded Resumes (Max 5)
  resumes: ResumeFile[];
  activeResumeId: string | null;

  // Session History
  sessions: ResumeSession[];
  activeSessionId: string | null;

  // Active Session Draft (if not yet analyzed or currently editing)
  draftJdText: string;
  
  // UI State
  isAnalyzing: boolean;
  analysisProgress: string;
  showContinueDialog: boolean;
  draftKeywordAnalysis: { matched: string[], missing: string[], score: number } | null;

  // Actions
  addResume: (name: string, text: string) => void;
  deleteResume: (id: string) => void;
  setActiveResume: (id: string | null) => void;
  updateActiveResumeText: (text: string) => void;

  createNewSession: () => void;
  setDraftJd: (text: string) => void;
  setDraftKeywordAnalysis: (analysis: { matched: string[], missing: string[], score: number } | null) => void;
  saveSession: (analysis: AnalysisResult | null, targetRole?: string, company?: string) => void;
  loadSession: (id: string) => void;
  deleteSession: (id: string) => void;
  setIsAnalyzing: (isAnalyzing: boolean, progress?: string) => void;
  dismissContinueDialog: () => void;
}

export const useResumeAnalyzerStore = create<ResumeAnalyzerState>()(
  persist(
    (set, get) => ({
      resumes: [],
      activeResumeId: null,
      sessions: [],
      activeSessionId: null,

      draftJdText: '',
      draftKeywordAnalysis: null,

      isAnalyzing: false,
      analysisProgress: '',
      showContinueDialog: true, // Show on mount if there's an active session

      createNewSession: () => set({
        activeSessionId: null,
        draftJdText: '',
        draftKeywordAnalysis: null,
        isAnalyzing: false,
        showContinueDialog: false,
      }),

      addResume: (name, text) => set((state) => {
        const newResume: ResumeFile = {
          id: crypto.randomUUID(),
          name,
          text,
          lastEdited: Date.now(),
        };
        const newResumes = [newResume, ...state.resumes].slice(0, 5); // Keep max 5
        return {
          resumes: newResumes,
          activeResumeId: newResume.id,
        };
      }),

      deleteResume: (id) => set((state) => ({
        resumes: state.resumes.filter(r => r.id !== id),
        activeResumeId: state.activeResumeId === id ? null : state.activeResumeId,
      })),

      setActiveResume: (id) => set({ activeResumeId: id }),

      updateActiveResumeText: (text) => set((state) => {
        if (!state.activeResumeId) return state;
        return {
          resumes: state.resumes.map(r => 
            r.id === state.activeResumeId 
              ? { ...r, text, lastEdited: Date.now() } 
              : r
          )
        };
      }),

      setDraftJd: (text) => set({ draftJdText: text }),
      setDraftKeywordAnalysis: (analysis) => set({ draftKeywordAnalysis: analysis }),

      saveSession: (analysis, targetRole = 'Unknown Role', company = 'Unknown Company') => {
        const { sessions, activeSessionId, resumes, activeResumeId, draftJdText, draftKeywordAnalysis } = get();
        const activeResume = resumes.find(r => r.id === activeResumeId);
        
        if (!activeResume && !activeSessionId) return; // Need a resume to save

        const sessionToUpdate = activeSessionId ? sessions.find(s => s.id === activeSessionId) : null;
        
        const newSession: ResumeSession = {
          id: activeSessionId || crypto.randomUUID(),
          date: Date.now(),
          resumeName: activeResume?.name || sessionToUpdate?.resumeName || 'Untitled Resume',
          resumeText: activeResume?.text || sessionToUpdate?.resumeText || '',
          targetRole,
          company,
          jdText: draftJdText,
          analysis,
          keywordAnalysis: draftKeywordAnalysis,
        };

        const existingIndex = sessions.findIndex((s) => s.id === newSession.id);
        let newSessions = [...sessions];
        
        if (existingIndex >= 0) {
          newSessions[existingIndex] = newSession;
        } else {
          newSessions.unshift(newSession);
        }

        // Keep only last 20
        if (newSessions.length > 20) {
          newSessions = newSessions.slice(0, 20);
        }

        set({
          sessions: newSessions,
          activeSessionId: newSession.id,
          isAnalyzing: false,
        });
      },

      loadSession: (id) => {
        const session = get().sessions.find((s) => s.id === id);
        if (session) {
          // Find or create a matching resume entry
          let currentResumes = get().resumes;
          let matchedResume = currentResumes.find(r => r.text === session.resumeText);
          
          if (!matchedResume) {
             matchedResume = {
                id: crypto.randomUUID(),
                name: session.resumeName,
                text: session.resumeText,
                lastEdited: Date.now()
             };
             currentResumes = [matchedResume, ...currentResumes].slice(0, 5);
          }

          set({
            activeSessionId: session.id,
            activeResumeId: matchedResume.id,
            resumes: currentResumes,
            draftJdText: session.jdText,
            draftKeywordAnalysis: session.keywordAnalysis || null,
            showContinueDialog: false,
          });
        }
      },

      deleteSession: (id) => set((state) => {
        const newSessions = state.sessions.filter(s => s.id !== id);
        if (state.activeSessionId === id) {
          return { sessions: newSessions, activeSessionId: null, draftJdText: '', draftKeywordAnalysis: null };
        }
        return { sessions: newSessions };
      }),

      setIsAnalyzing: (isAnalyzing, progress = '') => set({ isAnalyzing, analysisProgress: progress }),
      
      dismissContinueDialog: () => set({ showContinueDialog: false }),
    }),
    {
      name: 'campus-os-resume-analyzer',
      partialize: (state) => ({
        resumes: state.resumes,
        activeResumeId: state.activeResumeId,
        sessions: state.sessions,
        activeSessionId: state.activeSessionId,
        draftJdText: state.draftJdText,
      }),
    }
  )
);
