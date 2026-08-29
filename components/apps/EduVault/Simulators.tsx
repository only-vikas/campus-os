'use client';

import SalarySimulator from './SalarySimulator';
import SIPCalculator from './SIPCalculator';

export default function Simulators() {
  return (
    <div className="h-full overflow-y-auto scrollbar-thin pb-6 flex flex-col gap-6">
      <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6 text-center shrink-0">
        <h2 className="text-xl font-bold text-slate-100 mb-2">Financial Planning Simulators</h2>
        <p className="text-sm text-slate-400">Plan your future salary, investments, and savings goals.</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 shrink-0">
        <SalarySimulator />
        <SIPCalculator />
      </div>
    </div>
  );
}
