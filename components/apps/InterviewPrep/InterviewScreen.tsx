'use client';
// ============================================================
// Interview Prep — Interview Screen (3-Column Live Layout)
// Left: Resume | Center: Q&A Chat | Right: Feedback
// ============================================================
import ResumeSummary from './ResumeSummary';
import InterviewCenter from './InterviewCenter';
import FeedbackPanel from './FeedbackPanel';

export default function InterviewScreen() {
  return (
    <div className="h-full flex">
      {/* Left: Resume Summary — 20% */}
      <div className="w-[20%] min-w-[180px] border-r border-[#1e293b] bg-[#0a0f1e]/50">
        <ResumeSummary />
      </div>

      {/* Center: Interview Chat — 55% */}
      <div className="flex-1 min-w-0 bg-[#0a0f1e]">
        <InterviewCenter />
      </div>

      {/* Right: Feedback Panel — 25% */}
      <div className="w-[25%] min-w-[200px] border-l border-[#1e293b] bg-[#0a0f1e]/50">
        <FeedbackPanel />
      </div>
    </div>
  );
}
