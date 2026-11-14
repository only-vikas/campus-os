'use client';

// ============================================================
// Campus OS — Top Bar (Sprint 2)
// Transparent Glass Strip + Deep Space Typography & System Icons
// ============================================================
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Battery, ChevronDown, UserCircle2, Bell, Star, Monitor, Cpu } from 'lucide-react';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { useWindowStore } from '@/stores/useWindowStore';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { APP_MAP } from '@/components/apps/AppRegistry';
import { UserButton, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import AboutCampusOS from './AboutCampusOS';

export default function TopBar() {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const { lock, restart, activeAI } = useDesktopStore();
  const { windows, activeWindowId } = useWindowStore();
  const { xp, level, notifications } = useGamificationStore();
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // Live clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes().toString().padStart(2, '0');
      const ampm = h >= 12 ? 'PM' : 'AM';
      const h12 = h % 12 || 12;
      setTime(`${h12}:${m} ${ampm}`);
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    update();
    const t = setInterval(update, 10000);
    return () => clearInterval(t);
  }, []);

  // Active app name & accent
  const activeWindow = windows.find((w) => w.id === activeWindowId);
  const activeApp = activeWindow ? APP_MAP.get(activeWindow.appId) : null;
  const activeAppName = activeApp?.name ?? 'Campus OS';
  const activeAppColor = activeApp?.color ?? '#6366F1';

  const menuItems = [
    {
      label: 'About Campus OS',
      action: () => {
        setMenuOpen(false);
        setAboutOpen(true);
      },
    },
    { label: '─────────────', action: () => {} },
    {
      label: 'Lock Screen',
      action: () => {
        setMenuOpen(false);
        lock();
      },
    },
    {
      label: 'Restart System',
      action: () => {
        setMenuOpen(false);
        restart();
      },
    },
  ];

  return (
    <div className="absolute top-0 inset-x-0 h-8 flex items-center justify-between px-4 z-[800] select-none bg-[#0A0C10]/45 backdrop-blur-md border-b border-white/[0.06] transition-colors">
      {/* ── Left: OS Logo & Active App Context ───────────────────────── */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            id="os-menu-btn"
            onClick={() => setMenuOpen((p) => !p)}
            className="flex items-center gap-1.5 text-[#F1F5F9] font-semibold text-xs sm:text-sm hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/5 active:scale-95"
          >
            <div className="w-3.5 h-3.5 rounded bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1px] flex items-center justify-center">
              <div className="w-full h-full bg-[#0A0C10] rounded-[3px] flex items-center justify-center">
                <Monitor size={9} className="text-cyan-400" />
              </div>
            </div>
            <span>Campus OS</span>
            <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
          </button>

          {/* ── Glassmorphic Dropdown Menu ───────────────────────────── */}
          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="glass-panel absolute top-8 left-0 rounded-2xl py-2 w-52 shadow-2xl z-[900] border border-white/10"
                  style={{ background: 'rgba(17, 19, 24, 0.92)' }}
                >
                  {menuItems.map((item, i) => (
                    <button
                      key={i}
                      onClick={item.action}
                      disabled={item.label.startsWith('─')}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-[#F1F5F9] hover:bg-indigo-500/20 hover:text-white disabled:cursor-default disabled:text-[#475569] disabled:hover:bg-transparent transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Active App Pill */}
        <div className="flex items-center gap-2">
          <span className="text-[#475569] text-xs">/</span>
          <span
            className="text-xs font-semibold tracking-wide transition-colors"
            style={{ color: activeApp ? activeAppColor : '#94A3B8' }}
          >
            {activeAppName}
          </span>
        </div>
      </div>

      {/* ── Right: System UI & Gamification Stats ──────────────────── */}
      <div className="flex items-center gap-3.5 text-[#94A3B8]">
        {/* Live AI Engine Status Pill */}
        <div
          title={
            activeAI?.provider === 'local-ollama'
              ? `Active Engine: Local Ollama (${activeAI.modelName})`
              : activeAI?.provider === 'cloud-openrouter'
              ? `Active Engine: Cloud OpenRouter (${activeAI.modelName})`
              : 'AI Engine: Auto-switch (Ollama Local -> OpenRouter Cloud)'
          }
          className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono transition-all duration-300 backdrop-blur-sm"
          style={{
            borderColor: activeAI?.isGenerating
              ? '#22D3EE'
              : activeAI?.provider === 'local-ollama'
              ? 'rgba(52, 211, 153, 0.4)'
              : activeAI?.provider === 'cloud-openrouter'
              ? 'rgba(167, 139, 250, 0.4)'
              : 'rgba(255, 255, 255, 0.1)',
            backgroundColor: activeAI?.isGenerating
              ? 'rgba(34, 211, 238, 0.15)'
              : activeAI?.provider === 'local-ollama'
              ? 'rgba(52, 211, 153, 0.1)'
              : activeAI?.provider === 'cloud-openrouter'
              ? 'rgba(167, 139, 250, 0.1)'
              : 'rgba(24, 28, 36, 0.7)',
          }}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              activeAI?.isGenerating
                ? 'bg-cyan-400 animate-ping'
                : activeAI?.provider === 'local-ollama'
                ? 'bg-emerald-400'
                : activeAI?.provider === 'cloud-openrouter'
                ? 'bg-violet-400'
                : 'bg-emerald-400/80'
            }`}
          />
          <Cpu size={11} className={activeAI?.provider === 'local-ollama' ? 'text-emerald-400' : 'text-violet-400'} />
          <span className="font-semibold truncate max-w-[150px]">
            {activeAI?.isGenerating ? (
              <span className="text-cyan-300">Generating...</span>
            ) : activeAI?.provider === 'local-ollama' ? (
              <span className="text-emerald-300">Local: {activeAI.modelName}</span>
            ) : activeAI?.provider === 'cloud-openrouter' ? (
              <span className="text-violet-300">Cloud: {activeAI.modelName}</span>
            ) : (
              <span className="text-slate-300">AI: Auto</span>
            )}
          </span>
        </div>

        {/* Gamification Level & XP Badge */}
        <div className="hidden sm:flex items-center gap-2 mr-1">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#181C24]/80 border border-white/10 shadow-sm">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-[11px] font-bold text-amber-300">Lvl {level}</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-[#F1F5F9]">
            <span className="text-[#94A3B8]">XP</span>
            <span className="font-mono text-cyan-300">{xp}</span>
          </div>
        </div>

        {/* Notifications */}
        <button
          title="Notifications"
          className="relative flex items-center justify-center text-[#94A3B8] hover:text-[#F1F5F9] transition-colors p-1 rounded-md hover:bg-white/5"
        >
          <Bell className="w-3.5 h-3.5" />
          {notifications.length > 0 && (
            <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-rose-500 rounded-full border border-[#0A0C10] animate-pulse" />
          )}
        </button>

        {/* System Hardware Status */}
        <div className="flex items-center gap-2 text-[#94A3B8]">
          <span title="Campus WiFi: 5GHz Connected" className="flex items-center">
            <Wifi className="w-3.5 h-3.5 hover:text-[#F1F5F9] transition-colors" />
          </span>
          <span title="Battery: 100% Charged" className="flex items-center">
            <Battery className="w-3.5 h-3.5 hover:text-[#F1F5F9] transition-colors" />
          </span>
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-2 text-xs font-medium text-[#F1F5F9]">
          <span className="hidden md:inline-block text-[#94A3B8]">{date}</span>
          <span className="font-mono tracking-tight">{time}</span>
        </div>

        {/* User Profile / Auth State */}
        <div className="ml-1 flex items-center justify-center">
          {isLoaded && isSignedIn ? (
            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: 'w-6 h-6' } }} />
          ) : (
            <button
              onClick={() => router.push('/sign-in')}
              title="Sign In / Create Account"
              className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-white hover:ring-2 ring-indigo-400/30 transition-all active:scale-95 shadow-sm"
            >
              <UserCircle2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* About Campus OS Modal */}
      <AboutCampusOS isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
