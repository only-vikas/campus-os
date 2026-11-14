'use client';

// ============================================================
// Campus OS — Window Frame
// Deep Space Academy Glassmorphism + Dynamic Accent Theming
// ============================================================
import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Rnd } from 'react-rnd';
import { ArrowUpRight, Shrink } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { WindowState } from '@/types/window';
import { useWindowStore } from '@/stores/useWindowStore';
import { APP_MAP } from '@/components/apps/AppRegistry';

function AppIcon({ iconName, color }: { iconName: string; color: string }) {
  const Icon = (LucideIcons as any)[iconName] as React.ElementType;
  if (!Icon) return <span style={{ fontSize: 13 }}>{iconName}</span>;
  return <Icon size={14} strokeWidth={1.75} style={{ color }} />;
}

interface WindowFrameProps {
  window: WindowState;
  children: React.ReactNode;
}

const TOPBAR_HEIGHT = 28;

export default function WindowFrame({ window: win, children }: WindowFrameProps) {
  const {
    removeWindow,
    minimizeWindow,
    maximizeWindow,
    fullMaximizeWindow,
    focusWindow,
    updateWindowPosition,
    updateWindowSize,
  } = useWindowStore();

  const app = APP_MAP.get(win.appId);
  const accentColor = app?.color || '#6366F1';

  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      removeWindow(win.id);
    },
    [removeWindow, win.id]
  );

  const handleMinimize = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      minimizeWindow(win.id);
    },
    [minimizeWindow, win.id]
  );

  const handleMaximize = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      maximizeWindow(win.id);
    },
    [maximizeWindow, win.id]
  );

  const handleFullMaximize = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      fullMaximizeWindow(win.id);
    },
    [fullMaximizeWindow, win.id]
  );

  const handleFocus = useCallback(() => {
    focusWindow(win.id);
  }, [focusWindow, win.id]);

  // When maximized, calculate limits
  const maxWidth = typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth : 1440;
  const maxHeightFull = typeof globalThis.window !== 'undefined' ? globalThis.window.innerHeight : 900;

  return (
    <Rnd
      size={
        win.isFullMaximized
          ? { width: maxWidth, height: maxHeightFull }
          : win.isMaximized
          ? { width: '100%', height: '100%' }
          : win.size
      }
      position={
        win.isFullMaximized
          ? { x: 0, y: -TOPBAR_HEIGHT }
          : win.isMaximized
          ? { x: 0, y: 0 }
          : win.position
      }
      minWidth={app?.minSize?.width ?? 400}
      minHeight={app?.minSize?.height ?? 300}
      disableDragging={win.isMaximized || win.isFullMaximized}
      enableResizing={!win.isMaximized && !win.isFullMaximized}
      bounds={win.isFullMaximized ? undefined : 'parent'}
      dragHandleClassName="window-drag-handle"
      onMouseDown={handleFocus}
      onDragStop={(_e, d) => {
        updateWindowPosition(win.id, { x: d.x, y: d.y });
      }}
      onResizeStop={(_e, _dir, ref, _delta, pos) => {
        updateWindowSize(win.id, {
          width: parseInt(ref.style.width),
          height: parseInt(ref.style.height),
        });
        updateWindowPosition(win.id, pos);
      }}
      style={{
        zIndex: win.isFullMaximized ? 9999 : win.zIndex,
        pointerEvents: win.isMinimized ? 'none' : 'auto',
      }}
      className="campus-os-window"
    >
      {/* ── Glassmorphic Animated Window Container ──────────────────── */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, filter: 'blur(10px)' }}
        animate={
          win.isMinimized
            ? {
                scale: 0.9,
                opacity: 0,
                filter: 'blur(8px)',
                y: '80vh',
                transitionEnd: { display: 'none' },
                transition: { duration: 0.25, ease: 'easeIn' },
              }
            : {
                scale: 1,
                opacity: 1,
                filter: 'blur(0px)',
                y: 0,
                display: 'flex',
                transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
              }
        }
        className="glass-panel flex flex-col w-full h-full rounded-2xl overflow-hidden transition-colors duration-200"
        style={{
          background: 'rgba(17, 19, 24, 0.84)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderColor: win.isFocused ? `${accentColor}55` : 'rgba(255, 255, 255, 0.08)',
          boxShadow: win.isFocused
            ? `0 24px 60px rgba(0,0,0,0.7), 0 0 28px ${accentColor}25, inset 0 1px 0 rgba(255,255,255,0.15)`
            : '0 14px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* ── Title Bar (Drag Handle + Accent Strip) ────────────────── */}
        <div
          className="window-drag-handle relative flex items-center justify-between px-3.5 h-10 flex-shrink-0 select-none cursor-grab active:cursor-grabbing border-b border-white/[0.08]"
          style={{
            background: win.isFocused
              ? `linear-gradient(180deg, ${accentColor}18 0%, rgba(24, 28, 36, 0.85) 100%)`
              : 'rgba(17, 19, 24, 0.75)',
          }}
        >
          {/* Top Edge Accent Glow Filament */}
          <div
            className="absolute top-0 inset-x-0 h-[2px] transition-opacity duration-300"
            style={{
              background: `linear-gradient(90deg, transparent 5%, ${accentColor} 50%, transparent 95%)`,
              opacity: win.isFocused ? 0.95 : 0.3,
            }}
          />

          {/* Traffic Lights Controls */}
          <div className="flex items-center gap-2 z-10" style={{ cursor: 'default' }}>
            <button
              id={`win-close-${win.id}`}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={handleClose}
              title="Close window"
              className="btn-close w-3 h-3 rounded-full transition-transform hover:scale-110 active:scale-95 shadow-sm"
              style={{ cursor: 'pointer' }}
            />
            <button
              id={`win-min-${win.id}`}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={handleMinimize}
              title="Minimize window"
              className="btn-min w-3 h-3 rounded-full transition-transform hover:scale-110 active:scale-95 shadow-sm"
              style={{ cursor: 'pointer' }}
            />
            <button
              id={`win-max-${win.id}`}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={handleMaximize}
              title="Toggle maximize"
              className="btn-max w-3 h-3 rounded-full transition-transform hover:scale-110 active:scale-95 shadow-sm"
              style={{ cursor: 'pointer' }}
            />
          </div>

          {/* Centered App Title + Dynamic Accent Icon */}
          <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2 pointer-events-none">
            {app && (
              <span
                className="p-1 rounded-md transition-colors"
                style={{ backgroundColor: `${accentColor}20` }}
              >
                <AppIcon iconName={app.icon} color={accentColor} />
              </span>
            )}
            <span
              className={`text-xs font-semibold tracking-wide transition-colors ${
                win.isFocused ? 'text-[#F1F5F9]' : 'text-[#94A3B8]'
              }`}
            >
              {win.title}
            </span>
          </div>

          {/* Right Actions: Full Screen Maximizer */}
          <div className="flex items-center gap-1.5 z-10">
            <button
              onMouseDown={(e) => e.stopPropagation()}
              onClick={handleFullMaximize}
              title={win.isFullMaximized ? 'Restore Window' : 'Full Screen'}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              style={{ cursor: 'pointer' }}
            >
              {win.isFullMaximized ? <Shrink size={13} /> : <ArrowUpRight size={13} />}
            </button>
          </div>
        </div>

        {/* ── App Content Area ───────────────────────────────────────── */}
        <div className="flex-1 min-h-0 overflow-auto window-content bg-[#0A0C10]/40">
          {children}
        </div>
      </motion.div>
    </Rnd>
  );
}
