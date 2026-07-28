import React, { useState } from 'react';
import {
    Camera, ChevronLeft, Droplets, Leaf,
     Thermometer, Wind, Zap, CircuitBoard,
} from 'lucide-react';
import type { Plant, DataPoint, MeasurementType } from '../../types';
import type { TelemetryMap, ActiveSensorMap } from '../../hooks/useTelemetry';
import { ActionButton } from '../common/ActionButton';
import { SensorCard } from '../common/SensorCard';

// ─── Configuração visual por MeasurementType ──────────────────────────────────
// Adicionar novos tipos aqui é suficiente — nada mais precisa mudar.

const MEASUREMENT_CONFIG: Record<MeasurementType, {
    title: string;
    icon:  React.ElementType;
    unit:  string;
    color: string;
}> = {
    HUMIDITY: { title: 'Umidade Solo', icon: Droplets,     unit: '%',    color: 'green'  },
    TEMPERATURE:   { title: 'Temperatura',  icon: Thermometer,  unit: '°C',   color: 'orange' },
    AIR_QUALITY:   { title: 'Qualidade Ar', icon: Wind,         unit: ' AQI', color: 'blue'   },
    MOCK:          { title: 'Mock',         icon: CircuitBoard, unit: '',      color: 'yellow' },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface PlantDetailViewProps {
    plant:          Plant;
    onBack:         () => void;
    connected:      boolean;
    activeSensors:  ActiveSensorMap;
    telemetryData:  TelemetryMap;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export const PlantDetailView: React.FC<PlantDetailViewProps> = ({
                                                                    plant, onBack, connected, activeSensors, telemetryData,
                                                                }) => {
    const [showCamera, setShowCamera] = useState(false);
    const [isWatering, setIsWatering] = useState(false);
    const [isLightOn,  setIsLightOn]  = useState(false);

    // Apenas os tipos que a planta tem no measurementsMapping
    const activeTypes = Object.entries(plant.measurementsMapping ?? {})
        .filter(([, entry]) => entry !== null)
        .map(([type]) => type as MeasurementType);

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

            {/* ── Cards de sensores — apenas os monitorados pela planta ── */}
            {activeTypes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-stone-400 gap-3">
                    <CircuitBoard size={36} strokeWidth={1.5} />
                    <p className="font-bold text-base">Nenhuma medida configurada</p>
                    <p className="text-sm text-center">Edite esta planta para associar sensores.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {activeTypes.map((type) => {
                        const config = MEASUREMENT_CONFIG[type];
                        if (!config) return null;

                        const entry        = plant.measurementsMapping?.[type];
                        const measurementId = entry?.measurementId ?? 0;
                        const isActive     = !!activeSensors[type];
                        const data: DataPoint[] = telemetryData[type] ?? [];

                        return (
                            <SensorCard
                                key={type}
                                title={config.title}
                                icon={config.icon}
                                data={data}
                                unit={config.unit}
                                color={config.color}
                                measurementId={measurementId}
                                connected={connected && isActive}
                            />
                        );
                    })}
                </div>
            )}

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