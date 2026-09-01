'use client';

// ============================================================
// Campus OS — FinSack App Shell
// Financial Education & Market Intelligence
// ============================================================
import React from 'react';
import { Landmark, LayoutDashboard, BookOpen, TrendingUp, Terminal } from 'lucide-react';
import { useFinSackStore } from '@/stores/useFinSackStore';
import Dashboard from './Dashboard';
import FinLearn from './FinLearn';
import MarketPulse from './MarketPulse';
import NovaTerminal from './NovaTerminal';

export default function FinSack() {
  const { activeTab, setActiveTab } = useFinSackStore();

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'finlearn' as const, label: 'FinLearn', icon: <BookOpen size={18} /> },
    { id: 'marketpulse' as const, label: 'MarketPulse', icon: <TrendingUp size={18} /> },
    { id: 'nova' as const, label: 'Nova Terminal', icon: <Terminal size={18} /> },
  ];

  return (
    <div className="flex h-full bg-[#0a0f1e] text-[#e2e8f0] font-sans">
      {/* Sidebar Navigation */}
      <div className="w-52 flex flex-col p-3 border-r border-[rgba(51,65,85,0.4)] bg-[rgba(15,23,42,0.6)] flex-shrink-0">
        <div className="px-3 py-4 mb-4 border-b border-[rgba(51,65,85,0.4)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Landmark className="text-emerald-400" size={18} />
            </div>
            <div>
              <span className="font-bold text-sm text-[#e2e8f0] tracking-wide">FinSack</span>
              <span className="block text-[10px] text-emerald-400/80 font-medium tracking-widest uppercase">Finance OS</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all text-left ${
                activeTab === t.id
                  ? 'bg-emerald-500/15 text-emerald-400 font-medium border border-emerald-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
                  : 'text-[#94a3b8] hover:bg-[rgba(51,65,85,0.3)] border border-transparent'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden bg-[rgba(8,8,20,0.5)]">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'finlearn' && <FinLearn />}
        {activeTab === 'marketpulse' && <MarketPulse />}
        {activeTab === 'nova' && <NovaTerminal />}
      </div>
    </div>
  );
}
