import React, { useState } from 'react';
import { Cable, ChevronDown, ChevronUp, CircuitBoard, Droplets, Sun, Tag, Trash2, Wind, Zap, Camera } from 'lucide-react';
import type { Sensor, SensorType } from '../../types';
import { SENSOR_TEMPLATES } from '../../constants/sensorTemplates';

interface SensorConfigCardProps {
  sensor: Sensor;
  onChange: (sensor: Sensor) => void;
  onDelete: () => void;
}

export const SensorConfigCard: React.FC<SensorConfigCardProps> = ({ sensor, onChange, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const template = SENSOR_TEMPLATES[sensor.type] || SENSOR_TEMPLATES['generic'];

  const handleChange = (field: keyof Sensor, value: string | Record<string, string>) => {
    onChange({ ...sensor, [field]: value });
  };

  const handleConfigChange = (key: string, value: string) => {
    onChange({ ...sensor, config: { ...sensor.config, [key]: value } });
  };

  const getIcon = (type: SensorType) => {
    if (type.includes('soil')) return Droplets;
    if (type.includes('dht') || type.includes('air')) return Wind;
    if (type.includes('camera')) return Camera;
    if (type.includes('light')) return Sun;
    if (type.includes('relay')) return Zap;
    return CircuitBoard;
  };

  const IconComponent = getIcon(sensor.type);

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden transition-all shadow-sm hover:shadow-md">
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 flex items-center justify-between cursor-pointer bg-stone-50 hover:bg-white transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white border border-stone-200 rounded-lg text-stone-500">
            <IconComponent size={18} />
          </div>
          <div>
            <h4 className="font-bold text-stone-700 text-sm">{sensor.name || 'Novo Sensor'}</h4>
            <p className="text-[10px] text-stone-400">{template.label}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded">
              {Object.values(sensor.config || {}).join(', ') || 'N/A'}
            </span>
          </div>
          {expanded ? <ChevronUp size={16} className="text-stone-400" /> : <ChevronDown size={16} className="text-stone-400" />}
        </div>
      </div>

      {expanded && (
        <div className="p-4 border-t border-stone-100 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase">Nome do Sensor</label>
              <div className="relative">
                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={sensor.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full pl-9 p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:border-emerald-500 outline-none"
                  placeholder="Ex: Sensor Umidade"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase">Tipo / Modelo</label>
              <div className="relative">
                <CircuitBoard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <select
                  value={sensor.type}
                  onChange={(e) => {
                    const newType = e.target.value as SensorType;
                    const newTemplate = SENSOR_TEMPLATES[newType];
                    const newConfig: Record<string, string> = newTemplate.pins.reduce((acc, pin) => ({ ...acc, [pin.key]: '' }), {});
                    onChange({ ...sensor, type: newType, config: newConfig });
                  }}
                  className="w-full pl-9 p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:border-emerald-500 outline-none appearance-none"
                >
                  {Object.entries(SENSOR_TEMPLATES).map(([key, tmpl]) => (
                    <option key={key} value={key}>{tmpl.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
            <h5 className="text-[10px] font-bold text-stone-500 uppercase mb-2 flex items-center gap-1">
              <Cable size={12} /> Configuração de Pinos
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {template.pins.map(pinDef => (
                <div key={pinDef.key} className="space-y-1">
                  <label className="text-[10px] text-stone-400 font-medium">{pinDef.label}</label>
                  <div className="flex">
                    <span className="bg-stone-200 text-stone-500 text-xs px-2 flex items-center rounded-l-lg border border-r-0 border-stone-300">
                      {pinDef.type === 'analog' ? 'A' : pinDef.type === 'i2c' ? '0x' : 'D'}
                    </span>
                    <input
                      type="text"
                      value={sensor.config[pinDef.key] || ''}
                      onChange={(e) => handleConfigChange(pinDef.key, e.target.value)}
                      className="w-full p-2 bg-white border border-stone-300 rounded-r-lg text-sm outline-none focus:border-emerald-500 font-mono"
                      placeholder={pinDef.type === 'analog' ? '0' : '21'}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={onDelete}
              className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 font-bold px-3 py-1.5 rounded hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
            >
              <Trash2 size={12} /> Remover Sensor
            </button>
          </div>
        </div>
      )}
    </div>
  );
};