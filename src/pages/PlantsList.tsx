import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, AlertCircle, Sprout } from 'lucide-react';
import { PlantSummaryCard } from '../components/common/PlantSummaryCard';
import type { Plant } from '../types';
import { usePlants } from '../hooks/usePlants';

export const PlantsList: React.FC = () => {
  const navigate = useNavigate();
  const { plants, loading, error, deletePlant, isDeleting } = usePlants();

  const handleEditPlant = (plant: Plant) => navigate(`/plants/edit/${plant.id}`);
  const handlePlantClick = (plant: Plant) => navigate(`/plants/${plant.id}`);

  const handleDeletePlant = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir esta planta?')) {
      deletePlant(id);
    }
  };

  return (
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-stone-800">Meus Cultivos</h1>
            <p className="text-xs md:text-base text-stone-500 mt-1">
              {loading
                  ? 'Carregando...'
                  : <span>Total: <span className="text-emerald-600 font-bold">{plants.length} plantas</span></span>
              }
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

        {/* Erro de carregamento */}
        {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <AlertCircle size={16} className="shrink-0" />
              Não foi possível carregar as plantas. Verifique sua conexão.
            </div>
        )}

        {/* Skeleton de loading */}
        {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
              {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 bg-stone-100 rounded-3xl animate-pulse" />
              ))}
            </div>
        )}

        {/* Lista de plantas */}
        {!loading && plants.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-24 text-stone-400 gap-3">
              <Sprout size={40} strokeWidth={1.5} />
              <p className="font-bold text-lg">Nenhuma planta cadastrada</p>
              <p className="text-sm">Clique em "Nova Planta" para começar</p>
            </div>
        )}

        {!loading && plants.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-6">
              {plants.map((plant) => (
                  <div key={plant.id} className={isDeleting ? 'opacity-60 pointer-events-none' : ''}>
                    <PlantSummaryCard
                        plant={plant}
                        onClick={handlePlantClick}
                        onEdit={handleEditPlant}
                        onDelete={handleDeletePlant}
                    />
                  </div>
              ))}
            </div>
        )}
      </div>
  );
};