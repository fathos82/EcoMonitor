import React from 'react';
import { NavLink } from 'react-router-dom';
import { Activity, LayoutGrid, Settings } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const navItems = [
    { to: '/', icon: LayoutGrid, label: 'Cultivos' },
    { to: '/reports', icon: Activity, label: 'Relatórios' },
    { to: '/settings', icon: Settings, label: 'Sensores Pi' },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-6 py-2 pb-4 flex justify-between items-center z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              isActive ? 'text-emerald-600' : 'text-stone-400 hover:text-stone-600'
            }`
          }
        >
          <Icon size={24} strokeWidth={({ isActive }) => (isActive ? 2.5 : 2)} />
          <span className={`text-[10px] font-medium ${({ isActive }) => (isActive ? 'font-bold' : '')}`}>
            {label}
          </span>
        </NavLink>
      ))}
    </div>
  );
};