import React from 'react';

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
  color: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ icon: Icon, label, isActive, onClick, color }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all shadow-sm ${
      isActive
        ? `bg-${color}-50 border-${color}-200 text-${color}-700 ring-2 ring-${color}-100`
        : 'bg-white border-stone-100 text-stone-600 hover:bg-stone-50'
    }`}
  >
    <div className={`p-2 rounded-lg md:rounded-xl ${isActive ? 'bg-white' : 'bg-stone-100'}`}>
      <Icon size={18} className={`md:w-5 md:h-5 ${isActive ? `text-${color}-600` : 'text-stone-500'}`} />
    </div>
    <div className="text-left flex-1">
      <p className="text-[10px] md:text-xs font-bold uppercase tracking-wider opacity-70">Controle</p>
      <p className="text-sm md:text-base font-bold leading-tight">{label}</p>
    </div>
    <div className={`ml-auto w-2 h-2 md:w-3 md:h-3 rounded-full ${isActive ? `bg-${color}-500 animate-pulse` : 'bg-stone-300'}`}></div>
  </button>
);