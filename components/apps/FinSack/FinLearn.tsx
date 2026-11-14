'use client';

// ============================================================
// Campus OS — FinSack FinLearn
// Gamified financial learning with categories, timeline, video + AI notes
// Ported from D:\finsack\components\apps\FinLearn.tsx
// ============================================================
import { useState, useCallback } from 'react';
import {
  BookOpen, Play, CheckCircle2, ChevronRight, Sparkles,
  Loader2, Star, ArrowLeft, ExternalLink, Cpu, RefreshCw, AlertCircle
} from 'lucide-react';
import { strategies, categoryInfo } from '@/data/finsack/strategies';
import { useFinSackStore } from '@/stores/useFinSackStore';
import { useDesktopStore } from '@/stores/useDesktopStore';
import type { Strategy, StrategyCategory } from '@/types/finsack';

export default function FinLearn() {
  const [selectedCategory, setSelectedCategory] = useState<StrategyCategory>('investing');
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [notes, setNotes] = useState<string>('');
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const { completedLessons, completeLesson, addXp, cachedNotes, cacheNotes } = useFinSackStore();
  const activeAI = useDesktopStore((s) => s.activeAI);
  const setActiveAI = useDesktopStore((s) => s.setActiveAI);

  const isLessonComplete = (id: string) => completedLessons.includes(id);
  const filteredStrategies = strategies.filter((s) => s.category === selectedCategory);

  // Fetch YouTube video with fallback
  const fetchVideo = useCallback(async (searchTag: string, defaultId?: string) => {
    setLoadingVideo(true);
    setVideoId(null);
    try {
      const res = await fetch(`/api/finsack/youtube?q=${encodeURIComponent(searchTag)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.videoId) { setVideoId(data.videoId); return; }
      }
      if (defaultId) setVideoId(defaultId);
    } catch {
      if (defaultId) setVideoId(defaultId);
    } finally {
      setLoadingVideo(false);
    }
  }, []);

  // Fetch AI Notes with store caching and active AI engine reporting
  const fetchNotes = useCallback(async (strategy: Strategy, forceRefresh: boolean = false) => {
    if (!forceRefresh && cachedNotes && cachedNotes[strategy.id]) {
      setNotes(cachedNotes[strategy.id]);
      return;
    }

    setLoadingNotes(true);
    setNotes('');
    setActiveAI({ isGenerating: true, statusText: 'Generating FinSack strategy notes...' });

    try {
      const res = await fetch('/api/finsack/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: strategy.aiPrompt, strategyId: strategy.id }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.content || '';
        setNotes(content);
        if (cacheNotes) cacheNotes(strategy.id, content);

        if (!completedLessons.includes(strategy.id)) {
          completeLesson(strategy.id);
          addXp(strategy.xpReward);
        }

        if (data.provider === 'ollama') {
          setActiveAI({
            provider: 'local-ollama',
            modelName: data.model || 'deepseek-r1:1.5b (Local)',
            statusText: `Local Ollama: ${data.model || 'deepseek-r1:1.5b'}`,
            isGenerating: false,
          });
        } else {
          setActiveAI({
            provider: 'cloud-openrouter',
            modelName: `${data.model || 'nemotron-3.5'} (Cloud)`,
            statusText: `Cloud: ${data.model || 'nemotron-3.5'}`,
            isGenerating: false,
          });
        }
      } else {
        setNotes('*Failed to generate notes. Please try again.*');
        setActiveAI({ isGenerating: false });
      }
    } catch {
      setNotes('*Failed to generate notes. Please try again.*');
      setActiveAI({ isGenerating: false });
    } finally {
      setLoadingNotes(false);
    }
  }, [completedLessons, completeLesson, addXp, cachedNotes, cacheNotes, setActiveAI]);

  // Open strategy
  const openStrategy = useCallback((strategy: Strategy) => {
    setSelectedStrategy(strategy);
    fetchVideo(strategy.ytSearchTag, strategy.defaultVideoId);
    fetchNotes(strategy);
  }, [fetchVideo, fetchNotes]);

  // ── Lesson View ──────────────────────────────────────────────
  if (selectedStrategy) {
    return (
      <div className="flex flex-col h-full">
        {/* Lesson header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(51,65,85,0.4)] bg-[rgba(15,23,42,0.6)] flex-shrink-0">
          <button
            className="flex items-center gap-1.5 text-sm text-[#94a3b8] hover:text-[#e2e8f0] transition-colors"
            onClick={() => setSelectedStrategy(null)}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h2 className="font-semibold text-sm text-[#e2e8f0] truncate mx-4">{selectedStrategy.title}</h2>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              selectedStrategy.difficulty === 'Beginner' ? 'bg-[#22c55e]/20 text-[#22c55e]'
                : selectedStrategy.difficulty === 'Intermediate' ? 'bg-[#fbbf24]/20 text-[#fbbf24]'
                : 'bg-[#ef4444]/20 text-[#ef4444]'
            }`}>{selectedStrategy.difficulty}</span>
            {videoId && (
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-[#94a3b8] hover:text-[#e2e8f0] transition-colors"
              >
                <ExternalLink size={12} /> YouTube
              </a>
            )}
          </div>
        </div>

        {/* Split view */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Video pane */}
          <div className="w-1/2 border-r border-[rgba(51,65,85,0.4)] flex items-center justify-center bg-black/30">
            {loadingVideo ? (
              <div className="flex flex-col items-center gap-2 text-[#94a3b8]">
                <Loader2 size={32} className="animate-spin" />
                <span className="text-sm">Loading video...</span>
              </div>
            ) : videoId ? (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&enablejsapi=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title={selectedStrategy.title}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-[#475569]">
                <Play size={32} />
                <span className="text-sm">Video unavailable</span>
              </div>
            )}
          </div>

          {/* Notes pane */}
          <div className="w-1/2 flex flex-col">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(51,65,85,0.4)] bg-[rgba(15,23,42,0.4)]">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#22d3ee]" />
                <span className="text-xs font-semibold text-[#e2e8f0]">AI Strategy Notes</span>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-cyan-400">
                  <Cpu size={10} className={activeAI.provider === 'local-ollama' ? 'text-emerald-400' : 'text-violet-400'} />
                  <span>{activeAI.provider === 'local-ollama' ? 'Local Engine' : activeAI.provider === 'cloud-openrouter' ? 'Cloud Fallback' : 'AI Active'}</span>
                </div>
              </div>
              <button
                disabled={loadingNotes}
                onClick={() => fetchNotes(selectedStrategy, true)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-white/5 transition-colors disabled:opacity-50"
                title="Regenerate strategy notes"
              >
                <RefreshCw size={12} className={loadingNotes ? 'animate-spin text-cyan-400' : ''} />
                <span>{loadingNotes ? 'Generating...' : 'Regenerate'}</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {loadingNotes ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-[#94a3b8]">
                  <Loader2 size={24} className="animate-spin text-cyan-400" />
                  <span className="text-sm font-medium">Generating notes with Nova AI...</span>
                  <span className="text-xs text-[#64748b] font-mono">Checking Ollama & Cloud Fallbacks</span>
                </div>
              ) : notes && notes.includes('Failed to generate notes') ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-3">
                  <AlertCircle size={28} className="text-amber-400" />
                  <p className="text-sm text-slate-300">Notes generation timed out or could not connect.</p>
                  <button
                    onClick={() => fetchNotes(selectedStrategy, true)}
                    className="px-4 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 text-xs font-semibold border border-cyan-500/30 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw size={12} /> Retry Notes Generation
                  </button>
                </div>
              ) : notes ? (
                <div className="space-y-2 text-sm text-[#cbd5e1] leading-relaxed">
                  {notes.split('\n').map((line, i) => {
                    if (line.startsWith('# ')) return <h3 key={i} className="text-base font-bold text-[#e2e8f0] mt-4 mb-2">{line.replace(/^#+\s*/, '')}</h3>;
                    if (line.startsWith('## ')) return <h4 key={i} className="text-sm font-semibold text-[#22d3ee] mt-3 mb-1.5 flex items-center gap-1.5">{line.replace(/^#+\s*/, '')}</h4>;
                    if (line.startsWith('- ') || line.startsWith('* ')) {
                      const raw = line.replace(/^[-*]\s*/, '');
                      return (
                        <p key={i} className="pl-3 text-sm text-[#cbd5e1] leading-relaxed">
                          • <span dangerouslySetInnerHTML={{ __html: raw.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>') }} />
                        </p>
                      );
                    }
                    if (line.trim() === '') return <div key={i} className="h-1.5" />;
                    return (
                      <p key={i} className="text-sm text-[#cbd5e1] leading-relaxed" dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>') }} />
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-[#475569]">
                  <BookOpen size={24} />
                  <span className="text-sm">Notes will appear here</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main: Sidebar + Timeline ──────────────────────────────────
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside className="w-52 flex flex-col border-r border-[rgba(51,65,85,0.4)] bg-[rgba(15,23,42,0.6)] flex-shrink-0">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-[rgba(51,65,85,0.3)]">
          <BookOpen size={18} className="text-[#22d3ee]" />
          <span className="font-semibold text-sm text-[#e2e8f0]">Categories</span>
        </div>
        <div className="p-2 space-y-1 overflow-y-auto custom-scrollbar">
          {(Object.keys(categoryInfo) as StrategyCategory[]).map((cat) => {
            const info = categoryInfo[cat];
            const count = strategies.filter((s) => s.category === cat).length;
            const completed = strategies.filter((s) => s.category === cat && isLessonComplete(s.id)).length;
            return (
              <button
                key={cat}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all text-sm ${
                  selectedCategory === cat
                    ? 'bg-[rgba(34,211,238,0.1)] border border-[rgba(34,211,238,0.3)]'
                    : 'hover:bg-[rgba(51,65,85,0.3)] border border-transparent'
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                <span className="text-lg">{info.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className={`block text-sm font-medium ${selectedCategory === cat ? 'text-[#e2e8f0]' : 'text-[#94a3b8]'}`}>{info.name}</span>
                  <span className="text-xs text-[#475569]">{completed}/{count} complete</span>
                </div>
                <ChevronRight size={14} className="text-[#475569] flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </aside>

      {/* Timeline */}
      <main className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#e2e8f0]">
            {categoryInfo[selectedCategory].icon} {categoryInfo[selectedCategory].name}
          </h2>
          <span className="text-xs text-[#475569]">{filteredStrategies.length} strategies available</span>
        </div>

        <div className="space-y-3 pl-4 relative">
          {/* Timeline line */}
          <div className="absolute left-[15px] top-4 bottom-4 w-px bg-[rgba(51,65,85,0.4)]" />

          {filteredStrategies.map((strategy) => {
            const completed = isLessonComplete(strategy.id);
            return (
              <button
                key={strategy.id}
                className={`relative w-full flex items-start gap-4 p-4 rounded-xl text-left transition-all ${
                  completed
                    ? 'bg-[rgba(34,211,153,0.05)] border border-[rgba(34,211,153,0.2)] hover:border-[rgba(34,211,153,0.4)]'
                    : 'bg-[rgba(15,23,42,0.5)] border border-[rgba(51,65,85,0.3)] hover:border-[rgba(51,65,85,0.6)]'
                }`}
                onClick={() => openStrategy(strategy)}
              >
                {/* Node dot */}
                <div
                  className="w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ borderColor: completed ? '#34d399' : categoryInfo[selectedCategory].color }}
                >
                  {completed ? (
                    <CheckCircle2 size={14} className="text-[#34d399]" />
                  ) : (
                    <Play size={10} className="text-[#94a3b8]" />
                  )}
                </div>

                {/* Card content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-sm text-[#e2e8f0]">{strategy.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                      strategy.difficulty === 'Beginner' ? 'bg-[#22c55e]/15 text-[#22c55e]'
                        : strategy.difficulty === 'Intermediate' ? 'bg-[#fbbf24]/15 text-[#fbbf24]'
                        : 'bg-[#ef4444]/15 text-[#ef4444]'
                    }`}>{strategy.difficulty}</span>
                  </div>
                  <p className="text-xs text-[#94a3b8] mb-2">{strategy.description}</p>
                  <span className="flex items-center gap-1 text-xs text-[#fbbf24]">
                    <Star size={12} /> {strategy.xpReward} XP
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
