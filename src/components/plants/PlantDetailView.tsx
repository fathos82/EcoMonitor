import React, { useState } from 'react';
import { Camera, ChevronLeft, Droplets, Leaf, RefreshCw, Sun, Thermometer, Wind, Zap } from 'lucide-react';
import type { Plant, DataPoint } from '../../types';
import { ActionButton } from '../common/ActionButton';
import { SensorCard } from '../common/SensorCard';

interface PlantDetailViewProps {
  plant: Plant;
  onBack: () => void;
  onRefresh: () => void;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  soilData: DataPoint[];
  airData: DataPoint[];
  tempData: DataPoint[];
  lightData: DataPoint[];
  mockData: DataPoint[];
  loading: boolean;
}

// TODO: FAzer isso ser esvalavel.

export const PlantDetailView: React.FC<PlantDetailViewProps> = ({
  plant,
  onBack,
  onRefresh,
  timeRange,
  onTimeRangeChange,
  soilData,
  mockData,
  airData,
  tempData,
  lightData,
  loading
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [isWatering, setIsWatering] = useState(false);
  const [isLightOn, setIsLightOn] = useState(false);

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in slide-in-from-right duration-300 pb-24">
      <header className="flex flex-col gap-4 border-b border-stone-200 pb-4 md:pb-6">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={onBack} className="p-1 md:p-2 rounded-lg hover:bg-stone-200 transition-colors text-stone-500">
            <ChevronLeft size={20} className="md:w-6 md:h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl md:text-3xl font-extrabold text-stone-800 flex flex-col md:flex-row md:items-center gap-1 md:gap-2 leading-none">
              {plant.name}
              <span className="inline-block w-fit text-[10px] md:text-sm px-2 py-0.5 md:py-1 bg-stone-100 rounded-md text-stone-500 font-normal border border-stone-200">
                {plant.location}
              </span>
            </h1>
          </div>

          <div className="flex bg-stone-100 p-1 rounded-lg">
            {['1H', '24H', '7D'].map((range) => (
              <button
                key={range}
                onClick={() => onTimeRangeChange(range)}
                className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-bold rounded-md transition-all ${
                  timeRange === range ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
          <button
            onClick={() => setShowCamera(!showCamera)}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-all border shadow-sm ${
              showCamera ? 'bg-red-50 text-red-600 border-red-100' : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200'
            }`}
          >
            {showCamera ? <Zap size={16} /> : <Camera size={16} />}
            {showCamera ? 'Fechar' : 'Câmera'}
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`flex items-center justify-center gap-2 px-3 py-2.5 md:px-4 md:py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs md:text-sm font-bold transition-all shadow-lg shadow-stone-300 active:scale-95 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Atualizar
          </button>
        </div>
      </header>

      {showCamera && (
        <div className="w-full bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl relative aspect-video border-2 md:border-4 border-stone-800 animate-in fade-in zoom-in duration-300">
          <img src={plant.image} alt="Live Feed" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-red-600 text-white px-2 py-1 rounded text-[10px] md:text-xs font-bold animate-pulse flex items-center gap-1">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full"></div> LIVE
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 md:gap-4">
        <ActionButton
          icon={Droplets}
          label={isWatering ? "Irrigando" : "Irrigar"}
          isActive={isWatering}
          color="blue"
          onClick={() => setIsWatering(!isWatering)}
        />
        <ActionButton
          icon={Zap}
          label={isLightOn ? "Luz ON" : "Luz"}
          isActive={isLightOn}
          color="yellow"
          onClick={() => setIsLightOn(!isLightOn)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <SensorCard title="Umidade Solo" icon={Droplets} data={soilData} dataKey="humidity" unit="%" color="green" />
        <SensorCard title="Qualidade Ar" icon={Wind} data={airData} dataKey="aqi" unit=" AQI" color="blue" />
        <SensorCard title="Temperatura" icon={Thermometer} data={tempData} dataKey="temp" unit="°C" color="orange" />
        <SensorCard title="Luminosidade" icon={Sun} data={lightData} dataKey="lux" unit=" lx" color="yellow" />
        <SensorCard title="Mock" icon={Thermometer} data={mockData} dataKey="mock" unit=" mock" color="yellow" />
      </div>

      <div className="bg-emerald-50/50 rounded-2xl p-4 md:p-6 border border-emerald-100 mb-8">
        <h4 className="text-xs md:text-sm font-bold text-emerald-700 mb-2 uppercase tracking-wide flex items-center gap-2">
          <Leaf size={16} />
          Análise
        </h4>
        <p className="text-stone-600 text-xs md:text-sm leading-relaxed">
          Os parâmetros estão ideais para <strong>{plant.species}</strong>. Fotossíntese eficiente detectada.
        </p>
      </div>
    </div>
  );
};