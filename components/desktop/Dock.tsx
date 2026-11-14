'use client';

// ============================================================
// Campus OS — Dock (Sprint 2)
// Neumorphic Hardware Tactility + High-Fidelity Spring Physics
// ============================================================
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { useAppStore } from '@/stores/useAppStore';
import { useWindowStore } from '@/stores/useWindowStore';
import { DOCK_APP_IDS, APP_MAP } from '@/components/apps/AppRegistry';

// Dynamic Lucide icon renderer
function AppIcon({ iconName, color, size = 22 }: { iconName: string; color: string; size?: number }) {
  const Icon = (LucideIcons as any)[iconName] as React.ElementType;
  if (!Icon) return <span className="text-xl leading-none">{iconName}</span>;
  return <Icon size={size} strokeWidth={1.75} style={{ color }} />;
}

export default function Dock() {
  const [bouncing, setBouncing] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { launchApp } = useAppStore();
  const { windows } = useWindowStore();

  const openAppIds = new Set(windows.map((w) => w.appId));

  const handleLaunch = (appId: string) => {
    setBouncing(appId);
    launchApp(appId);
    setTimeout(() => setBouncing(null), 650);
  };

  return (
    <div className="absolute bottom-3 inset-x-0 flex justify-center z-[700] pointer-events-none select-none">
      {/* ── Floating Physical Dock Bar ─────────────────────────────── */}
      <motion.div
        className="glass-panel rounded-2xl px-3.5 py-2.5 flex items-end gap-2.5 pointer-events-auto border border-white/10 shadow-2xl relative"
        style={{
          background: 'rgba(17, 19, 24, 0.82)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
        }}
        initial={{ y: 80, opacity: 0 }}
        animate={{
          y: 0,
          opacity: 1,
          transition: { type: 'spring', stiffness: 280, damping: 26, delay: 0.15 },
        }}
      >
        {/* Subtle Top Edge Highlight Line */}
        <div className="absolute top-0 inset-x-4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        {DOCK_APP_IDS.map((appId) => {
          const app = APP_MAP.get(appId);
          if (!app) return null;
          const isOpen = openAppIds.has(appId);
          const isBouncing = bouncing === appId;
          const isHovered = hoveredId === appId;
          const accentColor = app.color || '#6366F1';

          return (
            <div key={appId} className="relative flex flex-col items-center group">
              {/* ── Floating Frosted Tooltip ─────────────────────────── */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full mb-3 glass-panel rounded-xl px-3 py-1.5 text-xs text-white whitespace-nowrap pointer-events-none z-20 flex items-center gap-1.5 border border-white/15 shadow-xl"
                    style={{ background: 'rgba(17, 19, 24, 0.92)' }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: accentColor, boxShadow: `0 0 6px ${accentColor}` }}
                    />
                    <span className="font-semibold tracking-wide">{app.name}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Neumorphic Icon Button ──────────────────────────── */}
              <motion.button
                id={`dock-${appId}`}
                onClick={() => handleLaunch(appId)}
                onMouseEnter={() => setHoveredId(appId)}
                onMouseLeave={() => setHoveredId(null)}
                className="neu-button w-12 h-12 rounded-xl flex items-center justify-center relative cursor-pointer"
                style={{
                  border: isHovered
                    ? `1px solid ${accentColor}70`
                    : isOpen
                    ? `1px solid ${accentColor}40`
                    : '1px solid rgba(255, 255, 255, 0.06)',
                  background: isHovered
                    ? `linear-gradient(135deg, ${accentColor}25 0%, #1A1D27 100%)`
                    : '#1A1D27',
                }}
                animate={
                  isBouncing
                    ? { y: [0, -18, 0, -8, 0], transition: { duration: 0.55 } }
                    : isHovered
                    ? { scale: 1.25, y: -8 }
                    : { scale: 1, y: 0 }
                }
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                }}
                whileTap={{
                  scale: 0.9,
                  transition: { duration: 0.1 },
                }}
                title={app.name}
              >
                {/* Accent Wash on hover/active */}
                <span className="transition-transform group-hover:scale-110">
                  <AppIcon iconName={app.icon} color={accentColor} size={22} />
                </span>
              </motion.button>

              {/* ── Glowing Active App Dot ──────────────────────────── */}
              <motion.div
                className="w-1.5 h-1.5 rounded-full mt-1.5 pointer-events-none"
                style={{
                  backgroundColor: accentColor,
                  boxShadow: isOpen ? `0 0 8px ${accentColor}, 0 0 2px ${accentColor}` : 'none',
                }}
                animate={{
                  opacity: isOpen ? 1 : 0,
                  scale: isOpen ? 1 : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                }}
              />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
