'use client';
// ============================================================
// Campus OS — NovaMind Predictive Intelligence Panel
// Phase 5: Performance prediction, risk detection, time-to-competency
// ============================================================
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, Clock, Target, Zap, CheckCircle2, Activity } from 'lucide-react';
import { useNovaMindStore } from '@/stores/useNovaMindStore';
import { SKILL_TAXONOMY, CATEGORY_META } from '@/data/novamind/skillTaxonomy';

// ── Prediction Algorithms ─────────────────────────────────────────────────

function predictTimeToMastery(currentMastery: number, weeklyHours: number, targetMastery = 80): number | null {
  if (currentMastery >= targetMastery) return 0;
  const gap = targetMastery - currentMastery;
  // Simplified: each % point requires ~30min practice on average, slows at high mastery
  const hoursNeeded = (gap * 0.5) * (1 + currentMastery / 100);
  if (weeklyHours <= 0) return null;
  return Math.ceil(hoursNeeded / weeklyHours);
}

function detectRiskFactors(state: {
  streak: number;
  xp: number;
  skillMastery: Record<string, { mastery: number; practiceCount: number; lastPracticed: string }>;
  careerReadiness: number;
}): { level: 'high' | 'medium' | 'low'; message: string; action: string }[] {
  const risks = [];
  const today = new Date().toISOString().slice(0, 10);

  if (state.streak < 3) {
    risks.push({ level: 'medium' as const, message: 'Low streak detected — consistency is key for retention.', action: 'Take a 10-min quiz today to build momentum' });
  }

  const staleSkills = Object.values(state.skillMastery).filter((m) => {
    const daysSince = Math.floor((Date.now() - new Date(m.lastPracticed).getTime()) / 86400000);
    return daysSince > 7 && m.mastery > 0;
  });
  if (staleSkills.length > 0) {
    risks.push({ level: 'medium' as const, message: `${staleSkills.length} skill(s) not practiced in 7+ days — forgetting curve is active.`, action: 'Review forgotten skills in Knowledge Trace' });
  }

  if (state.careerReadiness < 50) {
    risks.push({ level: 'high' as const, message: `Career readiness at ${state.careerReadiness}% — below job-ready threshold.`, action: 'Follow your learning path to close skill gaps' });
  }

  const criticalGaps = SKILL_TAXONOMY.filter((s) => ['dsa', 'system-design', 'sql'].includes(s.id))
    .filter((s) => (state.skillMastery[s.id]?.mastery ?? 0) < 30);
  if (criticalGaps.length > 0) {
    risks.push({ level: 'high' as const, message: `Core interview skills (${criticalGaps.map((s) => s.name).join(', ')}) are below 30%.`, action: 'Prioritize DSA and System Design practice' });
  }

  return risks.slice(0, 4);
}

function computeCareerProjection(skillMastery: Record<string, { mastery: number }>, weeklyHours: number): {
  weeksToJobReady: number;
  topBlockers: { name: string; gap: number }[];
  momentum: 'accelerating' | 'steady' | 'stalling';
} {
  const TARGET_MASTERY = 70;
  const criticalSkills = ['python', 'javascript', 'dsa', 'sql', 'git', 'system-design', 'communication'];
  const blockers = criticalSkills
    .map((id) => {
      const skill = SKILL_TAXONOMY.find((s) => s.id === id);
      const mastery = skillMastery[id]?.mastery ?? 0;
      return { name: skill?.name ?? id, gap: Math.max(0, TARGET_MASTERY - mastery), id };
    })
    .filter((b) => b.gap > 10)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 4);

  const totalGap = blockers.reduce((sum, b) => sum + b.gap, 0);
  const hoursNeeded = totalGap * 0.4;
  const weeksToJobReady = weeklyHours > 0 ? Math.ceil(hoursNeeded / weeklyHours) : 99;

  const avgMastery = Object.values(skillMastery).reduce((s, m) => s + m.mastery, 0) /
    Math.max(1, Object.keys(skillMastery).length);

  const momentum = avgMastery > 60 ? 'accelerating' : avgMastery > 35 ? 'steady' : 'stalling';

  return { weeksToJobReady, topBlockers: blockers, momentum };
}

// ─────────────────────────────────────────────────────────────────────────────

const RISK_COLORS = {
  high: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', icon: <AlertTriangle size={13} className="text-[#f87171]" />, text: 'text-[#f87171]' },
  medium: { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)', icon: <AlertTriangle size={13} className="text-[#fbbf24]" />, text: 'text-[#fbbf24]' },
  low: { bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.25)', icon: <CheckCircle2 size={13} className="text-[#34d399]" />, text: 'text-[#34d399]' },
};

export default function PredictiveIntelligence() {
  const { skillMastery, careerReadiness, streak, xp, userProfile } = useNovaMindStore();

  const risks = useMemo(() => detectRiskFactors({ streak, xp, skillMastery, careerReadiness }), [streak, xp, skillMastery, careerReadiness]);
  const projection = useMemo(() => computeCareerProjection(skillMastery, userProfile.weeklyHours), [skillMastery, userProfile.weeklyHours]);

  // Per-skill time predictions for top 5 gap skills
  const skillPredictions = useMemo(() =>
    SKILL_TAXONOMY
      .map((s) => ({
        skill: s,
        mastery: skillMastery[s.id]?.mastery ?? 0,
        weeks: predictTimeToMastery(skillMastery[s.id]?.mastery ?? 0, userProfile.weeklyHours),
      }))
      .filter((s) => s.mastery < 80 && s.mastery > 0)
      .sort((a, b) => a.mastery - b.mastery)
      .slice(0, 5),
    [skillMastery, userProfile.weeklyHours]
  );

  const momentumColors = {
    accelerating: '#34d399',
    steady: '#fbbf24',
    stalling: '#f87171',
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-5 space-y-4 custom-scrollbar">
      {/* Career Projection */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl border border-[rgba(167,139,250,0.2)] bg-[rgba(167,139,250,0.05)]"
      >
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-[#a78bfa]" />
          <h3 className="font-semibold text-sm text-[#e2e8f0]">Career Trajectory Forecast</h3>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Time to job-ready */}
          <div className="text-center p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(51,65,85,0.3)]">
            <Clock size={18} className="text-[#60a5fa] mx-auto mb-1" />
            <div className="text-xl font-black text-[#60a5fa]">{projection.weeksToJobReady}w</div>
            <div className="text-[10px] text-[#475569]">To Job-Ready</div>
          </div>
          {/* Career readiness */}
          <div className="text-center p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(51,65,85,0.3)]">
            <Target size={18} className="text-[#a78bfa] mx-auto mb-1" />
            <div className="text-xl font-black text-[#a78bfa]">{careerReadiness}%</div>
            <div className="text-[10px] text-[#475569]">Readiness</div>
          </div>
          {/* Momentum */}
          <div className="text-center p-3 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(51,65,85,0.3)]">
            <TrendingUp size={18} className="mx-auto mb-1" style={{ color: momentumColors[projection.momentum] }} />
            <div className="text-sm font-bold capitalize" style={{ color: momentumColors[projection.momentum] }}>
              {projection.momentum}
            </div>
            <div className="text-[10px] text-[#475569]">Momentum</div>
          </div>
        </div>

        {/* Top blockers */}
        <div>
          <p className="text-[10px] text-[#475569] uppercase tracking-wider mb-2">Top Skill Blockers</p>
          <div className="space-y-1.5">
            {projection.topBlockers.map((blocker, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="text-[#94a3b8] w-24 truncate">{blocker.name}</span>
                <div className="flex-1 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[#f87171]"
                    initial={{ width: 0 }}
                    animate={{ width: `${blocker.gap}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  />
                </div>
                <span className="text-[#f87171] text-[10px] w-8 text-right">-{blocker.gap}%</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Risk Detection */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
        className="rounded-2xl border border-[rgba(51,65,85,0.4)] bg-[rgba(10,15,30,0.5)] p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={15} className="text-[#fbbf24]" />
          <h3 className="font-semibold text-sm text-[#e2e8f0]">Risk Detection</h3>
          <span className="ml-auto text-[10px] bg-[#fbbf24]/10 text-[#fbbf24] px-2 py-0.5 rounded-full">
            {risks.filter(r => r.level === 'high').length} High
          </span>
        </div>

        {risks.length === 0 ? (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(52,211,153,0.06)] border border-[rgba(52,211,153,0.2)]">
            <CheckCircle2 size={14} className="text-[#34d399]" />
            <p className="text-xs text-[#34d399]">No risks detected. Keep up the great work!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {risks.map((risk, i) => {
              const rc = RISK_COLORS[risk.level];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: i * 0.08 } }}
                  className="p-3 rounded-xl border text-xs"
                  style={{ background: rc.bg, borderColor: rc.border }}
                >
                  <div className={`flex items-center gap-1.5 font-medium mb-1 ${rc.text}`}>
                    {rc.icon} {risk.level.toUpperCase()} RISK
                  </div>
                  <p className="text-[#94a3b8] mb-1">{risk.message}</p>
                  <p className="text-[#475569] flex items-center gap-1">
                    <Zap size={10} /> {risk.action}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Time-to-Competency */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
        className="rounded-2xl border border-[rgba(51,65,85,0.4)] bg-[rgba(10,15,30,0.5)] p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Clock size={15} className="text-[#60a5fa]" />
          <h3 className="font-semibold text-sm text-[#e2e8f0]">Time-to-Competency</h3>
          <span className="ml-auto text-[10px] text-[#475569]">@ {userProfile.weeklyHours}h/week</span>
        </div>

        <div className="space-y-2.5">
          {skillPredictions.map((s, i) => {
            const meta = CATEGORY_META[s.skill.category];
            return (
              <motion.div
                key={s.skill.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0, transition: { delay: i * 0.08 } }}
                className="flex items-center gap-3"
              >
                <span className="text-base w-6">{s.skill.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#94a3b8]">{s.skill.name}</span>
                    <span className="text-[10px]" style={{ color: meta.color }}>{s.mastery}% → 80%</span>
                  </div>
                  <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: meta.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${s.mastery}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                    />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {s.weeks === 0 ? (
                    <CheckCircle2 size={13} className="text-[#34d399]" />
                  ) : (
                    <span className="text-[11px] font-bold text-[#60a5fa]">{s.weeks}w</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="text-[10px] text-[#2d3748] mt-3 leading-relaxed">
          Prediction based on current pace, weekly hours commitment, and skill complexity. Actual time may vary.
        </p>
      </motion.div>
    </div>
  );
}
