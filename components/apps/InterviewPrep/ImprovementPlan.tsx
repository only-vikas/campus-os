'use client';
// ============================================================
// Interview Prep — Improvement Plan Cards
// Actionable suggestions from AI interview report
// ============================================================
import { motion } from 'framer-motion';
import { Lightbulb, ExternalLink } from 'lucide-react';

interface Improvement {
  title: string;
  description: string;
  resource?: string;
}

interface ImprovementPlanProps {
  improvements: Improvement[];
}

export default function ImprovementPlan({ improvements }: ImprovementPlanProps) {
  return (
    <div className="space-y-2">
      {improvements.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0, transition: { delay: i * 0.1 } }}
          className="rounded-xl bg-[#0f172a]/80 border border-[#1e293b] p-3 hover:border-[#334155] transition-colors"
        >
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#fbbf24]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lightbulb size={12} className="text-[#fbbf24]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#e2e8f0] mb-0.5">{item.title}</p>
              <p className="text-[10px] text-[#94a3b8] leading-relaxed">{item.description}</p>
              {item.resource && (
                <a
                  href={item.resource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-[#60a5fa] hover:underline mt-1"
                >
                  Learn More <ExternalLink size={8} />
                </a>
              )}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
