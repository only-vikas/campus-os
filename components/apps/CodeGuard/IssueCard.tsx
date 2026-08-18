import React, { useState } from 'react';
import { AlertTriangle, Bug, Zap, Activity, CheckCircle, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { useCodeGuardStore } from '@/stores/useCodeGuardStore';
import confetti from 'canvas-confetti';

interface IssueCardProps {
  issue: {
    line: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
    category: 'bug' | 'security' | 'performance' | 'smell' | 'practice';
    title: string;
    description: string;
    fix: string;
    explanation: string;
  };
}

export default function IssueCard({ issue }: IssueCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { applyFix, appliedFixes } = useCodeGuardStore();
  
  const isApplied = appliedFixes.includes(issue.line);

  const severityConfig = {
    critical: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
    high: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
    medium: { color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
    low: { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug': return <Bug size={16} />;
      case 'security': return <AlertTriangle size={16} />;
      case 'performance': return <Zap size={16} />;
      case 'smell': return <Activity size={16} />;
      case 'practice': return <CheckCircle size={16} />;
      default: return <Bug size={16} />;
    }
  };

  const config = severityConfig[issue.severity] || severityConfig.medium;

  const handleApplyFix = (e: React.MouseEvent) => {
    e.stopPropagation();
    applyFix(issue.line, issue.fix);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  return (
    <div className={`bg-slate-800/80 backdrop-blur-md rounded-xl border ${config.border} overflow-hidden transition-all ${isApplied ? 'opacity-50 grayscale' : ''}`}>
      <div 
        className="p-4 flex items-start justify-between cursor-pointer hover:bg-slate-700/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex space-x-3 items-start">
          <div className={`mt-0.5 ${config.color}`}>
            {getCategoryIcon(issue.category)}
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-md ${config.bg} ${config.color}`}>
                {issue.severity}
              </span>
              <span className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md">Line {issue.line}</span>
            </div>
            <h4 className={`font-semibold text-slate-200 ${isApplied ? 'line-through text-slate-400' : ''}`}>
              {issue.title}
            </h4>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-200 ml-2">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-700/50 space-y-4">
          <p className="text-sm text-slate-300">{issue.description}</p>
          
          {issue.explanation && (
            <div className="bg-slate-900/50 p-3 rounded-lg text-sm text-slate-300 border border-slate-700">
              <strong>Why it matters: </strong> {issue.explanation}
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button 
              onClick={handleApplyFix}
              disabled={isApplied}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-colors text-center border ${
                isApplied 
                  ? 'bg-slate-700 text-slate-500 border-slate-600 cursor-not-allowed' 
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border-amber-500/50'
              }`}
            >
              {isApplied ? 'Fix Applied' : 'Apply Fix'}
            </button>
            <button 
              disabled
              className="flex-1 flex items-center justify-center space-x-2 bg-slate-700 text-slate-500 cursor-not-allowed py-2 px-3 rounded-lg text-sm font-semibold border border-slate-600"
            >
              <BookOpen size={16} />
              <span>Learning Engine (Phase 2)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
