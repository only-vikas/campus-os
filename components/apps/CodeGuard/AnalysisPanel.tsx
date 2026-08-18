import React from 'react';
import { Bug, CheckCircle, GitCompare } from 'lucide-react';
import { useCodeGuardStore } from '@/stores/useCodeGuardStore';
import IssueCard from './IssueCard';

function ShieldIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
    </svg>
  );
}

export default function AnalysisPanel() {
  const { analysisResult, isAnalyzing, viewMode, setViewMode, error, warning } = useCodeGuardStore();

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
          <span className="text-4xl">🚨</span>
        </div>
        <h3 className="text-xl font-semibold text-red-400">Analysis Failed</h3>
        <p className="text-slate-300 max-w-sm">{error}</p>
        <button 
          onClick={() => useCodeGuardStore.getState().setError(null)}
          className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md transition-colors"
        >
          Dismiss
        </button>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-6">
        <div className="relative w-32 h-32">
          <svg className="animate-spin w-full h-full text-amber-500/20" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" strokeWidth="8" stroke="currentColor" strokeDasharray="70 200" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <ShieldIcon className="w-10 h-10 text-amber-500 animate-pulse" />
          </div>
        </div>
        <p className="text-lg font-medium animate-pulse">Analyzing Code...</p>
        {warning && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-sm max-w-xs text-center">
            {warning}
          </div>
        )}
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center space-y-4">
        <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center">
          <Bug size={40} className="text-slate-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-300">No Analysis Yet</h3>
        <p>Paste your code on the left and click "Analyze Code" to detect bugs, security vulnerabilities, and performance issues.</p>
      </div>
    );
  }

  // Score Dashboard SVG
  const score = analysisResult.overallScore;
  const circumference = 2 * Math.PI * 40; // r=40
  const offset = circumference - (score / 100) * circumference;
  const scoreColor = score >= 90 ? 'text-green-500' : score >= 70 ? 'text-amber-400' : 'text-red-500';

  return (
    <div className="flex flex-col space-y-6 pb-8 relative min-h-full">
      {/* Diff Toggle Floating */}
      {analysisResult.improvedCode && (
        <div className="sticky top-0 z-10 flex justify-end pb-2 bg-slate-900">
          <button
            onClick={() => setViewMode(viewMode === 'diff' ? 'editor' : 'diff')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-md ${
              viewMode === 'diff' ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            <GitCompare size={16} />
            <span>{viewMode === 'diff' ? 'Hide Diff' : 'Show Diff'}</span>
          </button>
        </div>
      )}

      {/* Score Dashboard */}
      <div className="flex items-center justify-between bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-xl p-6 shadow-sm mx-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-1">Analysis Score</h2>
          <p className="text-slate-400 text-sm">Based on {analysisResult.issues.length} detected issues</p>
        </div>
        <div className="relative w-24 h-24 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" strokeWidth="8" className="text-slate-700" stroke="currentColor" />
            <circle 
              cx="50" cy="50" r="40" fill="none" strokeWidth="8" 
              className={`${scoreColor} transition-all duration-1000 ease-out`} 
              stroke="currentColor" 
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-black ${scoreColor}`}>{score}</span>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4 px-1">
        <h3 className="text-lg font-semibold text-slate-200 flex items-center justify-between">
          <span>Detected Issues</span>
          <span className="bg-slate-800 px-2 py-0.5 rounded-md text-sm">{analysisResult.issues.length}</span>
        </h3>
        
        {analysisResult.issues.length === 0 ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-400 flex items-center space-x-3">
            <CheckCircle size={20} />
            <span>Great job! No significant issues found in your code.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {analysisResult.issues.map((issue, idx) => (
              <IssueCard key={`${issue.line}-${idx}`} issue={issue} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
