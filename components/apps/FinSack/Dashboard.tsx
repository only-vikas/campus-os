'use client';

// ============================================================
// Campus OS — FinSack Dashboard
// XP ring, streak, category progress, mini market ticker
// ============================================================
import { motion } from 'framer-motion';
import { Flame, Star, BookOpen, TrendingUp, Trophy } from 'lucide-react';
import { useFinSackStore } from '@/stores/useFinSackStore';
import { strategies, categoryInfo } from '@/data/finsack/strategies';
import type { StrategyCategory } from '@/types/finsack';

export default function Dashboard() {
  const { xp, streak, completedLessons, setActiveTab } = useFinSackStore();
  const totalStrategies = strategies.length;
  const completedCount = completedLessons.length;
  const level = Math.floor(xp / 500) + 1;
  const xpInLevel = xp % 500;
  const xpForNextLevel = 500;

  // Category progress
  const categories = Object.keys(categoryInfo) as StrategyCategory[];

  // XP ring
  const circumference = 2 * Math.PI * 52;
  const progress = (xpInLevel / xpForNextLevel) * 100;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="h-full overflow-y-auto p-6 space-y-6 custom-scrollbar">
      {/* Top Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {/* XP Ring */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-1 rounded-2xl p-5 flex flex-col items-center justify-center bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.15)]"
        >
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle cx="56" cy="56" r="52" fill="none" stroke="#1e293b" strokeWidth="8" />
              <motion.circle
                cx="56" cy="56" r="52" fill="none" stroke="#10b981" strokeWidth="8"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center">
              <div className="text-2xl font-black text-[#10b981]">{level}</div>
              <div className="text-[10px] text-[#94a3b8]">LEVEL</div>
            </div>
          </div>
          <p className="text-xs text-[#94a3b8] mt-2">{xpInLevel}/{xpForNextLevel} XP</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}
          className="rounded-2xl p-5 bg-[rgba(251,191,36,0.05)] border border-[rgba(251,191,36,0.15)] flex flex-col items-center justify-center"
        >
          <Flame className="text-[#fbbf24] mb-2" size={28} />
          <div className="text-3xl font-bold text-[#e2e8f0]">{streak}</div>
          <p className="text-xs text-[#94a3b8]">Day Streak</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="rounded-2xl p-5 bg-[rgba(96,165,250,0.05)] border border-[rgba(96,165,250,0.15)] flex flex-col items-center justify-center"
        >
          <Star className="text-[#60a5fa] mb-2" size={28} />
          <div className="text-3xl font-bold text-[#e2e8f0]">{xp}</div>
          <p className="text-xs text-[#94a3b8]">Total XP</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}
          className="rounded-2xl p-5 bg-[rgba(167,139,250,0.05)] border border-[rgba(167,139,250,0.15)] flex flex-col items-center justify-center"
        >
          <Trophy className="text-[#a78bfa] mb-2" size={28} />
          <div className="text-3xl font-bold text-[#e2e8f0]">{completedCount}/{totalStrategies}</div>
          <p className="text-xs text-[#94a3b8]">Completed</p>
        </motion.div>
      </div>

      {/* Category Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
        className="rounded-2xl p-5 bg-[rgba(15,23,42,0.5)] border border-[rgba(51,65,85,0.4)]"
      >
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="text-[#10b981]" size={18} />
          <h3 className="font-semibold text-[#e2e8f0]">Learning Progress</h3>
        </div>

        <div className="space-y-4">
          {categories.map((cat) => {
            const info = categoryInfo[cat];
            const catStrategies = strategies.filter((s) => s.category === cat);
            const catCompleted = catStrategies.filter((s) => completedLessons.includes(s.id)).length;
            const pct = catStrategies.length > 0 ? (catCompleted / catStrategies.length) * 100 : 0;

            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span>{info.icon}</span>
                    <span className="text-sm font-medium text-[#e2e8f0]">{info.name}</span>
                  </div>
                  <span className="text-xs text-[#94a3b8]">{catCompleted}/{catStrategies.length}</span>
                </div>
                <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: info.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setActiveTab('finlearn')}
          className="rounded-xl p-4 bg-[rgba(34,211,238,0.08)] border border-[rgba(34,211,238,0.2)] hover:border-[rgba(34,211,238,0.4)] transition-all text-left"
        >
          <BookOpen className="text-[#22d3ee] mb-2" size={20} />
          <p className="text-sm font-medium text-[#e2e8f0]">Continue Learning</p>
          <p className="text-xs text-[#475569]">9 strategies available</p>
        </button>
        <button
          onClick={() => setActiveTab('marketpulse')}
          className="rounded-xl p-4 bg-[rgba(167,139,250,0.08)] border border-[rgba(167,139,250,0.2)] hover:border-[rgba(167,139,250,0.4)] transition-all text-left"
        >
          <TrendingUp className="text-[#a78bfa] mb-2" size={20} />
          <p className="text-sm font-medium text-[#e2e8f0]">Market Pulse</p>
          <p className="text-xs text-[#475569]">Live market data</p>
        </button>
        <button
          onClick={() => setActiveTab('nova')}
          className="rounded-xl p-4 bg-[rgba(16,185,129,0.08)] border border-[rgba(16,185,129,0.2)] hover:border-[rgba(16,185,129,0.4)] transition-all text-left"
        >
          <Star className="text-[#10b981] mb-2" size={20} />
          <p className="text-sm font-medium text-[#e2e8f0]">Nova Terminal</p>
          <p className="text-xs text-[#475569]">AI financial coach</p>
        </button>
      </div>
    </div>
  );
}
