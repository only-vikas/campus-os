import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Briefcase, BarChart2 } from 'lucide-react';
import { useResumeAnalyzerStore } from '@/stores/useResumeAnalyzerStore';
import { analyzeResume } from '@/services/aiService';
import { compareKeywords } from '@/services/keywordExtractor';

const SUGGESTED_JDS = [
  { title: 'Software Engineer', text: 'Looking for a Software Engineer with experience in React, Node.js, and TypeScript. Must have strong problem-solving skills, experience with REST APIs, and a good understanding of Git and CI/CD. 2+ years of experience preferred.' },
  { title: 'Data Analyst', text: 'Data Analyst needed to interpret data and analyze results using statistical techniques. Proficiency in SQL, Python, and Tableau is required. Must be able to present findings to stakeholders.' },
  { title: 'Product Manager', text: 'Product Manager to lead cross-functional teams. Experience in Agile methodologies, writing user stories, and market research. Excellent communication and leadership skills are a must.' }
];

export default function UploadZone() {
  const { addResume, resumes, activeResumeId, setDraftJd, draftJdText, setIsAnalyzing, saveSession, draftKeywordAnalysis, setDraftKeywordAnalysis } = useResumeAnalyzerStore();
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const jdInputRef = useRef<HTMLInputElement>(null);
  
  const [isDraggingResume, setIsDraggingResume] = useState(false);
  const [isDraggingJd, setIsDraggingJd] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [uploadError, setUploadError] = useState('');

  const activeResume = resumes.find(r => r.id === activeResumeId);
  const textToAnalyze = activeResume?.text || resumeText;

  // Update keyword analysis whenever resume or JD changes
  const updateKeywordAnalysis = (res: string, jd: string) => {
    if (res && jd) {
      setDraftKeywordAnalysis(compareKeywords(res, jd));
    } else {
      setDraftKeywordAnalysis(null);
    }
  };

  const parseFile = async (file: File): Promise<string> => {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File too large (Max 5MB).');
    }

    return new Promise((resolve, reject) => {
      const worker = new Worker(new URL('../../../workers/documentParser.worker.ts', import.meta.url));
      worker.postMessage({ file, type: file.type });
      
      worker.onmessage = (e) => {
        if (e.data.success) {
          resolve(e.data.text);
        } else {
          reject(new Error(e.data.error || 'Failed to parse document'));
        }
        worker.terminate();
      };
      
      worker.onerror = (err) => {
        reject(err);
        worker.terminate();
      };
    });
  };

  const handleResumeDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingResume(false);
    const file = e.dataTransfer.files[0];
    if (file) handleResumeFile(file);
  };

  const handleResumeFile = async (file: File) => {
    try {
      setUploadError('');
      const text = await parseFile(file);
      addResume(file.name, text);
      setResumeText(text);
      updateKeywordAnalysis(text, draftJdText);
    } catch (err: any) {
      setUploadError(err.message);
    }
  };

  const handleJdDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingJd(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      try {
        const text = await parseFile(file);
        setDraftJd(text);
        updateKeywordAnalysis(resumeText, text);
      } catch (err: any) {
        setUploadError(err.message);
      }
    }
  };

  const startAnalysis = async () => {
    if (!textToAnalyze || !draftJdText) {
      setUploadError('Please provide both a Resume and a Job Description.');
      return;
    }
    
    setUploadError('');
    setIsAnalyzing(true, 'Initializing AI Analysis...');
    
    try {
      const analysis = await analyzeResume(textToAnalyze, draftJdText, (msg) => {
        setIsAnalyzing(true, msg);
      });
      saveSession(analysis, 'Target Role', 'Unknown Company');
    } catch (err: any) {
      setUploadError(err.message);
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 p-4 md:p-6 overflow-y-auto">
      <div className="flex justify-between items-center mb-2 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-[#e2e8f0]">New Analysis</h2>
          <p className="text-[#94a3b8] text-sm mt-1">Upload your resume and the target job description to get started.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {draftKeywordAnalysis && (
            <div className="bg-[#1e293b]/50 border border-[#334155] rounded-xl px-4 py-2 flex flex-col min-w-[150px]">
               <div className="flex justify-between items-center text-xs text-[#94a3b8] mb-1">
                 <span className="flex items-center gap-1"><BarChart2 size={12}/> Match</span>
                 <span className="font-bold text-[#e2e8f0]">{draftKeywordAnalysis.score}%</span>
               </div>
               <div className="w-full h-1.5 bg-[#0f172a] rounded-full overflow-hidden">
                 <motion.div 
                   initial={{ width: 0 }}
                   animate={{ width: `${draftKeywordAnalysis.score}%` }}
                   className={`h-full ${draftKeywordAnalysis.score > 70 ? 'bg-[#22c55e]' : draftKeywordAnalysis.score > 40 ? 'bg-[#fbbf24]' : 'bg-[#ef4444]'}`}
                 />
               </div>
            </div>
          )}
          
          <motion.button
            whileHover={{ scale: 1.03, textShadow: "0px 0px 8px rgba(96,165,250,0.8)" }}
            whileTap={{ scale: 0.96 }}
            onClick={startAnalysis}
            disabled={!textToAnalyze || !draftJdText}
            className="px-6 py-2 bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(96,165,250,0.3)] hover:shadow-[0_0_25px_rgba(96,165,250,0.5)] transition-shadow whitespace-nowrap"
          >
            Analyze Resume
          </motion.button>
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded-lg text-sm text-center">
          {uploadError}
        </div>
      )}

      <div className="flex flex-1 gap-6 min-h-[250px]">
        {/* Resume Dropzone */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileDrag={{ scale: 1.02, rotate: -1, zIndex: 10 }}
          onDragOver={(e) => { e.preventDefault(); setIsDraggingResume(true); }}
          onDragLeave={() => setIsDraggingResume(false)}
          onDrop={handleResumeDrop}
          onClick={() => resumeInputRef.current?.click()}
          className={`flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            isDraggingResume ? 'border-[#60a5fa] bg-[#60a5fa]/10' : 'border-[#60a5fa]/30 hover:border-[#60a5fa]/60 glass'
          }`}
          style={{ boxShadow: isDraggingResume ? '0px 0px 15px rgba(96,165,250,0.4)' : 'none' }}
        >
          <input type="file" ref={resumeInputRef} onChange={(e) => e.target.files?.[0] && handleResumeFile(e.target.files[0])} className="hidden" accept=".pdf,.doc,.docx,.txt" />
          
          <div className="w-16 h-16 rounded-full bg-[#60a5fa]/20 flex items-center justify-center mb-4 text-[#60a5fa]">
            <FileText size={32} />
          </div>
          <h3 className="text-lg font-semibold text-[#e2e8f0]">Upload Resume</h3>
          <p className="text-[#94a3b8] text-sm mt-2 text-center">Drag & drop your file here, or click to browse.</p>
          <p className="text-[#475569] text-xs mt-1">PDF, DOCX, TXT (Max 5MB)</p>
          
          {activeResumeId && resumes.find(r => r.id === activeResumeId) && (
            <div className="mt-4 px-4 py-2 bg-[#1e293b] rounded-lg text-sm text-[#60a5fa] flex items-center gap-2 max-w-[200px] truncate">
              <FileText size={14} className="shrink-0" /> {resumes.find(r => r.id === activeResumeId)?.name}
            </div>
          )}
        </motion.div>

        {/* JD Dropzone / Input */}
        <div className="flex-1 flex flex-col gap-4">
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileDrag={{ scale: 1.02, rotate: 1, zIndex: 10 }}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingJd(true); }}
            onDragLeave={() => setIsDraggingJd(false)}
            onDrop={handleJdDrop}
            className={`flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-all ${
              isDraggingJd ? 'border-[#a78bfa] bg-[#a78bfa]/10' : 'border-[#a78bfa]/30 glass'
            }`}
          >
            <input type="file" ref={jdInputRef} onChange={(e) => e.target.files?.[0] && parseFile(e.target.files[0]).then(setDraftJd)} className="hidden" accept=".txt,.pdf,.docx" />
            
            <div className="w-12 h-12 rounded-full bg-[#a78bfa]/20 flex items-center justify-center mb-3 text-[#a78bfa]">
              <Briefcase size={24} />
            </div>
            <h3 className="text-base font-semibold text-[#e2e8f0]">Job Description</h3>
            
            <textarea 
              value={draftJdText}
              onChange={(e) => {
                setDraftJd(e.target.value);
                updateKeywordAnalysis(resumeText, e.target.value);
              }}
              placeholder="Paste job description here, or drag & drop a file..."
              className="w-full h-full min-h-[100px] mt-3 p-3 bg-[#0f172a] border border-[#1e293b] rounded-xl text-sm text-[#e2e8f0] resize-none outline-none focus:border-[#a78bfa]/50"
            />
          </motion.div>

          {/* Suggested JDs */}
          <div className="flex gap-2">
            {SUGGESTED_JDS.map((jd, i) => (
              <button
                key={i}
                onClick={() => {
                  setDraftJd(jd.text);
                  updateKeywordAnalysis(resumeText, jd.text);
                }}
                className="flex-1 py-2 glass rounded-lg text-xs text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-[#a78bfa]/20 transition-colors whitespace-nowrap overflow-hidden text-ellipsis px-2"
              >
                {jd.title}
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
