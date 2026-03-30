import React, { useState } from 'react';
import { Droplets, Edit, MoreVertical, Trash2, Video } from 'lucide-react';
import type { Plant } from '../../types';
import { useClickOutside } from '../../hooks/useClickOutside';

interface PlantSummaryCardProps {
  plant: Plant;
  onClick: (plant: Plant) => void;
  onEdit: (plant: Plant) => void;
  onDelete: (id: number) => void;
}

export const PlantSummaryCard: React.FC<PlantSummaryCardProps> = ({ plant, onClick, onEdit, onDelete }) => {
  const isWarning = plant.status === 'warning';
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useClickOutside<HTMLDivElement>(() => setShowMenu(false));

  return (
    <div
      onClick={() => onClick(plant)}
      className="group relative bg-white rounded-2xl md:rounded-3xl p-3 md:p-4 border border-stone-100 shadow-md md:shadow-lg shadow-stone-200/50 active:scale-[0.99] transition-all cursor-pointer flex gap-3 md:gap-4 md:flex-col items-center md:items-stretch"
    >
      <div className="absolute top-2 right-2 md:top-3 md:right-3 z-10" ref={menuRef}>
        <button
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
          className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <MoreVertical size={18} />
        </button>

        {showMenu && (
          <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right z-20">
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(false); onEdit(plant); }}
              className="w-full text-left px-4 py-3 text-xs md:text-sm font-medium text-stone-600 hover:bg-stone-50 flex items-center gap-2"
            >
              <Edit size={14} /> Editar
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowMenu(false); onDelete(plant.id); }}
              className="w-full text-left px-4 py-3 text-xs md:text-sm font-medium text-red-500 hover:bg-red-50 flex items-center gap-2"
            >
              <Trash2 size={14} /> Excluir
            </button>
          </div>
        )}
      </div>

      <div className="relative h-20 w-20 md:h-48 md:w-full rounded-xl md:rounded-2xl overflow-hidden shrink-0">
        <img src={plant.image} alt={plant.name} className="w-full h-full object-cover" />
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-bold text-white shadow-sm md:hidden">
          {plant.location}
        </div>
        <div className="absolute top-2 right-2 md:top-3 md:right-3 bg-white/90 backdrop-blur-md px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold text-stone-700 shadow-sm hidden md:block">
          {plant.location}
        </div>
      </div>

      <div className="flex-1 w-full overflow-hidden">
        <div className="flex justify-between items-start mb-1 pr-6">
          <h3 className="text-base md:text-xl font-bold text-stone-800 leading-tight truncate">{plant.name}</h3>
          {isWarning && <span className="flex h-2 w-2 md:h-3 md:w-3 rounded-full bg-amber-500 animate-pulse mt-1 shrink-0" title="Atenção Necessária"></span>}
        </div>
        <p className="text-xs md:text-sm text-stone-500 italic mb-2 md:mb-4 truncate">{plant.species}</p>

        <div className="grid grid-cols-2 gap-2">
          <div className={`p-2 md:p-3 rounded-lg md:rounded-xl ${isWarning ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
            <div className="flex items-center gap-1 md:gap-2 mb-0.5 md:mb-1">
              <Droplets size={12} className="md:w-3.5 md:h-3.5" />
              <span className="text-[10px] md:text-xs font-bold uppercase">Umidade</span>
            </div>
            <span className="text-sm md:text-lg font-bold">{plant.lastHumidity}%</span>
          </div>
          <div className="p-2 md:p-3 rounded-lg md:rounded-xl bg-stone-100 text-stone-600 flex flex-col justify-center items-center">
            <div className="flex items-center gap-1 mb-0.5">
              <Video size={12} />
              <span className="text-[10px] font-bold uppercase">Cam</span>
            </div>
            <span className="text-xs md:text-sm font-bold">On</span>
          </div>
        </div>
      </div>
    </div>
  );
};