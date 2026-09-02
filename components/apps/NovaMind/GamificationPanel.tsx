'use client';
// ============================================================
// Campus OS — NovaMind Gamification Panel
// Phase 6: Badges, XP progression, skill tree achievements
// ============================================================
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Flame, Star, Lock } from 'lucide-react';
import { useNovaMindStore } from '@/stores/useNovaMindStore';
import { BADGES, RARITY_CONFIG, getLevelProgress } from '@/data/novamind/badges';

function checkBadgeUnlocked(
  badge: typeof BADGES[number],
  state: { xp: number; streak: number; skillMastery: Record<string, { mastery: number; practiceCount: number }> }
): boolean {
  const { type, value, skillId } = badge.requirement;
  switch (type) {
    case 'xp':
      return state.xp >= value;
    case 'streak':
      return state.streak >= value;
    case 'quiz_count': {
      const total = Object.values(state.skillMastery).reduce((s, m) => s + (m.practiceCount || 0), 0);
      return total >= value;
    }
    case 'skill_count':
      return Object.keys(state.skillMastery).length >= value;
    case 'mastery':
      if (!skillId) return false;
      return (state.skillMastery[skillId]?.mastery ?? 0) >= value;
    default:
      return false;
  }
}

const RARITY_ORDER = ['legendary', 'epic', 'rare', 'common'] as const;

export default function GamificationPanel() {
  const { xp, streak, skillMastery } = useNovaMindStore();
  const levelInfo = getLevelProgress(xp);

  const badgesWithStatus = useMemo(() =>
    BADGES.map((b) => ({
      ...b,
      unlocked: checkBadgeUnlocked(b, { xp, streak, skillMastery }),
    })).sort((a, b) => {
      // Unlocked first, then by rarity
      if (a.unlocked !== b.unlocked) return a.unlocked ? -1 : 1;
      return RARITY_ORDER.indexOf(a.rarity as any) - RARITY_ORDER.indexOf(b.rarity as any);
    }),
    [xp, streak, skillMastery]
  );

  const unlockedCount = badgesWithStatus.filter((b) => b.unlocked).length;

  const totalQuizzes = Object.values(skillMastery).reduce((s, m) => s + (m.practiceCount || 0), 0);
  const skillsTracked = Object.keys(skillMastery).length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* XP Progress Section */}
      <div className="flex-shrink-0 p-5 border-b border-[rgba(51,65,85,0.4)] space-y-4">
        {/* Level + XP ring row */}
        <div className="flex items-center gap-4">
          {/* Level ring */}
          <div className="relative w-16 h-16 flex-shrink-0">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="26" fill="none" stroke="#1e293b" strokeWidth="5" />
              <motion.circle
                cx="32" cy="32" r="26" fill="none"
                stroke="#a78bfa" strokeWidth="5"
                strokeDasharray={2 * Math.PI * 26}
                initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - levelInfo.pct / 100) }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-black text-[#a78bfa] leading-none">{levelInfo.level}</span>
              <span className="text-[8px] text-[#475569]">LVL</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-[#e2e8f0]">
                {levelInfo.level < 5 ? 'Rising Star' : levelInfo.level < 8 ? 'Knowledge Seeker' : 'Campus Legend'}
              </span>
              <span className="text-xs text-[#a78bfa]">{xp.toLocaleString()} XP</span>
            </div>
            <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[#a78bfa] to-[#7c3aed]"
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.pct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[#475569] mt-1">
              <span>{levelInfo.current.toLocaleString()} XP</span>
              <span>Next: {levelInfo.next.toLocaleString()} XP</span>
            </div>
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: <Flame size={14} className="text-[#fb923c]" />, label: 'Streak', value: `${streak}d`, color: '#fb923c' },
            { icon: <Zap size={14} className="text-[#fbbf24]" />, label: 'Quizzes', value: totalQuizzes, color: '#fbbf24' },
            { icon: <Star size={14} className="text-[#34d399]" />, label: 'Skills', value: skillsTracked, color: '#34d399' },
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center py-2 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(51,65,85,0.3)]">
              {s.icon}
              <span className="text-base font-bold mt-0.5" style={{ color: s.color }}>{s.value}</span>
              <span className="text-[10px] text-[#475569]">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Badges Section */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy size={15} className="text-[#fbbf24]" />
            <h3 className="font-semibold text-sm text-[#e2e8f0]">Badges</h3>
          </div>
          <span className="text-xs text-[#94a3b8]">{unlockedCount}/{BADGES.length} earned</span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {badgesWithStatus.map((badge, i) => {
            const rarityConf = RARITY_CONFIG[badge.rarity];
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.04 } }}
                className={`relative flex flex-col items-center p-3 rounded-2xl border text-center transition-all ${
                  badge.unlocked
                    ? 'bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.07)]'
                    : 'bg-[rgba(0,0,0,0.2)] opacity-50'
                }`}
                style={{
                  borderColor: badge.unlocked ? `${rarityConf.color}40` : 'rgba(51,65,85,0.3)',
                  boxShadow: badge.unlocked ? `0 0 12px 2px ${rarityConf.glow}` : 'none',
                }}
              >
                {/* Rarity glow dot */}
                {badge.unlocked && (
                  <div
                    className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                    style={{ background: rarityConf.color }}
                  />
                )}

                {/* Icon */}
                <div className={`text-2xl mb-1.5 ${!badge.unlocked ? 'grayscale' : ''}`}>
                  {badge.unlocked ? badge.icon : '🔒'}
                </div>

                {/* Name */}
                <p className="text-[11px] font-semibold text-[#e2e8f0] leading-tight mb-0.5">{badge.name}</p>

                {/* Rarity */}
                <span className="text-[9px] font-medium" style={{ color: rarityConf.color }}>
                  {rarityConf.label}
                </span>

                {/* XP reward */}
                {badge.unlocked && (
                  <div className="flex items-center gap-0.5 mt-1 text-[9px] text-[#fbbf24]">
                    <Zap size={8} />+{badge.xpReward} XP
                  </div>
                )}

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#0f172a] border border-[rgba(51,65,85,0.6)] rounded-lg text-[10px] text-[#94a3b8] whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 z-10">
                  {badge.description}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
