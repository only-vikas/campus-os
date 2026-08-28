'use client';
// ============================================================
// Interview Prep — AI Avatar Display
// Shows the selected interviewer persona with status animations
// All animations: Framer Motion + CSS — no external deps
// ============================================================
import { motion, AnimatePresence } from 'framer-motion';
import { InterviewStatus, InterviewerPersona } from '@/stores/useInterviewStore';

// ---- Persona config ----
export const PERSONAS: Record<InterviewerPersona, {
  name: string;
  title: string;
  about: string;
  gradient: string;
  accentColor: string;
  voiceRate: number;
  voicePitch: number;
}> = {
  alex: {
    name: 'Alex',
    title: 'Senior Engineer, Calm & Composed',
    about: 'Alex listens fully before responding. He asks thoughtful follow-ups and creates a relaxed interview environment. Great for first interviews.',
    gradient: 'from-[#3b82f6] to-[#1d4ed8]',
    accentColor: '#60a5fa',
    voiceRate: 0.9,
    voicePitch: 0.95,
  },
  raj: {
    name: 'Raj',
    title: 'Tech Lead, Rigorous & Demanding',
    about: 'Raj digs deep. He challenges vague answers with "Can you be more specific?" and ramps up pressure. Best for senior role prep.',
    gradient: 'from-[#f59e0b] to-[#b45309]',
    accentColor: '#fbbf24',
    voiceRate: 1.05,
    voicePitch: 0.85,
  },
  sofia: {
    name: 'Sofia',
    title: 'HR Director, Empathetic & Insightful',
    about: 'Sofia excels at behavioral interviews. She reads between the lines and explores your motivations. Perfect for culture-fit & leadership roles.',
    gradient: 'from-[#a78bfa] to-[#7c3aed]',
    accentColor: '#c4b5fd',
    voiceRate: 0.88,
    voicePitch: 1.15,
  },
  priya: {
    name: 'Priya',
    title: 'Product Manager, Analytical & Precise',
    about: 'Priya is data-driven. She probes technical depth and verifies facts. Expects structured, metric-backed answers. Ideal for PM & data roles.',
    gradient: 'from-[#34d399] to-[#059669]',
    accentColor: '#6ee7b7',
    voiceRate: 1.0,
    voicePitch: 1.08,
  },
};

// ---- Inline SVG Avatars ----
function AlexAvatar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="35" r="22" fill="#1e40af" />
      <circle cx="50" cy="35" r="16" fill="#3b82f6" />
      <ellipse cx="44" cy="31" rx="3" ry="4" fill="#1e293b" />
      <ellipse cx="56" cy="31" rx="3" ry="4" fill="#1e293b" />
      <circle cx="44" cy="31" r="1.5" fill="white" />
      <circle cx="56" cy="31" r="1.5" fill="white" />
      <path d="M43 41 Q50 46 57 41" stroke="#1e293b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <ellipse cx="50" cy="72" rx="26" ry="18" fill="#1d4ed8" />
      <ellipse cx="50" cy="58" rx="12" ry="8" fill="#3b82f6" />
    </svg>
  );
}

function RajAvatar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="35" r="22" fill="#92400e" />
      <circle cx="50" cy="35" r="16" fill="#f59e0b" />
      <ellipse cx="44" cy="31" rx="3" ry="4" fill="#1e293b" />
      <ellipse cx="56" cy="31" rx="3" ry="4" fill="#1e293b" />
      <circle cx="44" cy="31" r="1.5" fill="white" />
      <circle cx="56" cy="31" r="1.5" fill="white" />
      <path d="M44 40 Q50 38 56 40" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      <rect x="36" y="17" width="28" height="5" rx="2" fill="#78350f" />
      <ellipse cx="50" cy="72" rx="26" ry="18" fill="#b45309" />
      <ellipse cx="50" cy="58" rx="12" ry="8" fill="#f59e0b" />
    </svg>
  );
}

function SofiaAvatar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="35" r="22" fill="#5b21b6" />
      <circle cx="50" cy="35" r="16" fill="#a78bfa" />
      <ellipse cx="44" cy="32" rx="3" ry="3.5" fill="#1e293b" />
      <ellipse cx="56" cy="32" rx="3" ry="3.5" fill="#1e293b" />
      <circle cx="44" cy="32" r="1.5" fill="white" />
      <circle cx="56" cy="32" r="1.5" fill="white" />
      <path d="M43 41 Q50 47 57 41" stroke="#5b21b6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M30 22 Q40 10 60 14 Q68 16 70 25" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" fill="none" />
      <ellipse cx="50" cy="72" rx="26" ry="18" fill="#7c3aed" />
      <ellipse cx="50" cy="58" rx="12" ry="8" fill="#a78bfa" />
    </svg>
  );
}

function PriyaAvatar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="35" r="22" fill="#065f46" />
      <circle cx="50" cy="35" r="16" fill="#34d399" />
      <ellipse cx="44" cy="32" rx="3" ry="3.5" fill="#1e293b" />
      <ellipse cx="56" cy="32" rx="3" ry="3.5" fill="#1e293b" />
      <circle cx="44" cy="32" r="1.5" fill="white" />
      <circle cx="56" cy="32" r="1.5" fill="white" />
      <path d="M43 41 Q50 46 57 41" stroke="#065f46" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M33 19 Q50 8 67 19" stroke="#059669" strokeWidth="3" strokeLinecap="round" fill="none" />
      <ellipse cx="50" cy="72" rx="26" ry="18" fill="#059669" />
      <ellipse cx="50" cy="58" rx="12" ry="8" fill="#34d399" />
    </svg>
  );
}

const AVATAR_COMPONENTS: Record<InterviewerPersona, React.ComponentType<{ size: number }>> = {
  alex: AlexAvatar,
  raj: RajAvatar,
  sofia: SofiaAvatar,
  priya: PriyaAvatar,
};

// ---- Status label + animation config ----
function getStatusConfig(status: InterviewStatus, persona: InterviewerPersona) {
  const color = PERSONAS[persona].accentColor;
  switch (status) {
    case 'ai-speaking':
      return { label: `${PERSONAS[persona].name} is speaking...`, labelColor: color, blobActive: true, blobColor: color, orbitActive: false };
    case 'user-speaking':
      return { label: '🎤 Listening...', labelColor: '#34d399', blobActive: false, blobColor: '#34d399', orbitActive: true };
    case 'evaluating':
      return { label: '🤖 Evaluating your answer...', labelColor: '#fbbf24', blobActive: false, blobColor: '#fbbf24', orbitActive: true };
    case 'ready':
    case 'setup':
      return { label: 'Getting ready...', labelColor: '#94a3b8', blobActive: true, blobColor: color, orbitActive: false };
    default:
      return { label: '', labelColor: '#64748b', blobActive: false, blobColor: color, orbitActive: false };
  }
}

// ---- Morphing blob animation ----
function MorphingBlob({ color, active }: { color: string; active: boolean }) {
  if (!active) return null;
  return (
    <motion.div
      className="absolute inset-0 rounded-full"
      style={{ background: `radial-gradient(circle, ${color}30 0%, transparent 70%)` }}
      animate={{
        scale: [1, 1.15, 1.05, 1.2, 1],
        opacity: [0.6, 1, 0.7, 1, 0.6],
        borderRadius: ['50%', '44% 56% 52% 48%', '50%', '56% 44% 48% 52%', '50%'],
      }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

// ---- Speaking bars animation ----
function SpeakingBars({ color, active }: { color: string; active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ height: ['4px', `${8 + Math.random() * 14}px`, '4px'] }}
          transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.08 }}
        />
      ))}
    </div>
  );
}

// ---- Orbit animation (listening / evaluating) ----
function OrbitRing({ color, active }: { color: string; active: boolean }) {
  if (!active) return null;
  return (
    <motion.div
      className="absolute inset-[-8px] rounded-full border-2 border-dashed"
      style={{ borderColor: `${color}60` }}
      animate={{ rotate: 360 }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
    />
  );
}

interface AvatarDisplayProps {
  persona: InterviewerPersona;
  status: InterviewStatus;
  size?: number;
  onChangePersona?: () => void;
}

export default function AvatarDisplay({ persona, status, size = 80, onChangePersona }: AvatarDisplayProps) {
  const config = getStatusConfig(status, persona);
  const AvatarSVG = AVATAR_COMPONENTS[persona];
  const personaData = PERSONAS[persona];

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Avatar + animations */}
      <div className="relative flex items-center justify-center" style={{ width: size + 32, height: size + 32 }}>
        <MorphingBlob color={personaData.accentColor} active={config.blobActive} />
        <OrbitRing color={config.blobColor} active={config.orbitActive} />
        <div className="relative z-10 rounded-full overflow-hidden shadow-lg" style={{ width: size, height: size }}>
          <div className={`w-full h-full bg-gradient-to-br ${personaData.gradient} flex items-center justify-center`}>
            <AvatarSVG size={size} />
          </div>
        </div>
        <SpeakingBars color={personaData.accentColor} active={status === 'ai-speaking'} />
      </div>

      {/* Name + title */}
      <div className="text-center">
        <p className="text-xs font-bold text-[#e2e8f0]">{personaData.name}</p>
        <p className="text-[9px] text-[#64748b] max-w-[120px] leading-tight">{personaData.title}</p>
      </div>

      {/* Status label */}
      <AnimatePresence mode="wait">
        {config.label && (
          <motion.div
            key={config.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#1e293b] border border-[#334155]"
            style={{ color: config.labelColor }}
          >
            {config.label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change interviewer button */}
      {onChangePersona && (
        <button
          onClick={onChangePersona}
          className="text-[9px] text-[#475569] hover:text-[#94a3b8] underline transition-colors mt-0.5"
        >
          Change interviewer
        </button>
      )}
    </div>
  );
}
