'use client';

import { useEduVaultStore } from '@/stores/useEduVaultStore';
import { Medal, Trophy, Star, Target, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const BADGE_DEFINITIONS = [
  { id: 'first_entry', name: 'First Step', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-400/20' },
  { id: 'budget_master', name: 'Budget Master', icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/20' },
  { id: 'savings_king', name: 'Savings King', icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-400/20' },
  { id: 'target_met', name: 'Goal Crusher', icon: Target, color: 'text-blue-400', bg: 'bg-blue-400/20' }
];

export default function BadgeShowcase() {
  const { xp, unlockedBadges } = useEduVaultStore();

  const level = Math.floor(xp / 100) + 1;
  const xpToNextLevel = 100 - (xp % 100);
  const progressPercent = (xp % 100);

  return (
    <div className="flex flex-col gap-4">
      {/* Level Card */}
      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 border-2 border-emerald-400/30">
          <Medal className="text-emerald-400 absolute opacity-20" size={40} />
          <span className="text-xl font-bold text-slate-100 z-10">Lvl {level}</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-end mb-1">
            <span className="text-sm font-semibold text-slate-200">{xp} XP Total</span>
            <span className="text-xs text-slate-400">{xpToNextLevel} XP to Level {level + 1}</span>
          </div>
          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div>
        <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider font-semibold">Your Badges</p>
        <div className="grid grid-cols-4 gap-3">
          {BADGE_DEFINITIONS.map((badge, idx) => {
            const isUnlocked = unlockedBadges.includes(badge.id);
            const Icon = badge.icon;
            
            return (
              <motion.div 
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border ${
                  isUnlocked ? 'border-slate-700 bg-slate-800' : 'border-slate-800 bg-slate-900/50 opacity-50 grayscale'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isUnlocked ? badge.bg : 'bg-slate-800'}`}>
                  <Icon size={20} className={isUnlocked ? badge.color : 'text-slate-500'} />
                </div>
                <span className="text-[10px] font-medium text-center leading-tight text-slate-300">
                  {badge.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
