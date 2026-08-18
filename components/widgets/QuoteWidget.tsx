'use client';

// ============================================================
// Campus OS — Quote Widget (Dynamic)
// Uses ZenQuotes API with 3-min rotation + lock/unlock triggers
// ============================================================
import { motion, AnimatePresence } from 'framer-motion';
import { useQuotes } from '@/hooks/useQuotes';

export default function QuoteWidget() {
  const { quote, author, isLoading } = useQuotes();

  return (
    <motion.div
      className="absolute top-4 left-4 glass rounded-2xl p-4 w-72 select-none cursor-default z-10"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1, transition: { delay: 0.6 } }}
      drag
      dragMomentum={false}
      style={{ touchAction: 'none' }}
    >
      <p className="text-[#34d399] text-xs font-medium mb-2 uppercase tracking-wider">💡 Daily Quote</p>

      {isLoading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-[#1e293b] rounded w-full" />
          <div className="h-3 bg-[#1e293b] rounded w-3/4" />
          <div className="h-2 bg-[#1e293b] rounded w-1/3 mt-3" />
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={quote}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <p className="text-[#e2e8f0] text-sm leading-relaxed italic">
              &ldquo;{quote}&rdquo;
            </p>
            <p className="text-[#475569] text-xs mt-2">— {author}</p>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}
