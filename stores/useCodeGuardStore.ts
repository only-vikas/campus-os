import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CodeAnalysisResult } from '@/services/codeReviewService';

interface LineOffset {
  originalLine: number;
  delta: number;
}

export interface AnalysisHistoryEntry {
  id: string;
  timestamp: string;
  code: string;
  language: string;
  result: CodeAnalysisResult;
}

export interface CodeGuardState {
  originalCode: string;
  currentCode: string;
  language: string;
  analysisResult: CodeAnalysisResult | null;
  activeTab: 'editor' | 'history';
  history: AnalysisHistoryEntry[];
  
  // Error handling
  error: string | null;
  warning: string | null;
  
  // Sets or arrays to track applied fixes and line shifts
  appliedFixes: number[];
  lineOffsets: LineOffset[];
  
  // Actions
  setOriginalCode: (code: string) => void;
  setCurrentCode: (code: string) => void;
  setLanguage: (lang: string) => void;
  setAnalysisResult: (result: CodeAnalysisResult | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setViewMode: (mode: 'editor' | 'diff') => void;
  setError: (error: string | null) => void;
  setWarning: (warning: string | null) => void;
  
  setActiveTab: (tab: 'editor' | 'history') => void;
  addToHistory: (entry: AnalysisHistoryEntry) => void;
  loadFromHistory: (id: string) => void;
  clearHistory: () => void;
  startNewAnalysis: () => void;
  
  // Fix Mutation
  applyFix: (lineNumber: number, fixString: string) => void;
  applyAllFixes: () => void;
  
  // Reset
  resetState: () => void;
}

export const useCodeGuardStore = create<CodeGuardState>()(
  persist(
    (set, get) => ({
      originalCode: '// Paste or upload your code here\n',
      currentCode: '// Paste or upload your code here\n',
      language: 'javascript',
      analysisResult: null,
      isAnalyzing: false,
      viewMode: 'editor',
      appliedFixes: [],
      lineOffsets: [],
      activeTab: 'editor',
      history: [],
      error: null,
      warning: null,
      
      setOriginalCode: (code) => set({ originalCode: code }),
      setCurrentCode: (code) => set({ currentCode: code }),
      setLanguage: (lang) => set({ language: lang }),
      setAnalysisResult: (result) => set({ 
        analysisResult: result, 
        appliedFixes: [],
        lineOffsets: [],
        error: null
      }),
      setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setError: (error) => set({ error }),
      setWarning: (warning) => set({ warning }),
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      addToHistory: (entry) => set((state) => ({ history: [entry, ...state.history] })),
      loadFromHistory: (id) => {
        const state = get();
        const entry = state.history.find(e => e.id === id);
        if (entry) {
          set({
            currentCode: entry.code,
            originalCode: entry.code,
            language: entry.language,
            analysisResult: entry.result,
            activeTab: 'editor',
            viewMode: 'editor',
            appliedFixes: [],
            lineOffsets: [],
            error: null,
            warning: null
          });
        }
      },
      clearHistory: () => set({ history: [] }),
      startNewAnalysis: () => set({
        currentCode: '',
        originalCode: '',
        analysisResult: null,
        isAnalyzing: false,
        viewMode: 'editor',
        appliedFixes: [],
        lineOffsets: [],
        activeTab: 'editor',
        error: null,
        warning: null
      }),
      
      applyFix: (originalLineNumber, fixString) => {
        const state = get();
        if (state.appliedFixes.includes(originalLineNumber)) return; // Already applied
        
        const lines = state.currentCode.split('\n');
        
        // Calculate the current line number accounting for previous multi-line shifts
        let currentLine = originalLineNumber;
        for (const offset of state.lineOffsets) {
          if (offset.originalLine < originalLineNumber) {
            currentLine += offset.delta;
          }
        }

        if (currentLine > 0 && currentLine <= lines.length) {
          const fixLines = fixString.split('\n');
          // A single line is replaced by fixLines.length lines
          const delta = fixLines.length - 1;
          
          lines.splice(currentLine - 1, 1, ...fixLines);
          
          set({ 
            currentCode: lines.join('\n'),
            appliedFixes: [...state.appliedFixes, originalLineNumber],
            lineOffsets: [...state.lineOffsets, { originalLine: originalLineNumber, delta }],
            viewMode: 'diff'
          });
        }
      },
      
      applyAllFixes: () => {
        const state = get();
        if (state.analysisResult?.improvedCode) {
          set({
            currentCode: state.analysisResult.improvedCode,
            viewMode: 'editor',
            appliedFixes: state.analysisResult.issues.map(i => i.line),
            lineOffsets: [] // Reset offsets since we replaced everything at once
          });
        }
      },
      
      resetState: () => set({
        analysisResult: null,
        isAnalyzing: false,
        viewMode: 'editor',
        appliedFixes: [],
        lineOffsets: []
      })
    }),
    {
      name: 'code-guard-state',
      partialize: (state) => ({ 
        originalCode: state.originalCode, 
        currentCode: state.currentCode, 
        language: state.language 
      }) // Persist only code
    }
  )
);
