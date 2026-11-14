'use client';

// ============================================================
// Campus OS — Post-Auth Onboarding Wizard (/onboarding)
// 3-Step Interactive Guided Setup with AnimatePresence
// ============================================================
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  User,
  GraduationCap,
  Briefcase,
  BrainCircuit,
  Wallet,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Monitor,
  ShieldCheck,
  Check,
} from 'lucide-react';

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
    filter: 'blur(4px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.35,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    filter: 'blur(4px)',
    transition: {
      duration: 0.25,
    },
  }),
};

// Goals available in Step 2
const GOAL_OPTIONS = [
  {
    id: 'placements',
    title: 'Campus Placements & Dream Drives',
    description: 'Tier-1 drive tracking, automated ATS resume optimization, and mock interview drills.',
    icon: Briefcase,
    color: '#FB923C',
    badge: 'High Priority',
  },
  {
    id: 'upskilling',
    title: 'Full-Stack & Systems Upskilling',
    description: 'Project-based roadmaps, NovaMind AI tutor, code security auditing with CodeGuard.',
    icon: BrainCircuit,
    color: '#22D3EE',
    badge: 'Popular',
  },
  {
    id: 'academics',
    title: 'Academic Excellence & CGPA Boost',
    description: 'Semester subject schedules, attendance safety buffer, exam marks forecast.',
    icon: GraduationCap,
    color: '#6366F1',
    badge: 'Foundational',
  },
  {
    id: 'finance',
    title: 'Student Financial Intelligence',
    description: 'Track multi-channel income (salary, freelance, agriculture) & smart expenses.',
    icon: Wallet,
    color: '#34D399',
    badge: 'EduVault',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Form State
  const [usn, setUsn] = useState('');
  const [name, setName] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('placements');
  const [isFinishing, setIsFinishing] = useState(false);

  // Detect Department from USN pattern (e.g. 2BA23CS001 -> Computer Science)
  const getDepartment = (usnVal: string) => {
    const clean = usnVal.toUpperCase();
    if (clean.includes('CS')) return 'Computer Science & Engineering';
    if (clean.includes('IS')) return 'Information Science & Engineering';
    if (clean.includes('EC')) return 'Electronics & Communication';
    if (clean.includes('EE')) return 'Electrical & Electronics';
    if (clean.includes('ME')) return 'Mechanical Engineering';
    if (clean.includes('CV')) return 'Civil Engineering';
    if (clean.includes('AI') || clean.includes('ML')) return 'Artificial Intelligence & Data';
    return null;
  };

  const detectedDept = getDepartment(usn);

  const handleNext = () => {
    setDirection(1);
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setDirection(-1);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinish = () => {
    setIsFinishing(true);

    // Save profile to local storage for OS personalization
    try {
      const profile = {
        usn: usn.trim().toUpperCase() || '2BA23CS001',
        name: name.trim() || 'Student Scholar',
        department: detectedDept || 'Engineering Department',
        goal: selectedGoal,
        onboardedAt: new Date().toISOString(),
      };
      localStorage.setItem('campus_os_profile', JSON.stringify(profile));
    } catch {
      // Fallback
    }

    // Trigger celebratory confetti burst
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366F1', '#22D3EE', '#34D399', '#FB923C'],
    });

    setTimeout(() => {
      router.push('/desktop');
    }, 1200);
  };

  return (
    <div className="relative min-h-screen bg-[#0A0C10] text-[#F1F5F9] flex flex-col justify-between p-4 sm:p-6 overflow-hidden bg-deep-grid">
      {/* Background Ambience */}
      <div className="pointer-events-none fixed top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[450px] glow-radial-indigo opacity-60 blur-3xl" />
      <div className="pointer-events-none fixed bottom-10 right-10 w-[500px] h-[500px] glow-radial-cyan opacity-30 blur-3xl" />

      {/* ── Top Header / Stepper ──────────────────────────────────── */}
      <header className="relative z-10 max-w-2xl mx-auto w-full pt-4 sm:pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1px]">
              <div className="w-full h-full bg-[#0A0C10] rounded-[7px] flex items-center justify-center">
                <Monitor size={16} className="text-cyan-400" />
              </div>
            </div>
            <span className="font-bold tracking-tight text-sm text-white">Campus OS Setup</span>
          </div>
          <span className="text-xs font-mono text-slate-400">Step {step} of 3</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-slate-800/80 overflow-hidden border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400"
            initial={{ width: '33.33%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </header>

      {/* ── Main Wizard Container ──────────────────────────────────── */}
      <main className="relative z-10 max-w-xl mx-auto w-full my-auto py-8">
        <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            {/* ── STEP 1: Identity & USN ─────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-500/10 text-indigo-400 text-xs font-mono mb-2 border border-indigo-500/20">
                    <User size={13} />
                    Step 1: Student Identity
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Enter Your University Credentials
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    Your USN connects your course schedule, attendance radar, and campus placement drives.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Vikas Kannur"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#111318] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  {/* USN Input */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      University Seat Number (USN)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2BA23CS001"
                      value={usn}
                      onChange={(e) => setUsn(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 rounded-xl bg-[#111318] border border-white/10 text-white placeholder-slate-500 font-mono text-sm tracking-wide focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all uppercase"
                    />
                  </div>

                  {/* Auto-detected Department Pill */}
                  {detectedDept && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs flex items-center gap-2.5 text-cyan-300 font-medium"
                    >
                      <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
                      <span>Detected: <strong>{detectedDept}</strong></span>
                    </motion.div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleNext}
                    className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 shadow-glow-indigo transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <span>Proceed to Goal Selection</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Goal Selection ─────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-500/10 text-cyan-400 text-xs font-mono mb-2 border border-cyan-500/20">
                    <Sparkles size={13} />
                    Step 2: Trajectory
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Select Your Primary Focus
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    Campus OS tunes its background AI recommendation engines around this choice.
                  </p>
                </div>

                <div className="space-y-3">
                  {GOAL_OPTIONS.map((opt) => {
                    const isSelected = selectedGoal === opt.id;
                    const Icon = opt.icon;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedGoal(opt.id)}
                        className={`p-3.5 sm:p-4 rounded-2xl cursor-pointer transition-all border flex items-start gap-3.5 ${
                          isSelected
                            ? 'bg-white/10 border-cyan-400/50 shadow-lg shadow-cyan-500/10'
                            : 'bg-[#111318]/70 border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${opt.color}20`, color: opt.color }}
                        >
                          <Icon size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-semibold text-white truncate">{opt.title}</h4>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-cyan-400 text-[#0A0C10] flex items-center justify-center shrink-0">
                                <Check size={12} strokeWidth={3} />
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 leading-snug">{opt.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleBack}
                    className="py-3 px-5 rounded-xl font-medium text-xs sm:text-sm text-slate-300 hover:text-white glass-panel border border-white/10 flex items-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 py-3.5 px-6 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 shadow-glow-indigo transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <span>Final Review</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Ready to Enter ─────────────────────────── */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-mono mb-2 border border-emerald-500/20">
                    <ShieldCheck size={13} />
                    Step 3: Ready for Launch
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Your Campus Life OS is Initialized
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">
                    Review your workspace summary before entering the live simulated desktop.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="rounded-2xl bg-[#0A0C10]/80 border border-white/10 p-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400">STUDENT NAME</span>
                    <span className="text-white font-sans font-semibold">{name || 'Student Scholar'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400">ASSIGNED USN</span>
                    <span className="text-cyan-400 font-bold">{usn || '2BA23CS001'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400">DEPARTMENT</span>
                    <span className="text-slate-200">{detectedDept || 'General Engineering'}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-400">TARGET TRACK</span>
                    <span className="text-emerald-400 font-sans capitalize">{selectedGoal}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">AI KERNEL</span>
                    <span className="text-indigo-400">Local (DeepSeek) + Cloud</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleBack}
                    disabled={isFinishing}
                    className="py-3.5 px-5 rounded-xl font-medium text-xs sm:text-sm text-slate-300 hover:text-white glass-panel border border-white/10 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <ArrowLeft size={16} />
                    <span>Back</span>
                  </button>
                  <button
                    onClick={handleFinish}
                    disabled={isFinishing}
                    className="flex-1 py-4 px-6 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-500 hover:from-emerald-400 hover:to-indigo-400 shadow-glow-emerald transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-80"
                  >
                    <Sparkles size={18} />
                    <span>{isFinishing ? 'Booting Campus OS...' : 'Enter Campus Life'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="relative z-10 text-center py-4 text-[11px] text-slate-400">
        Campus OS Kernel &bull; Privacy First &bull; Zero Third-Party Tracker
      </footer>
    </div>
  );
}
