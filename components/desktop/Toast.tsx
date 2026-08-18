'use client';

// ============================================================
// Campus OS — Toast Notification
// Auto-dismissing toast for system messages
// ============================================================
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string | null;
}

export default function Toast({ message }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="fixed top-10 left-1/2 -translate-x-1/2 glass rounded-xl px-5 py-2.5 text-sm text-[#60a5fa] z-[950] shadow-xl pointer-events-none"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
