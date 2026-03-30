import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AddPlantForm } from '../components/plants/AddPlantForm';
import type { MeasurementsMapping, Plant } from '../types';
import { usePlants } from '../hooks/usePlants';
import { useDevices } from '../hooks/useDevices';
import { measurementService } from '../services/measurementService';
import { plantService } from '../services/plantsService';

export const AddPlant: React.FC = () => {
  const { id }       = useParams<{ id: string }>();
  const navigate     = useNavigate();
  const { plants, updatePlant, isUpdating } = usePlants();
  const { devices }  = useDevices();
  const [saving, setSaving]     = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const editingPlant = id ? plants.find((p) => p.id === Number(id)) : null;

  const handleSave = async (
      plantData: Partial<Plant> & { measurementsMapping?: MeasurementsMapping }
  ) => {
    setApiError(null);
    setSaving(true);
    try {
      const { measurementsMapping, ...rest } = plantData;

      if (editingPlant) {
        // ── Edição: só atualiza campos da planta ──────────────────────────────
        await updatePlant({ id: editingPlant.id, data: rest });
      } else {
        // ── Criação: planta primeiro, depois as medidas ───────────────────────
        const created = await plantService.create(rest);

        if (measurementsMapping && Object.keys(measurementsMapping).length > 0) {
          await measurementService.createMany(created.id, measurementsMapping);
        }
      }

      navigate('/');
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Erro ao salvar. Tente novamente.';
      setApiError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
      <AddPlantForm
          onSave={handleSave}
          onCancel={() => navigate('/')}
          initialData={editingPlant}
          availableHardware={devices}
          loading={saving || isUpdating}
          error={apiError}
      />
  );
};