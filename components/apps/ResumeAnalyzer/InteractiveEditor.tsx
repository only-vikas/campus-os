import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useResumeAnalyzerStore } from '@/stores/useResumeAnalyzerStore';
import { enhanceBullet } from '@/services/aiService';
import { Wand2, Download, Check, X } from 'lucide-react';
import { exportToDocx, exportToPdf } from '@/services/exportUtils';

export default function InteractiveEditor() {
  const { activeSessionId, sessions, resumes, activeResumeId, updateActiveResumeText } = useResumeAnalyzerStore();
  const session = sessions.find(s => s.id === activeSessionId);
  const activeResume = resumes.find(r => r.id === activeResumeId);
  const text = activeResume?.text || session?.resumeText || '';
  
  const [editingBullet, setEditingBullet] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  if (!session || !session.analysis) return null;
  const analysis = session.analysis;

  // Split text by lines to render as separate blocks
  const lines = text.split('\n').filter(line => line.trim().length > 0);

  const handleEnhance = async (line: string) => {
    if (isEnhancing) return;
    setIsEnhancing(true);
    setEditingBullet(line);
    
    try {
      const missingKeys = analysis.missingSkills.map(s => s.skill).slice(0, 3);
      const enhanced = await enhanceBullet(line, missingKeys);
      setAiSuggestion(enhanced);
    } catch (err) {
      setAiSuggestion('Failed to generate suggestion. Please try again.');
    }
    setIsEnhancing(false);
  };

  const applySuggestion = () => {
    if (aiSuggestion && editingBullet) {
      const newText = text.replace(editingBullet, aiSuggestion);
      updateActiveResumeText(newText);
      // Ideally, we'd also trigger a re-analysis here or just let user re-analyze later
    }
    cancelEnhance();
  };

  const cancelEnhance = () => {
    setEditingBullet(null);
    setAiSuggestion(null);
  };

  const handleExportPdf = async () => {
    try {
      await exportToPdf(lines, activeResume?.name || 'Resume');
    } catch (err) {
      console.error("Failed to generate PDF", err);
      alert("Failed to generate PDF. Check console for details.");
    }
  };

  const handleExportDocx = async () => {
    try {
      await exportToDocx(lines, activeResume?.name || 'Resume');
    } catch (err) {
      console.error("Failed to generate DOCX", err);
      alert("Failed to generate DOCX. Check console for details.");
    }
  };

  const handleLineEdit = (idx: number, newText: string) => {
    if (newText !== lines[idx]) {
      const newLines = [...lines];
      newLines[idx] = newText;
      updateActiveResumeText(newLines.join('\n'));
    }
  };

  // Helper to check if a line contains a weak bullet
  const getWeakHighlight = (line: string) => {
    const weakMatch = analysis.weakBullets.find(w => line.includes(w.text) || w.text.includes(line));
    return weakMatch;
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0f1e]">
      <div className="flex justify-between items-center p-4 border-b border-[#1e293b]">
        <h3 className="text-lg font-bold text-[#e2e8f0]">Interactive Editor</h3>
        <div className="flex items-center gap-3">
          <button onClick={handleExportDocx} className="flex items-center gap-2 px-4 py-2 bg-[#1e293b] hover:bg-[#334155] text-white rounded-lg text-sm font-medium transition-colors border border-[#334155]">
            <Download size={16} /> Word (.docx)
          </button>
          <button onClick={handleExportPdf} className="flex items-center gap-2 px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-[#10b981]/20">
            <Download size={16} /> Styled PDF
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 font-serif text-[#e2e8f0] leading-relaxed">
        <div className="max-w-3xl mx-auto bg-white/5 p-10 rounded-xl shadow-2xl">
          {lines.map((line, idx) => {
            const weak = getWeakHighlight(line);
            
            return (
              <motion.div 
                key={idx}
                layout
                whileInView={weak ? { backgroundColor: "rgba(251, 191, 36, 0.15)" } : {}}
                viewport={{ once: false, margin: "-100px" }}
                className={`group relative p-2 -mx-2 rounded transition-colors ${weak ? 'hover:bg-amber-500/20' : 'hover:bg-white/10'}`}
              >
                <p 
                  className="text-sm outline-none focus:bg-white/10 p-1 rounded"
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => handleLineEdit(idx, e.currentTarget.textContent || '')}
                >
                  {line}
                </p>
                
                {/* Enhancement Button on Hover */}
                {line.length > 20 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute top-1/2 -right-12 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 bg-[#60a5fa] text-white rounded-full shadow-lg transition-opacity"
                    onClick={() => handleEnhance(line)}
                  >
                    <Wand2 size={14} />
                  </motion.button>
                )}

                {/* Popover for Enhancement */}
                <AnimatePresence>
                  {editingBullet === line && (
                    <motion.div
                      layoutId="enhancement-popover"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="mt-3 p-4 bg-[#1e293b] border border-[#334155] rounded-xl shadow-xl z-10 relative"
                    >
                      <h4 className="text-xs font-bold text-[#60a5fa] mb-2 uppercase flex items-center gap-2">
                        <Wand2 size={12}/> AI Suggestion
                      </h4>
                      {isEnhancing ? (
                        <div className="flex items-center gap-2 text-sm text-[#94a3b8]">
                          <div className="w-4 h-4 border-2 border-[#60a5fa] border-t-transparent rounded-full animate-spin" /> Generating...
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-[#22c55e] mb-4">{aiSuggestion}</p>
                          <div className="flex gap-2 justify-end">
                            <button onClick={cancelEnhance} className="px-3 py-1.5 rounded bg-transparent hover:bg-white/5 text-[#94a3b8] text-xs flex items-center gap-1 transition-colors">
                              <X size={14}/> Cancel
                            </button>
                            <button onClick={applySuggestion} className="px-3 py-1.5 rounded bg-[#60a5fa] hover:bg-[#3b82f6] text-white text-xs flex items-center gap-1 transition-colors shadow">
                              <Check size={14}/> Apply Fix
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
