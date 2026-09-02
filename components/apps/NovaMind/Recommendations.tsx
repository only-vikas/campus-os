'use client';
// ============================================================
// Campus OS — NovaMind Recommendations
// Personalized learning paths generated via AI + skill gap analysis
// ============================================================
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, CheckCircle2, Clock, ExternalLink, Play, Trophy, ChevronRight } from 'lucide-react';
import { useNovaMindStore } from '@/stores/useNovaMindStore';
import { SKILL_TAXONOMY, CATEGORY_META, SKILL_MAP } from '@/data/novamind/skillTaxonomy';
import type { LearningPath, Recommendation, SkillCategory } from '@/types/novamind';

// Static recommendations based on skill gaps
function generateRecommendations(skillMastery: Record<string, { mastery: number }>, careerGoal: string): Recommendation[] {
  // Find top skill gaps
  const gaps = SKILL_TAXONOMY.map((s) => ({
    skill: s,
    mastery: skillMastery[s.id]?.mastery ?? 0,
    gap: 100 - (skillMastery[s.id]?.mastery ?? 0),
  }))
    .filter((g) => g.gap > 30)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 6);

  return gaps.map((g, i) => ({
    id: `rec-${i}`,
    skillId: g.skill.id,
    resource: {
      id: `res-${i}`,
      title: `${g.skill.name}: Complete Guide`,
      type: i % 3 === 0 ? 'video' : i % 3 === 1 ? 'course' : 'article',
      url: `https://www.youtube.com/results?search_query=learn+${encodeURIComponent(g.skill.name)}`,
      skillIds: [g.skill.id],
      duration: `${4 + i * 2}h`,
      difficulty: g.mastery < 20 ? 'beginner' : g.mastery < 50 ? 'intermediate' : 'advanced',
      relevanceScore: Math.round(90 - i * 8),
    },
    reason: `Your mastery is only ${g.mastery}% — this skill appears in ${60 - i * 5}% of ${careerGoal} job postings.`,
    priority: i < 2 ? 'high' : i < 4 ? 'medium' : 'low',
    estimatedTime: `${1 + i}–${2 + i} weeks`,
  }));
}

const PRIORITY_COLORS = {
  high: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' },
  medium: { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' },
  low: { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.2)' },
};

const RESOURCE_ICONS: Record<string, string> = {
  video: '🎬', course: '🎓', article: '📰', project: '🛠️', practice: '🧩',
};

export default function Recommendations() {
  const { skillMastery, activePath, setActivePath, completeMilestone, userProfile, setActiveTab } = useNovaMindStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    () => generateRecommendations(skillMastery, userProfile.careerGoal)
  );
  const [activeView, setActiveView] = useState<'recs' | 'path'>('recs');

  const handleGeneratePath = async () => {
    setIsGenerating(true);
    try {
      // Build skill levels for API
      const skillLevels = Object.fromEntries(
        Object.entries(skillMastery).map(([id, m]) => [id, m.mastery])
      );

      const res = await fetch('/api/novamind/generate-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          careerGoal: userProfile.careerGoal,
          targetRole: userProfile.targetRole,
          skillLevels,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const path = data.path as LearningPath;
        // Ensure unique IDs and required fields
        const safePath: LearningPath = {
          id: `path-${Date.now()}`,
          title: path.title || `Path to ${userProfile.targetRole}`,
          careerGoal: userProfile.careerGoal,
          totalDays: path.totalDays || 60,
          generatedAt: new Date().toISOString(),
          milestones: (path.milestones || []).map((m, i) => ({
            id: m.id || `m${i + 1}`,
            title: m.title || `Milestone ${i + 1}`,
            description: m.description || '',
            skillIds: m.skillIds || [],
            estimatedDays: m.estimatedDays || 14,
            completed: false,
            project: m.project,
          })),
        };
        setActivePath(safePath);
        setActiveView('path');
      } else {
        // Use fallback path
        setActivePath(FALLBACK_PATH(userProfile));
        setActiveView('path');
      }
    } catch {
      setActivePath(FALLBACK_PATH(userProfile));
      setActiveView('path');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex-shrink-0 flex gap-1 p-3 border-b border-[rgba(51,65,85,0.4)]">
        {(['recs', 'path'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setActiveView(v)}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
              activeView === v
                ? 'bg-[rgba(167,139,250,0.15)] text-[#a78bfa] border border-[rgba(167,139,250,0.3)]'
                : 'text-[#94a3b8] hover:text-[#e2e8f0]'
            }`}
          >
            {v === 'recs' ? '💡 Recommendations' : '🗺️ My Learning Path'}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <AnimatePresence mode="wait">
          {/* ── Recommendations ── */}
          {activeView === 'recs' && (
            <motion.div key="recs" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-[#94a3b8]">Based on your skill gaps & career goal: <span className="text-[#a78bfa]">{userProfile.careerGoal}</span></p>
                <button
                  onClick={() => setRecommendations(generateRecommendations(skillMastery, userProfile.careerGoal))}
                  className="text-[10px] text-[#a78bfa] hover:underline"
                >
                  Refresh
                </button>
              </div>

              {recommendations.map((rec, i) => {
                const skill = SKILL_MAP.get(rec.skillId);
                const catMeta = skill ? CATEGORY_META[skill.category] : null;
                const pCol = PRIORITY_COLORS[rec.priority];
                const mastery = skillMastery[rec.skillId]?.mastery ?? 0;

                return (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.07 } }}
                    className="p-4 rounded-2xl border border-[rgba(51,65,85,0.4)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(167,139,250,0.25)] hover:bg-[rgba(167,139,250,0.03)] transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{RESOURCE_ICONS[rec.resource.type]}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-sm font-semibold text-[#e2e8f0]">{rec.resource.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ color: pCol.color, background: pCol.bg, border: `1px solid ${pCol.border}` }}>
                            {rec.priority} priority
                          </span>
                        </div>
                        <p className="text-xs text-[#94a3b8] mb-2">{rec.reason}</p>

                        <div className="flex items-center gap-3 text-[11px] text-[#475569]">
                          <span className="flex items-center gap-1"><Clock size={11} />{rec.resource.duration}</span>
                          <span>•</span>
                          <span className="capitalize">{rec.resource.difficulty}</span>
                          {catMeta && (
                            <>
                              <span>•</span>
                              <span style={{ color: catMeta.color }}>{catMeta.label}</span>
                            </>
                          )}
                          <span className="ml-auto text-[#a78bfa]">Relevance: {rec.resource.relevanceScore}%</span>
                        </div>

                        {/* Mastery bar */}
                        <div className="mt-2.5">
                          <div className="flex justify-between text-[10px] text-[#475569] mb-1">
                            <span>Current Mastery</span>
                            <span>{mastery}%</span>
                          </div>
                          <div className="h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-[#a78bfa]" style={{ width: `${mastery}%` }} />
                          </div>
                        </div>
                      </div>

                      <a
                        href={rec.resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-[#a78bfa]/10 border border-[#a78bfa]/20 text-[#a78bfa] hover:bg-[#a78bfa]/20 transition-colors"
                      >
                        <Play size={13} />
                      </a>
                    </div>
                  </motion.div>
                );
              })}

              {/* Generate path CTA */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
                className="p-5 rounded-2xl border border-dashed border-[rgba(167,139,250,0.3)] bg-[rgba(167,139,250,0.03)] text-center"
              >
                <Sparkles size={24} className="text-[#a78bfa] mx-auto mb-2" />
                <p className="text-sm font-semibold text-[#e2e8f0] mb-1">Want a full personalized roadmap?</p>
                <p className="text-xs text-[#94a3b8] mb-3">NovaMind will generate a 5-milestone project-based learning path tailored to you.</p>
                <button
                  onClick={handleGeneratePath}
                  disabled={isGenerating}
                  className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#a78bfa] to-[#7c3aed] text-white text-sm font-semibold shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                  {isGenerating ? 'Generating...' : 'Generate My Learning Path'}
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* ── Learning Path ── */}
          {activeView === 'path' && (
            <motion.div key="path" initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }}>
              {activePath ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-[#e2e8f0]">{activePath.title}</h3>
                      <p className="text-xs text-[#94a3b8] mt-0.5">
                        {activePath.totalDays} days • {activePath.milestones.filter((m) => m.completed).length}/{activePath.milestones.length} milestones
                      </p>
                    </div>
                    <div className="text-xs text-[#a78bfa] bg-[#a78bfa]/10 px-2 py-1 rounded-lg">
                      {Math.round((activePath.milestones.filter((m) => m.completed).length / activePath.milestones.length) * 100)}% done
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-[#1e293b] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#a78bfa] to-[#7c3aed]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(activePath.milestones.filter((m) => m.completed).length / activePath.milestones.length) * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>

                  {/* Milestones */}
                  <div className="space-y-3">
                    {activePath.milestones.map((milestone, i) => {
                      const isNext = !milestone.completed && activePath.milestones.slice(0, i).every((m) => m.completed);
                      return (
                        <motion.div
                          key={milestone.id}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0, transition: { delay: i * 0.1 } }}
                          className={`relative p-4 rounded-2xl border transition-all ${
                            milestone.completed
                              ? 'border-[rgba(34,197,94,0.2)] bg-[rgba(34,197,94,0.04)]'
                              : isNext
                              ? 'border-[rgba(167,139,250,0.4)] bg-[rgba(167,139,250,0.06)]'
                              : 'border-[rgba(51,65,85,0.4)] bg-[rgba(255,255,255,0.02)]'
                          }`}
                        >
                          {/* Connector line */}
                          {i < activePath.milestones.length - 1 && (
                            <div className="absolute left-7 top-full w-0.5 h-3 bg-[rgba(51,65,85,0.4)] -translate-x-1/2" />
                          )}

                          <div className="flex items-start gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              milestone.completed
                                ? 'bg-[rgba(34,197,94,0.2)] text-[#22c55e]'
                                : isNext
                                ? 'bg-[rgba(167,139,250,0.2)] text-[#a78bfa]'
                                : 'bg-[#1e293b] text-[#475569]'
                            }`}>
                              {milestone.completed ? <CheckCircle2 size={14} /> : i + 1}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-semibold text-[#e2e8f0]">{milestone.title}</h4>
                                {isNext && <span className="text-[10px] bg-[#a78bfa]/10 text-[#a78bfa] px-1.5 py-0.5 rounded-full">Next up</span>}
                              </div>
                              <p className="text-xs text-[#94a3b8] mt-0.5 mb-2">{milestone.description}</p>

                              <div className="flex items-center gap-3 text-[11px] text-[#475569]">
                                <span className="flex items-center gap-1"><Clock size={10} />{milestone.estimatedDays} days</span>
                                {milestone.project && (
                                  <span className="flex items-center gap-1">🛠️ Project: {milestone.project}</span>
                                )}
                              </div>

                              {isNext && !milestone.completed && (
                                <button
                                  onClick={() => completeMilestone(milestone.id)}
                                  className="mt-2 text-xs px-3 py-1 rounded-lg bg-[#a78bfa]/20 text-[#a78bfa] border border-[#a78bfa]/30 hover:bg-[#a78bfa]/30 transition-colors"
                                >
                                  Mark Complete
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => { setActivePath(null); setActiveView('recs'); }}
                    className="w-full py-2 rounded-xl text-sm text-[#94a3b8] border border-[rgba(51,65,85,0.4)] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
                  >
                    Generate a New Path
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <Trophy size={40} className="text-[#475569]" />
                  <p className="text-sm text-[#94a3b8] text-center">No learning path yet. Generate one from the Recommendations tab.</p>
                  <button onClick={() => setActiveView('recs')} className="text-sm text-[#a78bfa] flex items-center gap-1">
                    Go to Recommendations <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Fallback path used when API is unavailable
function FALLBACK_PATH(userProfile: { careerGoal: string; targetRole: string }): LearningPath {
  return {
    id: `path-fallback-${Date.now()}`,
    title: `Path to ${userProfile.targetRole}`,
    careerGoal: userProfile.careerGoal,
    totalDays: 60,
    generatedAt: new Date().toISOString(),
    milestones: [
      { id: 'm1', title: 'Core Foundations', description: 'Master the fundamental programming concepts and data structures.', skillIds: ['python', 'dsa'], estimatedDays: 14, completed: false, project: 'Build a CLI task manager in Python' },
      { id: 'm2', title: 'Web Development', description: 'Learn frontend and backend web technologies.', skillIds: ['javascript', 'react', 'nodejs'], estimatedDays: 12, completed: false, project: 'Build a full-stack todo app with React + Express' },
      { id: 'm3', title: 'Databases & APIs', description: 'SQL, REST API design, and database management.', skillIds: ['sql', 'nodejs'], estimatedDays: 10, completed: false, project: 'Build a REST API with authentication and PostgreSQL' },
      { id: 'm4', title: 'DevOps Basics', description: 'Version control, containers, and deployment.', skillIds: ['git', 'docker', 'ci-cd'], estimatedDays: 12, completed: false, project: 'Containerize your API and deploy to a cloud service' },
      { id: 'm5', title: 'Advanced Topics & Portfolio', description: 'Build your portfolio project and prepare for interviews.', skillIds: ['system-design', 'dsa'], estimatedDays: 12, completed: false, project: 'Build a capstone project showcasing all skills' },
    ],
  };
}
