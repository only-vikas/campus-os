'use client';
// ============================================================
// Campus OS — NovaMind Dashboard
// Career readiness ring, skill summary, insights, quick actions
// ============================================================
import { motion } from 'framer-motion';
import { Zap, Flame, Target, TrendingUp, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNovaMindStore } from '@/stores/useNovaMindStore';
import { SKILL_TAXONOMY, CATEGORY_META } from '@/data/novamind/skillTaxonomy';
import type { SkillCategory } from '@/types/novamind';

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Dashboard() {
  const {
    careerReadiness, xp, streak, skillMastery,
    insights, activePath, setActiveTab, userProfile,
  } = useNovaMindStore();

  // Career readiness ring
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (careerReadiness / 100) * circumference;

  // Category averages
  const categories = Object.keys(CATEGORY_META) as SkillCategory[];
  const categoryAverages = categories.map((cat) => {
    const skills = SKILL_TAXONOMY.filter((s) => s.category === cat);
    const masteredSkills = skills.filter((s) => skillMastery[s.id]);
    const avg = masteredSkills.length > 0
      ? Math.round(masteredSkills.reduce((sum, s) => sum + (skillMastery[s.id]?.mastery ?? 0), 0) / masteredSkills.length)
      : 0;
    return { cat, avg, meta: CATEGORY_META[cat], count: skills.length, mastered: masteredSkills.length };
  });

  const level = Math.floor(xp / 500) + 1;

  return (
    <motion.div
      className="h-full overflow-y-auto p-5 space-y-4 custom-scrollbar"
      variants={stagger}
      initial="initial"
      animate="animate"
    >
      {/* Top row: Career readiness + stats */}
      <div className="grid grid-cols-4 gap-3">
        {/* Career readiness ring */}
        <motion.div
          variants={fadeUp}
          className="col-span-1 rounded-2xl p-5 flex flex-col items-center justify-center bg-[rgba(167,139,250,0.05)] border border-[rgba(167,139,250,0.15)]"
        >
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="56" cy="56" r="52" fill="none" stroke="#1e293b" strokeWidth="8" />
              <motion.circle
                cx="56" cy="56" r="52" fill="none" stroke="#a78bfa" strokeWidth="8"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.8, ease: 'easeOut', delay: 0.3 }}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center z-10">
              <div className="text-2xl font-black text-[#a78bfa]">{careerReadiness}%</div>
              <div className="text-[9px] text-[#94a3b8] leading-tight">CAREER<br/>READY</div>
            </div>
          </div>
          <p className="text-xs text-[#94a3b8] mt-2 text-center">{userProfile.targetRole}</p>
        </motion.div>

        {/* Stat cards */}
        {[
          { label: 'Level', value: level, sub: `${xp} XP`, icon: <Zap size={22} />, color: '#a78bfa', bg: 'rgba(167,139,250,0.08)' },
          { label: 'Day Streak', value: streak, sub: 'Keep going!', icon: <Flame size={22} />, color: '#fb923c', bg: 'rgba(251,146,60,0.08)' },
          { label: 'Skills Tracked', value: Object.keys(skillMastery).length, sub: `of ${SKILL_TAXONOMY.length}`, icon: <Target size={22} />, color: '#34d399', bg: 'rgba(52,211,153,0.08)' },
        ].map((s, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            className="rounded-2xl p-5 flex flex-col items-center justify-center border border-[rgba(255,255,255,0.06)]"
            style={{ background: s.bg }}
          >
            <div style={{ color: s.color }} className="mb-2">{s.icon}</div>
            <div className="text-3xl font-bold text-[#e2e8f0]">{s.value}</div>
            <div className="text-xs text-[#94a3b8]">{s.label}</div>
            <div className="text-[10px] text-[#475569]">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Category skill grid */}
      <motion.div
        variants={fadeUp}
        className="rounded-2xl p-5 bg-[rgba(15,23,42,0.5)] border border-[rgba(51,65,85,0.4)]"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-[#a78bfa]" />
          <h3 className="font-semibold text-sm text-[#e2e8f0]">Skill Category Progress</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {categoryAverages.map(({ cat, avg, meta, count, mastered }) => (
            <div key={cat} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span>{meta.icon}</span>
                  <span className="text-[#e2e8f0] font-medium">{meta.label}</span>
                </div>
                <span className="text-[#475569]">{mastered}/{count} skills • {avg}%</span>
              </div>
              <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: meta.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${avg}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Cross-App Insights */}
      <motion.div variants={fadeUp} className="rounded-2xl p-5 bg-[rgba(15,23,42,0.5)] border border-[rgba(51,65,85,0.4)]">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={16} className="text-[#fbbf24]" />
          <h3 className="font-semibold text-sm text-[#e2e8f0]">Cross-App Insights</h3>
          <span className="ml-auto text-[10px] text-[#475569] bg-[#fbbf24]/10 px-2 py-0.5 rounded-full text-[#fbbf24]">
            {insights.length} active
          </span>
        </div>
        <div className="space-y-2">
          {insights.slice(0, 3).map((insight, i) => {
            const icons: Record<string, string> = {
              resume: '📄', interview: '🎤', 'code-guard': '🛡️', 'edu-vault': '🏗️', placement: '💼',
            };
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0, transition: { delay: i * 0.1 } }}
                className="flex items-start gap-3 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(51,65,85,0.3)] hover:border-[rgba(167,139,250,0.3)] transition-colors group"
              >
                <span className="text-xl flex-shrink-0">{icons[insight.source] ?? '💡'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#94a3b8] leading-relaxed">{insight.message}</p>
                </div>
                <button
                  onClick={() => setActiveTab('recommendations')}
                  className="flex-shrink-0 flex items-center gap-1 text-[10px] text-[#a78bfa] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {insight.actionLabel} <ArrowRight size={10} />
                </button>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Active path + quick actions */}
      <div className="grid grid-cols-2 gap-3">
        {/* Active path */}
        <motion.div
          variants={fadeUp}
          className="rounded-2xl p-4 bg-[rgba(167,139,250,0.06)] border border-[rgba(167,139,250,0.15)]"
        >
          <h4 className="text-xs font-semibold text-[#a78bfa] uppercase tracking-wider mb-2">Active Learning Path</h4>
          {activePath ? (
            <div>
              <p className="text-sm font-medium text-[#e2e8f0] mb-2">{activePath.title}</p>
              <div className="space-y-1.5">
                {activePath.milestones.slice(0, 3).map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-xs">
                    {m.completed
                      ? <CheckCircle2 size={12} className="text-[#34d399]" />
                      : <div className="w-3 h-3 rounded-full border border-[#475569]" />}
                    <span className={m.completed ? 'text-[#475569] line-through' : 'text-[#94a3b8]'}>{m.title}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab('recommendations')}
                className="mt-3 text-xs text-[#a78bfa] flex items-center gap-1 hover:gap-2 transition-all"
              >
                View full path <ArrowRight size={11} />
              </button>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-xs text-[#475569] mb-3">No active learning path</p>
              <button
                onClick={() => setActiveTab('recommendations')}
                className="text-xs px-3 py-1.5 rounded-lg bg-[#a78bfa]/20 text-[#a78bfa] border border-[#a78bfa]/30 hover:bg-[#a78bfa]/30 transition-colors"
              >
                Generate My Path ✨
              </button>
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={fadeUp} className="rounded-2xl p-4 bg-[rgba(15,23,42,0.5)] border border-[rgba(51,65,85,0.4)]">
          <h4 className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-2">Quick Actions</h4>
          <div className="space-y-1.5">
            {[
              { label: 'Explore Skill Map', tab: 'skillmap', icon: '🗺️' },
              { label: 'Take a Quiz', tab: 'knowledge', icon: '🧩' },
              { label: 'Get Recommendations', tab: 'recommendations', icon: '💡' },
              { label: 'Chat with Nova', tab: 'tutor', icon: '🤖' },
            ].map((a) => (
              <button
                key={a.tab}
                onClick={() => setActiveTab(a.tab as any)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-left text-[#94a3b8] hover:bg-[rgba(51,65,85,0.4)] hover:text-[#e2e8f0] transition-all border border-transparent hover:border-[rgba(167,139,250,0.2)]"
              >
                <span>{a.icon}</span>
                {a.label}
                <ArrowRight size={11} className="ml-auto opacity-0 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
