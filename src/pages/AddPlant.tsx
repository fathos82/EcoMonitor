import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AddPlantForm } from '../components/plants/AddPlantForm';
import type { Plant } from '../types';
import { usePlants } from '../hooks/usePlants';

export const AddPlant: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { plants, createPlant, updatePlant, isCreating, isUpdating } = usePlants();
  const [apiError, setApiError] = useState<string | null>(null);

  const editingPlant = id ? plants.find((p) => p.id === Number(id)) : null;

  const handleSave = async (plantData: Partial<Plant>) => {
    setApiError(null);
    try {
      if (editingPlant) {
        await updatePlant({ id: editingPlant.id, data: plantData });
      } else {
        await createPlant(plantData);
      }
      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Erro ao salvar. Tente novamente.';
      setApiError(msg);
    }
  };

  return (
      <AddPlantForm
          onSave={handleSave}
          onCancel={() => navigate('/')}
          initialData={editingPlant}
          availableHardware={[]}
          loading={isCreating || isUpdating}
          error={apiError}
      />
  );
};