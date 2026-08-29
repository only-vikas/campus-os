'use client';

import { useState } from 'react';
import { useEduVaultStore, Transaction } from '@/stores/useEduVaultStore';
import { Search, Filter, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function TransactionList() {
  const { transactions, deleteTransaction, categories } = useEduVaultStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filtered = transactions.filter((tx) => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (filterCategory !== 'all' && tx.category !== filterCategory) return false;
    if (search && !tx.description.toLowerCase().includes(search.toLowerCase()) && 
        !tx.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" size={16} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-xl pl-9 pr-4 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#34d399]"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" size={14} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="appearance-none bg-[#1e293b]/60 border border-[#334155] rounded-xl pl-8 pr-8 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#34d399]"
            >
              <option value="all">All Types</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
            </select>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#1e293b]/60 border border-[#334155] rounded-xl px-4 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#34d399]"
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button
            onClick={() => {
              const headers = ['Date', 'Description', 'Category', 'Method', 'Type', 'Amount'];
              const csvData = [
                headers.join(','),
                ...filtered.map(tx => [
                  new Date(tx.date).toLocaleDateString(),
                  `"${tx.description.replace(/"/g, '""')}"`,
                  tx.category,
                  tx.paymentMethod,
                  tx.type,
                  tx.amount
                ].join(','))
              ].join('\n');
              
              const blob = new Blob([csvData], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `eduvault-export-${new Date().toISOString().split('T')[0]}.csv`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            className="bg-[#1e293b]/60 hover:bg-[#334155] border border-[#334155] rounded-xl px-4 py-2 text-sm text-[#e2e8f0] transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin bg-[#0f172a] rounded-xl border border-[#1e293b]">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#64748b]">
            <p className="text-sm">No transactions found.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#1e293b]">
            {filtered.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-[#1e293b]/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tx.type === 'expense' ? 'bg-[#f87171]/10 text-[#f87171]' : 'bg-[#34d399]/10 text-[#34d399]'
                  }`}>
                    {tx.type === 'expense' ? <ArrowDownRight size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#e2e8f0]">{tx.description}</p>
                    <div className="flex items-center gap-2 text-xs text-[#64748b] mt-0.5">
                      <span>{new Date(tx.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{tx.paymentMethod}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${tx.type === 'expense' ? 'text-[#e2e8f0]' : 'text-[#34d399]'}`}>
                    {tx.type === 'expense' ? '-' : '+'}₹{tx.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={() => deleteTransaction(tx.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-[#64748b] hover:text-[#f87171] hover:bg-[#f87171]/10 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
