import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

export const Layout: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-stone-50 font-sans text-stone-800 pb-20 md:pb-0 animate-in fade-in duration-700">
      <Sidebar />
      <MobileNav />
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto mt-14 md:mt-0">
        <Outlet />
      </main>
    </div>
  );
};