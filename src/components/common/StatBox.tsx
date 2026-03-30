import React from 'react';
import { Activity, ArrowDown, ArrowUp, Minus } from 'lucide-react';

interface StatBoxProps {
  label: string;
  value: number;
  unit: string;
  type?: 'max' | 'min' | 'avg';
  colorClass: string;
}

export const StatBox: React.FC<StatBoxProps> = ({ label, value, unit, type, colorClass }) => {
  let Icon = Minus;
  if (type === 'max') Icon = ArrowUp;
  if (type === 'min') Icon = ArrowDown;
  if (type === 'avg') Icon = Activity;

  return (
    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-stone-100 border border-stone-200 flex-1 min-w-[60px]">
      <div className={`flex items-center gap-1 text-[9px] md:text-xs font-bold uppercase tracking-wider ${colorClass} opacity-90 mb-1`}>
        <Icon size={10} strokeWidth={3} />
        {label}
      </div>
      <div className="text-base md:text-xl font-bold text-stone-800">
        {value}<span className="text-[10px] md:text-sm font-normal text-stone-500 ml-0.5">{unit}</span>
      </div>
    </div>
  );
};