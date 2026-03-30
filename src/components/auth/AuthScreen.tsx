import React, { useState } from 'react';
import { ArrowRight, Lock, Mail, Sprout, User } from 'lucide-react';
import type { User as UserType } from '../../types';

interface AuthScreenProps {
  onLogin: (user: UserType) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTimeout(() => {
      onLogin({
        name: formData.name || "Jardineiro",
        email: formData.email
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row font-sans">
      <div className="hidden md:flex md:w-1/2 lg:w-5/12 bg-emerald-900 relative overflow-hidden flex-col justify-between p-12">
        <img
          src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=1000"
          alt="Nature Lab"
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-emerald-100 mb-6">
            <Sprout size={32} />
            <span className="font-extrabold text-2xl tracking-tight">EcoMonitor</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
            Tecnologia para Cultivos Mais Saudáveis.
          </h1>
          <p className="text-emerald-100/90 text-lg leading-relaxed max-w-md">
            Acompanhe a umidade do solo, luz e clima das suas plantas em tempo real, de qualquer lugar.
          </p>
        </div>
        <div className="relative z-10 flex gap-4 text-emerald-200/60 text-sm font-mono">
          <span>v2.5.0</span>
          <span>● IoT System Online</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 md:p-12 animate-in slide-in-from-right duration-500">
        <div className="w-full max-w-md space-y-6 md:space-y-8 bg-white md:bg-transparent p-6 md:p-0 rounded-3xl md:rounded-none shadow-xl md:shadow-none border border-stone-100 md:border-none">
          <div className="text-center md:text-left">
            <div className="md:hidden flex justify-center mb-4 text-emerald-700">
              <Sprout size={40} />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-stone-800 mb-2">
              {isSignUp ? 'Criar Conta' : 'Bem-vindo de volta'}
            </h2>
            <p className="text-sm md:text-base text-stone-500">
              {isSignUp ? 'Inicie o monitoramento do seu jardim.' : 'Acesse o painel de controle.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            {isSignUp && (
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-xs md:text-sm font-bold text-stone-700 flex items-center gap-2">
                  <User size={14} className="md:w-4 md:h-4" /> Nome Completo
                </label>
                <input
                  type="text"
                  className="w-full p-3 md:p-4 bg-stone-50 md:bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                  placeholder="Ex: Ana Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-xs md:text-sm font-bold text-stone-700 flex items-center gap-2">
                <Mail size={14} className="md:w-4 md:h-4" /> E-mail
              </label>
              <input
                type="email"
                required
                className="w-full p-3 md:p-4 bg-stone-50 md:bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1.5 md:space-y-2">
              <label className="text-xs md:text-sm font-bold text-stone-700 flex items-center gap-2">
                <Lock size={14} className="md:w-4 md:h-4" /> Senha
              </label>
              <input
                type="password"
                required
                className="w-full p-3 md:p-4 bg-stone-50 md:bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all text-sm"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 md:py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 md:mt-6 text-sm md:text-base"
            >
              {isSignUp ? 'Criar Conta Gratuita' : 'Entrar no Sistema'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="text-center pt-4 border-t border-stone-100">
            <p className="text-stone-500 text-xs md:text-sm">
              {isSignUp ? 'Já tem cadastro?' : 'Novo por aqui?'}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 font-bold text-emerald-600 hover:underline"
              >
                {isSignUp ? 'Fazer Login' : 'Criar Conta'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};