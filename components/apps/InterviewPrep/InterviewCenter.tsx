'use client';
// ============================================================
// Interview Prep — Interview Center (Main Column)
// - AI avatar + status animations
// - Internshala-style speech pipeline (silence detection)
// - Speech mode vs Writing mode
// - Change interviewer mid-session
// - Typewriter questions, chat history
// ============================================================
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, StopCircle, Loader2, Bot, User, Sparkles,
  Mic, MicOff, CheckCircle, RotateCcw
} from 'lucide-react';
import { useInterview } from '@/hooks/useInterview';
import { useInterviewStore } from '@/stores/useInterviewStore';
import AvatarDisplay from './AvatarDisplay';
import AvatarPicker from './AvatarPicker';
import Waveform from './Waveform';
import { stopAudioAnalyzer, startAudioAnalyzer, isListening } from '@/services/voiceService';

const SILENCE_COUNTDOWN = 8; // seconds shown to user

export default function InterviewCenter() {
  const {
    status, currentQuestion, currentAnswer, questionHistory,
    questionNumber, totalQuestions, isGenerating, isEvaluating,
    aiStatus, ttsEnabled, difficulty, interviewMode, interviewerPersona,
    setCurrentAnswer, toggleTTS, setInterviewerPersona,
    askNextQuestion, submitAnswer, finishInterview,
    fetchResume, startVoiceInput, stopVoiceInput,
  } = useInterview();

  const [typewriterText, setTypewriterText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showTextInput, setShowTextInput] = useState(interviewMode === 'writing');
  const [silenceCountdown, setSilenceCountdown] = useState<number | null>(null);
  const [showPersonaPicker, setShowPersonaPicker] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch resume on mount + start first question
  useEffect(() => {
    fetchResume();
    if (status === 'ready') {
      askNextQuestion();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    }, 18);
    return () => clearInterval(interval);
  }, [currentQuestion]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [questionHistory, currentQuestion, isGenerating, isEvaluating]);

  // Sync recording state with actual recognition
  useEffect(() => {
    if (status === 'user-speaking' && interviewMode === 'speech') {
      setIsRecording(true);
      // Start silence countdown display at 5s remaining
      let elapsed = 0;
      countdownRef.current = setInterval(() => {
        elapsed++;
        const remaining = SILENCE_COUNTDOWN - elapsed;
        if (remaining <= 3 && remaining > 0) {
          setSilenceCountdown(remaining);
        } else {
          setSilenceCountdown(null);
        }
        if (elapsed >= SILENCE_COUNTDOWN) {
          clearInterval(countdownRef.current!);
          setSilenceCountdown(null);
        }
      }, 1000);
    } else {
      setIsRecording(false);
      setSilenceCountdown(null);
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [status, interviewMode]);

  const handleManualSubmit = () => {
    if (!currentAnswer.trim()) return;
    submitAnswer();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleManualSubmit();
    }
  };

  const handlePersonaChange = (p: any) => {
    setInterviewerPersona(p);
    setShowPersonaPicker(false);
  };

  // Compute AI status label for avatar
  const avatarStatus = isGenerating ? 'ai-speaking' :
                       isEvaluating ? 'evaluating' :
                       status === 'user-speaking' ? 'user-speaking' :
                       status === 'ai-speaking' ? 'ai-speaking' :
                       status;

  return (
    <div className="h-full flex flex-col">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e293b] bg-[#0a0f1e]/80 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#60a5fa] to-[#a78bfa] flex items-center justify-center">
            <Bot size={14} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#e2e8f0]">Interview in Progress</p>
            <p className="text-[10px] text-[#64748b]">
              Q{questionNumber}/{totalQuestions} · Difficulty {difficulty}/10 · {interviewMode === 'speech' ? '🎤 Speech' : '✍️ Writing'} mode
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

      {/* ---- AI Avatar Section ---- */}
      <div className="flex-shrink-0 flex flex-col items-center py-4 border-b border-[#1e293b] bg-gradient-to-b from-[#0a0f1e] to-transparent">
        <AvatarDisplay
          persona={interviewerPersona}
          status={avatarStatus as any}
          size={72}
          onChangePersona={() => setShowPersonaPicker(true)}
        />
        {/* Waveform (only in speech mode while recording) */}
        {isRecording && interviewMode === 'speech' && (
          <div className="mt-2 w-48">
            <Waveform isActive={true} color="#60a5fa" height={24} />
          </div>
        )}
        {/* Silence countdown */}
        <AnimatePresence>
          {silenceCountdown !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-1 text-[10px] text-[#fbbf24] font-medium"
            >
              Auto-submitting in {silenceCountdown}s...
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ---- Chat area ---- */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 scrollbar-thin">
        {/* Past Q&A pairs */}
        {questionHistory.map((pair, i) => (
          <div key={i} className="space-y-2">
            {/* AI question */}
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-[#60a5fa]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot size={12} className="text-[#60a5fa]" />
              </div>
              <div className="bg-[#1e293b]/60 rounded-xl rounded-tl-none px-3 py-2 max-w-[85%]">
                <p className="text-sm text-[#e2e8f0] leading-relaxed">{pair.question}</p>
              </div>
            </div>
            {/* User answer */}
            <div className="flex items-start gap-2 justify-end">
              <div className="bg-[#60a5fa]/10 border border-[#60a5fa]/20 rounded-xl rounded-tr-none px-3 py-2 max-w-[85%]">
                <p className="text-sm text-[#e2e8f0] leading-relaxed">{pair.answer}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`text-[10px] font-semibold ${
                    pair.score >= 70 ? 'text-[#34d399]' :
                    pair.score >= 40 ? 'text-[#fbbf24]' : 'text-[#f87171]'
                  }`}>{pair.score}/100</span>
                  <span className="text-[10px] text-[#64748b]">{pair.feedback}</span>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#a78bfa]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={12} className="text-[#a78bfa]" />
              </div>
            </div>
          </div>
        ))}

        {/* Current question (typewriter) */}
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
              <p className="text-sm text-[#e2e8f0] leading-relaxed">
                {typewriterText}
                {typewriterText.length < currentQuestion.length && (
                  <span className="animate-pulse text-[#60a5fa]">|</span>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Live answer preview (speech mode) */}
        {isRecording && currentAnswer && (
          <div className="flex items-start gap-2 justify-end">
            <div className="bg-[#60a5fa]/5 border border-[#60a5fa]/10 rounded-xl rounded-tr-none px-3 py-2 max-w-[85%] italic">
              <p className="text-sm text-[#94a3b8]">{currentAnswer}<span className="animate-pulse text-[#60a5fa] not-italic">|</span></p>
            </div>
            <div className="w-6 h-6 rounded-full bg-[#a78bfa]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Mic size={12} className="text-[#f87171]" />
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
              <Sparkles size={12} className="text-[#60a5fa]" />
            </motion.div>
            <div className="bg-[#1e293b]/60 rounded-xl rounded-tl-none px-3 py-2">
              <p className="text-xs text-[#64748b]">Composing next question...</p>
            </div>
          </div>
        )}

        {/* Evaluating indicator */}
        {isEvaluating && (
          <div className="flex justify-center py-1">
            <span className="text-[10px] text-[#fbbf24] flex items-center gap-1.5">
              <Loader2 size={10} className="animate-spin" /> AI is evaluating your answer...
            </span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ---- Input area ---- */}
      {status !== 'completed' && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-[#1e293b] bg-[#0a0f1e]/80">
          {/* Speech mode controls */}
          {interviewMode === 'speech' && (
            <div className="flex items-center gap-3 mb-3">
              {/* Mic status */}
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border ${
                isRecording
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : status === 'ai-speaking'
                  ? 'bg-[#60a5fa]/10 border-[#60a5fa]/20 text-[#60a5fa]'
                  : 'bg-[#1e293b] border-[#334155] text-[#64748b]'
              }`}>
                {isRecording ? (
                  <>
                    <motion.div
                      className="w-2 h-2 rounded-full bg-red-400"
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                    />
                    <Mic size={12} /> Listening...
                  </>
                ) : status === 'ai-speaking' ? (
                  <><Bot size={12} /> AI is speaking...</>
                ) : isEvaluating ? (
                  <><Loader2 size={12} className="animate-spin" /> Evaluating...</>
                ) : (
                  <><MicOff size={12} /> Waiting</>
                )}
              </div>

              {/* Done Answering button (shows only when recording) */}
              {isRecording && (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleManualSubmit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#34d399]/10 border border-[#34d399]/30 text-[#34d399] text-xs font-medium hover:bg-[#34d399]/20 transition-colors"
                >
                  <CheckCircle size={12} /> Done Answering
                </motion.button>
              )}

              {/* Type instead toggle */}
              <button
                onClick={() => setShowTextInput((s) => !s)}
                className="ml-auto text-[10px] text-[#475569] hover:text-[#94a3b8] transition-colors"
              >
                {showTextInput ? 'Hide text box' : 'Type instead'}
              </button>
            </div>
          )}

          {/* Text input — always shown in writing mode, toggle in speech mode */}
          <AnimatePresence>
            {(interviewMode === 'writing' || showTextInput) && (
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
                  placeholder={
                    interviewMode === 'speech'
                      ? 'Or type your answer here...'
                      : 'Type your answer... (Enter to submit, Shift+Enter for new line)'
                  }
                  disabled={isGenerating || isEvaluating}
                  rows={interviewMode === 'writing' ? 3 : 2}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#1e293b]/60 border border-[#334155] text-sm text-[#e2e8f0] placeholder-[#475569] focus:outline-none focus:border-[#60a5fa] resize-none disabled:opacity-50 transition-colors"
                />
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleManualSubmit}
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

      {/* ---- Persona Picker Modal ---- */}
      <AnimatePresence>
        {showPersonaPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0a0f1e]/90 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 w-full max-w-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-[#e2e8f0]">Change Interviewer</p>
                <button onClick={() => setShowPersonaPicker(false)} className="text-[#475569] hover:text-[#94a3b8] text-xs">✕ Cancel</button>
              </div>
              <AvatarPicker selected={interviewerPersona} onSelect={handlePersonaChange} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
