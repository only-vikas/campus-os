'use client';
// ============================================================
// Interview Prep — Setup Screen (Multi-Step Wizard)
// Step 1: Interview Type
// Step 2: Job Description + Resume (paste or file upload)
// Step 3: Mode (Speech / Writing) + Interviewer Persona
// ============================================================
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, Code2, Users, Brain, Zap, Building2, ArrowRight,
  ArrowLeft, Server, Cloud, RefreshCw, Sparkles,
  FileText, Upload, Keyboard, CheckCircle2, ClipboardPaste, X
} from 'lucide-react';
import { useInterviewStore, InterviewType, InterviewMode, InterviewerPersona } from '@/stores/useInterviewStore';
import { useOllamaStatus } from '@/hooks/useOllamaStatus';
import AvatarPicker from './AvatarPicker';

// ---- PDF/DOCX parser helpers ----
async function extractTextFromFile(file: File): Promise<string> {
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    // Use pdfjs-dist (already installed)
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(' ') + '\n';
    }
    return text.trim();
  } else if (file.name.endsWith('.docx') || file.type.includes('wordprocessingml')) {
    // Use mammoth (already installed)
    const mammoth = await import('mammoth');
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    return result.value.trim();
  } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
    return await file.text();
  }
  throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT.');
}

// ---- Interview Type cards ----
const INTERVIEW_TYPES: { type: InterviewType; label: string; desc: string; icon: React.ReactNode; color: string }[] = [
  { type: 'technical', label: 'Technical', desc: 'DSA, system design, coding concepts', icon: <Code2 size={22} />, color: '#60a5fa' },
  { type: 'behavioral', label: 'Behavioral', desc: 'Leadership, teamwork, situational Qs', icon: <Users size={22} />, color: '#a78bfa' },
  { type: 'resume', label: 'Resume Deep-Dive', desc: 'Deep questions from your projects & experience', icon: <Brain size={22} />, color: '#34d399' },
  { type: 'stress', label: 'Stress Test', desc: 'Rapid-fire with time pressure', icon: <Zap size={22} />, color: '#f472b6' },
];

// ---- Document Upload sub-component ----
function DocUpload({
  label, required, value, onText, placeholder
}: {
  label: string; required?: boolean; value: string; onText: (t: string) => void; placeholder: string;
}) {
  const [mode, setMode] = useState<'paste' | 'upload'>('paste');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const text = await extractTextFromFile(file);
      onText(text);
    } catch (err: any) {
      setError(err.message || 'Failed to read file');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="rounded-xl bg-[#0f172a]/80 border border-[#1e293b] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-[#60a5fa]" />
          <span className="text-xs font-semibold text-[#e2e8f0]">{label}</span>
          {required && <span className="text-[10px] text-red-400">Required</span>}
          {value && <CheckCircle2 size={12} className="text-[#34d399]" />}
        </div>
        {/* Mode toggle */}
        <div className="flex rounded-lg bg-[#1e293b] p-0.5 text-[10px]">
          <button
            onClick={() => setMode('paste')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${mode === 'paste' ? 'bg-[#334155] text-[#e2e8f0]' : 'text-[#64748b]'}`}
          >
            <ClipboardPaste size={10} /> Paste
          </button>
          <button
            onClick={() => setMode('upload')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${mode === 'upload' ? 'bg-[#334155] text-[#e2e8f0]' : 'text-[#64748b]'}`}
          >
            <Upload size={10} /> Upload
          </button>
        </div>
      </div>

      {mode === 'paste' ? (
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onText(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full px-3 py-2 rounded-lg bg-[#1e293b] border border-[#334155] text-xs text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#60a5fa] resize-none transition-colors"
          />
          {value && (
            <button onClick={() => onText('')} className="absolute top-2 right-2 text-[#475569] hover:text-[#94a3b8]">
              <X size={12} />
            </button>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-[#334155] rounded-lg p-6 text-center cursor-pointer hover:border-[#60a5fa] hover:bg-[#60a5fa]/5 transition-all"
        >
          {uploading ? (
            <p className="text-xs text-[#60a5fa] animate-pulse">Extracting text...</p>
          ) : value ? (
            <div>
              <CheckCircle2 size={20} className="text-[#34d399] mx-auto mb-1" />
              <p className="text-xs text-[#34d399] font-medium">File loaded</p>
              <p className="text-[10px] text-[#64748b]">{value.length} characters extracted</p>
            </div>
          ) : (
            <>
              <Upload size={20} className="text-[#475569] mx-auto mb-2" />
              <p className="text-xs text-[#94a3b8]">Click to upload</p>
              <p className="text-[10px] text-[#475569] mt-1">PDF, DOCX, or TXT</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={handleFile}
            className="hidden"
          />
        </div>
      )}
      {error && <p className="text-[10px] text-red-400 mt-1">{error}</p>}
    </div>
  );
}

// ---- Step indicators ----
function StepBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
            i < current ? 'bg-[#60a5fa] text-white' :
            i === current ? 'bg-[#1e293b] border-2 border-[#60a5fa] text-[#60a5fa]' :
            'bg-[#1e293b] text-[#475569]'
          }`}>
            {i < current ? <CheckCircle2 size={12} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div className={`h-0.5 w-8 transition-all ${i < current ? 'bg-[#60a5fa]' : 'bg-[#1e293b]'}`} />
          )}
        </div>
      ))}
      <span className="text-[10px] text-[#475569] ml-2">
        {['Choose Type', 'Documents', 'Mode & Interviewer'][current]}
      </span>
    </div>
  );
}

// ---- Main SetupScreen ----
export default function SetupScreen() {
  const [step, setStep] = useState(0);
  const [selectedType, setSelectedType] = useState<InterviewType | null>(null);
  const [company, setCompany] = useState('');
  const [jdTextLocal, setJdTextLocal] = useState('');
  const [resumeTextLocal, setResumeTextLocal] = useState('');
  const [selectedMode, setSelectedMode] = useState<InterviewMode>('speech');
  const [selectedPersona, setSelectedPersona] = useState<InterviewerPersona>('alex');

  const {
    startInterview, setJdText, setResumeText,
    setInterviewMode, setInterviewerPersona
  } = useInterviewStore();
  const ollamaStatus = useOllamaStatus();

  const canProceedStep0 = !!selectedType;
  const canProceedStep1 = true; // JD and resume are optional but strongly encouraged
  const canStart = !!selectedType;

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleStart = () => {
    if (!selectedType) return;
    setJdText(jdTextLocal);
    setResumeText(resumeTextLocal);
    setInterviewMode(selectedMode);
    setInterviewerPersona(selectedPersona);
    startInterview(selectedType, company || undefined);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col items-center min-h-full p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[#60a5fa] to-[#a78bfa] mb-3">
            <Mic className="text-white" size={22} />
          </div>
          <h1 className="text-xl font-bold text-[#e2e8f0]">AI Mock Interview</h1>
          <p className="text-[#94a3b8] text-xs mt-1 max-w-md">
            Practice with an AI interviewer that adapts to your resume and job description.
          </p>
          {/* AI Status */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border mt-2 ${
            ollamaStatus === 'connected' ? 'bg-[#34d399]/10 text-[#34d399] border-[#34d399]/20' :
            ollamaStatus === 'disconnected' ? 'bg-[#fbbf24]/10 text-[#fbbf24] border-[#fbbf24]/20' :
            'bg-[#94a3b8]/10 text-[#94a3b8] border-[#94a3b8]/20'
          }`}>
            {ollamaStatus === 'connected' ? <><Server size={10} /> Local AI Ready</> :
             ollamaStatus === 'disconnected' ? <><Cloud size={10} /> Cloud AI Active</> :
             <><RefreshCw size={10} className="animate-spin" /> Checking AI...</>}
          </div>
        </motion.div>

        {/* Step bar */}
        <StepBar current={step} total={3} />

        {/* Step content */}
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait">

            {/* ---- STEP 0: Interview Type ---- */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {INTERVIEW_TYPES.map((item, i) => (
                    <motion.button
                      key={item.type}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: i * 0.07 } }}
                      onClick={() => setSelectedType(item.type)}
                      className={`relative p-5 rounded-2xl border text-left transition-all duration-200 ${
                        selectedType === item.type
                          ? 'border-[var(--sel)] bg-[var(--sel)]/10 shadow-lg'
                          : 'border-[#1e293b] bg-[#0f172a]/60 hover:border-[#334155] hover:bg-[#1e293b]/40'
                      }`}
                      style={{ '--sel': item.color } as React.CSSProperties}
                    >
                      <div className="flex items-center gap-2 mb-2" style={{ color: item.color }}>
                        {item.icon}
                        <span className="font-semibold text-sm text-[#e2e8f0]">{item.label}</span>
                      </div>
                      <p className="text-xs text-[#64748b] leading-relaxed">{item.desc}</p>
                      {selectedType === item.type && (
                        <motion.div layoutId="sel-ring" className="absolute inset-0 rounded-2xl border-2" style={{ borderColor: item.color }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Company */}
                <div className="relative mb-5">
                  <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Target company (optional) — e.g. Google, Startup..."
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-[#1e293b]/60 border border-[#334155] text-sm text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#60a5fa] transition-colors"
                  />
                </div>

                <button onClick={handleNext} disabled={!canProceedStep0} className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm ${canProceedStep0 ? 'bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] text-white hover:scale-[1.01]' : 'bg-[#1e293b] text-[#475569] cursor-not-allowed'} transition-all`}>
                  Next: Upload Documents <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {/* ---- STEP 1: Documents ---- */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <p className="text-xs text-[#94a3b8] text-center mb-4">
                  Upload your resume and the job description. The AI will tailor every question to the overlap between them.
                </p>
                <DocUpload
                  label="Job Description"
                  value={jdTextLocal}
                  onText={setJdTextLocal}
                  placeholder="Paste the job description here..."
                />
                <DocUpload
                  label="Your Resume"
                  value={resumeTextLocal}
                  onText={setResumeTextLocal}
                  placeholder="Paste your resume text here..."
                />
                {(!jdTextLocal || !resumeTextLocal) && (
                  <p className="text-[10px] text-[#64748b] text-center">
                    💡 Adding both files gives 10× better, personalized questions. You can skip for generic practice.
                  </p>
                )}
                <div className="flex gap-3 mt-4">
                  <button onClick={handleBack} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1e293b] text-[#94a3b8] text-sm font-medium hover:bg-[#334155] transition-colors">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button onClick={handleNext} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] text-white text-sm font-semibold hover:scale-[1.01] transition-all">
                    Next: Choose Mode <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ---- STEP 2: Mode + Persona ---- */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">

                {/* Mode selector */}
                <div>
                  <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Interview Mode</p>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedMode('speech')}
                      className={`p-4 rounded-2xl border text-left transition-all ${selectedMode === 'speech' ? 'border-[#60a5fa] bg-[#60a5fa]/10' : 'border-[#1e293b] bg-[#0f172a]/60 hover:border-[#334155]'}`}
                    >
                      <Mic size={20} className={`mb-2 ${selectedMode === 'speech' ? 'text-[#60a5fa]' : 'text-[#475569]'}`} />
                      <p className="text-sm font-semibold text-[#e2e8f0]">Speech Mode</p>
                      <p className="text-[10px] text-[#64748b] mt-1 leading-relaxed">AI speaks questions. Answer by voice or type. Most realistic experience.</p>
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setSelectedMode('writing')}
                      className={`p-4 rounded-2xl border text-left transition-all ${selectedMode === 'writing' ? 'border-[#a78bfa] bg-[#a78bfa]/10' : 'border-[#1e293b] bg-[#0f172a]/60 hover:border-[#334155]'}`}
                    >
                      <Keyboard size={20} className={`mb-2 ${selectedMode === 'writing' ? 'text-[#a78bfa]' : 'text-[#475569]'}`} />
                      <p className="text-sm font-semibold text-[#e2e8f0]">Writing Mode</p>
                      <p className="text-[10px] text-[#64748b] mt-1 leading-relaxed">Questions appear as text. Strictly text-only responses. No voice.</p>
                    </motion.button>
                  </div>
                </div>

                {/* Persona selector */}
                <div>
                  <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Choose Your Interviewer</p>
                  <AvatarPicker selected={selectedPersona} onSelect={setSelectedPersona} />
                </div>

                <div className="flex gap-3">
                  <button onClick={handleBack} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1e293b] text-[#94a3b8] text-sm font-medium hover:bg-[#334155] transition-colors">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleStart}
                    disabled={!canStart}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm ${canStart ? 'bg-gradient-to-r from-[#60a5fa] to-[#a78bfa] text-white shadow-lg shadow-[#60a5fa]/20 hover:scale-[1.01]' : 'bg-[#1e293b] text-[#475569] cursor-not-allowed'} transition-all`}
                  >
                    <Sparkles size={16} /> Start Interview <ArrowRight size={16} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
