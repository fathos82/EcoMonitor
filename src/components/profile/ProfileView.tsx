import React, { useState, useEffect } from 'react';
import {
  Bell, Camera, Check, AlertCircle,
  LogOut, Mail, Phone, User, Loader2, Calendar,
} from 'lucide-react';
import type { User as UserType } from '../../types';
import {useProfile} from "../../hooks/useProfile.ts";

interface ProfileViewProps {
  user:     UserType;
  onLogout: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout }) => {
  const { saving, error, success, update } = useProfile();

  const [name,          setName]          = useState(user.name ?? '');
  const [phone,         setPhone]         = useState(user.phone ?? '');
  const [notifications, setNotifications] = useState(true);
  const [isDirty,       setIsDirty]       = useState(false);

  // Detecta mudanças
  useEffect(() => {
    const changed = name !== (user.name ?? '') || phone !== (user.phone ?? '');
    setIsDirty(changed);
  }, [name, phone, user]);

  const handleSave = () => {
    update({ name: name.trim(), phone: phone.trim() || undefined });
  };

  const initial = (user.name ?? user.email).charAt(0).toUpperCase();

  return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 pb-24">

        <header>
          <h1 className="text-2xl md:text-3xl font-extrabold text-stone-800">Meu Perfil</h1>
          <p className="text-xs md:text-base text-stone-500 mt-1">Gerencie seus dados pessoais</p>
        </header>

        {/* ── Avatar + Info ─────────────────────────────────────── */}
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-xl flex flex-col md:flex-row items-center gap-6">

          {/* Avatar */}
          <div className="relative shrink-0">
            {user.avatarUrl ? (
                <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 border-white shadow-md"
                />
            ) : (
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-emerald-100 flex items-center justify-center text-4xl font-extrabold text-emerald-600 border-4 border-white shadow-md">
                  {initial}
                </div>
            )}
            <button className="absolute bottom-0 right-0 p-2 bg-stone-800 text-white rounded-full shadow-lg border-2 border-white hover:bg-stone-700 transition-colors">
              <Camera size={14} />
            </button>
          </div>

          {/* Campos editáveis */}
          <div className="flex-1 w-full space-y-4">
            {/* Nome */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <User size={11} /> Nome
              </label>
              <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-stone-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            {/* Email (readonly) */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Mail size={11} /> E-mail
              </label>
              <input
                  value={user.email}
                  readOnly
                  className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-sm text-stone-400 cursor-not-allowed outline-none"
              />
            </div>

            {/* Telefone */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Phone size={11} /> Telefone
              </label>
              <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* ── Feedback + Salvar ─────────────────────────────────── */}
        {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              <AlertCircle size={15} className="shrink-0" /> {error}
            </div>
        )}
        {success && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm rounded-xl px-4 py-3">
              <Check size={15} className="shrink-0" /> Perfil atualizado com sucesso!
            </div>
        )}
        {isDirty && (
            <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-100"
            >
              {saving
                  ? <><Loader2 size={17} className="animate-spin" /> Salvando...</>
                  : <><Check size={17} /> Salvar Alterações</>
              }
            </button>
        )}

        {/* ── Preferências ──────────────────────────────────────── */}
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-lg space-y-4">
          <h3 className="font-bold text-stone-800 flex items-center gap-2 border-b border-stone-100 pb-3 text-sm">
            <Bell size={16} className="text-emerald-500" /> Preferências
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-stone-700">Notificações</p>
              <p className="text-[10px] text-stone-400">Alertas de sensores e irrigação</p>
            </div>
            <button
                onClick={() => setNotifications(!notifications)}
                className={`w-11 h-6 rounded-full p-1 transition-colors ${notifications ? 'bg-emerald-500' : 'bg-stone-200'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${notifications ? 'translate-x-5' : ''}`} />
            </button>
          </div>
        </div>

        {/* ── Info da conta ─────────────────────────────────────── */}
        <div className="bg-stone-50 rounded-2xl border border-stone-100 px-5 py-4 flex items-center gap-3 text-xs text-stone-400">
          <Calendar size={14} className="shrink-0" />
          Conta criada em {formatDate(user.createdAt)}
        </div>

        {/* ── Logout ───────────────────────────────────────────── */}
        <div className="pt-2">
          <button
              onClick={onLogout}
              className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut size={17} /> Sair da Conta
          </button>
        </div>
      </div>
  );
};