import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/AppContext';
import { useTelemetry } from '../hooks/useTelemetry';
import { PlantDetailView } from '../components/plants/PlantDetailView';

export const PlantDetail: React.FC = () => {
    const { id }     = useParams<{ id: string }>();
    const navigate   = useNavigate();
    const { plants } = useAppStore();

    const plant = plants.find((p) => p.id === Number(id)) ?? null;
    const { data, connected, activeSensors } = useTelemetry(plant);

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
            connected={connected}
            activeSensors={activeSensors}
            telemetryData={data}
        />
    );
};