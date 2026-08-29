import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type TransactionType = 'expense' | 'income';
export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Net Banking';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // ISO string
  description: string;
  paymentMethod: PaymentMethod;
}

export interface Budget {
  category: string;
  amount: number;
}

interface EduVaultState {
  transactions: Transaction[];
  budgets: Budget[];
  categories: string[];
  xp: number;
  unlockedBadges: string[];
  
  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  setTransactions: (transactions: Transaction[]) => void;
  
  setBudget: (category: string, amount: number) => void;
  
  // Gamification Actions
  addXP: (amount: number) => void;
  unlockBadge: (badgeId: string) => void;
}

const DEFAULT_CATEGORIES = [
  'Food', 'Transport', 'Education', 'Housing', 'Subscriptions', 
  'Entertainment', 'Health', 'Shopping', 'Internet', 'Stationery', 
  'Laundry', 'Sports', 'Gifts', 'Savings', 'Other'
];

export const useEduVaultStore = create<EduVaultState>()(
  persist(
    (set) => ({
      transactions: [],
      budgets: [],
      categories: DEFAULT_CATEGORIES,
      xp: 0,
      unlockedBadges: [],

      addXP: (amount) => set((state) => ({ xp: state.xp + amount })),
      
      unlockBadge: (badgeId) => set((state) => ({
        unlockedBadges: state.unlockedBadges.includes(badgeId) 
          ? state.unlockedBadges 
          : [...state.unlockedBadges, badgeId]
      })),

      addTransaction: (tx) => set((state) => {
        // Award 10 XP for logging an expense, 20 XP for logging an income/savings
        const xpGained = tx.type === 'income' ? 20 : 10;
        
        // Check for badges
        const newTransactions = [
          { ...tx, id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` },
          ...state.transactions
        ];
        
        let newBadges = [...state.unlockedBadges];
        
        // "First Entry" Badge
        if (!newBadges.includes('first_entry')) {
          newBadges.push('first_entry');
        }
        
        // "Budget Master" Badge (e.g. 50 transactions logged)
        if (newTransactions.length >= 50 && !newBadges.includes('budget_master')) {
          newBadges.push('budget_master');
        }

        return {
          transactions: newTransactions,
          xp: state.xp + xpGained,
          unlockedBadges: newBadges
        };
      }),

      updateTransaction: (id, updatedTx) => set((state) => ({
        transactions: state.transactions.map((tx) => 
          tx.id === id ? { ...updatedTx, id } : tx
        )
      })),

      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter((tx) => tx.id !== id)
      })),

      setTransactions: (transactions) => set({ transactions }),

      setBudget: (category, amount) => set((state) => {
        const existing = state.budgets.find((b) => b.category === category);
        if (existing) {
          return {
            budgets: state.budgets.map((b) => 
              b.category === category ? { ...b, amount } : b
            )
          };
        }
        return { budgets: [...state.budgets, { category, amount }] };
      }),
    }),
    {
      name: 'campus-os-eduvault',
      storage: createJSONStorage(() => localStorage), // Persist across sessions
    }
  )
);
