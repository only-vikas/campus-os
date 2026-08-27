'use client';
// ============================================================
// Interview Prep — ScoreBar (Animated Progress Bar)
// ============================================================
import { motion } from 'framer-motion';

interface ScoreBarProps {
  label: string;
  value: number;       // 0–100
  maxValue?: number;
  delay?: number;
}

function getColor(v: number): string {
  if (v >= 70) return '#34d399';
  if (v >= 40) return '#fbbf24';
  return '#f87171';
}

export default function ScoreBar({ label, value, maxValue = 100, delay = 0 }: ScoreBarProps) {
  const pct = Math.min(100, Math.max(0, (value / maxValue) * 100));
  const color = getColor(value);

  return (
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-[#94a3b8] uppercase tracking-wider">{label}</span>
        <span className="text-[10px] font-bold" style={{ color }}>{Math.round(value)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#1e293b] overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
