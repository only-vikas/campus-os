'use client';
// ============================================================
// Interview Prep — Results Dashboard
// Post-interview report: score, radar, strengths, improvements
// ============================================================
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, RotateCcw, Download, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Search, Clock
} from 'lucide-react';
import { useInterviewStore } from '@/stores/useInterviewStore';
import RadarChart from './RadarChart';
import ImprovementPlan from './ImprovementPlan';
import ScoreBar from './ScoreBar';

export default function ResultsDashboard() {
  const { finalReport, questionHistory, fillerWords, duration, interviewType, company, resetInterview } = useInterviewStore();
  const [showTranscript, setShowTranscript] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!finalReport) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-[#475569]">Generating your report...</p>
      </div>
    );
  }

  const minutes = Math.floor(duration / 60);
  const totalFillers = Object.values(fillerWords).reduce((a, b) => a + b, 0);

  // Score ring color
  const scoreColor =
    finalReport.overallScore >= 70 ? '#34d399' :
    finalReport.overallScore >= 40 ? '#fbbf24' : '#f87171';

  // Filter transcript by search
  const filteredHistory = searchQuery
    ? questionHistory.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : questionHistory;

  return (
    <div className="h-full overflow-y-auto p-6 scrollbar-thin">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#e2e8f0]">Interview Report</h2>
          <p className="text-xs text-[#64748b]">
            {interviewType && interviewType.charAt(0).toUpperCase() + interviewType.slice(1)} Interview
            {company && ` · ${company}`}
            {' · '}{minutes} min · {questionHistory.length} questions
          </p>
        </div>
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={resetInterview}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#60a5fa]/10 text-[#60a5fa] text-xs font-medium hover:bg-[#60a5fa]/20 transition-colors"
          >
            <RotateCcw size={14} /> Practice Again
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Left column: Score + Radar */}
        <div className="space-y-4">
          {/* Overall Score Circle */}
          <div className="rounded-2xl bg-[#0f172a]/80 border border-[#1e293b] p-6 text-center">
            <div className="relative w-28 h-28 mx-auto mb-3">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="6" />
                <motion.circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke={scoreColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${Math.PI * 84}`}
                  initial={{ strokeDashoffset: Math.PI * 84 }}
                  animate={{ strokeDashoffset: Math.PI * 84 * (1 - finalReport.overallScore / 100) }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl font-bold"
                  style={{ color: scoreColor }}
                >
                  {finalReport.overallScore}
                </motion.span>
              </div>
            </div>
            <p className="text-xs text-[#94a3b8]">Overall Score</p>
          </div>

          {/* Radar Chart */}
          <div className="rounded-2xl bg-[#0f172a]/80 border border-[#1e293b] p-4">
            <RadarChart dimensions={finalReport.dimensions} size={220} />
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-[#0f172a]/80 border border-[#1e293b] p-3 text-center">
              <Clock size={14} className="text-[#60a5fa] mx-auto mb-1" />
              <p className="text-sm font-bold text-[#e2e8f0]">{minutes}m</p>
              <p className="text-[9px] text-[#475569]">Duration</p>
            </div>
            <div className="rounded-xl bg-[#0f172a]/80 border border-[#1e293b] p-3 text-center">
              <Trophy size={14} className="text-[#fbbf24] mx-auto mb-1" />
              <p className="text-sm font-bold text-[#e2e8f0]">{totalFillers}</p>
              <p className="text-[9px] text-[#475569]">Filler Words</p>
            </div>
          </div>
        </div>

        {/* Center column: Scores + Strengths/Weaknesses */}
        <div className="space-y-4">
          {/* Dimension Scores */}
          <div className="rounded-2xl bg-[#0f172a]/80 border border-[#1e293b] p-4">
            <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Dimension Scores</h3>
            <ScoreBar label="Communication" value={finalReport.dimensions.communication} delay={0.1} />
            <ScoreBar label="Technical Depth" value={finalReport.dimensions.technicalDepth} delay={0.2} />
            <ScoreBar label="Problem Solving" value={finalReport.dimensions.problemSolving} delay={0.3} />
            <ScoreBar label="Cultural Fit" value={finalReport.dimensions.culturalFit} delay={0.4} />
            <ScoreBar label="Confidence" value={finalReport.dimensions.confidence} delay={0.5} />
            <ScoreBar label="STAR Usage" value={finalReport.dimensions.starUsage} delay={0.6} />
          </div>

          {/* Strengths */}
          <div className="rounded-2xl bg-[#0f172a]/80 border border-[#1e293b] p-4">
            <h3 className="text-xs font-semibold text-[#34d399] uppercase tracking-wider mb-2">✅ Strengths</h3>
            <div className="space-y-1.5">
              {finalReport.strengths.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: i * 0.1 } }}
                  className="flex items-start gap-2"
                >
                  <CheckCircle2 size={12} className="text-[#34d399] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-[#94a3b8]">{s}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="rounded-2xl bg-[#0f172a]/80 border border-[#1e293b] p-4">
            <h3 className="text-xs font-semibold text-[#f87171] uppercase tracking-wider mb-2">❌ Areas to Improve</h3>
            <div className="space-y-1.5">
              {finalReport.weaknesses.map((w, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: i * 0.1 } }}
                  className="flex items-start gap-2"
                >
                  <XCircle size={12} className="text-[#f87171] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-[#94a3b8]">{w}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Improvement Plan + Transcript */}
        <div className="space-y-4">
          {/* Improvement Plan */}
          <div className="rounded-2xl bg-[#0f172a]/80 border border-[#1e293b] p-4">
            <h3 className="text-xs font-semibold text-[#fbbf24] uppercase tracking-wider mb-3">🎯 Improvement Plan</h3>
            <ImprovementPlan improvements={finalReport.improvements} />
          </div>

          {/* Filler Word Report */}
          <div className="rounded-2xl bg-[#0f172a]/80 border border-[#1e293b] p-4">
            <h3 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Filler Word Report</h3>
            <div className="space-y-1">
              {Object.entries(fillerWords).map(([word, count]) => (
                <div key={word} className="flex items-center justify-between">
                  <span className="text-xs text-[#64748b]">"{word}"</span>
                  <span className={`text-xs font-bold ${count > 5 ? 'text-[#f87171]' : count > 2 ? 'text-[#fbbf24]' : 'text-[#34d399]'}`}>
                    {count}x
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Transcript toggle */}
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#1e293b]/60 border border-[#334155] text-xs text-[#94a3b8] hover:border-[#475569] transition-colors"
          >
            <span>📝 Full Transcript ({questionHistory.length} Q&As)</span>
            {showTranscript ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Transcript (expandable) */}
      {showTranscript && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 rounded-2xl bg-[#0f172a]/80 border border-[#1e293b] p-4"
        >
          {/* Search */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transcript..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#1e293b] border border-[#334155] text-xs text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#60a5fa]"
            />
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
            {filteredHistory.map((pair, i) => (
              <div key={i} className="rounded-xl bg-[#1e293b]/40 p-3">
                <p className="text-xs font-semibold text-[#60a5fa] mb-1">Q{i + 1}: {pair.question}</p>
                <p className="text-xs text-[#94a3b8] mb-1">{pair.answer}</p>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] font-bold ${
                    pair.score >= 70 ? 'text-[#34d399]' : pair.score >= 40 ? 'text-[#fbbf24]' : 'text-[#f87171]'
                  }`}>
                    Score: {pair.score}/100
                  </span>
                  <span className="text-[10px] text-[#475569]">{pair.feedback}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
