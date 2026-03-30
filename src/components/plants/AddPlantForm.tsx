import React, { useState } from 'react';
import {
  AlertCircle, ChevronLeft, ChevronDown,
  CircuitBoard, Droplets, Save, Tag,
  Thermometer, Wind, Settings,
} from 'lucide-react';
import type {
  Hardware, MeasurementType, MeasurementsMapping,
  Plant, PlantSettings,
} from '../../types';

// ─── Tipos locais ─────────────────────────────────────────────────────────────

interface AddPlantFormProps {
  onSave: (plant: Partial<Plant> & { measurementsMapping: MeasurementsMapping }) => void;
  onCancel: () => void;
  initialData?: Plant | null;
  availableHardware: Hardware[];
  loading?: boolean;
  error?: string | null;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: PlantSettings = {
  humidity: { min: 40,  max: 80,   alert: true  },
  temp:     { min: 18,  max: 28,   alert: false },
  air:      { min: 0,   max: 50,   alert: true  },
  light:    { min: 200, max: 1000, alert: false },
};

const LOCATIONS = ['Jardim Externo', 'Estufa', 'Varanda', 'Sala de Estar', 'Cozinha', 'Escritório'];

/**
 * Cada canal de medida disponível para monitoramento.
 * settingKey → chave correspondente em PlantSettings.
 */
const MEASUREMENT_CHANNELS: {
  type: MeasurementType;
  settingKey: keyof PlantSettings;
  label: string;
  unit: string;
  icon: React.ElementType;
  iconColor: string;
  accentColor: string;
}[] = [
  { type: 'SOIL_MOISTURE', settingKey: 'humidity', label: 'Umidade do Solo',  unit: '%',   icon: Droplets,    iconColor: 'text-emerald-400', accentColor: 'text-blue-500'   },
  { type: 'TEMPERATURE',   settingKey: 'temp',     label: 'Temperatura',       unit: '°C',  icon: Thermometer, iconColor: 'text-orange-400',  accentColor: 'text-orange-500' },
  { type: 'AIR_QUALITY',   settingKey: 'air',      label: 'Qualidade do Ar',   unit: 'AQI', icon: Wind,        iconColor: 'text-blue-400',    accentColor: 'text-teal-500'   },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export const AddPlantForm: React.FC<AddPlantFormProps> = ({
                                                            onSave, onCancel, initialData, availableHardware, loading = false, error = null,
                                                          }) => {
  const [formData, setFormData] = useState<Partial<Plant>>(() =>
          initialData ?? {
            name: '', species: '', location: '', image: '',
            hardwareId: 0,
            sensorsMapping:      { soil: null, env: null, light: null },
            measurementsMapping: {},
            settings: DEFAULT_SETTINGS,
          }
  );

  // Quais medidas o usuário quer monitorar (true = ativa)
  const [activeMap, setActiveMap] = useState<Partial<Record<MeasurementType, boolean>>>(
      () => {
        // Ao editar, pré-marca as medidas que já tinham sensorId
        if (initialData?.measurementsMapping) {
          return Object.fromEntries(
              Object.entries(initialData.measurementsMapping).map(([k, v]) => [k, v !== null])
          );
        }
        return {};
      }
  );

  const selectedHardware = availableHardware.find((h) => h.id === formData.hardwareId);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleHardwareChange = (id: number) => {
    setFormData((prev) => ({ ...prev, hardwareId: id }));
    setActiveMap({}); // limpa medidas ao trocar hardware
  };

  const toggleMeasurement = (type: MeasurementType) => {
    setActiveMap((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSettingChange = (
      key: keyof PlantSettings,
      field: 'min' | 'max' | 'alert',
      value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...(prev.settings ?? DEFAULT_SETTINGS),
        [key]: {
          ...(prev.settings ?? DEFAULT_SETTINGS)[key],
          [field]: field === 'alert' ? value : Number(value),
        },
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Constrói o mapeamento final: medidas ativas ficam com null por enquanto
    // (sensorId será associado na etapa de sensores)
    const measurementsMapping: MeasurementsMapping = Object.fromEntries(
        MEASUREMENT_CHANNELS
            .filter(({ type }) => activeMap[type])
            .map(({ type }) => [type, null])
    );

    onSave({
      ...formData,
      image: formData.image ||
          'https://images.unsplash.com/photo-1530968464168-ab334d3efcee?auto=format&fit=crop&q=80&w=400',
      measurementsMapping,
    });
  };

  const settings = formData.settings ?? DEFAULT_SETTINGS;
  // Canais ativos = os que têm toggle ligado E um hardware selecionado
  const activeChannels = MEASUREMENT_CHANNELS.filter(({ type }) => activeMap[type]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
      <div className="max-w-3xl mx-auto space-y-4 md:space-y-6 animate-in slide-in-from-bottom duration-300 pb-24">

        {/* Cabeçalho */}
        <header className="flex items-center gap-3 md:gap-4 border-b border-stone-200 pb-3 md:pb-4">
          <button onClick={onCancel} className="p-2 rounded-lg hover:bg-stone-200 text-stone-500 transition-colors">
            <ChevronLeft size={20} className="md:w-6 md:h-6" />
          </button>
          <div>
            <h1 className="text-xl md:text-3xl font-extrabold text-stone-800">
              {initialData ? 'Editar Cultivo' : 'Novo Cultivo'}
            </h1>
            <p className="text-xs md:text-base text-stone-500">Configuração de monitoramento</p>
          </div>
        </header>

        {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <AlertCircle size={16} className="shrink-0" />{error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">

          {/* ── Identificação ──────────────────────────────────────────────────── */}
          <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/50 space-y-4 md:space-y-6">
            <h3 className="text-base md:text-lg font-bold text-stone-800 flex items-center gap-2">
              <Tag size={18} className="text-emerald-600" /> Identificação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-xs md:text-sm font-bold text-stone-700">Apelido</label>
                <input type="text" required placeholder="Ex: Tomateiro 01"
                       className="w-full p-2.5 md:p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                       value={formData.name ?? ''}
                       onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 md:space-y-2">
                <label className="text-xs md:text-sm font-bold text-stone-700">Espécie</label>
                <input type="text" placeholder="Ex: Solanum lycopersicum"
                       className="w-full p-2.5 md:p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                       value={formData.species ?? ''}
                       onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                />
              </div>
              <div className="space-y-1.5 md:space-y-2 md:col-span-2">
                <label className="text-xs md:text-sm font-bold text-stone-700">Localização</label>
                <div className="relative">
                  <select required
                          className="w-full p-2.5 md:p-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all appearance-none text-sm"
                          value={formData.location ?? ''}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  >
                    <option value="" disabled>Selecione um ambiente…</option>
                    {LOCATIONS.map((loc) => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Medidas Monitoradas ────────────────────────────────────────────── */}
          <div className="bg-stone-800 text-white p-4 md:p-8 rounded-2xl md:rounded-3xl border border-stone-700 shadow-xl space-y-4 md:space-y-6">
            <h3 className="text-base md:text-lg font-bold flex items-center gap-2">
              <CircuitBoard size={18} className="text-emerald-400" /> Medidas Monitoradas
            </h3>

            {/* Seleção de Hardware */}
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[10px] md:text-xs font-bold text-stone-300 uppercase tracking-wider">
                Central de Controle
              </label>
              <div className="relative">
                <select
                    className="w-full p-3 bg-stone-900 border border-stone-600 rounded-xl focus:border-emerald-500 outline-none transition-all text-white appearance-none cursor-pointer text-sm"
                    value={formData.hardwareId ?? 0}
                    onChange={(e) => handleHardwareChange(parseInt(e.target.value))}
                >
                  <option value={0}>Selecione o equipamento…</option>
                  {availableHardware.map((hw) => (
                      <option key={hw.id} value={hw.id}>
                        {hw.name} ({hw.model}) — {hw.ip}
                      </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={16} />
              </div>
              {availableHardware.length === 0 && (
                  <p className="text-xs text-amber-400 mt-1">
                    Nenhum hardware cadastrado. Adicione um em Configurações.
                  </p>
              )}
            </div>

            {/* Toggles das medidas — só aparece após selecionar hardware */}
            {selectedHardware && (
                <div className="bg-stone-900/50 p-4 rounded-xl border border-stone-700/50 space-y-2 animate-in slide-in-from-top duration-300">
                  <p className="text-xs text-stone-400 mb-3">
                    Selecione o que deseja monitorar em <strong className="text-stone-200">{selectedHardware.name}</strong>:
                  </p>
                  {MEASUREMENT_CHANNELS.map(({ type, label, unit, icon: Icon, iconColor }) => {
                    const active = !!activeMap[type];
                    return (
                        <button
                            key={type}
                            type="button"
                            onClick={() => toggleMeasurement(type)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                                active
                                    ? 'bg-emerald-900/40 border-emerald-600/50'
                                    : 'bg-stone-800/60 border-stone-700 hover:border-stone-500'
                            }`}
                        >
                          <div className={`p-1.5 rounded-lg border shrink-0 ${
                              active ? 'bg-emerald-800/50 border-emerald-600/50' : 'bg-stone-700 border-stone-600'
                          } ${iconColor}`}>
                            <Icon size={15} />
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-bold ${active ? 'text-white' : 'text-stone-400'}`}>{label}</p>
                            <p className="text-[10px] text-stone-500">{unit}</p>
                          </div>
                          {/* Toggle visual */}
                          <div className={`w-9 h-5 rounded-full transition-colors shrink-0 ${active ? 'bg-emerald-500' : 'bg-stone-600'}`}>
                            <div className={`mt-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                          </div>
                        </button>
                    );
                  })}
                </div>
            )}
          </div>

          {/* ── Regras de Monitoramento — só renderiza se houver medidas ativas ── */}
          {activeChannels.length > 0 && (
              <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/50 space-y-4 md:space-y-6 animate-in slide-in-from-bottom duration-300">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-stone-800 flex items-center gap-2">
                    <Settings size={18} className="text-emerald-600" /> Regras de Monitoramento
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Limites ideais para cada medida ativa. Alertas disparam quando o valor sair do intervalo.
                  </p>
                </div>

                <div className="grid gap-3 md:gap-4">
                  {activeChannels.map(({ type, settingKey, label, unit, icon: Icon, accentColor }) => {
                    const s = settings[settingKey];
                    return (
                        <div key={type} className="p-3 md:p-4 bg-stone-50 rounded-xl md:rounded-2xl border border-stone-100 flex flex-col sm:flex-row items-center gap-3 md:gap-4">

                          {/* Ícone + label */}
                          <div className="flex items-center gap-2 w-full sm:w-1/3">
                            <div className={`p-1.5 md:p-2 bg-white rounded-lg shadow-sm ${accentColor}`}>
                              <Icon size={16} />
                            </div>
                            <div>
                              <p className="font-bold text-stone-700 text-xs md:text-sm">{label}</p>
                              <p className="text-[10px] md:text-xs text-stone-400">{unit}</p>
                            </div>
                          </div>

                          {/* Min / Max */}
                          <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
                            <div className="flex-1 space-y-1">
                              <label className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase text-center block">Min</label>
                              <input type="number"
                                     className="w-full p-1.5 md:p-2 bg-white border border-stone-200 rounded-lg text-center text-xs md:text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                                     value={s.min}
                                     onChange={(e) => handleSettingChange(settingKey, 'min', e.target.value)}
                              />
                            </div>
                            <span className="text-stone-300 pt-4 text-sm">—</span>
                            <div className="flex-1 space-y-1">
                              <label className="text-[9px] md:text-[10px] font-bold text-stone-400 uppercase text-center block">Max</label>
                              <input type="number"
                                     className="w-full p-1.5 md:p-2 bg-white border border-stone-200 rounded-lg text-center text-xs md:text-sm font-bold outline-none focus:border-emerald-500 transition-all"
                                     value={s.max}
                                     onChange={(e) => handleSettingChange(settingKey, 'max', e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Toggle alerta */}
                          <label className="flex items-center gap-2 cursor-pointer shrink-0 ml-auto sm:ml-0">
                            <span className="text-[10px] md:text-xs font-bold text-stone-500 uppercase">Alerta</span>
                            <div className="relative">
                              <input type="checkbox" className="sr-only peer"
                                     checked={s.alert}
                                     onChange={(e) => handleSettingChange(settingKey, 'alert', e.target.checked)}
                              />
                              <div className="w-9 h-5 bg-stone-200 peer-checked:bg-emerald-500 rounded-full transition-colors" />
                              <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                            </div>
                          </label>
                        </div>
                    );
                  })}
                </div>
              </div>
          )}

          {/* ── Botões ─────────────────────────────────────────────────────────── */}
          <div className="pt-2 md:pt-4 flex gap-3 md:gap-4 pb-4">
            <button type="button" onClick={onCancel} disabled={loading}
                    className="flex-1 py-3 md:py-4 rounded-xl font-bold text-stone-500 hover:bg-stone-100 transition-colors text-sm md:text-base disabled:opacity-50"
            >
              Cancelar
            </button>
            <button type="submit" disabled={loading}
                    className="flex-[2] py-3 md:py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm md:text-base"
            >
              {loading
                  ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <><Save size={18} /> Salvar</>
              }
            </button>
          </div>
        </form>
      </div>
  );
};