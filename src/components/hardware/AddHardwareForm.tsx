import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronLeft, Cpu, Loader2, Server } from 'lucide-react';

interface AddHardwareFormProps {
  onSave: (uuid: string, name: string, hostname: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

export const AddHardwareForm: React.FC<AddHardwareFormProps> = ({
                                                                  onSave, onCancel, loading = false, error = null
                                                                }) => {
  const [uuid, setUuid]         = useState('');
  const [name, setName]         = useState('');
  const [hostname, setHostname] = useState('');
  const [success, setSuccess]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(uuid.trim(), name.trim(), hostname.trim());
    setSuccess(true);
  };

  if (success) {
    return (
        <div className="max-w-lg mx-auto mt-20 flex flex-col items-center gap-4 text-center animate-in zoom-in duration-300">
          <div className="p-5 bg-emerald-100 rounded-full text-emerald-600">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-2xl font-extrabold text-stone-800">Device Vinculado!</h2>
          <p className="text-stone-500 text-sm">O dispositivo foi adicionado à sua conta com sucesso.</p>
          <button
              onClick={onCancel}
              className="mt-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all"
          >
            Voltar para Hardware
          </button>
        </div>
    );
  }

  return (
      <div className="max-w-xl mx-auto space-y-6 animate-in slide-in-from-right duration-300 pb-24">
        <header className="flex items-center gap-3 border-b border-stone-200 pb-4">
          <button onClick={onCancel} className="p-2 rounded-lg hover:bg-stone-200 text-stone-500 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl md:text-3xl font-extrabold text-stone-800">Conectar Device</h1>
            <p className="text-xs md:text-sm text-stone-500">Insira o UUID do dispositivo para vinculá-lo à sua conta</p>
          </div>
        </header>

        {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-lg space-y-5">

            {/* UUID — campo principal */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500 flex items-center gap-1.5">
                <Cpu size={13} /> UUID DO DEVICE
              </label>
              <input
                  type="text"
                  required
                  placeholder="ex: f656cca5-20eb-47f7-9126-281d0bc6b35f"
                  value={uuid}
                  onChange={(e) => setUuid(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-mono tracking-wide"
              />
              <p className="text-xs text-stone-400">
                Encontre o UUID no painel do dispositivo ou no arquivo <code className="bg-stone-100 px-1 rounded">/etc/ecomonitor/uuid</code>
              </p>
            </div>

            {/* Nome — enviado para o backend, ignorado se não suportado ainda */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500 flex items-center gap-1.5">
                <Server size={13} /> NOME DO DEVICE <span className="text-stone-300 font-normal">(opcional)</span>
              </label>
              <input
                  type="text"
                  placeholder="ex: Estufa Principal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
              />
            </div>

            {/* Hostname — enviado para o backend, ignorado se não suportado ainda */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-500 flex items-center gap-1.5">
                HOSTNAME <span className="text-stone-300 font-normal">(opcional)</span>
              </label>
              <input
                  type="text"
                  placeholder="ex: raspberrypi.local"
                  value={hostname}
                  onChange={(e) => setHostname(e.target.value)}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-mono"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-bold text-stone-500 hover:bg-stone-100 transition-colors text-sm disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
                type="submit"
                disabled={loading || !uuid.trim()}
                className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
            >
              {loading
                  ? <><Loader2 size={18} className="animate-spin" /> Vinculando...</>
                  : <><CheckCircle2 size={18} /> Vincular Device</>
              }
            </button>
          </div>
        </form>
      </div>
  );
};