import React, { useState } from 'react';
import { AlertOctagon, AlertTriangle, Camera, CheckCircle2, ChevronDown, ChevronUp, CircuitBoard, Droplets, Edit, Minus, Plus, Server, Sun, Terminal, Wifi, Wind, Zap } from 'lucide-react';
import type { Hardware, SensorType } from '../../types';
import { SENSOR_TEMPLATES } from '../../constants/sensorTemplates';
import { AddHardwareForm } from './AddHardwareForm';

interface SettingsViewProps {
  hardwareList: Hardware[];
  onAddHardware: (hardware: Hardware) => void;
  onEditHardware: (hardware: Hardware) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ hardwareList, onAddHardware, onEditHardware }) => {
  const [expandedHubId, setExpandedHubId] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingHardware, setEditingHardware] = useState<Hardware | null>(null);
  const [expandedSensorErrorId, setExpandedSensorErrorId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedHubId(expandedHubId === id ? null : id);
  };

  const toggleSensorError = (id: number) => {
    setExpandedSensorErrorId(expandedSensorErrorId === id ? null : id);
  };

  const getStatusColor = (status: string) => {
    if (status === 'online' || status === 'ok') return 'text-emerald-500 bg-emerald-500/10';
    if (status === 'error') return 'text-red-500 bg-red-500/10';
    return 'text-stone-400 bg-stone-100';
  };

  const getIcon = (type: SensorType) => {
    if (type.includes('soil')) return Droplets;
    if (type.includes('dht') || type.includes('air')) return Wind;
    if (type.includes('camera')) return Camera;
    if (type.includes('light')) return Sun;
    if (type.includes('relay')) return Zap;
    return CircuitBoard;
  };

  if (isAdding || editingHardware) {
    return (
      <AddHardwareForm
        onSave={(data) => {
          if (editingHardware) {
            onEditHardware({ ...editingHardware, ...data });
            setEditingHardware(null);
          } else {
            onAddHardware(data);
            setIsAdding(false);
          }
        }}
        onCancel={() => { setIsAdding(false); setEditingHardware(null); }}
        initialData={editingHardware}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-24">
      <header className="mb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-stone-800">Hardware</h1>
          <p className="text-xs md:text-base text-stone-500 mt-1">Status da rede de sensores</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-stone-800 text-white rounded-xl text-xs md:text-sm font-bold shadow-lg hover:bg-stone-700 transition-colors"
        >
          <Plus size={16} /> <span className="hidden md:inline">Adicionar Hardware</span> <span className="md:hidden">Add</span>
        </button>
      </header>

      <div className="space-y-4">
        {hardwareList.map(hub => (
          <div
            key={hub.id}
            className={`rounded-2xl border transition-all overflow-hidden ${
              expandedHubId === hub.id
                ? 'bg-white border-stone-300 shadow-lg'
                : 'bg-white border-stone-200 shadow-sm hover:border-emerald-300'
            }`}
          >
            <div
              onClick={() => toggleExpand(hub.id)}
              className="p-4 md:p-5 flex items-center justify-between cursor-pointer bg-white group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${hub.status === 'online' ? 'bg-stone-800 text-emerald-400' : 'bg-stone-100 text-stone-400'}`}>
                  <Server size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-stone-800 text-sm md:text-lg leading-tight">{hub.name}</h3>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingHardware(hub); }}
                      className="p-1 text-stone-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      title="Editar Configuração"
                    >
                      <Edit size={14} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-stone-500 font-medium">{hub.model}</span>
                    <span className="hidden md:flex items-center gap-1 text-xs font-mono text-stone-400 bg-stone-50 px-1.5 rounded border border-stone-100">
                      <Wifi size={10} /> {hub.ip}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-6">
                <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(hub.status)}`}>
                  <div className={`w-2 h-2 rounded-full ${hub.status === 'online' ? 'bg-current animate-pulse' : 'bg-current'}`}></div>
                  {hub.status}
                </div>
                <div className={`md:hidden w-3 h-3 rounded-full ${hub.status === 'online' ? 'bg-emerald-500' : 'bg-stone-300'}`}></div>

                {expandedHubId === hub.id ? <ChevronUp size={20} className="text-stone-400" /> : <ChevronDown size={20} className="text-stone-400" />}
              </div>
            </div>

            {expandedHubId === hub.id && (
              <div className="bg-stone-50 border-t border-stone-100 p-2 md:p-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                <div className="px-2 pb-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest flex justify-between">
                  <span>Sensor / Serviço</span>
                  <span className="hidden md:inline">Configuração Física</span>
                  <span>Integridade</span>
                </div>

                {hub.sensors.map(sensor => {
                  const SensorIcon = getIcon(sensor.type);
                  const configText = Object.entries(sensor.config || {}).map(([k, v]) => `${k.toUpperCase()}:${v}`).join(', ');
                  const hasError = sensor.status === 'error';

                  return (
                    <div key={sensor.id} className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
                      <div className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${sensor.status === 'ok' ? 'bg-stone-100 text-stone-600' : 'bg-red-50 text-red-500'}`}>
                            <SensorIcon size={16} />
                          </div>
                          <div>
                            <p className="text-xs md:text-sm font-bold text-stone-700">{sensor.name}</p>
                            <p className="text-[10px] text-stone-400">{SENSOR_TEMPLATES[sensor.type]?.label || sensor.type}</p>
                          </div>
                        </div>

                        <div className="hidden md:block text-xs font-mono text-stone-500 bg-stone-100 px-2 py-1 rounded">
                          {configText}
                        </div>

                        <div className="flex items-center gap-3">
                          {hasError && (
                            <button
                              onClick={() => toggleSensorError(sensor.id)}
                              className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1 bg-red-50 px-2 py-1 rounded-lg transition-colors animate-pulse"
                            >
                              <AlertOctagon size={14} />
                              {expandedSensorErrorId === sensor.id ? 'Ocultar Erro' : 'Ver Erro'}
                            </button>
                          )}

                          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wide w-24 justify-center ${getStatusColor(sensor.status)}`}>
                            {sensor.status === 'ok' ? (
                              <><CheckCircle2 size={12} /> Íntegro</>
                            ) : sensor.status === 'error' ? (
                              <><AlertTriangle size={12} /> Falha</>
                            ) : (
                              <><Minus size={12} /> Offline</>
                            )}
                          </div>

                          <button
                            onClick={(e) => { e.stopPropagation(); setEditingHardware(hub); }}
                            className="p-1.5 text-stone-300 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Editar este sensor"
                          >
                            <Edit size={14} />
                          </button>
                        </div>
                      </div>

                      {hasError && expandedSensorErrorId === sensor.id && (
                        <div className="bg-red-50 p-3 border-t border-red-100 text-xs text-red-700 flex items-start gap-2">
                          <Terminal size={14} className="mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold block mb-1">Log de Erro:</span>
                            <span className="font-mono">{sensor.errorMessage || 'Erro desconhecido na comunicação com o sensor.'}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {hub.sensors.length === 0 && (
                  <div className="text-center py-6 text-stone-400 text-sm italic">
                    Nenhum sensor configurado. Clique em editar para adicionar.
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};