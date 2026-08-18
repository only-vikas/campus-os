import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play } from 'lucide-react';
import { useCodeGuardStore } from '@/stores/useCodeGuardStore';
import { analyzeCode } from '@/services/codeReviewService';

export default function CodeEditor() {
  const { 
    currentCode, 
    setCurrentCode, 
    setOriginalCode,
    language, 
    isAnalyzing,
    setIsAnalyzing,
    setAnalysisResult
  } = useCodeGuardStore();
  
  const [progressMsg, setProgressMsg] = useState('');

  const handleAnalyze = async () => {
    // 1. Validation
    const { validateCode, handleAPIError } = await import('@/services/codeReviewService');
    const validation = validateCode(currentCode, language);
    
    if (!validation.valid) {
      useCodeGuardStore.getState().setError(validation.message);
      return;
    }
    
    // Clear previous errors
    useCodeGuardStore.getState().setError(null);
    useCodeGuardStore.getState().setWarning(validation.warning || null);

    setIsAnalyzing(true);
    setAnalysisResult(null);
    setOriginalCode(currentCode); // Snapshot before analysis
    
    // If there's a warning (language mismatch), we can wait a bit to show it
    if (validation.warning) {
      setProgressMsg('Language mismatch detected. Proceeding...');
      await new Promise(r => setTimeout(r, 1000));
    }
    
    // Use detected language or fallback
    const targetLang = validation.detectedLanguage || language;
    
    try {
      const result = await analyzeCode(currentCode, targetLang, (msg) => setProgressMsg(msg));
      setAnalysisResult(result);
      
      useCodeGuardStore.getState().addToHistory({
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        code: currentCode,
        language: targetLang,
        result: result
      });
    } catch (err: any) {
      useCodeGuardStore.getState().setError(handleAPIError(err));
    } finally {
      setIsAnalyzing(false);
      setProgressMsg('');
    }
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Editor */}
      <div className="flex-1 min-h-0 w-full relative">
        <Editor
          height="100%"
          width="100%"
          language={language}
          theme="vs-dark"
          value={currentCode}
          onChange={(val) => setCurrentCode(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 16 },
            scrollBeyondLastLine: false,
            wordWrap: 'on'
          }}
        />
      </div>

      {/* Action Footer */}
      <div className="flex-shrink-0 flex items-center justify-end gap-3 p-3 border-t border-slate-700/50 bg-slate-800/50">
        {isAnalyzing && (
          <span className="text-amber-400 font-medium text-sm animate-pulse mr-2">
            {progressMsg || 'Analyzing...'}
          </span>
        )}
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !currentCode.trim()}
          className="flex items-center space-x-2 px-6 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-semibold rounded-lg transition-colors"
        >
          <Play size={18} fill="currentColor" />
          <span>{isAnalyzing ? 'Analyzing...' : 'Analyze Code'}</span>
        </button>
      </div>
    </div>
  );
}
