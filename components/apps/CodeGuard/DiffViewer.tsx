import React from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';
import { useCodeGuardStore } from '@/stores/useCodeGuardStore';
import { ShieldAlert } from 'lucide-react';

export default function DiffViewer() {
  const { originalCode, currentCode, analysisResult, viewMode, setViewMode, applyAllFixes } = useCodeGuardStore();

  if (viewMode !== 'diff' || !analysisResult?.improvedCode) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 w-full relative">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center shrink-0">
        <div className="flex items-center text-amber-400 space-x-2">
          <ShieldAlert size={20} />
          <h2 className="text-lg font-semibold text-slate-100 hidden sm:inline">Review Changes</h2>
        </div>
        <div className="space-x-3">
          <button 
            onClick={() => setViewMode('editor')}
            className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors border border-slate-600 rounded-lg hover:bg-slate-700"
          >
            Cancel
          </button>
          <button 
            onClick={() => applyAllFixes()}
            className="px-4 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold rounded-lg transition-colors"
          >
            Apply All Fixes
          </button>
        </div>
      </div>
      
      {/* Diff Area */}
      <div className="flex-1 overflow-y-auto bg-slate-900 min-h-0">
        <ReactDiffViewer 
          oldValue={currentCode} 
          newValue={analysisResult.improvedCode} 
          splitView={true}
          useDarkTheme={true}
          hideLineNumbers={false}
        />
      </div>
      
      {/* Footer */}
      <div className="p-4 bg-slate-800 border-t border-slate-700 text-sm text-slate-300 shrink-0">
        <span className="font-semibold text-slate-100">Summary:</span> {analysisResult.summary}
      </div>
    </div>
  );
}
