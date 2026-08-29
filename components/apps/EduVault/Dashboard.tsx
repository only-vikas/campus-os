'use client';

import { useMemo } from 'react';
import { useEduVaultStore } from '@/stores/useEduVaultStore';
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import DonutChart from './DonutChart';
import AreaChart from './AreaChart';
import BudgetRing from './BudgetRing';
import BadgeShowcase from './BadgeShowcase';

export default function Dashboard() {
  const { transactions, budgets } = useEduVaultStore();

  const {
    netWorth,
    totalIncome,
    totalExpense,
    categoryData,
    trendData,
    topCategories
  } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const categoryTotals: Record<string, number> = {};
    const dailyTotals: Record<string, number> = {};

    transactions.forEach(tx => {
      if (tx.type === 'income') income += tx.amount;
      else {
        expense += tx.amount;
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
      }
      
      const date = tx.date.split('T')[0];
      if (tx.type === 'expense') {
        dailyTotals[date] = (dailyTotals[date] || 0) + tx.amount;
      }
    });

    const categoryColors = ['#60a5fa', '#34d399', '#f472b6', '#fbbf24', '#a78bfa', '#f87171', '#38bdf8', '#818cf8'];
    const catData = Object.entries(categoryTotals)
      .map(([label, value], i) => ({ label, value, color: categoryColors[i % categoryColors.length] }))
      .sort((a, b) => b.value - a.value);

    // Get last 7 days for trend
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    const trend = last7Days.map(date => ({
      label: date.substring(5), // MM-DD
      value: dailyTotals[date] || 0
    }));

    return {
      netWorth: income - expense,
      totalIncome: income,
      totalExpense: expense,
      categoryData: catData,
      trendData: trend,
      topCategories: catData.slice(0, 5)
    };
  }, [transactions]);

  // For burn rate, let's assume a dummy monthly budget based on total budgets or default 20k
  const totalBudget = budgets.length > 0 ? budgets.reduce((sum, b) => sum + b.amount, 0) : 20000;
  const burnRate = totalBudget > 0 ? (totalExpense / totalBudget) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-full content-start">
      
      {/* 1. Net Worth Card (Col span 4) */}
      <div className="col-span-12 md:col-span-4 bg-[#0f172a] rounded-xl border border-[#1e293b] p-5 flex flex-col justify-center">
        <p className="text-sm text-[#64748b] mb-1">Net Worth</p>
        <div className="flex items-end gap-3">
          <h2 className={`text-4xl font-bold ${netWorth >= 0 ? 'text-[#34d399]' : 'text-[#f87171]'}`}>
            {netWorth >= 0 ? '+' : '-'}₹{Math.abs(netWorth).toLocaleString()}
          </h2>
        </div>
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-6 h-6 rounded-full bg-[#34d399]/20 flex items-center justify-center text-[#34d399]">
              <ArrowUpRight size={14} />
            </div>
            <div>
              <p className="text-[#64748b]">Income</p>
              <p className="font-semibold text-[#e2e8f0]">₹{totalIncome.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-6 h-6 rounded-full bg-[#f87171]/20 flex items-center justify-center text-[#f87171]">
              <ArrowDownRight size={14} />
            </div>
            <div>
              <p className="text-[#64748b]">Expenses</p>
              <p className="font-semibold text-[#e2e8f0]">₹{totalExpense.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Monthly Burn Rate (Col span 4) */}
      <div className="col-span-12 md:col-span-4 bg-[#0f172a] rounded-xl border border-[#1e293b] p-5 flex flex-col justify-center">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm text-[#64748b]">Monthly Burn Rate</p>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
            burnRate > 90 ? 'bg-[#f87171]/20 text-[#f87171]' : 
            burnRate > 75 ? 'bg-[#fbbf24]/20 text-[#fbbf24]' : 
            'bg-[#34d399]/20 text-[#34d399]'
          }`}>
            {Math.round(burnRate)}%
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-3">
          <h3 className="text-2xl font-bold text-[#e2e8f0]">₹{totalExpense.toLocaleString()}</h3>
          <span className="text-xs text-[#64748b]">/ ₹{totalBudget.toLocaleString()}</span>
        </div>
        <div className="h-2 w-full bg-[#1e293b] rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000"
            style={{ 
              width: `${Math.min(burnRate, 100)}%`,
              backgroundColor: burnRate > 90 ? '#f87171' : burnRate > 75 ? '#fbbf24' : '#34d399'
            }}
          />
        </div>
        {burnRate > 90 && (
          <p className="text-[10px] text-[#f87171] mt-2 flex items-center gap-1">
            <AlertCircle size={10} /> Approaching budget limit
          </p>
        )}
      </div>

      {/* 3. Category Breakdown (Col span 4) */}
      <div className="col-span-12 md:col-span-4 bg-[#0f172a] rounded-xl border border-[#1e293b] p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-[#64748b] mb-3">Top Category</p>
          {topCategories.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: topCategories[0].color }} />
                <h3 className="text-lg font-bold text-[#e2e8f0]">{topCategories[0].label}</h3>
              </div>
              <p className="text-sm text-[#94a3b8]">₹{topCategories[0].value.toLocaleString()}</p>
            </>
          ) : (
            <p className="text-sm text-[#94a3b8]">No expenses yet</p>
          )}
        </div>
        <DonutChart data={categoryData} size={100} thickness={16} />
      </div>

      {/* 4. Spending Trend (Col span 8) */}
      <div className="col-span-12 md:col-span-8 bg-[#0f172a] rounded-xl border border-[#1e293b] p-5 min-h-[250px] flex flex-col">
        <p className="text-sm text-[#64748b] mb-4">Spending Trend (Last 7 Days)</p>
        <div className="flex-1 w-full h-[180px]">
          <AreaChart data={trendData} width={500} height={180} />
        </div>
      </div>

      {/* 5. Budget Progress (Col span 4) */}
      <div className="col-span-12 md:col-span-4 bg-[#0f172a] rounded-xl border border-[#1e293b] p-5">
        <p className="text-sm text-[#64748b] mb-4">Budget Progress</p>
        <div className="grid grid-cols-2 gap-4">
          {budgets.slice(0, 4).map((budget) => {
            const spent = categoryData.find(c => c.label === budget.category)?.value || 0;
            return (
              <BudgetRing 
                key={budget.category}
                label={budget.category}
                spent={spent}
                total={budget.amount}
                size={70}
              />
            );
          })}
          {budgets.length === 0 && (
            <div className="col-span-2 text-center py-4">
              <p className="text-xs text-[#64748b]">No budgets set.</p>
            </div>
          )}
        </div>
      </div>

      {/* 6. Recent Transactions (Col span 8) */}
      <div className="col-span-12 md:col-span-8 bg-[#0f172a] rounded-xl border border-[#1e293b] p-5">
        <p className="text-sm text-[#64748b] mb-4">Recent Transactions</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1e293b] text-xs text-[#94a3b8]">
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Description</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium">Method</th>
                <th className="pb-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="border-b border-[#1e293b]/50 text-sm">
                  <td className="py-2.5 text-[#64748b]">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="py-2.5 text-[#e2e8f0] font-medium">{tx.description}</td>
                  <td className="py-2.5 text-[#94a3b8]">{tx.category}</td>
                  <td className="py-2.5 text-[#94a3b8]">{tx.paymentMethod}</td>
                  <td className={`py-2.5 text-right font-bold ${tx.type === 'income' ? 'text-[#34d399]' : 'text-[#e2e8f0]'}`}>
                    {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-xs text-[#64748b]">
                    No recent transactions.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Gamification & Badges (Col span 4) */}
      <div className="col-span-12 md:col-span-4 bg-[#0f172a] rounded-xl border border-[#1e293b] p-5">
        <BadgeShowcase />
      </div>

    </div>
  );
}
