'use client';
// ============================================================
// Campus OS — Interview Prep (Main Shell)
// Routes between: Setup → Interview → Results
// ============================================================
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SetupScreen from './SetupScreen';
import InterviewScreen from './InterviewScreen';
import ResultsDashboard from './ResultsDashboard';
import { useInterviewStore } from '@/stores/useInterviewStore';

export type InterviewView = 'setup' | 'interview' | 'results';

export default function InterviewPrep() {
  const status = useInterviewStore((s) => s.status);

  // Derive the current view from the store status
  const view: InterviewView =
    status === 'completed' ? 'results' :
    status === 'idle' || status === 'setup' ? 'setup' :
    'interview';

  return (
    <div className="h-full bg-[#0a0f1e] text-[#e2e8f0] overflow-hidden">
      <AnimatePresence mode="wait">
        {view === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <SetupScreen />
          </motion.div>
        )}
        {view === 'interview' && (
          <motion.div
            key="interview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <InterviewScreen />
          </motion.div>
        )}
        {view === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <ResultsDashboard />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
