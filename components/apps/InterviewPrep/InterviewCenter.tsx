'use client';
// ============================================================
// Interview Prep — Interview Center (Main Column)
// AI avatar, question display, answer input, chat history
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, StopCircle, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { useInterview } from '@/hooks/useInterview';
import VoiceControls from './VoiceControls';
import { startAudioAnalyzer, stopAudioAnalyzer } from '@/services/voiceService';

export default function InterviewCenter() {
  const {
    status, currentQuestion, currentAnswer, questionHistory,
    questionNumber, totalQuestions, isGenerating, isEvaluating,
    aiStatus, voiceEnabled, ttsEnabled, difficulty,
    setCurrentAnswer, toggleVoice, toggleTTS,
    askNextQuestion, submitAnswer, finishInterview,
    fetchResume, startVoiceInput, stopVoiceInput,
  } = useInterview();

  const [isRecording, setIsRecording] = useState(false);
  const [showTextInput, setShowTextInput] = useState(true);
  const [typewriterText, setTypewriterText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Fetch resume on mount & generate first question
  useEffect(() => {
    fetchResume();
    if (status === 'ready') {
      askNextQuestion();
    }
  }, []);

  // Typewriter effect for new questions
  useEffect(() => {
    if (!currentQuestion) return;
    setTypewriterText('');
    let i = 0;
    const interval = setInterval(() => {
      setTypewriterText(currentQuestion.slice(0, i + 1));
      i++;
      if (i >= currentQuestion.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [currentQuestion]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [questionHistory, currentQuestion]);

  // Voice recording toggle
  const handleVoiceToggle = async () => {
    if (isRecording) {
      stopVoiceInput();
      stopAudioAnalyzer();
      setIsRecording(false);
    } else {
      toggleVoice();
      await startAudioAnalyzer();
      startVoiceInput();
      setIsRecording(true);
      setShowTextInput(false);
    }
  };

  const handleSubmit = () => {
    if (!currentAnswer.trim()) return;
    if (isRecording) {
      stopVoiceInput();
      stopAudioAnalyzer();
      setIsRecording(false);
    }
    submitAnswer();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e293b]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#60a5fa] to-[#a78bfa] flex items-center justify-center">
            <Bot size={14} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#e2e8f0]">AI Interviewer</p>
            <p className="text-[10px] text-[#64748b]">
              Q{questionNumber}/{totalQuestions} · Difficulty {difficulty}/10
            </p>
          </div>
        </div>
        {aiStatus && (
          <span className="text-[10px] text-[#94a3b8] flex items-center gap-1">
            <Loader2 size={10} className="animate-spin" /> {aiStatus}
          </span>
        )}
        <button
          onClick={finishInterview}
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-colors"
        >
          <StopCircle size={12} /> End
        </button>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
        {/* Past Q&A pairs */}
        {questionHistory.map((pair, i) => (
          <div key={i} className="space-y-2">
            {/* AI question bubble */}
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-[#60a5fa]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={12} className="text-[#60a5fa]" />
              </div>
              <div className="bg-[#1e293b]/60 rounded-xl rounded-tl-none px-3 py-2 max-w-[85%]">
                <p className="text-sm text-[#e2e8f0]">{pair.question}</p>
              </div>
            </div>
            {/* User answer bubble */}
            <div className="flex items-start gap-2 justify-end">
              <div className="bg-[#60a5fa]/10 border border-[#60a5fa]/20 rounded-xl rounded-tr-none px-3 py-2 max-w-[85%]">
                <p className="text-sm text-[#e2e8f0]">{pair.answer}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-semibold ${
                    pair.score >= 70 ? 'text-[#34d399]' :
                    pair.score >= 40 ? 'text-[#fbbf24]' :
                    'text-[#f87171]'
                  }`}>
                    {pair.score}/100
                  </span>
                  <span className="text-[10px] text-[#64748b]">{pair.feedback}</span>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#a78bfa]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={12} className="text-[#a78bfa]" />
              </div>
            </div>
          </div>
        ))}

        {/* Current AI question (with typewriter) */}
        {currentQuestion && status !== 'completed' && (
          <div className="flex items-start gap-2">
            <motion.div
              className="w-6 h-6 rounded-full bg-[#60a5fa]/20 flex items-center justify-center flex-shrink-0 mt-0.5"
              animate={isGenerating ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Bot size={12} className="text-[#60a5fa]" />
            </motion.div>
            <div className="bg-[#1e293b]/60 rounded-xl rounded-tl-none px-3 py-2 max-w-[85%]">
              <p className="text-sm text-[#e2e8f0]">{typewriterText}<span className="animate-pulse">|</span></p>
            </div>
          </div>
        )}

        {/* Generating indicator */}
        {isGenerating && !currentQuestion && (
          <div className="flex items-start gap-2">
            <motion.div
              className="w-6 h-6 rounded-full bg-[#60a5fa]/20 flex items-center justify-center flex-shrink-0"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <Bot size={12} className="text-[#60a5fa]" />
            </motion.div>
            <div className="bg-[#1e293b]/60 rounded-xl rounded-tl-none px-3 py-2">
              <div className="flex items-center gap-2">
                <Sparkles size={12} className="text-[#60a5fa] animate-pulse" />
                <span className="text-xs text-[#64748b]">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Evaluating indicator */}
        {isEvaluating && (
          <div className="flex justify-center py-2">
            <span className="text-xs text-[#94a3b8] flex items-center gap-1.5">
              <Loader2 size={12} className="animate-spin" /> Evaluating your answer...
            </span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      {status !== 'completed' && (
        <div className="px-4 py-3 border-t border-[#1e293b]">
          {/* Voice controls */}
          <div className="flex items-center justify-between mb-2">
            <VoiceControls
              voiceEnabled={voiceEnabled}
              ttsEnabled={ttsEnabled}
              isRecording={isRecording}
              onToggleVoice={handleVoiceToggle}
              onToggleTTS={toggleTTS}
              onToggleTextMode={() => setShowTextInput(true)}
            />
          </div>

          {/* Text input */}
          <AnimatePresence>
            {(showTextInput || !voiceEnabled) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-2"
              >
                <textarea
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your answer... (Enter to submit, Shift+Enter for new line)"
                  disabled={isGenerating || isEvaluating}
                  rows={2}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#1e293b]/60 border border-[#334155] text-sm text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#60a5fa] resize-none disabled:opacity-50 transition-colors"
                />
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleSubmit}
                  disabled={!currentAnswer.trim() || isGenerating || isEvaluating}
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#60a5fa] to-[#a78bfa] flex items-center justify-center text-white disabled:opacity-40 self-end transition-opacity"
                >
                  <Send size={16} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
