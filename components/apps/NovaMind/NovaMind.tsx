'use client';
// ============================================================
// Campus OS — NovaMind App Shell (v2 — Phases 4-6 added)
// 7 tabs: Dashboard, Skill Map, Knowledge Trace, My Path,
//         AI Tutor, Predictions, Gamification
// ============================================================
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Map, BrainCircuit, Sparkles, Bot,
  Zap, Flame, TrendingUp, Trophy,
} from 'lucide-react';
import { useNovaMindStore } from '@/stores/useNovaMindStore';
import SplashScreen from './SplashScreen';
import Dashboard from './Dashboard';
import SkillMap from './SkillMap';
import KnowledgeTrace from './KnowledgeTrace';
import Recommendations from './Recommendations';
import AITutor from './AITutor';
import PredictiveIntelligence from './PredictiveIntelligence';
import GamificationPanel from './GamificationPanel';

type NovaMindTab = 'dashboard' | 'skillmap' | 'knowledge' | 'recommendations' | 'tutor' | 'predict' | 'gamification';

const TABS: { id: NovaMindTab; label: string; icon: React.ReactNode; badgePhase?: string }[] = [
  { id: 'dashboard',       label: 'Dashboard',      icon: <LayoutDashboard size={15} /> },
  { id: 'skillmap',        label: 'Skill Map',       icon: <Map size={15} /> },
  { id: 'knowledge',       label: 'Knowledge',       icon: <BrainCircuit size={15} /> },
  { id: 'recommendations', label: 'My Path',         icon: <Sparkles size={15} /> },
  { id: 'tutor',           label: 'AI Tutor',        icon: <Bot size={15} /> },
  { id: 'predict',         label: 'Predictions',     icon: <TrendingUp size={15} />, badgePhase: 'NEW' },
  { id: 'gamification',    label: 'Badges & XP',     icon: <Trophy size={15} />, badgePhase: 'NEW' },
];

export default function NovaMind() {
  const { activeTab, setActiveTab, hasSeenSplash, markSplashSeen, xp, streak } = useNovaMindStore();
  const [showSplash, setShowSplash] = useState(!hasSeenSplash);
  const [appVisible, setAppVisible] = useState(hasSeenSplash);

  const handleSplashComplete = () => {
    markSplashSeen();
    setShowSplash(false);
    setTimeout(() => setAppVisible(true), 50);
  };

  // Cast the stored tab to a valid NovaMind tab (backward compat)
  const safeTab = TABS.some(t => t.id === activeTab) ? activeTab as NovaMindTab : 'dashboard';

  return (
    <div className="relative h-full bg-[#080c1a] text-[#e2e8f0] font-sans overflow-hidden">
      {/* Splash screen — shows on every fresh open if not seen */}
      <SplashScreen onComplete={handleSplashComplete} />

      {/* Main app */}
      <AnimatePresence>
        {appVisible && (
          <motion.div
            key="novamind-app"
            className="flex h-full"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* ── Sidebar ── */}
            <div className="w-48 flex flex-col flex-shrink-0 border-r border-[rgba(51,65,85,0.35)] bg-[rgba(10,15,30,0.75)] backdrop-blur-xl">
              {/* App identity */}
              <div className="px-4 py-3.5 border-b border-[rgba(51,65,85,0.35)]">
                <div className="flex items-center gap-2.5">
                  <motion.div
                    className="w-8 h-8 rounded-xl flex items-center justify-center bg-[rgba(167,139,250,0.15)] border border-[rgba(167,139,250,0.3)]"
                    animate={{ boxShadow: ['0 0 8px 2px rgba(167,139,250,0.15)', '0 0 18px 5px rgba(167,139,250,0.3)', '0 0 8px 2px rgba(167,139,250,0.15)'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <span className="text-lg select-none">🧠</span>
                  </motion.div>
                  <div className="min-w-0">
                    <p className="font-bold text-[13px] text-[#e2e8f0] leading-tight">NovaMind</p>
                    <p className="text-[9px] text-[#a78bfa]/60 tracking-[0.15em] uppercase truncate">Intelligence Engine</p>
                  </div>
                </div>
              </div>

              {/* Quick XP & streak */}
              <div className="flex gap-2 px-3 py-2 border-b border-[rgba(51,65,85,0.35)]">
                <div className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[rgba(167,139,250,0.06)]">
                  <Zap size={11} className="text-[#a78bfa]" />
                  <span className="text-[11px] font-bold text-[#a78bfa]">{Math.floor(xp / 500) + 1}</span>
                  <span className="text-[9px] text-[#475569]">LVL</span>
                </div>
                <div className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[rgba(251,146,60,0.06)]">
                  <Flame size={11} className="text-[#fb923c]" />
                  <span className="text-[11px] font-bold text-[#fb923c]">{streak}d</span>
                </div>
              </div>

              {/* Nav tabs */}
              <nav className="flex flex-col gap-0.5 p-2 flex-1 overflow-y-auto custom-scrollbar">
                {TABS.map((tab) => {
                  const isActive = safeTab === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      id={`novamind-tab-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      whileTap={{ scale: 0.97 }}
                      className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all text-left w-full ${
                        isActive
                          ? 'text-[#a78bfa] bg-[rgba(167,139,250,0.12)] border border-[rgba(167,139,250,0.25)]'
                          : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[rgba(255,255,255,0.04)] border border-transparent'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="nm-active-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-[#a78bfa]"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className={isActive ? 'text-[#a78bfa]' : ''}>{tab.icon}</span>
                      <span className="truncate">{tab.label}</span>
                      {tab.badgePhase && (
                        <span className="ml-auto text-[8px] font-bold px-1 py-0.5 rounded bg-[#a78bfa]/20 text-[#a78bfa] flex-shrink-0">
                          {tab.badgePhase}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </nav>

              {/* Tagline */}
              <div className="px-3 py-2.5 border-t border-[rgba(51,65,85,0.35)]">
                <p className="text-[8px] text-[#1e293b] leading-relaxed italic">
                  "It doesn't just recommend. It understands. It evolves. It builds you."
                </p>
              </div>
            </div>

            {/* ── Main Content ── */}
            <div className="flex-1 relative overflow-hidden bg-[rgba(8,12,25,0.5)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={safeTab}
                  className="absolute inset-0"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  {safeTab === 'dashboard'       && <Dashboard />}
                  {safeTab === 'skillmap'        && <SkillMap />}
                  {safeTab === 'knowledge'       && <KnowledgeTrace />}
                  {safeTab === 'recommendations' && <Recommendations />}
                  {safeTab === 'tutor'           && <AITutor />}
                  {safeTab === 'predict'         && <PredictiveIntelligence />}
                  {safeTab === 'gamification'    && <GamificationPanel />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
