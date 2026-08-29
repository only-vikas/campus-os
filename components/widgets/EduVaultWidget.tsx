'use client';

import { useMemo } from 'react';
import { useEduVaultStore } from '@/stores/useEduVaultStore';
import { Landmark, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EduVaultWidget() {
  const { transactions } = useEduVaultStore();

  const { netWorth, burnRate, topExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    let maxExpense = 0;
    let topExpenseDesc = '';

    transactions.forEach(tx => {
      if (tx.type === 'income') {
        income += tx.amount;
      } else {
        expense += tx.amount;
        if (tx.amount > maxExpense) {
          maxExpense = tx.amount;
          topExpenseDesc = tx.description;
        }
      }
    });

    const defaultBudget = 20000;
    const br = defaultBudget > 0 ? (expense / defaultBudget) * 100 : 0;

    return { 
      netWorth: income - expense, 
      burnRate: br,
      topExpense: topExpenseDesc ? `${topExpenseDesc} (₹${maxExpense.toLocaleString('en-IN')})` : 'No expenses yet'
    };
  }, [transactions]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#0f172a]/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 w-64 shadow-2xl flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Landmark size={16} />
          </div>
          <span className="text-sm font-semibold text-slate-100">EduVault</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
          burnRate > 90 ? 'bg-rose-500/20 text-rose-400' : 
          burnRate > 75 ? 'bg-yellow-500/20 text-yellow-400' : 
          'bg-emerald-500/20 text-emerald-400'
        }`}>
          {Math.round(burnRate)}% Burn
        </span>
      </div>

      <div className="mt-1">
        <p className="text-xs text-slate-400 mb-0.5">Net Worth</p>
        <h3 className={`text-2xl font-bold ${netWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
          {netWorth >= 0 ? '+' : '-'}₹{Math.abs(netWorth).toLocaleString('en-IN')}
        </h3>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-2.5 flex items-center justify-between mt-1 border border-slate-700/30">
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Top Expense</p>
          <p className="text-xs font-medium text-slate-200 mt-0.5 truncate w-40">{topExpense}</p>
        </div>
        <TrendingUp size={14} className="text-rose-400 shrink-0" />
      </div>
    </motion.div>
  );
}
