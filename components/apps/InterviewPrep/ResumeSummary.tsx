'use client';
// ============================================================
// Interview Prep — Resume Summary (Left Column)
// Displays parsed resume data from MongoDB
// ============================================================
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Briefcase, GraduationCap, Code2, AlertCircle } from 'lucide-react';
import { useInterviewStore } from '@/stores/useInterviewStore';

export default function ResumeSummary() {
  const resumeData = useInterviewStore((s) => s.resumeData);
  const setResumeData = useInterviewStore((s) => s.setResumeData);

  useEffect(() => {
    if (!resumeData) {
      fetch('/api/resume/latest')
        .then((r) => r.json())
        .then((d) => { if (d.resume) setResumeData(d.resume); })
        .catch(() => {});
    }
  }, [resumeData, setResumeData]);

  if (!resumeData) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <AlertCircle size={32} className="text-[#fbbf24] mb-3" />
        <p className="text-sm text-[#94a3b8] font-medium">No Resume Found</p>
        <p className="text-xs text-[#475569] mt-1">Upload a resume in Resume Analyzer first to get personalized questions.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3 space-y-3 scrollbar-thin">
      {/* Name */}
      <div className="text-center pb-2 border-b border-[#1e293b]">
        <p className="font-bold text-sm text-[#e2e8f0]">{resumeData.name || 'Candidate'}</p>
        <p className="text-xs text-[#475569]">{resumeData.email || ''}</p>
      </div>

      {/* Skills */}
      {resumeData.skills && resumeData.skills.length > 0 && (
        <Section icon={<Code2 size={14} />} title="Skills" color="#60a5fa">
          <div className="flex flex-wrap gap-1">
            {resumeData.skills.slice(0, 12).map((skill: string, i: number) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-[#60a5fa]/10 text-[#60a5fa] border border-[#60a5fa]/20">
                {skill}
              </span>
            ))}
          </div>
        </Section>
      )}

      {/* Experience */}
      {resumeData.experience && resumeData.experience.length > 0 && (
        <Section icon={<Briefcase size={14} />} title="Experience" color="#a78bfa">
          {resumeData.experience.slice(0, 3).map((exp: any, i: number) => (
            <div key={i} className="mb-2 last:mb-0">
              <p className="text-xs font-medium text-[#e2e8f0]">{exp.role || exp.title}</p>
              <p className="text-[10px] text-[#64748b]">{exp.company} · {exp.duration || ''}</p>
            </div>
          ))}
        </Section>
      )}

      {/* Projects */}
      {resumeData.projects && resumeData.projects.length > 0 && (
        <Section icon={<FileText size={14} />} title="Projects" color="#34d399">
          {resumeData.projects.slice(0, 3).map((proj: any, i: number) => (
            <p key={i} className="text-xs text-[#94a3b8] mb-1">• {proj.name || proj}</p>
          ))}
        </Section>
      )}

      {/* Education */}
      {resumeData.education && resumeData.education.length > 0 && (
        <Section icon={<GraduationCap size={14} />} title="Education" color="#fbbf24">
          {resumeData.education.slice(0, 2).map((edu: any, i: number) => (
            <div key={i} className="mb-1 last:mb-0">
              <p className="text-xs font-medium text-[#e2e8f0]">{edu.degree}</p>
              <p className="text-[10px] text-[#64748b]">{edu.institution}</p>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ icon, title, color, children }: { icon: React.ReactNode; title: string; color: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="rounded-xl bg-[#0f172a]/80 border border-[#1e293b] p-3"
    >
      <div className="flex items-center gap-1.5 mb-2" style={{ color }}>
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </motion.div>
  );
}
