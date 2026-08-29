'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, LayoutDashboard, ListOrdered, Sparkles, Calculator } from 'lucide-react';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import Dashboard from './Dashboard';
import AIAdvisor from './AIAdvisor';
import Simulators from './Simulators';

type Tab = 'dashboard' | 'transactions' | 'ai' | 'simulators';

export default function EduVault() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="h-full bg-[#0a0f1e] text-[#e2e8f0] overflow-y-auto scrollbar-thin relative flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[#1e293b] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#34d399]/20 flex items-center justify-center">
            <Landmark className="text-[#34d399]" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#f8fafc]">EduVault</h2>
            <p className="text-xs text-[#94a3b8]">Track. Learn. Grow.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#0f172a] p-1 rounded-lg border border-[#1e293b]">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'dashboard' ? 'bg-[#1e293b] text-[#34d399]' : 'text-[#64748b] hover:text-[#e2e8f0]'
            }`}
          >
            <LayoutDashboard size={16} /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'transactions' ? 'bg-[#1e293b] text-[#34d399]' : 'text-[#64748b] hover:text-[#e2e8f0]'
            }`}
          >
            <ListOrdered size={16} /> Transactions
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'ai' ? 'bg-[#1e293b] text-[#34d399]' : 'text-[#64748b] hover:text-[#e2e8f0]'
            }`}
          >
            <Sparkles size={16} /> AI Advisor
          </button>
          <button
            onClick={() => setActiveTab('simulators')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'simulators' ? 'bg-[#1e293b] text-[#34d399]' : 'text-[#64748b] hover:text-[#e2e8f0]'
            }`}
          >
            <Calculator size={16} /> Simulators
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin relative">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Dashboard />
            </motion.div>
          )}
          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full flex gap-6"
            >
              <div className="w-[40%] flex-shrink-0">
                <TransactionForm />
              </div>
              <div className="w-[60%] flex-1">
                <TransactionList />
              </div>
            </motion.div>
          )}
          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <AIAdvisor />
            </motion.div>
          )}
          {activeTab === 'simulators' && (
            <motion.div
              key="simulators"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Simulators />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
