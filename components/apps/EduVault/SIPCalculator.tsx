'use client';

import { useState } from 'react';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SIPCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState<number | ''>(5000);
  const [expectedReturn, setExpectedReturn] = useState<number | ''>(12);
  const [timePeriod, setTimePeriod] = useState<number | ''>(10);

  const calculateSIP = () => {
    const P = Number(monthlyInvestment) || 0;
    const r = (Number(expectedReturn) || 0) / 100 / 12;
    const n = (Number(timePeriod) || 0) * 12;
    
    if (P === 0 || r === 0 || n === 0) return { invested: 0, wealth: 0, returns: 0 };

    // Future Value formula: FV = P * [(1 + r)^n - 1] * (1 + r) / r
    const fv = P * (Math.pow(1 + r, n) - 1) * (1 + r) / r;
    const invested = P * n;
    const returns = fv - invested;

    return { invested, wealth: fv, returns };
  };

  const { invested, wealth, returns } = calculateSIP();

  return (
    <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
          <TrendingUp className="text-emerald-400" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-100">SIP Calculator</h3>
          <p className="text-xs text-slate-400">Project your mutual fund returns</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        {/* Input Section */}
        <div className="w-full lg:w-1/2 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex justify-between">
              Monthly Investment
              <span className="text-emerald-400">₹{(Number(monthlyInvestment) || 0).toLocaleString('en-IN')}</span>
            </label>
            <input
              type="range"
              min="500"
              max="100000"
              step="500"
              value={Number(monthlyInvestment) || 0}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex justify-between">
              Expected Return Rate (p.a)
              <span className="text-emerald-400">{Number(expectedReturn) || 0}%</span>
            </label>
            <input
              type="range"
              min="1"
              max="30"
              step="0.5"
              value={Number(expectedReturn) || 0}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex justify-between">
              Time Period
              <span className="text-emerald-400">{Number(timePeriod) || 0} Years</span>
            </label>
            <input
              type="range"
              min="1"
              max="40"
              step="1"
              value={Number(timePeriod) || 0}
              onChange={(e) => setTimePeriod(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Output Section */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <motion.div 
            key={wealth}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-6 flex flex-col items-center justify-center text-center"
          >
            <p className="text-sm text-slate-400 mb-1">Total Value</p>
            <h2 className="text-4xl font-bold text-emerald-400 mb-6">₹{Math.round(wealth).toLocaleString('en-IN')}</h2>
            
            <div className="w-full grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Total Investment</p>
                <p className="text-lg font-semibold text-slate-200">₹{invested.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Est. Returns</p>
                <p className="text-lg font-semibold text-emerald-400">+₹{Math.round(returns).toLocaleString('en-IN')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
