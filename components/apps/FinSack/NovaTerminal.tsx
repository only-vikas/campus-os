'use client';

// ============================================================
// Campus OS — FinSack Nova Terminal
// AI financial coach chat interface
// Ported from D:\finsack\components\apps\NovaTerminal.tsx
// ============================================================
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Terminal,
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { FinSackChatMessage } from '@/types/finsack';
import { useFinSackStore } from '@/stores/useFinSackStore';

export default function NovaTerminal() {
  const { chatMessages, addChatMessage, clearChat } = useFinSackStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ── Send message ──────────────────────────────────────────────────────
  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg: FinSackChatMessage = {
      role: 'user',
      content: trimmed,
      timestamp: Date.now(),
    };

    addChatMessage(userMsg);
    setInput('');
    setIsLoading(true);

    try {
      const messagesPayload = [
        ...chatMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: trimmed },
      ];

      const res = await fetch('/api/finsack/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesPayload }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: FinSackChatMessage = {
          role: 'assistant',
          content: data.content || "I couldn't generate a response.",
          timestamp: Date.now(),
        };
        addChatMessage(assistantMsg);
      } else {
        addChatMessage({
          role: 'assistant',
          content: '⚠️ Error: Could not reach Nova AI. Please try again.',
          timestamp: Date.now(),
        });
      }
    } catch {
      addChatMessage({
        role: 'assistant',
        content: '⚠️ Network error. Please check your connection.',
        timestamp: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, chatMessages, addChatMessage]);

  // ── Simple markdown-ish renderer ──────────────────────────────────────
  const renderContent = (content: string) => {
    return content.split('\n').map((line, i) => {
      // Bold
      let processed = line.replace(
        /\*\*(.+?)\*\*/g,
        '<strong class="font-semibold text-[#e2e8f0]">$1</strong>'
      );
      // Italic
      processed = processed.replace(
        /\*(.+?)\*/g,
        '<em class="italic text-[#22d3ee]">$1</em>'
      );
      // Inline code
      processed = processed.replace(
        /`(.+?)`/g,
        '<code class="font-mono text-[12px] px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[#a78bfa]">$1</code>'
      );

      if (line.startsWith('# '))
        return (
          <h3 key={i} className="text-[14px] font-bold text-[#10b981] my-1.5">
            {line.replace(/^#+\s*/, '')}
          </h3>
        );
      if (line.startsWith('## '))
        return (
          <h4 key={i} className="text-[13px] font-semibold text-[#e2e8f0] my-1">
            {line.replace(/^#+\s*/, '')}
          </h4>
        );
      if (line.startsWith('- ') || line.startsWith('• '))
        return (
          <p
            key={i}
            className="pl-2.5 text-[#94a3b8]"
            dangerouslySetInnerHTML={{
              __html: '• ' + processed.replace(/^[-•]\s*/, ''),
            }}
          />
        );
      if (line.trim() === '') return <br key={i} />;
      return (
        <p
          key={i}
          className="text-[#94a3b8]"
          dangerouslySetInnerHTML={{ __html: processed }}
        />
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-[rgba(5,5,15,0.7)] font-sans">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]">
        <div className="flex items-center gap-2 text-[13px] font-semibold text-[#e2e8f0]">
          <Terminal size={16} className="text-[#34d399]" />
          <span>Nova Terminal</span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[rgba(52,211,153,0.12)] text-[#34d399]">
            Nemotron 120B
          </span>
        </div>
        <button
          className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-md px-2 py-1.5 text-[#94a3b8] cursor-pointer transition-all hover:text-[#e2e8f0] hover:bg-[rgba(255,255,255,0.08)]"
          onClick={clearChat}
          title="Clear chat"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar" ref={scrollRef}>
        {chatMessages.map((msg, i) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={i}
              className={`flex gap-2.5 animate-[fadeIn_0.3s_ease-out] ${
                isUser ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                  isUser
                    ? 'bg-[rgba(34,211,238,0.1)] border-[rgba(34,211,238,0.2)] text-[#22d3ee]'
                    : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-[#e2e8f0]'
                }`}
              >
                {isUser ? <User size={14} /> : <Bot size={14} className="text-[#34d399]" />}
              </div>
              <div
                className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed border ${
                  isUser
                    ? 'bg-[rgba(34,211,238,0.08)] border-[rgba(34,211,238,0.15)] text-[#e2e8f0]'
                    : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[#94a3b8]'
                }`}
              >
                {renderContent(msg.content)}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 animate-[fadeIn_0.3s_ease-out]">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)]">
              <Bot size={14} className="text-[#34d399]" />
            </div>
            <div className="max-w-[80%] px-3.5 py-2.5 rounded-xl text-[13px] leading-relaxed border bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.08)] text-[#94a3b8] flex items-center gap-2 italic">
              <Sparkles size={14} className="animate-[spin_2s_linear_infinite]" />
              <span>Nova is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2 px-4 py-3 border-t border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)]">
        <input
          ref={inputRef}
          className="flex-1 h-10 px-3.5 border border-[rgba(255,255,255,0.08)] rounded-lg bg-[rgba(255,255,255,0.04)] text-[#e2e8f0] text-[13px] font-sans outline-none transition-colors focus:border-[#34d399] placeholder-[#64748b] disabled:opacity-50"
          placeholder="Ask Nova anything about finance..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          disabled={isLoading}
        />
        <button
          className="w-10 h-10 border border-[rgba(52,211,153,0.3)] rounded-lg bg-[rgba(52,211,153,0.12)] text-[#34d399] flex items-center justify-center cursor-pointer transition-all hover:bg-[rgba(52,211,153,0.2)] hover:border-[rgba(52,211,153,0.5)] disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
        >
          {isLoading ? (
            <Loader2 size={16} className="animate-[spin_1s_linear_infinite]" />
          ) : (
            <Send size={16} />
          )}
        </button>
      </div>
    </div>
  );
}
