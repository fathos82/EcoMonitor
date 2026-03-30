import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { PlantSummaryCard } from '../components/common/PlantSummaryCard';
import type { Plant } from '../types';
import { useAppStore } from '../stores/AppContext';

export const PlantsList: React.FC = () => {
  const navigate = useNavigate();
  const { plants, deletePlant } = useAppStore();

  const handleEditPlant = (plant: Plant) => {
    navigate(`/plants/edit/${plant.id}`);
  };

  const handlePlantClick = (plant: Plant) => {
    navigate(`/plants/${plant.id}`);
  };

  const handleDeletePlant = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta planta?")) {
      deletePlant(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-stone-800">Meus Cultivos</h1>
          <p className="text-xs md:text-base text-stone-500 mt-1">
            Status: <span className="text-emerald-600 font-bold">● Online</span>
          </p>
        </div>
        <button
          onClick={() => navigate('/plants/add')}
          className="bg-stone-800 text-white p-2 md:px-4 md:py-2 rounded-xl font-bold text-sm hover:bg-stone-700 transition-colors shadow-lg shadow-stone-300 flex items-center gap-2"
        >
          <Plus size={20} />
          <span className="hidden md:inline">Nova Planta</span>
          <span className="md:hidden">Add</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
        {plants.map(plant => (
          <PlantSummaryCard
            key={plant.id}
            plant={plant}
            onClick={handlePlantClick}
            onEdit={handleEditPlant}
            onDelete={handleDeletePlant}
          />
        ))}
      </div>
    </div>
  );
};