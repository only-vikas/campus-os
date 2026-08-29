'use client';

interface BudgetRingProps {
  label: string;
  spent: number;
  total: number;
  size?: number;
  color?: string;
}

export default function BudgetRing({ 
  label, 
  spent, 
  total, 
  size = 80, 
  color = '#34d399' 
}: BudgetRingProps) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  // Cap percentage at 100% for the ring display, but calculate real percentage for text
  const percent = total > 0 ? (spent / total) * 100 : 0;
  const displayPercent = Math.min(percent, 100);
  const strokeDashoffset = circumference - (displayPercent / 100) * circumference;
  
  const isOverBudget = percent > 100;
  const ringColor = isOverBudget ? '#f87171' : percent > 80 ? '#fbbf24' : color;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        {/* Background track */}
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="transition-all duration-300"
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xs font-bold ${isOverBudget ? 'text-[#f87171]' : 'text-[#e2e8f0]'}`}>
            {Math.round(percent)}%
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-[#e2e8f0]">{label}</p>
        <p className="text-[10px] text-[#64748b]">₹{spent.toLocaleString()} / ₹{total.toLocaleString()}</p>
      </div>
    </div>
  );
}
