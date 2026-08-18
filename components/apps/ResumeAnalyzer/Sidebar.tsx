import { useScroll, motion, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useResumeAnalyzerStore, ResumeSession, ResumeFile } from '@/stores/useResumeAnalyzerStore';
import { FileText, Plus, Trash2, CheckCircle2 } from 'lucide-react';

function HistoryItem({ session, isActive, onClick, onDelete }: { session: ResumeSession, isActive: boolean, onClick: () => void, onDelete: (e: React.MouseEvent) => void }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.3, 1, 1, 0.3]);

  const scoreColor = session.analysis ? (session.analysis.matchScore < 50 ? '#ef4444' : session.analysis.matchScore < 75 ? '#fbbf24' : '#22c55e') : '#475569';

  return (
    <motion.div
      ref={ref}
      style={{ scale, opacity }}
      onClick={onClick}
      className={`relative p-3 rounded-xl cursor-pointer transition-colors border ${
        isActive ? 'bg-[#60a5fa]/20 border-[#60a5fa]/50' : 'bg-[#1e293b]/50 border-transparent hover:bg-[#1e293b]'
      }`}
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="text-sm font-semibold text-[#e2e8f0] truncate w-32">{session.resumeName}</h4>
        {session.analysis && (
          <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${scoreColor}20`, color: scoreColor }}>
            {session.analysis.matchScore}%
          </span>
        )}
      </div>
      <p className="text-xs text-[#94a3b8] truncate">{session.targetRole} @ {session.company}</p>
      <div className="flex justify-between items-center mt-2">
        <span className="text-[10px] text-[#475569]">{new Date(session.date).toLocaleDateString()}</span>
        <button onClick={onDelete} className="text-[#475569] hover:text-[#ef4444] transition-colors p-1">
          <Trash2 size={12} />
        </button>
      </div>
    </motion.div>
  );
}

export default function Sidebar() {
  const { resumes, activeResumeId, setActiveResume, deleteResume, sessions, activeSessionId, createNewSession, loadSession, deleteSession } = useResumeAnalyzerStore();

  return (
    <div className="w-64 h-full border-r border-[#1e293b] bg-[#0a0f1e]/80 flex flex-col">
      <div className="p-4 border-b border-[#1e293b]">
        <button
          onClick={createNewSession}
          className="w-full py-2 bg-[#60a5fa] hover:bg-[#3b82f6] text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-[0_0_10px_rgba(96,165,250,0.3)]"
        >
          <Plus size={16} /> New Analysis
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        
        {/* Uploaded Resumes Section */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-[#60a5fa] uppercase tracking-wider mb-2 px-1 flex justify-between">
            <span>My Resumes</span>
            <span className="opacity-60">{resumes.length}/5</span>
          </h3>
          {resumes.length === 0 ? (
             <div className="text-center text-[#475569] text-xs py-4 px-2 italic">
                No resumes uploaded.
             </div>
          ) : (
            resumes.map(resume => (
              <div 
                key={resume.id}
                onClick={() => setActiveResume(resume.id)}
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border ${
                  activeResumeId === resume.id ? 'bg-[#60a5fa]/20 border-[#60a5fa]/50 text-[#60a5fa]' : 'bg-[#1e293b]/50 border-transparent text-[#e2e8f0] hover:bg-[#1e293b]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                   <FileText size={14} className="shrink-0" />
                   <span className="text-sm truncate">{resume.name}</span>
                </div>
                <div className="flex items-center gap-1">
                   {activeResumeId === resume.id && <CheckCircle2 size={14} className="text-[#60a5fa] shrink-0" />}
                   <button onClick={(e) => { e.stopPropagation(); deleteResume(resume.id); }} className="text-[#475569] hover:text-[#ef4444] transition-colors p-1">
                     <Trash2 size={12} />
                   </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent Sessions Section */}
        <div className="space-y-2 pt-4 border-t border-[#1e293b]">
          <h3 className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-3 px-1">Recent Sessions</h3>
          {sessions.length === 0 ? (
            <div className="text-center text-[#475569] text-xs py-4 px-4">
              <FileText size={24} className="mx-auto mb-2 opacity-50" />
              No history yet.
            </div>
          ) : (
            sessions.map((session) => (
              <HistoryItem
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                onClick={() => loadSession(session.id)}
                onDelete={(e) => { e.stopPropagation(); deleteSession(session.id); }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
