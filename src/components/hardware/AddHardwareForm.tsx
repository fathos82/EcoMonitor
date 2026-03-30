import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ChevronLeft, CircuitBoard, Copy, Info, Plus, QrCode, Save, Server, Sprout, Terminal, Zap } from 'lucide-react';
import type { Hardware, Sensor } from '../../types';
import { SensorConfigCard } from './SensorConfigCard';

interface AddHardwareFormProps {
  onSave: (hardware: Hardware) => void;
  onCancel: () => void;
  initialData?: Hardware | null;
}

export const AddHardwareForm: React.FC<AddHardwareFormProps> = ({ onSave, onCancel, initialData }) => {
  const [step, setStep] = useState(initialData ? 2 : 1);
  const [method, setMethod] = useState('');
  const [generatedToken] = useState("BG-" + Math.random().toString(36).substr(2, 6).toUpperCase());

  const [formData, setFormData] = useState<Hardware>(initialData || {
    id: 0,
    name: '',
    model: '',
    ip: '',
    status: 'online',
    uptime: '0h',
    sensors: []
  });

  const handleMethodSelect = (selectedMethod: string) => {
    setMethod(selectedMethod);
    setStep(2);
  };

  const handleAddSensor = () => {
    const newSensor: Sensor = {
      id: Date.now(),
      name: '',
      type: 'soil_digital',
      config: { signal: '' },
      status: 'unknown',
      lastRead: '-'
    };
    setFormData(prev => ({ ...prev, sensors: [...prev.sensors, newSensor] }));
  };

  const handleUpdateSensor = (updatedSensor: Sensor) => {
    setFormData(prev => ({
      ...prev,
      sensors: prev.sensors.map(s => s.id === updatedSensor.id ? updatedSensor : s)
    }));
  };

  const handleDeleteSensor = (sensorId: number) => {
    setFormData(prev => ({
      ...prev,
      sensors: prev.sensors.filter(s => s.id !== sensorId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialData) {
      onSave({
        ...formData,
        name: "Novo Dispositivo",
        model: "Detectando...",
        ip: "---",
        status: "online",
        sensors: []
      });
    } else {
      onSave(formData);
    }
  };

  if (step === 1 && !initialData) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in slide-in-from-bottom duration-300 pb-24">
        <header className="flex items-center gap-3 md:gap-4 border-b border-stone-200 pb-3 md:pb-4">
          <button onClick={onCancel} className="p-2 rounded-lg hover:bg-stone-200 text-stone-500 transition-colors">
            <ChevronLeft size={20} className="md:w-6 md:h-6" />
          </button>
          <div>
            <h1 className="text-xl md:text-3xl font-extrabold text-stone-800">Conectar Hardware</h1>
            <p className="text-xs md:text-base text-stone-500">Escolha como configurar seu dispositivo</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => handleMethodSelect('ssh-token')}
            className="group relative bg-white p-6 rounded-3xl border-2 border-emerald-500 shadow-xl shadow-emerald-100 cursor-pointer hover:scale-[1.02] transition-all"
          >
            <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">
              Recomendado
            </div>
            <div className="mb-4 p-3 bg-emerald-50 rounded-2xl w-fit text-emerald-600">
              <Terminal size={32} />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">Instalação via SSH + Token</h3>
            <p className="text-sm text-stone-500 leading-relaxed">
              Você acessa o Raspberry Pi via SSH e executa um comando com token gerado pelo app.
            </p>
          </div>

          <div
            onClick={() => handleMethodSelect('auto-ssh')}
            className="group relative bg-stone-50 p-6 rounded-3xl border border-stone-200 hover:border-red-300 cursor-pointer hover:bg-white hover:shadow-lg transition-all opacity-80 hover:opacity-100"
          >
            <div className="absolute top-4 right-4 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
              <AlertTriangle size={10} /> Experimental
            </div>
            <div className="mb-4 p-3 bg-white border border-stone-200 rounded-2xl w-fit text-stone-400 group-hover:text-red-500 group-hover:border-red-100 transition-colors">
              <Zap size={32} />
            </div>
            <h3 className="text-lg font-bold text-stone-700 mb-2">Auto Configuração</h3>
            <p className="text-sm text-stone-500 leading-relaxed">
              O app tenta instalar automaticamente conectando via SSH. Requer IP e senha.
            </p>
          </div>

          <div
            onClick={() => handleMethodSelect('qr-code')}
            className="group relative bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-3xl border border-amber-200 cursor-pointer hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-100 transition-all"
          >
            <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
              <Sprout size={10} /> Premium
            </div>
            <div className="mb-4 p-3 bg-white/80 rounded-2xl w-fit text-orange-500 shadow-sm">
              <QrCode size={32} />
            </div>
            <h3 className="text-lg font-bold text-stone-800 mb-2">QR Code Pairing</h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              O Raspberry exibe um QR Code na tela. O app lê e finaliza o pareamento.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!initialData && step === 2) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-right duration-300 pb-24">
        <header className="flex items-center gap-3 md:gap-4 border-b border-stone-200 pb-3 md:pb-4">
          <button onClick={() => setStep(1)} className="p-2 rounded-lg hover:bg-stone-200 text-stone-500 transition-colors">
            <ChevronLeft size={20} className="md:w-6 md:h-6" />
          </button>
          <div>
            <h1 className="text-xl md:text-3xl font-extrabold text-stone-800">Instalação</h1>
            <p className="text-xs md:text-base text-stone-500 flex items-center gap-2">
              Siga os passos abaixo para conectar
            </p>
          </div>
        </header>

        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-xl space-y-6">
          {method === 'ssh-token' && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="bg-stone-100 p-2 rounded-lg text-stone-500 mt-1">1</div>
                <div>
                  <h3 className="font-bold text-stone-800">Acesse o Terminal</h3>
                  <p className="text-sm text-stone-500">Conecte-se ao seu Raspberry Pi via SSH.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-stone-100 p-2 rounded-lg text-stone-500 mt-1">2</div>
                <div className="w-full">
                  <h3 className="font-bold text-stone-800">Execute o Comando</h3>
                  <p className="text-sm text-stone-500 mb-2">Copie e cole o seguinte código:</p>
                  <div className="relative group">
                    <code className="block bg-stone-900 text-emerald-400 p-4 rounded-xl font-mono text-sm select-all break-all border border-stone-800 shadow-inner">
                      curl -sL https://biogarden.io/setup.sh | bash -s -- --token={generatedToken}
                    </code>
                    <button className="absolute top-3 right-3 text-stone-500 hover:text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity bg-stone-800 p-1.5 rounded">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 p-4 bg-blue-50 text-blue-700 rounded-xl text-xs">
                <Info size={16} className="shrink-0 mt-0.5" />
                <p>Após executar o comando, o dispositivo aparecerá automaticamente na lista.</p>
              </div>
            </div>
          )}
          {method !== 'ssh-token' && (
            <div className="text-center py-10 text-stone-400">
              Funcionalidade experimental em desenvolvimento.
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 size={20} /> Concluir e Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right duration-300 pb-24">
      <header className="flex items-center gap-3 md:gap-4 border-b border-stone-200 pb-3 md:pb-4">
        <button onClick={onCancel} className="p-2 rounded-lg hover:bg-stone-200 text-stone-500 transition-colors">
          <ChevronLeft size={20} className="md:w-6 md:h-6" />
        </button>
        <div>
          <h1 className="text-xl md:text-3xl font-extrabold text-stone-800">
            Configurar Hardware
          </h1>
          <p className="text-xs md:text-base text-stone-500">Ajuste os detalhes e mapeamento</p>
        </div>
      </header>

      <div className="bg-white p-4 md:p-6 rounded-3xl border border-stone-100 shadow-lg space-y-4">
        <h3 className="text-base font-bold text-stone-800 flex items-center gap-2 border-b border-stone-100 pb-2">
          <Server size={18} className="text-emerald-600" />
          Dados do Dispositivo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500">Nome</label>
            <input
              type="text"
              required
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500">Modelo</label>
            <select
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none text-sm"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            >
              <option value="Raspberry Pi 4B">Raspberry Pi 4B</option>
              <option value="Raspberry Pi Zero W">Raspberry Pi Zero W</option>
              <option value="ESP32">ESP32 (Arduino)</option>
              <option value="Detectando...">Detectando...</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-500">IP (Opcional)</label>
            <input
              type="text"
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-mono"
              value={formData.ip}
              onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
            <CircuitBoard size={18} className="text-emerald-600" />
            Sensores Conectados
          </h3>
          <button
            onClick={handleAddSensor}
            className="text-xs font-bold text-white bg-stone-800 hover:bg-stone-700 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-sm"
          >
            <Plus size={14} /> Adicionar Sensor
          </button>
        </div>

        <div className="space-y-3">
          {formData.sensors.map((sensor) => (
            <SensorConfigCard
              key={sensor.id}
              sensor={sensor}
              onChange={handleUpdateSensor}
              onDelete={() => handleDeleteSensor(sensor.id)}
            />
          ))}
          {formData.sensors.length === 0 && (
            <div className="text-center py-8 bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl">
              <p className="text-sm text-stone-400 font-medium">Nenhum sensor configurado.</p>
              <p className="text-xs text-stone-300 mt-1">Clique em "Adicionar Sensor" para mapear os pinos.</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 flex gap-4 border-t border-stone-200">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl font-bold text-stone-500 hover:bg-stone-100 transition-colors text-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          onClick={handleSubmit}
          className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
        >
          <Save size={18} /> Salvar Tudo
        </button>
      </div>
    </div>
  );
};