'use client';
// ============================================================
// Campus OS — NovaMind Splash Screen
// Stunning animated entry: brain + tagline + progress bar
// ============================================================
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onComplete: () => void;
}

const TAGLINE = "It doesn't just recommend. It understands. It evolves. It builds you.";

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<'icon' | 'tagline' | 'bar' | 'done'>('icon');
  const [visibleChars, setVisibleChars] = useState(0);
  const [barProgress, setBarProgress] = useState(0);

  // Phase sequencing
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('tagline'), 900);
    return () => clearTimeout(t1);
  }, []);

  // Typewriter effect
  useEffect(() => {
    if (phase !== 'tagline') return;
    if (visibleChars >= TAGLINE.length) {
      const t = setTimeout(() => setPhase('bar'), 300);
      return () => clearTimeout(t);
    }
    const speed = 28 + Math.random() * 12; // slightly variable speed
    const t = setTimeout(() => setVisibleChars((v) => v + 1), speed);
    return () => clearTimeout(t);
  }, [phase, visibleChars]);

  // Progress bar
  useEffect(() => {
    if (phase !== 'bar') return;
    const interval = setInterval(() => {
      setBarProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => { setPhase('done'); setTimeout(onComplete, 400); }, 200);
          return 100;
        }
        return p + 2.5;
      });
    }, 25);
    return () => clearInterval(interval);
  }, [phase, onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          key="splash"
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#080812] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.4, ease: 'easeIn' } }}
        >
          {/* Background radial glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-violet-500/15 blur-2xl" />
          </div>

          {/* Animated grid */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'linear-gradient(rgba(167,139,250,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.15) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />

          {/* Brain icon with animated rings */}
          <motion.div
            className="relative flex items-center justify-center mb-8"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          >
            {/* Outer pulsing ring */}
            <motion.div
              className="absolute rounded-full border border-purple-400/20"
              style={{ width: 140, height: 140 }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.1, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Middle ring */}
            <motion.div
              className="absolute rounded-full border border-purple-400/30"
              style={{ width: 110, height: 110 }}
              animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
            />
            {/* Inner glow */}
            <motion.div
              className="w-20 h-20 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center backdrop-blur-sm"
              animate={{
                boxShadow: [
                  '0 0 20px 4px rgba(167,139,250,0.3)',
                  '0 0 40px 8px rgba(167,139,250,0.5)',
                  '0 0 20px 4px rgba(167,139,250,0.3)',
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-4xl select-none">🧠</span>
            </motion.div>
          </motion.div>

          {/* App name */}
          <motion.div
            className="flex flex-col items-center mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-purple-300 via-violet-200 to-purple-400 bg-clip-text text-transparent">
              NovaMind
            </h1>
            <p className="text-xs font-medium tracking-[0.3em] text-purple-400/60 uppercase mt-1">
              Learning Intelligence Engine
            </p>
          </motion.div>

          {/* Typewriter tagline */}
          <div className="h-8 flex items-center justify-center mb-8 px-8 max-w-lg">
            <motion.p
              className="text-center text-[#94a3b8] text-sm leading-relaxed font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase === 'tagline' || phase === 'bar' ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {TAGLINE.slice(0, visibleChars)}
              {/* Blinking cursor */}
              {(phase === 'tagline') && visibleChars < TAGLINE.length && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                  className="inline-block w-0.5 h-4 bg-purple-400 ml-0.5 align-middle"
                />
              )}
            </motion.p>
          </div>

          {/* Progress bar */}
          <AnimatePresence>
            {phase === 'bar' && (
              <motion.div
                className="w-64"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex justify-between text-[10px] text-purple-400/50 mb-1.5">
                  <span>Initializing NovaMind</span>
                  <span>{Math.round(barProgress)}%</span>
                </div>
                <div className="h-1 w-full bg-purple-900/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-400"
                    style={{ width: `${barProgress}%` }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
