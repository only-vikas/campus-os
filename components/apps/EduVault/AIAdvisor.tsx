'use client';

import { useState } from 'react';
import { useEduVaultStore } from '@/stores/useEduVaultStore';
import { generateFinancialSummary, checkAnomalies, askFinancialQuestion } from '@/services/financeService';
import { Sparkles, Bot, AlertTriangle, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIAdvisor() {
  const { transactions } = useEduVaultStore();
  const [summary, setSummary] = useState('');
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const handleAnalyze = async () => {
    setIsLoading(true);
    try {
      // 1. Get summary
      const sum = await generateFinancialSummary(transactions, setStatus);
      setSummary(sum);
      
      // 2. Get anomalies
      const anoms = await checkAnomalies(transactions, setStatus);
      setAnomalies(anoms);
    } catch (error) {
      console.error(error);
      setStatus('Failed to generate insights.');
    } finally {
      setIsLoading(false);
      setStatus('');
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const question = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', content: question }]);
    setIsChatLoading(true);

    try {
      const answer = await askFinancialQuestion(question);
      setChatHistory(prev => [...prev, { role: 'ai', content: answer }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', content: 'Sorry, I am having trouble connecting to the AI engine right now.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col md:flex-row gap-6">
      
      {/* Left: Automated Insights */}
      <div className="w-full md:w-1/2 flex flex-col gap-4">
        <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#f8fafc] flex items-center gap-2">
              <Sparkles className="text-[#34d399]" size={20} /> Smart Insights
            </h3>
            <button 
              onClick={handleAnalyze}
              disabled={isLoading || transactions.length === 0}
              className="px-4 py-2 bg-[#34d399]/20 text-[#34d399] rounded-lg text-sm font-medium hover:bg-[#34d399]/30 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Analyze Now'}
            </button>
          </div>
          
          {status && <p className="text-xs text-[#64748b] mb-4">{status}</p>}

          {!summary && !isLoading && (
            <p className="text-sm text-[#94a3b8] italic">Click "Analyze Now" to get AI-powered insights on your spending habits.</p>
          )}

          {summary && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#1e293b]/50 p-4 rounded-xl border border-[#334155]/50 mb-4">
              <p className="text-sm text-[#e2e8f0] leading-relaxed whitespace-pre-wrap">{summary}</p>
            </motion.div>
          )}

          {anomalies.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h4 className="text-sm font-semibold text-[#f8fafc] mb-3 flex items-center gap-2">
                <AlertTriangle className="text-[#fbbf24]" size={16} /> Anomalies Detected
              </h4>
              <div className="space-y-2">
                {anomalies.map((a, i) => (
                  <div key={i} className="bg-[#fbbf24]/10 border border-[#fbbf24]/20 p-3 rounded-lg flex items-start gap-3">
                    <div className="mt-0.5"><AlertTriangle size={14} className="text-[#fbbf24]" /></div>
                    <div>
                      <p className="text-sm font-bold text-[#fbbf24]">₹{a.amount} on {a.category}</p>
                      <p className="text-xs text-[#e2e8f0] mt-1">{a.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Right: Ask Vault (Chat) */}
      <div className="w-full md:w-1/2 bg-[#0f172a] rounded-xl border border-[#1e293b] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-[#1e293b] bg-[#0a0f1e]/80">
          <h3 className="text-lg font-bold text-[#f8fafc] flex items-center gap-2">
            <Bot className="text-[#60a5fa]" size={20} /> Ask Vault
          </h3>
          <p className="text-xs text-[#94a3b8]">Your personal AI financial coach</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {chatHistory.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-[#64748b]">
              <Bot size={32} className="mb-2 opacity-50" />
              <p className="text-sm">Ask me anything about budgeting, saving, or your expenses!</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button onClick={() => setChatInput("How much should I save from my allowance?")} className="text-xs bg-[#1e293b] px-3 py-1.5 rounded-full hover:bg-[#334155] transition-colors text-[#e2e8f0]">How much should I save?</button>
                <button onClick={() => setChatInput("What is the 50/30/20 rule?")} className="text-xs bg-[#1e293b] px-3 py-1.5 rounded-full hover:bg-[#334155] transition-colors text-[#e2e8f0]">What is the 50/30/20 rule?</button>
              </div>
            </div>
          ) : (
            chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-[#34d399]/20 text-[#34d399] rounded-tr-none' 
                    : 'bg-[#1e293b] text-[#e2e8f0] rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))
          )}
          {isChatLoading && (
            <div className="flex justify-start">
              <div className="bg-[#1e293b] text-[#e2e8f0] p-3 rounded-xl rounded-tl-none flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Thinking...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-[#0a0f1e]/80 border-t border-[#1e293b]">
          <form onSubmit={handleAsk} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a financial question..."
              className="flex-1 bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2.5 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#60a5fa] transition-colors"
              disabled={isChatLoading}
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isChatLoading}
              className="w-11 h-11 flex items-center justify-center bg-[#60a5fa]/20 text-[#60a5fa] hover:bg-[#60a5fa]/30 rounded-xl transition-colors disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
