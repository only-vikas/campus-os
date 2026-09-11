'use client';

// ============================================================
// Campus OS — Top Bar
// macOS-style menu bar with app menu, active app name, status
// ============================================================
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Battery, ChevronDown, UserCircle2, Bell, Star } from 'lucide-react';
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
  const { lock, restart } = useDesktopStore();
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

  // Active app name
  const activeWindow = windows.find((w) => w.id === activeWindowId);
  const activeAppName = activeWindow ? (APP_MAP.get(activeWindow.appId)?.name ?? 'Campus OS') : 'Campus OS';

  const menuItems = [
    { label: 'About Campus OS', action: () => { setMenuOpen(false); setAboutOpen(true); } },
    { label: '─────────────', action: () => {} },
    { label: 'Lock Screen', action: () => { setMenuOpen(false); lock(); } },
    { label: 'Restart', action: () => { setMenuOpen(false); restart(); } },
  ];

  return (
    <div className="absolute top-0 left-0 right-0 h-7 glass-dark flex items-center justify-between px-4 z-[800] select-none">
      {/* Left: Logo + Dropdown */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            id="os-menu-btn"
            onClick={() => setMenuOpen((p) => !p)}
            className="flex items-center gap-1 text-[#e2e8f0] font-semibold text-sm hover:text-white transition-colors"
          >
            <svg viewBox="0 0 48 48" className="w-4 h-4 fill-current text-[#60a5fa]">
              <path d="M24 4C13 4 4 13 4 24s9 20 20 20 20-9 20-20S35 4 24 4zm-2 28v-8h-6l8-12v8h6L22 32z" />
            </svg>
            Campus OS
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-6 left-0 glass rounded-xl py-2 w-52 shadow-2xl z-[900]"
                >
                  {menuItems.map((item, i) => (
                    <button
                      key={i}
                      onClick={item.action}
                      disabled={item.label.startsWith('─')}
                      className="w-full text-left px-4 py-1.5 text-sm text-[#e2e8f0] hover:bg-[#60a5fa]/20 disabled:cursor-default disabled:text-[#475569] disabled:hover:bg-transparent transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Active app name */}
        <span className="text-[#94a3b8] text-sm font-medium">{activeAppName}</span>
      </div>

      {/* Right: Status icons & Gamification */}
      <div className="flex items-center gap-3 text-[#94a3b8]">
        {/* Gamification Stats */}
        <div className="hidden sm:flex items-center gap-2 mr-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#1e293b]/50 border border-[#334155]/50">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-yellow-400">Lvl {level}</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-medium text-[#e2e8f0]">
            <span className="text-[#94a3b8]">XP</span>
            <span>{xp}</span>
          </div>
        </div>

        {/* Notification Bell */}
        <button className="relative flex items-center justify-center hover:text-white transition-colors mr-1">
          <Bell className="w-4 h-4" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0a0f1e]"></span>
          )}
        </button>

        <Wifi className="w-3.5 h-3.5" />
        <Battery className="w-3.5 h-3.5" />
        <span className="text-xs font-medium text-[#e2e8f0]">{date}</span>
        <span className="text-xs font-medium text-[#e2e8f0]">{time}</span>
        
        <div className="ml-2 flex items-center justify-center">
          {isLoaded && isSignedIn ? (
            <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-6 h-6" } }} />
          ) : (
            <button 
              onClick={() => router.push('/sign-in')}
              title="Sign In / Create Account"
              className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-[#94a3b8] to-[#475569] text-white hover:ring-2 ring-white/20 transition-all"
            >
              <UserCircle2 size={14} />
            </button>
          )}
        </div>
      </div>
      {/* About Campus OS overlay */}
      <AboutCampusOS isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />
    </div>
  );
}
