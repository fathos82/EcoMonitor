import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AddPlantForm } from '../components/plants/AddPlantForm';
import type { Plant } from '../types';
import { useAppStore } from '../stores/AppContext';

export const AddPlant: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { plants, addPlant, updatePlant, hardwareList } = useAppStore();
  
  const editingPlant = id ? plants.find(p => p.id === Number(id)) : null;

  const handleSave = (plantData: Partial<Plant>) => {
    if (editingPlant) {
      updatePlant(editingPlant.id, plantData);
    } else {
      addPlant(plantData);
    }
    navigate('/');
  };

  return (
    <AddPlantForm
      onSave={handleSave}
      onCancel={() => navigate('/')}
      initialData={editingPlant}
      availableHardware={hardwareList}
    />
  );
};