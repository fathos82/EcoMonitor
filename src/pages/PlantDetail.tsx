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

    // data → janela completa (windowPoints). Card mostra últimos 60; modal expandido mostra tudo.
    const { data, connected } = useTelemetry(plant);

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

    const mm = plant.measurementsMapping ?? {};
    const soilMeasurementId = mm.SOIL_MOISTURE?.measurementId ?? 0;
    const airMeasurementId  = mm.AIR_QUALITY?.measurementId   ?? 0;
    const tempMeasurementId = mm.TEMPERATURE?.measurementId   ?? 0;
    const mockMeasurementId = mm.MOCK?.measurementId          ?? 0;

    return (
        <PlantDetailView
            plant={plant}
            onBack={() => navigate('/')}
            connected={connected}
            soilData={data.SOIL_MOISTURE ?? []}
            soilMeasurementId={soilMeasurementId}
            airData={data.AIR_QUALITY    ?? []}
            airMeasurementId={airMeasurementId}
            tempData={data.TEMPERATURE   ?? []}
            tempMeasurementId={tempMeasurementId}
            mockData={data.MOCK          ?? []}
            mockMeasurementId={mockMeasurementId}
            lightData={[]}
            lightMeasurementId={0}
        />
    );
};