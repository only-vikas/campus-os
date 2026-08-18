'use client';

// ============================================================
// Campus OS — Window Frame (FIXED)
// react-rnd draggable/resizable window with title bar
// FIX: Removed motion.div wrapper that was preventing drag
// ============================================================
import { useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { Minimize2, Maximize2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { WindowState } from '@/types/window';
import { useWindowStore } from '@/stores/useWindowStore';
import { APP_MAP } from '@/components/apps/AppRegistry';

function AppIcon({ iconName, color }: { iconName: string; color: string }) {
  const Icon = (LucideIcons as Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>>)[iconName];
  if (!Icon) return null;
  return <Icon size={14} strokeWidth={1.5} style={{ color }} />;
}

interface WindowFrameProps {
  window: WindowState;
  children: React.ReactNode;
}

const TOPBAR_HEIGHT = 28;
const DOCK_HEIGHT = 80;

export default function WindowFrame({ window: win, children }: WindowFrameProps) {
  const { removeWindow, minimizeWindow, maximizeWindow, focusWindow, updateWindowPosition, updateWindowSize } =
    useWindowStore();

  const app = APP_MAP.get(win.appId);

  const handleClose = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    removeWindow(win.id);
  }, [removeWindow, win.id]);

  const handleMinimize = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    minimizeWindow(win.id);
  }, [minimizeWindow, win.id]);

  const handleMaximize = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    maximizeWindow(win.id);
  }, [maximizeWindow, win.id]);

  const handleFocus = useCallback(() => {
    focusWindow(win.id);
  }, [focusWindow, win.id]);

  // When maximized, fill desktop area
  const maxWidth = typeof globalThis.window !== 'undefined' ? globalThis.window.innerWidth : 1440;
  const maxHeight =
    typeof globalThis.window !== 'undefined'
      ? globalThis.window.innerHeight - TOPBAR_HEIGHT - DOCK_HEIGHT
      : 900;

  if (win.isMinimized) return null;

  return (
    <Rnd
      size={win.isMaximized
        ? { width: maxWidth, height: maxHeight }
        : win.size
      }
      position={win.isMaximized
        ? { x: 0, y: 0 }
        : win.position
      }
      minWidth={app?.minSize?.width ?? 400}
      minHeight={app?.minSize?.height ?? 300}
      disableDragging={win.isMaximized}
      enableResizing={!win.isMaximized}
      bounds="parent"
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
        zIndex: win.zIndex,
        transition: 'box-shadow 0.2s ease',
      }}
      className="campus-os-window"
    >
      <div
        className={`flex flex-col w-full h-full rounded-xl overflow-hidden shadow-2xl border ${
          win.isFocused ? 'border-[rgba(51,65,85,0.7)]' : 'border-[rgba(51,65,85,0.3)]'
        }`}
        style={{
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* Title bar — THIS is the drag handle */}
        <div
          className={`window-drag-handle flex items-center justify-between px-3 h-9 flex-shrink-0 select-none cursor-default ${
            win.isFocused ? 'bg-[rgba(30,41,59,0.9)]' : 'bg-[rgba(15,23,42,0.8)]'
          }`}
          style={{ borderBottom: '1px solid rgba(51,65,85,0.4)', cursor: 'grab' }}
        >
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5" style={{ cursor: 'default' }}>
            <button
              id={`win-close-${win.id}`}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={handleClose}
              className="btn-close w-3 h-3 rounded-full transition-all hover:brightness-110 active:brightness-90"
              style={{ cursor: 'pointer' }}
            />
            <button
              id={`win-min-${win.id}`}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={handleMinimize}
              className="btn-min w-3 h-3 rounded-full transition-all hover:brightness-110 active:brightness-90"
              style={{ cursor: 'pointer' }}
            />
            <button
              id={`win-max-${win.id}`}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={handleMaximize}
              className="btn-max w-3 h-3 rounded-full transition-all hover:brightness-110 active:brightness-90"
              style={{ cursor: 'pointer' }}
            />
          </div>

          {/* App name + icon */}
          <div className="flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2 pointer-events-none">
            {app && <AppIcon iconName={app.icon} color={app.color} />}
            <span className="text-[#94a3b8] text-xs font-medium">{win.title}</span>
          </div>

          {/* Maximize toggle icon */}
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={handleMaximize}
            className="text-[#475569] hover:text-[#94a3b8] transition-colors"
            style={{ cursor: 'pointer' }}
          >
            {win.isMaximized ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          </button>
        </div>

        {/* App content */}
        <div className="flex-1 min-h-0 overflow-auto window-content">
          {children}
        </div>
      </div>
    </Rnd>
  );
}
