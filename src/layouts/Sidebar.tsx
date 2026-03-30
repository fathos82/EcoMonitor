import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, LayoutGrid, LogOut, Settings, Sprout } from 'lucide-react';
import { useAppStore } from '../stores/AppContext';

export const Sidebar: React.FC = () => {
  const { user, setUser } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutGrid, label: 'Meus Cultivos' },
    { to: '/reports', icon: Activity, label: 'Relatórios' },
    { to: '/settings', icon: Settings, label: 'Sensores Pi' },
  ];

  return (
    <aside className="hidden md:flex w-20 lg:w-64 bg-white border-r border-stone-200 flex-col justify-between p-4 sticky top-0 h-screen z-10">
      <div>
        <div className="flex items-center gap-3 mb-10 px-2 mt-2">
          <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-lg shadow-emerald-200 shrink-0">
            <Sprout size={24} />
          </div>
          <span className="font-extrabold text-xl tracking-tight hidden lg:block">EcoMonitor</span>
        </div>

        <nav className="space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                }`
              }
            >
              <Icon size={20} />
              <span className="hidden lg:block">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-stone-100 pt-6">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 p-2 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors group ${
              isActive ? 'bg-emerald-50' : ''
            }`
          }
        >
          <div className="w-10 h-10 rounded-full bg-emerald-100 overflow-hidden shrink-0 border-2 border-white shadow-sm flex items-center justify-center text-emerald-600 font-bold">
            {user?.name.charAt(0) || 'U'}
          </div>
          <div className="hidden lg:block overflow-hidden flex-1">
            <p className="text-sm font-bold truncate">{user?.name}</p>
            <p className="text-xs text-stone-400 truncate">Jardineiro Chefe</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            className="hidden group-hover:block lg:hidden lg:group-hover:block text-red-400 p-1"
          >
            <LogOut size={16} />
          </button>
        </NavLink>
      </div>
    </aside>
  );
};