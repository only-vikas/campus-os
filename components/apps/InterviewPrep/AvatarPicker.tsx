'use client';
// ============================================================
// Interview Prep — Avatar Picker
// Displays 4 interviewer persona cards with avatar + description
// ============================================================
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { InterviewerPersona } from '@/stores/useInterviewStore';
import AvatarDisplay, { PERSONAS } from './AvatarDisplay';

interface AvatarPickerProps {
  selected: InterviewerPersona;
  onSelect: (persona: InterviewerPersona) => void;
  compact?: boolean;
}

const PERSONA_ORDER: InterviewerPersona[] = ['alex', 'raj', 'sofia', 'priya'];

export default function AvatarPicker({ selected, onSelect, compact = false }: AvatarPickerProps) {
  return (
    <div className={`grid ${compact ? 'grid-cols-4 gap-2' : 'grid-cols-2 gap-3'}`}>
      {PERSONA_ORDER.map((key, i) => {
        const p = PERSONAS[key];
        const isSelected = selected === key;

        return (
          <motion.button
            key={key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { delay: i * 0.08 } }}
            onClick={() => onSelect(key)}
            className={`relative rounded-2xl border text-left transition-all duration-200 ${
              compact ? 'p-2' : 'p-4'
            } ${
              isSelected
                ? 'border-[var(--ac)] bg-[var(--ac)]/10'
                : 'border-[#1e293b] bg-[#0f172a]/60 hover:border-[#334155]'
            }`}
            style={{ '--ac': p.accentColor } as React.CSSProperties}
          >
            {/* Selected checkmark */}
            {isSelected && (
              <CheckCircle2
                size={14}
                className="absolute top-2 right-2"
                style={{ color: p.accentColor }}
              />
            )}

            {/* Avatar */}
            <div className="flex justify-center mb-2">
              <AvatarDisplay
                persona={key}
                status="idle"
                size={compact ? 44 : 64}
              />
            </div>

            {!compact && (
              <>
                <p className="text-xs font-bold text-[#e2e8f0] mb-0.5">{p.name}</p>
                <p className="text-[9px] text-[#64748b] leading-relaxed">{p.about}</p>
              </>
            )}

            {compact && (
              <p className="text-[10px] font-semibold text-center mt-1" style={{ color: isSelected ? p.accentColor : '#94a3b8' }}>
                {p.name}
              </p>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
