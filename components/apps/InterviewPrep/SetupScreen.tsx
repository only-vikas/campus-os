'use client';
// ============================================================
// Interview Prep — Setup Screen
// Choose interview type, company, and start the interview
// ============================================================
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mic, Code2, Users, Brain, Zap, Building2, ArrowRight,
  Server, Cloud, RefreshCw, Sparkles
} from 'lucide-react';
import { useInterviewStore, InterviewType } from '@/stores/useInterviewStore';
import { useOllamaStatus } from '@/hooks/useOllamaStatus';

const INTERVIEW_TYPES: { type: InterviewType; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  {
    type: 'technical',
    label: 'Technical',
    desc: 'DSA, system design, and coding concepts',
    icon: <Code2 size={22} />,
    color: '#60a5fa',
  },
  {
    type: 'behavioral',
    label: 'Behavioral',
    desc: 'Leadership, teamwork, and situational questions',
    icon: <Users size={22} />,
    color: '#a78bfa',
  },
  {
    type: 'resume',
    label: 'Resume Deep-Dive',
    desc: 'Questions based on your resume projects and experience',
    icon: <Brain size={22} />,
    color: '#34d399',
  },
  {
    type: 'stress',
    label: 'Stress Test',
    desc: 'Rapid-fire questions with time pressure',
    icon: <Zap size={22} />,
    color: '#f472b6',
  },
];

export default function SetupScreen() {
  const [selectedType, setSelectedType] = useState<InterviewType | null>(null);
  const [company, setCompany] = useState('');
  const startInterview = useInterviewStore((s) => s.startInterview);
  const ollamaStatus = useOllamaStatus();

  const handleStart = () => {
    if (!selectedType) return;
    startInterview(selectedType, company || undefined);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#60a5fa] to-[#a78bfa] mb-4">
          <Mic className="text-white" size={28} />
        </div>
        <h1 className="text-2xl font-bold text-[#e2e8f0] mb-2">AI Mock Interview</h1>
        <p className="text-[#94a3b8] text-sm max-w-md">
          Practice with an AI interviewer that adapts to your skill level. Get real-time feedback and actionable insights.
        </p>

        {/* AI Status Badge */}
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border mt-3 ${
          ollamaStatus === 'connected' ? 'bg-[#34d399]/10 text-[#34d399] border-[#34d399]/20' :
          ollamaStatus === 'disconnected' ? 'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/20' :
          'bg-[#94a3b8]/10 text-[#94a3b8] border-[#94a3b8]/20'
        }`}>
          {ollamaStatus === 'connected' ? (
            <><Server size={12} /> Local AI Ready</>
          ) : ollamaStatus === 'disconnected' ? (
            <><Cloud size={12} /> Cloud AI Active</>
          ) : (
            <><RefreshCw size={12} className="animate-spin" /> Checking AI...</>
          )}
        </div>
      </motion.div>

      {/* Interview Type Grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-8">
        {INTERVIEW_TYPES.map((item, i) => (
          <motion.button
            key={item.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: i * 0.08 } }}
            onClick={() => setSelectedType(item.type)}
            className={`relative p-5 rounded-2xl border text-left transition-all duration-200 ${
              selectedType === item.type
                ? 'border-[var(--sel-color)] bg-[var(--sel-color)]/10 shadow-lg'
                : 'border-[#1e293b] bg-[#0f172a]/60 hover:border-[#334155] hover:bg-[#1e293b]/40'
            }`}
            style={{ '--sel-color': item.color } as React.CSSProperties}
          >
            <div className="flex items-center gap-3 mb-2" style={{ color: item.color }}>
              {item.icon}
              <span className="font-semibold text-sm text-[#e2e8f0]">{item.label}</span>
            </div>
            <p className="text-xs text-[#64748b] leading-relaxed">{item.desc}</p>
            {selectedType === item.type && (
              <motion.div
                layoutId="selected-ring"
                className="absolute inset-0 rounded-2xl border-2"
                style={{ borderColor: item.color }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Company Input */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.35 } }}
        className="w-full max-w-lg mb-8"
      >
        <label className="text-xs text-[#64748b] uppercase tracking-wider mb-2 block">
          Target Company (optional)
        </label>
        <div className="relative">
          <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Google, Microsoft, Startup..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1e293b]/60 border border-[#334155] text-sm text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#60a5fa] transition-colors"
          />
        </div>
      </motion.div>

      {/* Start Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.45 } }}
        onClick={handleStart}
        disabled={!selectedType}
        className={`group flex items-center gap-3 px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
          selectedType
            ? 'bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] text-white shadow-lg shadow-[#60a5fa]/20 hover:shadow-xl hover:shadow-[#60a5fa]/30 hover:scale-[1.02] active:scale-[0.98]'
            : 'bg-[#1e293b] text-[#475569] cursor-not-allowed'
        }`}
      >
        <Sparkles size={16} />
        Start Interview
        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
      </motion.button>
    </div>
  );
}
