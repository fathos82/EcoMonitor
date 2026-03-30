import React, { useState } from 'react';
import { Bell, Briefcase, Camera, Copy, Eye, EyeOff, Key, LogOut, Mail, MapPinned, Phone, Settings, ShieldCheck, User } from 'lucide-react';
import type { User as UserType } from '../../types';

interface ProfileViewProps {
  user: UserType;
  onLogout: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [occupation, setOccupation] = useState("Botânico Amador");
  const [phone, setPhone] = useState("(11) 98765-4321");
  const [location, setLocation] = useState("São Paulo, SP");

  const userToken = "usr_" + Math.random().toString(36).substr(2, 12).toUpperCase();

  return (
    <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-24">
      <header className="mb-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-stone-800">Meu Perfil</h1>
        <p className="text-xs md:text-base text-stone-500 mt-1">Gerencie seus dados e chaves de acesso</p>
      </header>

      <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-xl flex flex-col md:flex-row items-center gap-6 md:gap-8">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-emerald-100 flex items-center justify-center text-4xl md:text-5xl font-bold text-emerald-600 border-4 border-white shadow-md group-hover:scale-105 transition-transform">
            {name.charAt(0)}
          </div>
          <div className="absolute bottom-0 right-0 p-2 bg-stone-800 text-white rounded-full shadow-lg border-2 border-white">
            <Camera size={16} />
          </div>
        </div>

        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Nome de Exibição</label>
            <div className="relative">
              <User size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-6 font-bold text-lg md:text-xl text-stone-800 bg-transparent border-b border-stone-200 focus:border-emerald-500 outline-none w-full py-1 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Email de Acesso</label>
            <div className="relative">
              <Mail size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-6 font-medium text-stone-600 bg-transparent border-b border-stone-200 focus:border-emerald-500 outline-none w-full py-1 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Ocupação</label>
            <div className="relative">
              <Briefcase size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="pl-6 font-medium text-stone-600 bg-transparent border-b border-stone-200 focus:border-emerald-500 outline-none w-full py-1 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Telefone</label>
            <div className="relative">
              <Phone size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-6 font-medium text-stone-600 bg-transparent border-b border-stone-200 focus:border-emerald-500 outline-none w-full py-1 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Localização</label>
            <div className="relative">
              <MapPinned size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-6 font-medium text-stone-600 bg-transparent border-b border-stone-200 focus:border-emerald-500 outline-none w-full py-1 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-lg space-y-6">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 border-b border-stone-100 pb-3">
            <Settings size={20} className="text-emerald-500" /> Preferências
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-stone-100 rounded-lg text-stone-500"><Bell size={18} /></div>
                <div>
                  <p className="text-sm font-bold text-stone-700">Notificações</p>
                  <p className="text-[10px] text-stone-400">Alertas de rega e sensores</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${notifications ? 'bg-emerald-500' : 'bg-stone-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${notifications ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-stone-100 rounded-lg text-stone-500"><span style={{ fontSize: '18px' }}>🌙</span></div>
                <div>
                  <p className="text-sm font-bold text-stone-700">Modo Escuro</p>
                  <p className="text-[10px] text-stone-400">Tema visual da interface</p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${darkMode ? 'bg-stone-800' : 'bg-stone-200'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${darkMode ? 'translate-x-5' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2 text-stone-800 border-b border-stone-100 pb-3">
              <Key size={20} className="text-emerald-500" /> Token de Acesso
            </h3>

            <p className="text-xs text-stone-500 leading-relaxed">
              Use este token para autenticar manualmente seus dispositivos Raspberry Pi ou ESP32 na rede segura.
            </p>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-center justify-between group">
              <code className="font-mono text-sm text-stone-800 tracking-wider font-bold">
                {showToken ? userToken : '••••••••••••••••'}
              </code>
              <div className="flex gap-2">
                <button onClick={() => setShowToken(!showToken)} className="text-stone-400 hover:text-emerald-600 transition-colors">
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button className="text-stone-400 hover:text-emerald-600 transition-colors">
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 relative z-10">
            <div className="text-[10px] text-stone-400 flex items-center gap-1">
              <ShieldCheck size={10} /> Não compartilhe esta chave.
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-stone-200 flex justify-end">
        <button
          onClick={onLogout}
          className="w-full md:w-auto px-8 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors mx-auto md:mx-0"
        >
          <LogOut size={18} /> Sair da Conta
        </button>
      </div>
    </div>
  );
};