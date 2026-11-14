'use client';

// ============================================================
// Campus OS — Pre-Auth Marketing & Experience Landing Page
// Theme: Deep Space Academy (Glassmorphism & 3D Interactive)
// ============================================================
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView, Variants } from 'framer-motion';
import {
  Sparkles,
  BrainCircuit,
  Wallet,
  ShieldCheck,
  Briefcase,
  ArrowRight,
  Monitor,
  Cpu,
  Layers,
  Terminal,
  CheckCircle2,
  Zap,
  Globe,
  Sliders,
  ChevronRight,
} from 'lucide-react';

// Word-by-word stagger animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
    },
  },
};

// Animated Counter Component for Stats Section
function Counter({ value, suffix = '', duration = 2000 }: { value: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// Interactive Knowledge Galaxy Canvas (Placeholder & Visual for Spline 3D Hero)
function KnowledgeGalaxyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Nodes representing OS Apps in 3D-projected space
    const nodes = [
      { name: 'NovaMind', color: '#22D3EE', x: 0, y: 0, z: 0, radius: 8, angle: 0, dist: 140, speed: 0.008 },
      { name: 'EduVault', color: '#34D399', x: 0, y: 0, z: 0, radius: 7, angle: (Math.PI * 2) / 5, dist: 180, speed: 0.006 },
      { name: 'CodeGuard', color: '#A78BFA', x: 0, y: 0, z: 0, radius: 7.5, angle: (Math.PI * 4) / 5, dist: 160, speed: -0.007 },
      { name: 'Placement', color: '#FB923C', x: 0, y: 0, z: 0, radius: 6.5, angle: (Math.PI * 6) / 5, dist: 210, speed: 0.005 },
      { name: 'FinSack', color: '#F59E0B', x: 0, y: 0, z: 0, radius: 6, angle: (Math.PI * 8) / 5, dist: 230, speed: -0.004 },
      { name: 'InterviewPrep', color: '#38BDF8', x: 0, y: 0, z: 0, radius: 6, angle: Math.PI / 3, dist: 120, speed: 0.009 },
    ];

    // Background stars
    const stars = Array.from({ length: 80 }).map(() => ({
      x: (Math.random() - 0.5) * 600,
      y: (Math.random() - 0.5) * 400,
      size: Math.random() * 1.8 + 0.4,
      alpha: Math.random() * 0.7 + 0.2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    }));

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = (e.clientX - rect.left - width / 2) * 0.15;
      mouseY = (e.clientY - rect.top - height / 2) * 0.15;
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    let tick = 0;
    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2 + mouseX * 0.4;
      const centerY = height / 2 + mouseY * 0.4;

      // Draw faint background stars
      stars.forEach((star) => {
        const pulse = 0.5 + Math.sin(tick * star.pulseSpeed) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha * pulse})`;
        ctx.beginPath();
        ctx.arc(centerX + star.x, centerY + star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw central Core Orb (Campus OS Kernel)
      const corePulse = Math.sin(tick * 0.03) * 4;
      const coreGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, 45 + corePulse);
      coreGrad.addColorStop(0, 'rgba(99, 102, 241, 0.9)');
      coreGrad.addColorStop(0.4, 'rgba(34, 211, 238, 0.4)');
      coreGrad.addColorStop(1, 'rgba(10, 12, 16, 0)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 50 + corePulse, 0, Math.PI * 2);
      ctx.fill();

      // Core center circle
      ctx.fillStyle = '#6366F1';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Update and draw App Node Orbits
      nodes.forEach((node) => {
        node.angle += node.speed;
        const x = Math.cos(node.angle) * node.dist;
        const y = Math.sin(node.angle) * (node.dist * 0.45); // Elliptical 3D tilt

        // Orbit ring
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, node.dist, node.dist * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Connecting filament to center
        ctx.strokeStyle = `${node.color}22`;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + x, centerY + y);
        ctx.stroke();

        // Node Glow
        const glow = ctx.createRadialGradient(centerX + x, centerY + y, 1, centerX + x, centerY + y, node.radius * 3);
        glow.addColorStop(0, `${node.color}99`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(centerX + x, centerY + y, node.radius * 3, 0, Math.PI * 2);
        ctx.fill();

        // Node Body
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(centerX + x, centerY + y, node.radius, 0, Math.PI * 2);
        ctx.fill();

        // Node Label
        ctx.font = '10px Inter, sans-serif';
        ctx.fillStyle = 'rgba(241, 245, 249, 0.85)';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, centerX + x, centerY + y + node.radius + 14);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (canvas) canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing" />;
}

export default function LandingPage() {
  const headlineWords = 'Your Entire Campus. One Intelligent OS.'.split(' ');

  return (
    <div className="relative min-h-screen bg-[#0A0C10] text-[#F1F5F9] overflow-x-hidden selection:bg-indigo-500/30 selection:text-white">
      {/* Background Deep Space Grid & Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-deep-grid opacity-60" />
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] glow-radial-indigo opacity-70 blur-3xl z-0" />
      <div className="pointer-events-none fixed top-[45%] right-0 w-[600px] h-[600px] glow-radial-cyan opacity-40 blur-3xl z-0" />

      {/* ── Top Floating Navigation Bar ────────────────────────────── */}
      <header className="fixed top-4 inset-x-0 z-50 max-w-6xl mx-auto px-4 sm:px-6">
        <nav className="glass-panel rounded-2xl px-5 py-3.5 flex items-center justify-between border border-white/10 shadow-2xl backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-[1px] shadow-glow-indigo transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#0A0C10] rounded-[11px] flex items-center justify-center">
                <Monitor size={18} className="text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="font-bold tracking-tight text-base text-white">Campus OS</span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-mono tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                v2.0
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <a href="#hero" className="hover:text-white transition-colors">Overview</a>
            <a href="#features" className="hover:text-white transition-colors">Bento Suite</a>
            <a href="#stats" className="hover:text-white transition-colors">Architecture</a>
            <a href="#preview" className="hover:text-white transition-colors">OS Desktop</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-xs sm:text-sm font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/desktop"
              className="group relative inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 shadow-lg shadow-indigo-500/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Launch Desktop</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ── HERO SECTION ───────────────────────────────────────────── */}
      <section id="hero" className="relative z-10 pt-32 sm:pt-40 pb-20 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Release Pill */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-8 backdrop-blur-md shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>Deep Space Academy Edition</span>
          <span className="text-white/30">•</span>
          <span className="text-slate-400">Local & Cloud AI Ready</span>
        </motion.div>

        {/* Staggered Word-by-Word Headline */}
        <motion.h1
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight max-w-4xl text-white leading-[1.1] mb-6"
        >
          {headlineWords.map((word, index) => {
            const isHighlight = word === 'One' || word === 'Intelligent' || word === 'OS.';
            return (
              <motion.span
                key={index}
                variants={wordVariants}
                className={`inline-block mr-2 sm:mr-3.5 ${
                  isHighlight
                    ? 'bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-300 bg-clip-text text-transparent'
                    : 'text-white'
                }`}
              >
                {word}
              </motion.span>
            );
          })}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-base sm:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed font-normal"
        >
          A next-generation simulated desktop unifying AI learning, financial vault intelligence, real-time code audit, and dream placements into a single seamless glass environment.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <Link
            href="/desktop"
            className="neu-button px-7 py-3.5 text-sm sm:text-base font-semibold text-white flex items-center gap-2.5 rounded-xl border border-indigo-500/40 bg-gradient-to-r from-indigo-600/90 to-cyan-600/90 hover:from-indigo-500 hover:to-cyan-500 shadow-glow-indigo transition-all"
          >
            <Monitor size={18} />
            <span>Launch Live Desktop</span>
          </Link>

          <Link
            href="/onboarding"
            className="neu-button px-6 py-3.5 text-sm sm:text-base font-semibold text-slate-200 hover:text-white flex items-center gap-2 rounded-xl border border-white/10"
          >
            <span>Start Onboarding</span>
            <ChevronRight size={17} className="text-slate-400" />
          </Link>
        </motion.div>

        {/* ── 3D HERO CONTAINER / SPLINE PLACEHOLDER ───────────────── */}
        {/* 
            DEVELOPER NOTE:
            This #spline-hero-container is prepared for your Google Stitch / Spline 3D scene.
            To replace with Spline:
            1. npm install @splinetool/react-spline
            2. Replace <KnowledgeGalaxyCanvas /> with <Spline scene="YOUR_SPLINE_SCENE_URL" />
        */}
        <motion.div
          id="spline-hero-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="relative w-full h-[380px] sm:h-[460px] md:h-[520px] rounded-3xl glass-panel p-2 sm:p-4 overflow-hidden border border-white/10 shadow-2xl flex flex-col justify-between"
        >
          {/* Top Bar status inside 3D Viewer */}
          <div className="relative z-10 flex items-center justify-between px-3 py-2 text-xs font-mono text-slate-400 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>3D KNOWLEDGE GALAXY &bull; LIVE RUNTIME</span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-500">
              <span>6 OS NODES ORBITING</span>
              <span>SPLINE 3D READY</span>
            </div>
          </div>

          {/* Interactive 3D Canvas / Galaxy Visual */}
          <div className="absolute inset-0 top-10">
            <KnowledgeGalaxyCanvas />
          </div>

          {/* Bottom helper pill */}
          <div className="relative z-10 self-center mb-2 px-4 py-1.5 rounded-full bg-[#111318]/80 border border-white/10 text-xs text-slate-300 backdrop-blur-md flex items-center gap-2 pointer-events-none">
            <Sparkles size={13} className="text-cyan-400" />
            <span>Interactive Node Galaxy &bull; Drag to inspect active apps</span>
          </div>
        </motion.div>
      </section>

      {/* ── BENTO GRID FEATURES SECTION ────────────────────────────── */}
      <section id="features" className="relative z-10 py-24 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 text-xs font-mono tracking-wider uppercase mb-3 border border-cyan-500/20">
            <Layers size={13} />
            Integrated Bento Ecosystem
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Four Flagship Engines, Zero Context Switching
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
            Every app in Campus OS is powered by reactive state persistence, local DeepSeek fallback, and glassmorphic micro-interactions.
          </p>
        </div>

        {/* 4-Card Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. NovaMind AI (Large Card - Spans 2 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2 glass-panel glass-panel-hover rounded-3xl p-7 sm:p-9 relative overflow-hidden flex flex-col justify-between group"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/15 transition-all" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-6 shadow-glow-cyan">
                <BrainCircuit size={24} />
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                  AI TUTOR & ROADMAP
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                  DeepSeek-R1 + OpenRouter
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">NovaMind Learning Coach</h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mb-6">
                Generates personalized 5-milestone project roadmaps with knowledge tracing, interactive technical quizzes, and conversational tutoring tuned to Indian engineering curricula.
              </p>
            </div>

            {/* Simulated UI Snippet */}
            <div className="mt-4 rounded-xl bg-[#0A0C10]/70 border border-white/5 p-4 text-xs font-mono text-slate-300">
              <div className="flex items-center justify-between text-slate-400 pb-2 mb-2 border-b border-white/5">
                <span>ACTIVE LEARNING PATH: FULL-STACK DEV</span>
                <span className="text-cyan-400 font-semibold">82% MASTERY</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 size={13} />
                  <span>M1: Modern TypeScript &amp; State Stores (Completed)</span>
                </div>
                <div className="flex items-center gap-2 text-cyan-300">
                  <Zap size={13} />
                  <span>M2: Distributed Systems &amp; Cache Coherence (In Progress)</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 2. EduVault (1 col) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-panel glass-panel-hover rounded-3xl p-7 sm:p-9 relative overflow-hidden flex flex-col justify-between group"
          >
            <div className="absolute top-0 right-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/15 transition-all" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-glow-emerald">
                <Wallet size={24} />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  FINANCIAL VAULT
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">EduVault Student Ledger</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Smart income tracking across Salary, Freelance &amp; Agriculture, emergency buffers, and persistent AI financial advising surviving window changes.
              </p>
            </div>

            <div className="rounded-xl bg-[#0A0C10]/70 border border-white/5 p-4 text-xs">
              <div className="text-slate-400 mb-1">SAVINGS GOAL &bull; SEMESTER 6</div>
              <div className="text-xl font-bold text-emerald-400 mb-2">&#8377; 42,500 / 50,000</div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 w-[85%]" />
              </div>
            </div>
          </motion.div>

          {/* 3. CodeGuard (1 col) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-panel glass-panel-hover rounded-3xl p-7 sm:p-9 relative overflow-hidden flex flex-col justify-between group"
          >
            <div className="absolute top-0 right-0 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/15 transition-all" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6 shadow-glow-indigo">
                <ShieldCheck size={24} />
              </div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  CODE SECURITY &amp; AST
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">CodeGuard Review</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Integrated Monaco Editor inspecting static AST anti-patterns, security vulnerabilities, side-by-side git diffs, and automatic code refinement.
              </p>
            </div>

            <div className="rounded-xl bg-[#0A0C10]/70 border border-white/5 p-3.5 font-mono text-xs text-purple-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Terminal size={14} className="text-purple-400" />
                <span>Lyria / Gemma Analyzer</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-200">0 Critical</span>
            </div>
          </motion.div>

          {/* 4. Placement & Resumate (2 cols) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-2 glass-panel glass-panel-hover rounded-3xl p-7 sm:p-9 relative overflow-hidden flex flex-col justify-between group"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-orange-500/15 transition-all" />
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-6">
                <Briefcase size={24} />
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-orange-500/10 text-orange-300 border border-orange-500/20">
                  CAREER &amp; ATS PIPELINE
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                  Mock Interview AI Included
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">Campus Placement &amp; Resumate</h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl mb-6">
                Real-time campus placement drives, automated resume match-scoring against company JDs, interactive ATS bullet optimizer, and AI voice mock interviews.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="rounded-xl bg-[#0A0C10]/70 border border-white/5 p-3 text-center">
                <div className="text-lg font-bold text-white">94%</div>
                <div className="text-[11px] text-slate-400">Avg ATS Score</div>
              </div>
              <div className="rounded-xl bg-[#0A0C10]/70 border border-white/5 p-3 text-center">
                <div className="text-lg font-bold text-orange-400">Tier-1</div>
                <div className="text-[11px] text-slate-400">Dream Drive Filters</div>
              </div>
              <div className="col-span-2 sm:col-span-1 rounded-xl bg-[#0A0C10]/70 border border-white/5 p-3 text-center">
                <div className="text-lg font-bold text-cyan-400">Real-time</div>
                <div className="text-[11px] text-slate-400">Speech-to-Text Mock</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS SECTION ──────────────────────────────────────────── */}
      <section id="stats" className="relative z-10 py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/10 relative overflow-hidden"
        >
          <div className="text-center mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400">
              Platform Metrics &bull; Built at Scale
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white mt-2">
              Engineered Without Compromise
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                <Counter value={10} suffix="+" />
              </div>
              <div className="text-sm font-semibold text-white">Integrated Apps</div>
              <div className="text-xs text-slate-400">Built-in desktop productivity</div>
            </div>

            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                <Counter value={100} suffix="%" />
              </div>
              <div className="text-sm font-semibold text-white">Client-First &amp; Free</div>
              <div className="text-xs text-slate-400">No telemetry or paywalls</div>
            </div>

            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
                <Counter value={150} suffix="+" />
              </div>
              <div className="text-sm font-semibold text-white">OS Features</div>
              <div className="text-xs text-slate-400">Widgets, shortcuts &amp; spotlight</div>
            </div>

            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                <Counter value={60} suffix="fps" />
              </div>
              <div className="text-sm font-semibold text-white">Butter Performance</div>
              <div className="text-xs text-slate-400">Hardware-accelerated windowing</div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── DESKTOP PREVIEW / LAUNCH BANNER ────────────────────────── */}
      <section id="preview" className="relative z-10 py-20 px-4 sm:px-6 max-w-6xl mx-auto text-center">
        <div className="glass-panel rounded-3xl p-10 sm:p-16 border border-white/10 relative overflow-hidden bg-gradient-to-b from-indigo-950/20 via-[#111318] to-[#0A0C10]">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-6 shadow-glow-indigo">
            <Cpu size={28} />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Ready to Boot Into Campus OS?
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto text-sm sm:text-base mb-8">
            Experience the simulated operating system directly in your browser without any installation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/desktop"
              className="px-8 py-4 rounded-xl text-base font-bold text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 shadow-glow-indigo transition-all duration-300 hover:scale-105"
            >
              Enter Desktop Now
            </Link>
            <Link
              href="/onboarding"
              className="px-7 py-4 rounded-xl text-base font-semibold text-slate-300 hover:text-white glass-panel hover:border-white/20 transition-all"
            >
              Guided Setup
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 py-10 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Campus OS Kernel v2.0 &bull; Deep Space Academy</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/desktop" className="hover:text-white transition-colors">Launch Desktop</Link>
          <Link href="/onboarding" className="hover:text-white transition-colors">Onboarding</Link>
          <Link href="/sign-in" className="hover:text-white transition-colors">Sign In</Link>
          <a
            href="https://github.com/only-vikas/campus-os"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
