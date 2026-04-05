import React, { useState } from 'react';
import {
    Camera, ChevronLeft, Droplets, Leaf,
    RefreshCw, Sun, Thermometer, Wind, Zap,
} from 'lucide-react';
import type { Plant, DataPoint } from '../../types';
import { ActionButton } from '../common/ActionButton';
import { SensorCard } from '../common/SensorCard';

interface PlantDetailViewProps {
    plant:              Plant;
    onBack:             () => void;
    onRefresh:          () => void;
    connected:          boolean;
    soilData:           DataPoint[];
    soilMeasurementId:  number;
    airData:            DataPoint[];
    airMeasurementId:   number;
    tempData:           DataPoint[];
    tempMeasurementId:  number;
    mockData:           DataPoint[];
    mockMeasurementId:  number;
    lightData:          DataPoint[];
    lightMeasurementId: number;
    loading:            boolean;
}

export const PlantDetailView: React.FC<PlantDetailViewProps> = ({
                                                                    plant, onBack, onRefresh, connected,
                                                                    soilData, soilMeasurementId,
                                                                    airData,  airMeasurementId,
                                                                    tempData, tempMeasurementId,
                                                                    mockData, mockMeasurementId,
                                                                    lightData, lightMeasurementId,
                                                                    loading,
                                                                }) => {
    const [showCamera, setShowCamera] = useState(false);
    const [isWatering, setIsWatering] = useState(false);
    const [isLightOn,  setIsLightOn]  = useState(false);

    return (
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in slide-in-from-right duration-300 pb-24">

            {/* ── Header ──────────────────────────────────────────────── */}
            <header className="flex flex-col gap-4 border-b border-stone-200 pb-4 md:pb-6">
                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={onBack}
                        className="p-1 md:p-2 rounded-lg hover:bg-stone-200 transition-colors text-stone-500"
                    >
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

                    {/* Indicador MQTT */}
                    <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                        connected
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-stone-50 text-stone-400 border-stone-200'
                    }`}>
                        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`} />
                        {connected ? 'MQTT Conectado' : 'MQTT Desconectado'}
                    </div>

                    <button
                        onClick={onRefresh}
                        disabled={loading}
                        className={`flex items-center justify-center gap-2 px-3 py-2.5 md:px-4 md:py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-xs md:text-sm font-bold transition-all shadow-lg shadow-stone-300 active:scale-95 ${
                            loading ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        <span className="hidden md:inline">Atualizar</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 md:flex gap-2 w-full md:w-auto">
                    <button
                        onClick={() => setShowCamera(!showCamera)}
                        className={`flex items-center justify-center gap-2 px-3 py-2.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold transition-all border shadow-sm ${
                            showCamera
                                ? 'bg-red-50 text-red-600 border-red-100'
                                : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200'
                        }`}
                    >
                        {showCamera ? <Zap size={16} /> : <Camera size={16} />}
                        {showCamera ? 'Fechar' : 'Câmera'}
                    </button>
                </div>
            </header>

            {/* ── Camera ──────────────────────────────────────────────── */}
            {showCamera && (
                <div className="w-full bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl relative aspect-video border-2 md:border-4 border-stone-800 animate-in fade-in zoom-in duration-300">
                    <img src={plant.image} alt="Live Feed" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-red-600 text-white px-2 py-1 rounded text-[10px] md:text-xs font-bold animate-pulse flex items-center gap-1">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full" /> LIVE
                    </div>
                </div>
            )}

            {/* ── Ações ───────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-2 md:gap-4">
                <ActionButton
                    icon={Droplets}
                    label={isWatering ? 'Irrigando' : 'Irrigar'}
                    isActive={isWatering}
                    color="blue"
                    onClick={() => setIsWatering(!isWatering)}
                />
                <ActionButton
                    icon={Zap}
                    label={isLightOn ? 'Luz ON' : 'Luz'}
                    isActive={isLightOn}
                    color="yellow"
                    onClick={() => setIsLightOn(!isLightOn)}
                />
            </div>

            {/* ── Gráficos ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <SensorCard
                    title="Umidade Solo"
                    icon={Droplets}
                    data={soilData}
                    unit="%"
                    color="green"
                    measurementId={soilMeasurementId}
                    connected={connected}
                />
                <SensorCard
                    title="Qualidade Ar"
                    icon={Wind}
                    data={airData}
                    unit=" AQI"
                    color="blue"
                    measurementId={airMeasurementId}
                    connected={connected}
                />
                <SensorCard
                    title="Temperatura"
                    icon={Thermometer}
                    data={tempData}
                    unit="°C"
                    color="orange"
                    measurementId={tempMeasurementId}
                    connected={connected}
                />
                <SensorCard
                    title="Luminosidade"
                    icon={Sun}
                    data={lightData}
                    unit=" lx"
                    color="yellow"
                    measurementId={lightMeasurementId}
                    connected={connected}
                />
                <SensorCard
                    title="Mock"
                    icon={Sun}
                    data={mockData}
                    unit=""
                    color="yellow"
                    measurementId={mockMeasurementId}
                    connected={connected}
                />
            </div>

            {/* ── Análise ──────────────────────────────────────────────── */}
            <div className="bg-emerald-50/50 rounded-2xl p-4 md:p-6 border border-emerald-100 mb-8">
                <h4 className="text-xs md:text-sm font-bold text-emerald-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                    <Leaf size={16} /> Análise
                </h4>
                <p className="text-stone-600 text-xs md:text-sm leading-relaxed">
                    Os parâmetros estão ideais para <strong>{plant.species}</strong>. Fotossíntese eficiente detectada.
                </p>
            </div>
        </div>
    );
};