import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/AppContext';
import { usePlantData } from '../hooks/usePlantData';
import { PlantDetailView } from '../components/plants/PlantDetailView';

export const PlantDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { plants } = useAppStore();
  const [timeRange, setTimeRange] = useState('24H');
  
  const plant = plants.find(p => p.id === Number(id));
  const { soilData, airData, tempData, lightData, loading, loadPlantData } = usePlantData();

  useEffect(() => {
    if (plant) {
      loadPlantData(plant.id);
    }
  }, [plant]);

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
      onRefresh={() => loadPlantData(plant.id)}
      timeRange={timeRange}
      onTimeRangeChange={setTimeRange}
      soilData={soilData}
      airData={airData}
      tempData={tempData}
      lightData={lightData}
      loading={loading}
    />
  );
};