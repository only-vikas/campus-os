'use client';

import { useState } from 'react';
import { useEduVaultStore, TransactionType, PaymentMethod } from '@/stores/useEduVaultStore';
import { Mic, Plus } from 'lucide-react';
import { isSTTSupported, startListening, stopListening } from '@/services/voiceService';

export default function TransactionForm({ onClose }: { onClose?: () => void }) {
  const { addTransaction, categories } = useEduVaultStore();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRecording, setIsRecording] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(Number(amount))) return;

    addTransaction({
      type,
      amount: Number(amount),
      category,
      description,
      paymentMethod,
      date: new Date(date).toISOString(),
    });

    // Reset form
    setAmount('');
    setDescription('');
    if (onClose) onClose();
  };

  const toggleVoice = () => {
    if (isRecording) {
      stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      startListening({
        onResult: (transcript, isFinal) => {
          if (isFinal) {
            setDescription(transcript);
            // In Phase 3, we will pass this to AI for auto-categorization
            stopListening();
            setIsRecording(false);
          }
        },
        onError: () => setIsRecording(false),
        onSilence: () => {
          stopListening();
          setIsRecording(false);
        },
        onEnd: () => setIsRecording(false),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#f8fafc]">New Transaction</h3>
        <div className="flex bg-[#1e293b] rounded-lg p-1">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              type === 'expense' ? 'bg-[#f87171]/20 text-[#f87171]' : 'text-[#64748b] hover:text-[#e2e8f0]'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              type === 'income' ? 'bg-[#34d399]/20 text-[#34d399]' : 'text-[#64748b] hover:text-[#e2e8f0]'
            }`}
          >
            Income
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[#94a3b8] mb-1">Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#34d399]"
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-[#94a3b8] mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#34d399]"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[#94a3b8] mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#34d399]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#94a3b8] mb-1">Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="w-full bg-[#1e293b]/60 border border-[#334155] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#34d399]"
          >
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Card">Card</option>
            <option value="Net Banking">Net Banking</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs text-[#94a3b8] mb-1">Description</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 bg-[#1e293b]/60 border border-[#334155] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#34d399]"
            placeholder="What was this for?"
            required
          />
          {isSTTSupported() && (
            <button
              type="button"
              onClick={toggleVoice}
              className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${
                isRecording 
                  ? 'bg-[#f87171]/20 border-[#f87171]/50 text-[#f87171] animate-pulse' 
                  : 'bg-[#1e293b]/60 border-[#334155] text-[#94a3b8] hover:text-[#e2e8f0]'
              }`}
            >
              <Mic size={16} />
            </button>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-2.5 bg-[#34d399]/20 hover:bg-[#34d399]/30 text-[#34d399] font-medium rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <Plus size={16} /> Add Transaction
      </button>
    </form>
  );
}
