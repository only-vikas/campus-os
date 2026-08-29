'use client';

import { useState } from 'react';
import { Calculator, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SalarySimulator() {
  const [ctc, setCtc] = useState<number | ''>(1200000); // 12 LPA default
  
  // Basic Indian Tax Calculation (New Regime approximation for student context)
  const calculateTax = (income: number) => {
    if (income <= 700000) return 0; // Rebate limit
    let tax = 0;
    if (income > 300000) tax += Math.min(income - 300000, 300000) * 0.05;
    if (income > 600000) tax += Math.min(income - 600000, 300000) * 0.10;
    if (income > 900000) tax += Math.min(income - 900000, 300000) * 0.15;
    if (income > 1200000) tax += Math.min(income - 1200000, 300000) * 0.20;
    if (income > 1500000) tax += (income - 1500000) * 0.30;
    return tax * 1.04; // Adding 4% cess
  };

  const annualIncome = Number(ctc) || 0;
  const standardDeduction = 50000;
  const taxableIncome = Math.max(0, annualIncome - standardDeduction);
  const annualTax = calculateTax(taxableIncome);
  const inHandAnnual = annualIncome - annualTax;
  const monthlyInHand = Math.round(inHandAnnual / 12);

  // 50/30/20 Rule
  const needs = Math.round(monthlyInHand * 0.5);
  const wants = Math.round(monthlyInHand * 0.3);
  const savings = monthlyInHand - needs - wants;

  return (
    <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
          <Calculator className="text-blue-400" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100">Salary Simulator</h3>
          <p className="text-xs text-slate-400">Calculate in-hand salary and plan your budget</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        
        {/* Input Section */}
        <div className="w-full lg:w-1/3 flex flex-col justify-center">
          <label className="block text-sm font-medium text-slate-300 mb-2">Target CTC (Annual ₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
            <input
              type="number"
              value={ctc}
              onChange={(e) => setCtc(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-lg font-semibold text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">Assuming New Tax Regime, incl. ₹50k Standard Deduction</p>
        </div>

        {/* Output Section */}
        <div className="w-full lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div 
            key={monthlyInHand}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-5 flex flex-col justify-center md:col-span-2"
          >
            <p className="text-sm text-slate-400 mb-1">Estimated Monthly In-Hand</p>
            <h2 className="text-4xl font-bold text-emerald-400">₹{monthlyInHand.toLocaleString('en-IN')}</h2>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <span>Annual Tax: ₹{Math.round(annualTax).toLocaleString('en-IN')}</span>
              <span>•</span>
              <span>Effective Tax Rate: {((annualTax / (annualIncome || 1)) * 100).toFixed(1)}%</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-5"
          >
            <p className="text-sm font-semibold text-slate-200 mb-3 flex justify-between">
              50/30/20 Rule <span className="text-xs font-normal text-slate-400">Recommended Split</span>
            </p>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Needs (50%)</span>
                  <span className="font-medium text-slate-100">₹{needs.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-blue-400 w-1/2"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Wants (30%)</span>
                  <span className="font-medium text-slate-100">₹{wants.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-purple-400 w-[30%]"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300">Savings (20%)</span>
                  <span className="font-medium text-slate-100">₹{savings.toLocaleString('en-IN')}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-emerald-400 w-[20%]"></div></div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-5 flex flex-col justify-center"
          >
            <p className="text-sm font-semibold text-slate-200 mb-2">Did you know?</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              If you invest just your 20% savings (₹{savings.toLocaleString('en-IN')}) every month in an index fund returning 12% annually, you could have <span className="text-emerald-400 font-bold">₹{(savings * 12 * 10 * 1.5).toLocaleString('en-IN')}</span> in 10 years!
            </p>
            <button className="mt-4 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors w-fit">
              Go to SIP Calculator <ArrowRight size={12} />
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
