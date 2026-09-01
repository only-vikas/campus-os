import { motion } from 'framer-motion';
import { useResumeAnalyzerStore } from '@/stores/useResumeAnalyzerStore';
import { Target, AlertTriangle, CheckCircle, Brain, LayoutDashboard } from 'lucide-react';

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 }
  }
};

const itemVariants: any = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 250, damping: 20 } }
};

export default function BentoDashboard() {
  const { sessions, activeSessionId, isAnalyzing, analysisProgress } = useResumeAnalyzerStore();
  const session = sessions.find((s) => s.id === activeSessionId);
  const analysis = session?.analysis;

  if (isAnalyzing) {
    return (
      <div className="grid grid-cols-3 gap-4 h-full p-6 overflow-y-auto">
        <div className="glass rounded-2xl p-6 col-span-1 animate-pulse bg-white/5 border border-white/10 flex flex-col items-center justify-center min-h-[250px]">
           <div className="w-10 h-10 border-4 border-[#60a5fa] border-t-transparent rounded-full animate-spin mb-4" />
           <p className="text-[#60a5fa] text-sm text-center">{analysisProgress || 'Analyzing...'}</p>
        </div>
        <div className="glass rounded-2xl p-6 col-span-2 animate-pulse bg-white/5 border border-white/10 min-h-[250px]" />
        <div className="glass rounded-2xl p-6 col-span-1 animate-pulse bg-white/5 border border-white/10 min-h-[150px]" />
        <div className="glass rounded-2xl p-6 col-span-2 animate-pulse bg-white/5 border border-white/10 min-h-[150px]" />
        <div className="glass rounded-2xl p-6 col-span-3 animate-pulse bg-white/5 border border-white/10 min-h-[250px]" />
      </div>
    );
  }

  if (!analysis) return null;

  const scoreColor = analysis.matchScore < 50 ? '#ef4444' : analysis.matchScore < 75 ? '#fbbf24' : '#22c55e';

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-3 gap-4 h-full p-6 overflow-y-auto"
    >
      {/* Cell 1: Radial Match Score */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6 flex flex-col items-center justify-center text-center col-span-1">
        <h3 className="text-[#94a3b8] text-sm font-medium mb-4 flex items-center gap-2" title="AI-generated ATS score based on structure analysis">
          <Target size={16} /> AI-Generated ATS Score
        </h3>
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="56" fill="none" stroke="#1e293b" strokeWidth="12" />
            <motion.circle 
              cx="64" cy="64" r="56" fill="none" stroke={scoreColor} strokeWidth="12" 
              strokeDasharray="351.858"
              initial={{ strokeDashoffset: 351.858 }}
              animate={{ strokeDashoffset: 351.858 - (351.858 * analysis.matchScore) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="text-4xl font-bold" style={{ color: scoreColor }}>
            {analysis.matchScore}<span className="text-lg">%</span>
          </div>
        </div>
      </motion.div>

      {/* Cell 2: Skill Alignment Heatmap */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6 col-span-2">
        <h3 className="text-[#94a3b8] text-sm font-medium mb-4 flex items-center gap-2">
          <Brain size={16} /> Skill Alignment
        </h3>
        <div className="flex flex-wrap gap-2">
          {analysis.matchedSkills.map((skill, i) => (
            <motion.div 
              key={`match-${i}`}
              whileHover={{ y: -4, scale: 1.05 }}
              className="px-3 py-1.5 rounded-lg text-sm bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30 cursor-default shadow-[0_0_10px_rgba(34,197,94,0)] hover:shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-shadow"
            >
              {skill.skill} <span className="opacity-60 text-xs">({skill.strength})</span>
            </motion.div>
          ))}
          {analysis.missingSkills.map((skill, i) => (
            <motion.div 
              key={`miss-${i}`}
              layoutId={`skill-${skill.skill}`}
              whileHover={{ y: -4, scale: 1.05 }}
              className="px-3 py-1.5 rounded-lg text-sm bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/30 cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0)] hover:shadow-[0_0_10px_rgba(239,68,68,0.3)] transition-shadow"
            >
              {skill.skill} <span className="opacity-60 text-xs">(Missing)</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Cell 3: Quality Rating */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6 flex flex-col items-center justify-center">
        <h3 className="text-[#94a3b8] text-sm font-medium mb-2">Overall Quality</h3>
        <div className="text-2xl font-bold text-[#e2e8f0]">{analysis.qualityRating}</div>
      </motion.div>

      {/* Cell 4: ATS Flags */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6 col-span-2 overflow-y-auto max-h-48">
        <h3 className="text-[#94a3b8] text-sm font-medium mb-3 flex items-center gap-2">
          <AlertTriangle size={16} /> ATS Flags & Fixes
        </h3>
        <div className="space-y-3">
          {analysis.atsFlags.length === 0 ? (
            <div className="text-[#22c55e] text-sm flex items-center gap-2"><CheckCircle size={14}/> No ATS issues detected!</div>
          ) : (
            analysis.atsFlags.map((flag, i) => (
              <div key={i} className="bg-[#1e293b]/50 p-3 rounded-xl border border-[#334155]">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${flag.severity === 'high' ? 'bg-[#ef4444]' : flag.severity === 'medium' ? 'bg-[#fbbf24]' : 'bg-[#60a5fa]'}`} />
                  <span className="text-sm font-medium text-[#e2e8f0]">{flag.issue}</span>
                </div>
                <p className="text-xs text-[#94a3b8] pl-4">{flag.fix}</p>
              </div>
            ))
          )}
        </div>
      </motion.div>

      {/* Cell 5: Missing Metrics & Weak Bullets */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-6 col-span-3">
        <h3 className="text-[#94a3b8] text-sm font-medium mb-3 flex items-center gap-2">
          <LayoutDashboard size={16} /> Impact & Improvements
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs text-[#60a5fa] font-bold mb-2 uppercase tracking-wider">Weak Bullets Detected</h4>
            <div className="space-y-2">
              {analysis.weakBullets.map((bullet, i) => (
                <div key={i} className="text-sm bg-[#0f172a]/50 p-2 rounded border border-[#ef4444]/20">
                  <span className="text-[#ef4444] line-through block mb-1">{bullet.text}</span>
                  <span className="text-[#22c55e] block">{bullet.enhancedVersion}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs text-[#fbbf24] font-bold mb-2 uppercase tracking-wider">Missing Metrics</h4>
            <div className="space-y-2">
              {analysis.missingMetrics.map((metric, i) => (
                <div key={i} className="text-sm bg-[#0f172a]/50 p-2 rounded border border-[#fbbf24]/20">
                  <p className="text-[#e2e8f0] mb-1">{metric.bullet}</p>
                  <p className="text-[#94a3b8] text-xs">💡 Suggestion: {metric.suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

    </motion.div>
  );
}
