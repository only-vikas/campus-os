'use client';

// ============================================================
// Campus OS — Toast Notification
// Auto-dismissing toast for system messages
// ============================================================
import { motion, AnimatePresence } from 'framer-motion';
import { ToastNotification } from '@/stores/useGamificationStore';
import { useEffect } from 'react';
import { useGamificationStore } from '@/stores/useGamificationStore';
import { Star, Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

interface ToastProps {
  // Legacy string support
  message?: string | null;
}

const ICONS = {
  success: <CheckCircle className="text-green-400" size={16} />,
  info: <Info className="text-blue-400" size={16} />,
  warning: <AlertTriangle className="text-yellow-400" size={16} />,
  error: <XCircle className="text-red-400" size={16} />,
  levelup: <Star className="text-yellow-400 fill-yellow-400 animate-pulse" size={16} />
};

export default function Toast({ message }: ToastProps) {
  const { notifications, dismissNotification } = useGamificationStore();
  
  // Auto-dismiss logic for gamification toasts
  useEffect(() => {
    notifications.forEach(notif => {
      const timer = setTimeout(() => {
        dismissNotification(notif.id);
      }, 5000);
      return () => clearTimeout(timer);
    });
  }, [notifications, dismissNotification]);

  return (
    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[950] flex flex-col items-center gap-2 pointer-events-none">
      <AnimatePresence>
        {/* Legacy single toast */}
        {message && (
          <motion.div
            key="legacy-toast"
            className="glass rounded-xl px-5 py-2.5 text-sm text-[#60a5fa] shadow-xl"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {message}
          </motion.div>
        )}

        {/* Gamification toasts */}
        {notifications.slice(0, 3).map((notif) => (
          <motion.div
            key={notif.id}
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`glass rounded-xl p-3 flex items-start gap-3 shadow-2xl pointer-events-auto border ${
              notif.type === 'levelup' ? 'border-yellow-400/50 bg-gradient-to-r from-yellow-500/10 to-transparent' : 'border-[#334155]/50'
            }`}
          >
            <div className="mt-0.5">{ICONS[notif.type]}</div>
            <div className="flex-1 min-w-[200px]">
              <div className="text-sm font-bold text-white">{notif.title}</div>
              {notif.message && <div className="text-xs text-[#94a3b8] mt-0.5">{notif.message}</div>}
            </div>
            <button 
              onClick={() => dismissNotification(notif.id)}
              className="text-[#94a3b8] hover:text-white transition-colors"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
