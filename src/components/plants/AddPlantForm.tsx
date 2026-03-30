import React, { useState } from 'react';
import { ChevronLeft, Save } from 'lucide-react';
import type { Hardware, Plant } from '../../types';

interface AddPlantFormProps {
  onSave: (plant: Partial<Plant>) => void;
  onCancel: () => void;
  initialData?: Plant | null;
  availableHardware: Hardware[];
}

export const AddPlantForm: React.FC<AddPlantFormProps> = ({ onSave, onCancel, initialData, availableHardware }) => {
  const [formData, setFormData] = useState<Partial<Plant>>(
    initialData || {
      name: '',
      species: '',
      location: '',
      hardwareId: availableHardware[0]?.id || 0,
      image: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&q=80&w=400'
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right duration-300 pb-24">
      <header className="flex items-center gap-3 md:gap-4 border-b border-stone-200 pb-3 md:pb-4">
        <button onClick={onCancel} className="p-2 rounded-lg hover:bg-stone-200 text-stone-500 transition-colors">
          <ChevronLeft size={20} className="md:w-6 md:h-6" />
        </button>
        <div>
          <h1 className="text-xl md:text-3xl font-extrabold text-stone-800">
            {initialData ? 'Editar Planta' : 'Nova Planta'}
          </h1>
          <p className="text-xs md:text-base text-stone-500">Configure os detalhes do seu cultivo</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500">Nome da Planta</label>
              <input
                type="text"
                required
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500">Espécie</label>
              <input
                type="text"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500">Localização</label>
              <input
                type="text"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500">Hardware Associado</label>
              <select
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                value={formData.hardwareId}
                onChange={(e) => setFormData({ ...formData, hardwareId: parseInt(e.target.value) })}
              >
                {availableHardware.map(hw => (
                  <option key={hw.id} value={hw.id}>{hw.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-stone-500">URL da Imagem</label>
              <input
                type="text"
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl font-bold text-stone-500 hover:bg-stone-100 transition-colors text-sm"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
          >
            <Save size={18} /> Salvar Planta
          </button>
        </div>
      </form>
    </div>
  );
};