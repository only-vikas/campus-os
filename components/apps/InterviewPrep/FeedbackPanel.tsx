'use client';
// ============================================================
// Interview Prep — Feedback Panel (Right Column)
// Live scoring, filler words, timer, difficulty, sentiment
// ============================================================
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, AlertTriangle, Smile, Meh, Frown, Gauge } from 'lucide-react';
import { useInterviewStore } from '@/stores/useInterviewStore';
import ScoreBar from './ScoreBar';

export default function FeedbackPanel() {
  const {
    dimensions, fillerWords, duration, difficulty, runningScore,
    questionNumber, questionHistory,
  } = useInterviewStore();

  // Format timer MM:SS
  const minutes = Math.floor(duration / 60).toString().padStart(2, '0');
  const seconds = (duration % 60).toString().padStart(2, '0');

  // Get sentiment from latest answer
  const latestScore = questionHistory.length > 0
    ? questionHistory[questionHistory.length - 1].score : 0;
  const sentiment = latestScore >= 70 ? 'positive' : latestScore >= 40 ? 'neutral' : 'negative';

  // Last micro-feedback
  const lastFeedback = questionHistory.length > 0
    ? questionHistory[questionHistory.length - 1].feedback : '';

  const totalFillers = Object.values(fillerWords).reduce((a, b) => a + b, 0);

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3 scrollbar-thin">
      {/* Overall Score */}
      <div className="rounded-xl bg-[#0f172a]/80 border border-[#1e293b] p-3 text-center">
        <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1">Running Score</p>
        <motion.p
          key={runningScore}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className={`text-3xl font-bold ${
            runningScore >= 70 ? 'text-[#34d399]' :
            runningScore >= 40 ? 'text-[#fbbf24]' :
            runningScore > 0 ? 'text-[#f87171]' :
            'text-[#475569]'
          }`}
        >
          {runningScore || '—'}
        </motion.p>
        <p className="text-[10px] text-[#475569]">{questionNumber} answered</p>
      </div>

      {/* Timer + Difficulty */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-[#0f172a]/80 border border-[#1e293b] p-2.5 text-center">
          <Clock size={14} className="text-[#60a5fa] mx-auto mb-1" />
          <p className="text-sm font-mono font-bold text-[#e2e8f0]">{minutes}:{seconds}</p>
          <p className="text-[9px] text-[#475569]">Elapsed</p>
        </div>
        <div className="rounded-xl bg-[#0f172a]/80 border border-[#1e293b] p-2.5 text-center">
          <Gauge size={14} className="text-[#a78bfa] mx-auto mb-1" />
          <p className="text-sm font-bold text-[#e2e8f0]">{difficulty}/10</p>
          <p className="text-[9px] text-[#475569]">Difficulty</p>
        </div>
      </div>

      {/* Dimension Scores */}
      <div className="rounded-xl bg-[#0f172a]/80 border border-[#1e293b] p-3">
        <div className="flex items-center gap-1.5 mb-2 text-[#60a5fa]">
          <TrendingUp size={12} />
          <span className="text-[10px] font-semibold uppercase tracking-wider">Live Scores</span>
        </div>
        <ScoreBar label="Communication" value={dimensions.communication} delay={0} />
        <ScoreBar label="Technical Depth" value={dimensions.technicalDepth} delay={0.05} />
        <ScoreBar label="Problem Solving" value={dimensions.problemSolving} delay={0.1} />
        <ScoreBar label="Cultural Fit" value={dimensions.culturalFit} delay={0.15} />
        <ScoreBar label="Confidence" value={dimensions.confidence} delay={0.2} />
        <ScoreBar label="STAR Usage" value={dimensions.starUsage} delay={0.25} />
      </div>

      {/* Filler Words */}
      <div className="rounded-xl bg-[#0f172a]/80 border border-[#1e293b] p-3">
        <div className="flex items-center gap-1.5 mb-2 text-[#fbbf24]">
          <AlertTriangle size={12} />
          <span className="text-[10px] font-semibold uppercase tracking-wider">Filler Words</span>
          <span className={`ml-auto text-xs font-bold ${totalFillers > 10 ? 'text-[#f87171]' : totalFillers > 5 ? 'text-[#fbbf24]' : 'text-[#34d399]'}`}>
            {totalFillers}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 text-center">
          {Object.entries(fillerWords).map(([word, count]) => (
            <div key={word} className="rounded-lg bg-[#1e293b]/60 px-2 py-1">
              <p className="text-[10px] text-[#64748b]">{word}</p>
              <p className="text-xs font-bold text-[#e2e8f0]">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sentiment */}
      {questionNumber > 0 && (
        <div className="rounded-xl bg-[#0f172a]/80 border border-[#1e293b] p-3 text-center">
          <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1">Sentiment</p>
          <motion.div
            key={sentiment}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {sentiment === 'positive' && <Smile size={24} className="text-[#34d399] mx-auto" />}
            {sentiment === 'neutral' && <Meh size={24} className="text-[#fbbf24] mx-auto" />}
            {sentiment === 'negative' && <Frown size={24} className="text-[#f87171] mx-auto" />}
          </motion.div>
        </div>
      )}

      {/* Micro-feedback Toast */}
      {lastFeedback && (
        <motion.div
          key={lastFeedback}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-[#60a5fa]/10 border border-[#60a5fa]/20 p-2.5"
        >
          <p className="text-[10px] text-[#60a5fa] font-semibold mb-0.5">💡 Tip</p>
          <p className="text-[10px] text-[#94a3b8]">{lastFeedback}</p>
        </motion.div>
      )}
    </div>
  );
}
