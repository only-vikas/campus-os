import React, { useRef } from 'react';
import CodeEditor from './CodeEditor';
import AnalysisPanel from './AnalysisPanel';
import DiffViewer from './DiffViewer';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useCodeGuardStore } from '@/stores/useCodeGuardStore';
import { ShieldAlert, Upload } from 'lucide-react';

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
  { id: 'go', name: 'Go' },
  { id: 'rust', name: 'Rust' },
];

export default function CodeGuard() {
  const { viewMode, language, setLanguage, setCurrentCode, setOriginalCode } = useCodeGuardStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCurrentCode(content);
        setOriginalCode(content);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-full w-full bg-slate-900/95 text-slate-100 font-sans overflow-y-auto custom-scrollbar">
      <div className="flex flex-col h-full min-h-[650px] w-full min-w-[900px]">
        {/* Header / Toolbar - fixed height */}
        <div className="flex-shrink-0 flex items-center justify-between p-3 border-b border-slate-700/50 bg-slate-800">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-amber-400 space-x-2">
              <ShieldAlert size={20} />
              <span className="font-bold text-lg hidden sm:inline">CodeGuard</span>
            </div>
            
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.id} value={lang.id}>{lang.name}</option>
              ))}
            </select>
          </div>

          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".js,.ts,.py,.java,.cpp,.cc,.go,.rs,.txt"
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition-colors text-sm"
            >
              <Upload size={16} />
              <span>Upload File</span>
            </button>
          </div>
        </div>

        {/* Main 60/40 split */}
        <div className="flex-1 min-h-0 flex gap-4 p-4 overflow-hidden">
          {/* Left Column - 60% Width */}
          <div className="w-3/5 h-full flex flex-col bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
            <ErrorBoundary>
              {viewMode === 'diff' ? <DiffViewer /> : <CodeEditor />}
            </ErrorBoundary>
          </div>

          {/* Right Column - 40% Width */}
          <div className="w-2/5 h-full overflow-y-auto pr-2 custom-scrollbar">
            <ErrorBoundary>
              <AnalysisPanel />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </div>
  );
}
