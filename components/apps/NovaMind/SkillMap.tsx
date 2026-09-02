'use client';
// ============================================================
// Campus OS — NovaMind Skill Map
// Animated bento grid of all skills with mastery bars, filters
// ============================================================
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronRight, Lock } from 'lucide-react';
import { useNovaMindStore } from '@/stores/useNovaMindStore';
import { SKILL_TAXONOMY, CATEGORY_META, SKILL_MAP } from '@/data/novamind/skillTaxonomy';
import type { SkillCategory, Skill } from '@/types/novamind';

const categories: SkillCategory[] = ['programming', 'frameworks', 'data-science', 'soft-skills', 'finance', 'devops'];

function getMasteryLabel(mastery: number): string {
  if (mastery >= 85) return 'Expert';
  if (mastery >= 65) return 'Proficient';
  if (mastery >= 40) return 'Intermediate';
  if (mastery >= 15) return 'Beginner';
  return 'Novice';
}

function getMasteryColor(mastery: number): string {
  if (mastery >= 85) return '#22c55e';
  if (mastery >= 65) return '#a78bfa';
  if (mastery >= 40) return '#60a5fa';
  if (mastery >= 15) return '#fbbf24';
  return '#475569';
}

export default function SkillMap() {
  const { skillMastery, updateSkillMastery } = useNovaMindStore();
  const [activeCategory, setActiveCategory] = useState<SkillCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const filtered = SKILL_TAXONOMY.filter((s) => {
    const matchCat = activeCategory === 'all' || s.category === activeCategory;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.tags.some((t) => t.includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  const skillDetail = selectedSkill;
  const detailMastery = skillDetail ? (skillMastery[skillDetail.id]?.mastery ?? 0) : 0;

  // Prerequisite check
  const isUnlocked = (skill: Skill) =>
    skill.prerequisites.length === 0 ||
    skill.prerequisites.every((pId) => (skillMastery[pId]?.mastery ?? 0) >= 20);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main skill grid */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Filters */}
        <div className="flex-shrink-0 p-4 pb-3 space-y-3 border-b border-[rgba(51,65,85,0.4)]">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
            <input
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(51,65,85,0.4)] text-sm text-[#e2e8f0] placeholder-[#475569] outline-none focus:border-[rgba(167,139,250,0.5)] transition-colors"
              placeholder="Search skills, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                activeCategory === 'all'
                  ? 'bg-[#a78bfa]/20 text-[#a78bfa] border-[#a78bfa]/30'
                  : 'text-[#94a3b8] border-[rgba(51,65,85,0.4)] hover:border-[rgba(51,65,85,0.7)]'
              }`}
            >
              All Skills ({SKILL_TAXONOMY.length})
            </button>
            {categories.map((cat) => {
              const m = CATEGORY_META[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                    activeCategory === cat
                      ? 'border-opacity-50 text-[#e2e8f0]'
                      : 'text-[#94a3b8] border-[rgba(51,65,85,0.4)] hover:border-[rgba(51,65,85,0.7)]'
                  }`}
                  style={activeCategory === cat ? { background: `${m.color}20`, borderColor: `${m.color}50`, color: m.color } : {}}
                >
                  <span>{m.icon}</span> {m.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <motion.div
            className="grid grid-cols-2 gap-2.5"
            layout
          >
            <AnimatePresence>
              {filtered.map((skill, i) => {
                const mastery = skillMastery[skill.id]?.mastery ?? 0;
                const unlocked = isUnlocked(skill);
                const color = unlocked ? CATEGORY_META[skill.category].color : '#475569';
                const isSelected = selectedSkill?.id === skill.id;

                return (
                  <motion.button
                    key={skill.id}
                    layout
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.02 } }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    onClick={() => setSelectedSkill(isSelected ? null : skill)}
                    className={`relative text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-[rgba(167,139,250,0.5)] bg-[rgba(167,139,250,0.08)]'
                        : 'border-[rgba(51,65,85,0.4)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(51,65,85,0.7)] hover:bg-[rgba(255,255,255,0.04)]'
                    } ${!unlocked ? 'opacity-50' : ''}`}
                  >
                    {!unlocked && (
                      <Lock size={10} className="absolute top-2 right-2 text-[#475569]" />
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{skill.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#e2e8f0] truncate">{skill.name}</p>
                        <p className="text-[10px]" style={{ color: CATEGORY_META[skill.category].color }}>
                          {CATEGORY_META[skill.category].label}
                        </p>
                      </div>
                      {mastery > 0 && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                          style={{ color: getMasteryColor(mastery), background: `${getMasteryColor(mastery)}15` }}
                        >
                          {mastery}%
                        </span>
                      )}
                    </div>
                    {/* Mastery bar */}
                    <div className="h-1 bg-[#1e293b] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${mastery}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    {mastery > 0 && (
                      <p className="text-[10px] text-[#475569] mt-1.5">{getMasteryLabel(mastery)}</p>
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Skill detail panel */}
      <AnimatePresence>
        {skillDetail && (
          <motion.div
            key="detail"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="flex-shrink-0 border-l border-[rgba(51,65,85,0.4)] bg-[rgba(10,15,30,0.8)] overflow-hidden"
          >
            <div className="p-5 h-full overflow-y-auto custom-scrollbar space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-3xl">{skillDetail.icon}</span>
                  <h3 className="text-base font-bold text-[#e2e8f0] mt-1">{skillDetail.name}</h3>
                  <p className="text-xs" style={{ color: CATEGORY_META[skillDetail.category].color }}>
                    {CATEGORY_META[skillDetail.category].label}
                  </p>
                </div>
                <button onClick={() => setSelectedSkill(null)} className="text-[#475569] hover:text-[#e2e8f0] text-lg leading-none">×</button>
              </div>

              {/* Mastery ring */}
              <div className="flex flex-col items-center py-2">
                <div className="relative w-20 h-20">
                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle cx="40" cy="40" r="35" fill="none" stroke="#1e293b" strokeWidth="6" />
                    <motion.circle
                      cx="40" cy="40" r="35" fill="none"
                      stroke={getMasteryColor(detailMastery)} strokeWidth="6"
                      strokeDasharray={2 * Math.PI * 35}
                      initial={{ strokeDashoffset: 2 * Math.PI * 35 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 35 * (1 - detailMastery / 100) }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-base font-bold" style={{ color: getMasteryColor(detailMastery) }}>
                      {detailMastery}%
                    </span>
                  </div>
                </div>
                <p className="text-xs text-[#94a3b8] mt-1">{getMasteryLabel(detailMastery)}</p>
              </div>

              {/* Description */}
              <p className="text-xs text-[#94a3b8] leading-relaxed">{skillDetail.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {skillDetail.tags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)] text-[#94a3b8] border border-[rgba(51,65,85,0.4)]">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Prerequisites */}
              {skillDetail.prerequisites.length > 0 && (
                <div>
                  <p className="text-[10px] text-[#475569] uppercase tracking-wider mb-1.5">Prerequisites</p>
                  <div className="space-y-1">
                    {skillDetail.prerequisites.map((pId) => {
                      const prereq = SKILL_MAP.get(pId);
                      if (!prereq) return null;
                      const pMastery = skillMastery[pId]?.mastery ?? 0;
                      return (
                        <div key={pId} className="flex items-center gap-2 text-xs">
                          <span>{prereq.icon}</span>
                          <span className="text-[#94a3b8]">{prereq.name}</span>
                          <span className="ml-auto text-[10px]" style={{ color: getMasteryColor(pMastery) }}>{pMastery}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Practice button */}
              <button
                onClick={() => {
                  updateSkillMastery(skillDetail.id, 5);
                }}
                className="w-full py-2 rounded-xl text-sm font-medium transition-all border"
                style={{
                  background: `${CATEGORY_META[skillDetail.category].color}20`,
                  borderColor: `${CATEGORY_META[skillDetail.category].color}40`,
                  color: CATEGORY_META[skillDetail.category].color,
                }}
              >
                Mark as Practiced (+5%)
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
