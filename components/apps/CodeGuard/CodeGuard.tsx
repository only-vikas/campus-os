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
  const { 
    viewMode, language, setLanguage, setCurrentCode, setOriginalCode,
    activeTab, setActiveTab, history, startNewAnalysis
  } = useCodeGuardStore();
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

          <div className="flex items-center space-x-2">
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
            
            {/* Tabs Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-800/50">
              <div className="flex space-x-2">
                <button 
                  onClick={() => setActiveTab('editor')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'editor' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  💻 Editor
                </button>
                <button 
                  onClick={() => setActiveTab('history')}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'history' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  📜 History ({(history || []).length})
                </button>
              </div>
              <button 
                onClick={startNewAnalysis}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md text-sm transition-colors flex items-center space-x-1"
              >
                <span>+ New</span>
              </button>
            </div>

            <div className="flex-1 min-h-0 relative">
              {activeTab === 'history' ? (
                <HistoryPanel />
              ) : (
                <ErrorBoundary>
                  {viewMode === 'diff' ? <DiffViewer /> : <CodeEditor />}
                </ErrorBoundary>
              )}
            </div>
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

function HistoryPanel() {
  const { history, loadFromHistory, clearHistory } = useCodeGuardStore();

  if ((history || []).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
          <span className="text-3xl">📜</span>
        </div>
        <p>No analysis history yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex justify-end p-2 border-b border-slate-700 bg-slate-800">
        <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-300 px-2 py-1">
          Clear History
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {(history || []).map((entry) => (
          <div 
            key={entry.id} 
            onClick={() => loadFromHistory(entry.id)}
            className="bg-slate-900 border border-slate-700 hover:border-amber-500/50 rounded-lg p-4 cursor-pointer transition-colors group"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-amber-400 font-medium text-sm">{entry.language}</span>
              <span className="text-slate-500 text-xs">{entry.timestamp}</span>
            </div>
            <pre className="text-slate-300 text-xs font-mono bg-slate-950 p-2 rounded overflow-hidden text-ellipsis max-h-16">
              {(entry.code || '').substring(0, 150) + ((entry.code || '').length > 150 ? '...' : '')}
            </pre>
            <div className="mt-3 flex items-center space-x-4 text-xs text-slate-400">
              <span>Score: <strong className={entry.result?.overallScore >= 80 ? 'text-green-400' : 'text-amber-400'}>{entry.result?.overallScore}</strong></span>
              <span>Issues: {entry.result?.issues?.length || 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
