'use client';

// ============================================================
// Campus OS — Lock Screen
// Full-screen clock with "click to unlock" transition
// ============================================================
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDesktopStore } from '@/stores/useDesktopStore';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function formatTime(date: Date) {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = (h % 12 || 12).toString().padStart(2, '0');
  return { time: `${hour12}:${m}`, seconds: s, ampm };
}

export default function LockScreen() {
  const [now, setNow] = useState(new Date());
  const [unlocking, setUnlocking] = useState(false);
  const [showAuthOptions, setShowAuthOptions] = useState(false);
  const { unlock, wallpaper } = useDesktopStore();
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const { time, seconds, ampm } = formatTime(now);
  const dateStr = `${DAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;

  const handleUnlock = () => {
    if (unlocking || !isLoaded) return;
    
    if (isSignedIn) {
      setUnlocking(true);
      setTimeout(unlock, 600);
    } else {
      setShowAuthOptions(true);
    }
  };

  const handleGuest = (e: React.MouseEvent) => {
    e.stopPropagation();
    setUnlocking(true);
    setTimeout(unlock, 600);
  };

  const handleSignIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push('/sign-in');
  };

  return (
    <motion.div
      className={`fixed inset-0 wallpaper-${wallpaper} flex flex-col items-center justify-center cursor-pointer select-none`}
      onClick={handleUnlock}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.8 } }}
      exit={{ opacity: 0, y: -40, transition: { duration: 0.6 } }}
    >
      {/* Subtle radial overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-6"
        animate={unlocking ? { y: -60, opacity: 0 } : { y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Date */}
        <p className="text-[#94a3b8] text-xl font-medium tracking-wide">{dateStr}</p>

        {/* Big Clock */}
        <div className="flex items-end gap-2">
          <span className="text-white font-bold" style={{ fontSize: 'clamp(80px, 14vw, 140px)', lineHeight: 1, letterSpacing: '-4px' }}>
            {time}
          </span>
          <div className="flex flex-col items-start mb-4 gap-1">
            <span className="text-[#60a5fa] text-2xl font-semibold">{ampm}</span>
            <span className="text-[#475569] text-lg font-mono animate-blink">{seconds}</span>
          </div>
        </div>

        {/* Unlock hint or Auth Options */}
        <AnimatePresence mode="wait">
          {!showAuthOptions ? (
            <motion.div
              key="hint"
              className="mt-8 flex flex-col items-center gap-3"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            >
              <div className="w-8 h-12 rounded-full border-2 border-[#e2e8f0]/40 flex items-start justify-center p-1">
                <div className="w-1.5 h-3 bg-[#e2e8f0]/70 rounded-full" />
              </div>
              <p className="text-[#e2e8f0]/60 text-sm tracking-widest uppercase">Click to unlock</p>
            </motion.div>
          ) : (
            <motion.div
              key="options"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8 flex flex-col items-center gap-4"
            >
              <button
                onClick={handleSignIn}
                className="px-8 py-3 rounded-xl bg-[#60a5fa] text-white font-semibold hover:bg-[#3b82f6] transition-colors w-64 shadow-lg shadow-[#60a5fa]/20"
              >
                Sign In / Create Account
              </button>
              <button
                onClick={handleGuest}
                className="px-8 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors w-64 backdrop-blur-md border border-white/10"
              >
                Explore as Guest
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom left: Status icons */}
      <div className="absolute bottom-6 left-6 flex items-center gap-4 text-[#e2e8f0]/50 text-sm">
        <span>📶 Connected</span>
        <span>🔋 100%</span>
      </div>
    </motion.div>
  );
}
