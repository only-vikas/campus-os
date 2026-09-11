'use client';

// ============================================================
// Campus OS — About Campus OS
// Premium full-screen overlay with glassmorphism, GSAP scroll
// trigger animations, Framer Motion stagger, parallax, and
// zoom-in/zoom-out interactions
// ============================================================
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import {
  X, FileText, Mic, Briefcase, Shield, Landmark, CloudSun, Settings,
  GraduationCap, Zap, Code2, Users, Globe, Layers, Cpu, Heart,
  ExternalLink, ChevronDown, Sparkles, Brain
} from 'lucide-react';

// GitHub icon not available in this lucide-react version — inline SVG
function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

// ── App showcase data ───────────────────────────────────────────
const APPS = [
  { name: 'Resume Analyzer', icon: <FileText size={28} />, color: '#60a5fa', desc: 'AI-powered resume analysis & optimization with multi-format support' },
  { name: 'Interview Prep', icon: <Mic size={28} />, color: '#60a5fa', desc: 'AI mock interviews with real-time feedback & performance analytics' },
  { name: 'EduVault', icon: <span className="text-2xl">🏗️</span>, color: '#34d399', desc: 'Your AI-powered financial companion for tracking & learning' },
  { name: 'Placement Portal', icon: <Briefcase size={28} />, color: '#fbbf24', desc: 'Job listings, applications & placement tracking with AI matching' },
  { name: 'CodeGuard', icon: <Shield size={28} />, color: '#fbbf24', desc: 'AI-powered code analysis, security scanning & automated fixes' },
  { name: 'FinSack', icon: <Landmark size={28} />, color: '#10b981', desc: 'Complete financial literacy OS — learn, simulate, trade' },
  { name: 'NovaMind', icon: <Brain size={28} />, color: '#a78bfa', desc: 'Predictive, adaptive learning & career intelligence engine' },
  { name: 'Campus Portal', icon: <GraduationCap size={28} />, color: '#a78bfa', desc: 'Student profile, grades, attendance, fees & registration' },
  { name: 'Weather', icon: <CloudSun size={28} />, color: '#fbbf24', desc: 'Real-time weather with city search across India' },
];

const STATS = [
  { label: 'Apps', value: 10, suffix: '+' },
  { label: 'Features', value: 150, suffix: '+' },
  { label: 'Lines of Code', value: 50, suffix: 'K+' },
  { label: 'Animations', value: 200, suffix: '+' },
];

const TECH_STACK = [
  { name: 'Next.js 14', icon: <Globe size={20} />, color: '#e2e8f0' },
  { name: 'TypeScript', icon: <Code2 size={20} />, color: '#3178c6' },
  { name: 'Framer Motion', icon: <Zap size={20} />, color: '#ff0055' },
  { name: 'Tailwind CSS', icon: <Layers size={20} />, color: '#06b6d4' },
  { name: 'MongoDB', icon: <Cpu size={20} />, color: '#00ed64' },
  { name: 'Zustand', icon: <Sparkles size={20} />, color: '#f59e0b' },
  { name: 'Clerk Auth', icon: <Users size={20} />, color: '#6c47ff' },
  { name: 'GSAP', icon: <Zap size={20} />, color: '#88ce02' },
];

// ── Animated counter hook ───────────────────────────────────────
function useCounter(target: number, duration: number = 2000, trigger: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, trigger]);
  return count;
}

// ── Particle background ─────────────────────────────────────────
function ParticleField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            background: `rgba(${96 + Math.random() * 80}, ${165 + Math.random() * 60}, ${250}, ${0.15 + Math.random() * 0.25})`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 50, 0],
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + Math.random() * 6,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ── Glowing Orbs ────────────────────────────────────────────────
function GlowingOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)', left: '-10%', top: '-10%' }}
        animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)', right: '-5%', bottom: '10%' }}
        animate={{ x: [0, -80, 0], y: [0, -60, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{ background: 'radial-gradient(circle, rgba(52,211,153,0.06) 0%, transparent 70%)', left: '40%', top: '30%' }}
        animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────
interface AboutCampusOSProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutCampusOS({ isOpen, onClose }: AboutCampusOSProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const parallaxX = useTransform(springX, [0, window?.innerWidth || 1920], [-15, 15]);
  const parallaxY = useTransform(springY, [0, window?.innerHeight || 1080], [-10, 10]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  }, [mouseX, mouseY]);

  // Scroll tracking
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const y = scrollRef.current.scrollTop;
    setScrollY(y);
    
    // Check if stats section is visible
    if (y > 400 && !statsVisible) setStatsVisible(true);
    
    // Determine current section
    const sectionHeight = window.innerHeight * 0.8;
    setCurrentSection(Math.floor(y / sectionHeight));
  }, [statsVisible]);

  // Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // GSAP-style scroll zoom (using Framer Motion transforms)
  const heroScale = Math.max(0.8, 1 - scrollY * 0.0003);
  const heroOpacity = Math.max(0, 1 - scrollY * 0.002);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[9000] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onMouseMove={handleMouseMove}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-[#050a18]/95 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Close button */}
          <motion.button
            className="absolute top-6 right-6 z-[9010] w-10 h-10 rounded-full glass flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-white/10 transition-all"
            onClick={onClose}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1, rotate: 90 }}
            transition={{ duration: 0.3 }}
          >
            <X size={20} />
          </motion.button>

          {/* Scrollable content */}
          <motion.div
            ref={scrollRef}
            className="relative z-[9005] w-full h-full overflow-y-auto overflow-x-hidden"
            style={{ scrollBehavior: 'smooth' }}
            onScroll={handleScroll}
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            exit={{ y: 50 }}
          >
            <ParticleField />
            <GlowingOrbs />

            {/* ═══════════════════════════════════════════════════
                SECTION 1: Hero
            ═══════════════════════════════════════════════════ */}
            <motion.section
              className="relative flex flex-col items-center justify-center min-h-screen px-8 text-center"
              style={{ transform: `scale(${heroScale})`, opacity: heroOpacity }}
            >
              {/* Animated Logo */}
              <motion.div
                className="relative mb-8"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.3 }}
              >
                <motion.div
                  className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#60a5fa] via-[#a78bfa] to-[#34d399] flex items-center justify-center shadow-2xl"
                  style={{ x: parallaxX, y: parallaxY }}
                  animate={{
                    boxShadow: [
                      '0 0 40px rgba(96,165,250,0.3)',
                      '0 0 60px rgba(167,139,250,0.4)',
                      '0 0 40px rgba(52,211,153,0.3)',
                      '0 0 60px rgba(96,165,250,0.3)',
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <svg viewBox="0 0 48 48" className="w-14 h-14 fill-white">
                    <path d="M24 4C13 4 4 13 4 24s9 20 20 20 20-9 20-20S35 4 24 4zm-2 28v-8h-6l8-12v8h6L22 32z" />
                  </svg>
                </motion.div>
                {/* Orbital rings */}
                <motion.div
                  className="absolute inset-[-20px] rounded-full border border-[#60a5fa]/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                />
                <motion.div
                  className="absolute inset-[-40px] rounded-full border border-[#a78bfa]/10"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>

              {/* Title */}
              <motion.h1
                className="text-6xl md:text-7xl font-black mb-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <span className="bg-gradient-to-r from-[#60a5fa] via-[#a78bfa] to-[#34d399] bg-clip-text text-transparent">
                  Campus OS
                </span>
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-[#94a3b8] max-w-2xl mb-3 font-light"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                The Complete Desktop Operating System for Modern Students
              </motion.p>

              <motion.p
                className="text-sm text-[#475569] max-w-lg mb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                AI-powered career tools • Financial literacy engine • Smart campus management • All in a beautiful, windowed desktop experience.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                className="flex gap-4 mb-16"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                <a
                  href="https://github.com/only-vikas/campus-os"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] text-white font-semibold hover:shadow-lg hover:shadow-[#60a5fa]/25 transition-all hover:scale-105"
                >
                  <GithubIcon size={18} /> View on GitHub
                </a>
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl glass text-[#e2e8f0] font-semibold hover:bg-white/10 transition-all hover:scale-105"
                >
                  <Zap size={18} /> Launch Desktop
                </button>
              </motion.div>

              {/* Scroll indicator */}
              <motion.div
                className="absolute bottom-10 flex flex-col items-center gap-2 text-[#475569]"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-xs">Scroll to explore</span>
                <ChevronDown size={20} />
              </motion.div>
            </motion.section>

            {/* ═══════════════════════════════════════════════════
                SECTION 2: Statistics
            ═══════════════════════════════════════════════════ */}
            <section className="relative py-32 px-8">
              <div className="max-w-5xl mx-auto">
                <motion.h2
                  className="text-4xl font-bold text-center mb-16"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  onViewportEnter={() => setStatsVisible(true)}
                >
                  <span className="bg-gradient-to-r from-[#60a5fa] to-[#34d399] bg-clip-text text-transparent">
                    Built at Scale
                  </span>
                </motion.h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {STATS.map((stat, i) => {
                    const count = useCounter(stat.value, 2000, statsVisible);
                    return (
                      <motion.div
                        key={stat.label}
                        className="glass rounded-2xl p-6 text-center group hover:scale-105 transition-transform duration-300 cursor-default"
                        initial={{ opacity: 0, y: 40, scale: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.15, duration: 0.6 }}
                        whileHover={{
                          boxShadow: '0 0 40px rgba(96,165,250,0.15)',
                          borderColor: 'rgba(96,165,250,0.3)',
                        }}
                      >
                        <div className="text-4xl md:text-5xl font-black bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] bg-clip-text text-transparent mb-2">
                          {count}{stat.suffix}
                        </div>
                        <div className="text-sm text-[#94a3b8] font-medium">{stat.label}</div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                SECTION 3: App Showcase (Zoom-in/out cards)
            ═══════════════════════════════════════════════════ */}
            <section className="relative py-32 px-8">
              <div className="max-w-6xl mx-auto">
                <motion.h2
                  className="text-4xl font-bold text-center mb-6"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                >
                  <span className="bg-gradient-to-r from-[#a78bfa] to-[#f472b6] bg-clip-text text-transparent">
                    Powerful Apps, One Desktop
                  </span>
                </motion.h2>
                <motion.p
                  className="text-center text-[#94a3b8] mb-16 max-w-xl mx-auto"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  Every app is a full-featured experience — designed with premium aesthetics and intelligent automation.
                </motion.p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {APPS.map((app, i) => (
                    <motion.div
                      key={app.name}
                      className="group relative glass rounded-2xl p-6 cursor-default overflow-hidden"
                      initial={{ opacity: 0, scale: 0.85, y: 40 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ delay: i * 0.08, duration: 0.5, type: 'spring', stiffness: 200 }}
                      whileHover={{
                        scale: 1.04,
                        y: -5,
                        boxShadow: `0 20px 60px ${app.color}20`,
                        transition: { duration: 0.3 },
                      }}
                    >
                      {/* Glow effect on hover */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                        style={{
                          background: `radial-gradient(circle at 30% 30%, ${app.color}10 0%, transparent 60%)`,
                        }}
                      />

                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                          <motion.div
                            className="w-12 h-12 rounded-xl flex items-center justify-center"
                            style={{ background: `${app.color}20`, border: `1px solid ${app.color}30` }}
                            whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.5 } }}
                          >
                            <span style={{ color: app.color }}>{app.icon}</span>
                          </motion.div>
                          <h3 className="text-lg font-bold text-[#e2e8f0]">{app.name}</h3>
                        </div>
                        <p className="text-sm text-[#94a3b8] leading-relaxed">{app.desc}</p>
                      </div>

                      {/* Bottom accent line */}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-[2px]"
                        style={{ background: `linear-gradient(90deg, transparent, ${app.color}, transparent)` }}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 + 0.3, duration: 0.8 }}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                SECTION 4: Tech Stack
            ═══════════════════════════════════════════════════ */}
            <section className="relative py-32 px-8">
              <div className="max-w-4xl mx-auto">
                <motion.h2
                  className="text-4xl font-bold text-center mb-16"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                >
                  <span className="bg-gradient-to-r from-[#34d399] to-[#60a5fa] bg-clip-text text-transparent">
                    Tech Stack
                  </span>
                </motion.h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {TECH_STACK.map((tech, i) => (
                    <motion.div
                      key={tech.name}
                      className="glass rounded-xl p-4 flex flex-col items-center gap-2 group cursor-default"
                      initial={{ opacity: 0, y: 30, rotateX: 15 }}
                      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.5 }}
                      whileHover={{
                        scale: 1.08,
                        y: -5,
                        boxShadow: `0 10px 30px ${tech.color}20`,
                      }}
                    >
                      <motion.div
                        style={{ color: tech.color }}
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                      >
                        {tech.icon}
                      </motion.div>
                      <span className="text-sm font-semibold text-[#e2e8f0]">{tech.name}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                SECTION 5: Architecture
            ═══════════════════════════════════════════════════ */}
            <section className="relative py-32 px-8">
              <div className="max-w-5xl mx-auto">
                <motion.h2
                  className="text-4xl font-bold text-center mb-16"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <span className="bg-gradient-to-r from-[#fbbf24] to-[#f472b6] bg-clip-text text-transparent">
                    Architecture
                  </span>
                </motion.h2>

                <motion.div
                  className="glass rounded-2xl p-8 font-mono text-sm leading-relaxed text-[#94a3b8]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <pre className="overflow-x-auto whitespace-pre">
{`┌─────────────────────────────────────────────────────────────┐
│                    CAMPUS OS DESKTOP                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ TopBar   │ │ Widgets  │ │ Spotlight│ │ Context  │      │
│  │ (Menu)   │ │ (Clock,  │ │ (Search) │ │ Menu     │      │
│  │          │ │  Weather)│ │          │ │          │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Window Manager                        │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐          │    │
│  │  │ App 1    │ │ App 2    │ │ App N    │          │    │
│  │  │ (Window) │ │ (Window) │ │ (Window) │          │    │
│  │  └──────────┘ └──────────┘ └──────────┘          │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Dock (macOS-style)                     │    │
│  └────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  Zustand Store │ MongoDB │ Clerk Auth │ OpenRouter AI      │
└─────────────────────────────────────────────────────────────┘`}
                  </pre>
                </motion.div>
              </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                SECTION 6: Made With Love
            ═══════════════════════════════════════════════════ */}
            <section className="relative py-32 px-8">
              <div className="max-w-3xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, type: 'spring' }}
                >
                  <motion.div
                    className="inline-flex items-center gap-2 text-[#f472b6] mb-6"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Heart size={24} fill="currentColor" />
                  </motion.div>

                  <h2 className="text-3xl font-bold text-[#e2e8f0] mb-4">
                    Made with{' '}
                    <span className="bg-gradient-to-r from-[#f472b6] to-[#fbbf24] bg-clip-text text-transparent">
                      passion
                    </span>
                  </h2>

                  <p className="text-[#94a3b8] mb-8">
                    Campus OS is an open-source project built to demonstrate what a modern, AI-powered student operating system can look like. 
                    Every pixel, every animation, every feature — crafted with care.
                  </p>

                  <div className="flex justify-center gap-4">
                    <a
                      href="https://github.com/only-vikas/campus-os"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass text-[#e2e8f0] text-sm font-medium hover:bg-white/10 transition-all hover:scale-105"
                    >
                      <GithubIcon size={16} /> GitHub
                    </a>
                    <a
                      href="https://github.com/only-vikas/BecVortex"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl glass text-[#e2e8f0] text-sm font-medium hover:bg-white/10 transition-all hover:scale-105"
                    >
                      <ExternalLink size={16} /> BecVortex
                    </a>
                  </div>
                </motion.div>
              </div>

              {/* Bottom spacer */}
              <div className="h-32" />
            </section>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
