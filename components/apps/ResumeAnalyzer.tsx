'use client';

// ============================================================
// Campus OS — Resume Analyzer App
// Deep AI semantic analysis and interactive resume editor
// ============================================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { useResumeAnalyzerStore } from '@/stores/useResumeAnalyzerStore';
import Sidebar from './ResumeAnalyzer/Sidebar';
import UploadZone from './ResumeAnalyzer/UploadZone';
import BentoDashboard from './ResumeAnalyzer/BentoDashboard';
import InteractiveEditor from './ResumeAnalyzer/InteractiveEditor';
import { ErrorBoundary } from '../ErrorBoundary';
import { LayoutDashboard, Edit3 } from 'lucide-react';

export default function ResumeAnalyzer() {
  const { 
    sessions, 
    activeSessionId, 
    showContinueDialog, 
    dismissContinueDialog, 
    createNewSession, 
    loadSession,
    isAnalyzing,
    analysisProgress
  } = useResumeAnalyzerStore();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'editor'>('dashboard');

  const activeSession = sessions.find(s => s.id === activeSessionId);
  const hasAnalysis = activeSession && activeSession.analysis;

  // On mount, if there's a recent session, show a dialog (handled via store state)
  // If no sessions, automatically close dialog and start fresh
  useEffect(() => {
    if (sessions.length === 0 && showContinueDialog) {
      dismissContinueDialog();
    }
  }, [sessions, showContinueDialog, dismissContinueDialog]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-full bg-[#0a0f1e] text-[#e2e8f0] overflow-hidden">
        
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative">
          
          {/* Top Navigation / Tabs (Only if we have an active analysis or are analyzing) */}
          {(hasAnalysis || isAnalyzing) && (
            <div className="flex justify-between items-center border-b border-[#1e293b] p-3">
              <div className="w-[150px]"></div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'dashboard' ? 'bg-[#60a5fa]/20 text-[#60a5fa]' : 'text-[#94a3b8] hover:bg-[#1e293b]'}`}
                >
                  <LayoutDashboard size={16} /> Dashboard
                </button>
                <button 
                  disabled={isAnalyzing}
                  onClick={() => setActiveTab('editor')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === 'editor' ? 'bg-[#60a5fa]/20 text-[#60a5fa]' : 'text-[#94a3b8] hover:bg-[#1e293b]'} ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Edit3 size={16} /> Editor
                </button>
              </div>
              <div className="w-[150px] flex justify-end">
                {hasAnalysis && !isAnalyzing && (
                  <button 
                    onClick={() => alert("Save to Interview Prep - Phase 2 Feature stub")}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1e293b] text-[#60a5fa] hover:bg-[#334155] transition-colors border border-[#60a5fa]/30 shadow-[0_0_8px_rgba(96,165,250,0.2)]"
                  >
                    Save to Interview Prep
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Dynamic Content */}
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {!hasAnalysis && !isAnalyzing ? (
                <motion.div key="upload" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                  <UploadZone />
                </motion.div>
              ) : activeTab === 'dashboard' ? (
                <motion.div key="dashboard" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                  <ErrorBoundary>
                    <BentoDashboard />
                  </ErrorBoundary>
                </motion.div>
              ) : (
                <motion.div key="editor" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="h-full">
                  <ErrorBoundary>
                    <InteractiveEditor />
                  </ErrorBoundary>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Session Recovery Dialog */}
          <AnimatePresence>
            {showContinueDialog && sessions.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 z-[100] bg-black/60 flex items-center justify-center backdrop-blur-md"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                  className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-2xl shadow-2xl max-w-sm text-center"
                >
                  <h3 className="text-lg font-bold text-[#e2e8f0] mb-2">Continue Last Session?</h3>
                  <p className="text-sm text-[#94a3b8] mb-6">You have a previous analysis for <strong className="text-white">{sessions[0].resumeName}</strong>. Do you want to continue where you left off?</p>
                  
                  <div className="flex gap-3 justify-center">
                    <button onClick={createNewSession} className="px-4 py-2 rounded-xl text-sm font-medium bg-[#1e293b] text-[#e2e8f0] hover:bg-[#334155] transition-colors">
                      Start Fresh
                    </button>
                    <button onClick={() => loadSession(sessions[0].id)} className="px-4 py-2 rounded-xl text-sm font-medium bg-[#60a5fa] text-white hover:bg-[#3b82f6] transition-colors shadow">
                      Continue Analysis
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      </div>
    </MotionConfig>
  );
}
