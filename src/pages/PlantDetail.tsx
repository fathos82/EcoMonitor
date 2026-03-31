import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/AppContext';
import { useTelemetry } from '../hooks/useTelemetry';
import { PlantDetailView } from '../components/plants/PlantDetailView';

// TODO: Fazer isso ser escalavel.
export const PlantDetail: React.FC = () => {
    const { id }     = useParams<{ id: string }>();
    const navigate   = useNavigate();
    const { plants } = useAppStore();
    const [timeRange, setTimeRange] = useState('24H');

    const plant = plants.find((p) => p.id === Number(id)) ?? null;
    const { data, loading, connected, refresh } = useTelemetry(plant);

    if (!plant) {
        return (
            <div className="text-center py-12">
                <p className="text-stone-500">Planta não encontrada</p>
                <button onClick={() => navigate('/')} className="mt-4 text-emerald-600 hover:underline">
                    Voltar para lista
                </button>
            </div>
        );
    }

    return (
        <PlantDetailView
            plant={plant}
            onBack={() => navigate('/')}
            onRefresh={refresh}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            soilData={data.SOIL_MOISTURE ?? []}
            airData={data.AIR_QUALITY    ?? []}
            tempData={data.TEMPERATURE   ?? []}
            mockData={data.MOCK   ?? []}
            lightData={[]}       // não implementado ainda
            loading={loading}
            connected={connected}
        />
    );
};
