'use client';
// ============================================================
// Campus OS — NovaMind AI Tutor
// Chat with Nova — specialized learning AI with skill context
// ============================================================
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Send, Loader2, Trash2, Sparkles, BookOpen } from 'lucide-react';
import { useNovaMindStore } from '@/stores/useNovaMindStore';
import type { NovaMindChatMessage } from '@/types/novamind';

const SUGGESTED_PROMPTS = [
  'Quiz me on Python closures',
  'Explain how React hooks work',
  'What should I learn next for a full-stack role?',
  'Best resources for System Design?',
  'How do I improve my DSA skills?',
  'Explain async/await with examples',
];

function renderContent(content: string): React.ReactNode[] {
  return content.split('\n').map((line, i) => {
    let html = line
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-[#e2e8f0]">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em class="italic text-[#c084fc]">$1</em>')
      .replace(/`(.+?)`/g, '<code class="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[#a78bfa]">$1</code>');

    if (line.startsWith('## '))
      return <h4 key={i} className="text-[13px] font-bold text-[#a78bfa] mt-2 mb-1">{line.replace(/^#+\s*/, '')}</h4>;
    if (line.startsWith('# '))
      return <h3 key={i} className="text-[14px] font-bold text-[#c084fc] mt-2 mb-1">{line.replace(/^#+\s*/, '')}</h3>;
    if (line.startsWith('- ') || line.startsWith('• '))
      return <p key={i} className="pl-3 text-[#94a3b8] text-[13px] leading-relaxed" dangerouslySetInnerHTML={{ __html: '• ' + html.replace(/^[-•]\s*/, '') }} />;
    if (line.trim() === '') return <br key={i} />;
    return <p key={i} className="text-[#94a3b8] text-[13px] leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />;
  });
}

export default function AITutor() {
  const { tutorMessages, addTutorMessage, clearTutorChat, skillMastery, userProfile } = useNovaMindStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [tutorMessages, isLoading]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const sendMessage = useCallback(async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isLoading) return;

    const userMsg: NovaMindChatMessage = { role: 'user', content, timestamp: Date.now() };
    addTutorMessage(userMsg);
    setInput('');
    setIsLoading(true);

    try {
      // Build context from top known skills
      const topSkills = Object.entries(skillMastery)
        .sort(([, a], [, b]) => b.mastery - a.mastery)
        .slice(0, 5)
        .map(([id, m]) => `${id}: ${m.mastery}%`);

      const res = await fetch('/api/novamind/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...tutorMessages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content },
          ],
          context: { careerGoal: userProfile.careerGoal, topSkills },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        addTutorMessage({ role: 'assistant', content: data.content || 'No response.', timestamp: Date.now() });
      } else {
        addTutorMessage({ role: 'assistant', content: '⚠️ Could not reach Nova AI. Please check your connection.', timestamp: Date.now() });
      }
    } catch {
      addTutorMessage({ role: 'assistant', content: '⚠️ Network error. Is Ollama running locally?', timestamp: Date.now() });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, tutorMessages, addTutorMessage, skillMastery, userProfile]);

  return (
    <div className="flex flex-col h-full bg-[rgba(5,5,15,0.5)]">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-[rgba(51,65,85,0.4)] bg-[rgba(255,255,255,0.02)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[rgba(167,139,250,0.2)] flex items-center justify-center">
            <Bot size={14} className="text-[#a78bfa]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#e2e8f0]">Nova AI Tutor</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
              <p className="text-[10px] text-[#475569]">Nemotron 120B • Skill-aware</p>
            </div>
          </div>
        </div>
        <button
          onClick={clearTutorChat}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(255,255,255,0.04)] border border-[rgba(51,65,85,0.4)] text-[#475569] hover:text-[#e2e8f0] hover:bg-[rgba(255,255,255,0.08)] transition-all"
          title="Clear chat"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <AnimatePresence initial={false}>
          {tutorMessages.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                  isUser
                    ? 'bg-[rgba(167,139,250,0.12)] border-[rgba(167,139,250,0.25)] text-[#a78bfa]'
                    : 'bg-[rgba(255,255,255,0.03)] border-[rgba(51,65,85,0.4)]'
                }`}>
                  {isUser ? <User size={13} /> : <Bot size={13} className="text-[#a78bfa]" />}
                </div>

                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-xl border ${
                  isUser
                    ? 'bg-[rgba(167,139,250,0.08)] border-[rgba(167,139,250,0.2)] text-[#e2e8f0]'
                    : 'bg-[rgba(255,255,255,0.04)] border-[rgba(51,65,85,0.4)]'
                }`}>
                  <div className="space-y-0.5">
                    {renderContent(msg.content)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center border bg-[rgba(255,255,255,0.03)] border-[rgba(51,65,85,0.4)]">
              <Bot size={13} className="text-[#a78bfa]" />
            </div>
            <div className="px-3.5 py-2.5 rounded-xl border bg-[rgba(255,255,255,0.04)] border-[rgba(51,65,85,0.4)] flex items-center gap-2 text-[13px] italic text-[#94a3b8]">
              <Sparkles size={13} className="text-[#a78bfa] animate-pulse" />
              Nova is thinking...
            </div>
          </motion.div>
        )}

        {/* Suggested prompts (only when no conversation yet) */}
        {tutorMessages.length === 1 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
            className="space-y-2"
          >
            <p className="text-[11px] text-[#475569] flex items-center gap-1.5">
              <BookOpen size={11} /> Try asking:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[rgba(167,139,250,0.08)] border border-[rgba(167,139,250,0.2)] text-[#a78bfa] hover:bg-[rgba(167,139,250,0.15)] transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 flex gap-2 px-4 py-3 border-t border-[rgba(51,65,85,0.4)] bg-[rgba(255,255,255,0.02)]">
        <input
          ref={inputRef}
          className="flex-1 h-10 px-4 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(51,65,85,0.4)] text-[#e2e8f0] text-[13px] placeholder-[#475569] outline-none focus:border-[rgba(167,139,250,0.5)] disabled:opacity-50 transition-colors"
          placeholder="Ask Nova anything about your learning journey..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          disabled={isLoading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={isLoading || !input.trim()}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-[rgba(167,139,250,0.15)] border border-[rgba(167,139,250,0.3)] text-[#a78bfa] hover:bg-[rgba(167,139,250,0.25)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
        </button>
      </div>
    </div>
  );
}
