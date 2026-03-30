import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Hardware, Plant, User } from '../types';
import { INITIAL_HARDWARE, INITIAL_PLANTS } from '../data/initialData';

interface AppState {
  user: User | null;
  plants: Plant[];
  hardwareList: Hardware[];
  
  setUser: (user: User | null) => void;
  setPlants: (plants: Plant[]) => void;
  setHardwareList: (hardware: Hardware[]) => void;
  
  addPlant: (plant: Partial<Plant>) => void;
  updatePlant: (id: number, plant: Partial<Plant>) => void;
  deletePlant: (id: number) => void;
  
  addHardware: (hardware: Hardware) => void;
  updateHardware: (hardware: Hardware) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      plants: INITIAL_PLANTS,
      hardwareList: INITIAL_HARDWARE,

      setUser: (user) => set({ user }),
      
      setPlants: (plants) => set({ plants }),
      
      setHardwareList: (hardwareList) => set({ hardwareList }),

      addPlant: (plantData) => {
        const { plants } = get();
        const newId = plants.length > 0 ? Math.max(...plants.map(p => p.id)) + 1 : 1;
        
        const newPlant: Plant = {
          id: newId,
          name: plantData.name || '',
          species: plantData.species || '',
          image: plantData.image || '',
          status: 'healthy',
          lastHumidity: 50,
          location: plantData.location || '',
          hardwareId: plantData.hardwareId || 0,
          sensorsMapping: plantData.sensorsMapping || { soil: null, env: null, light: null },
          settings: plantData.settings || {
            humidity: { min: 40, max: 80, alert: true },
            temp: { min: 18, max: 28, alert: false },
            air: { min: 0, max: 50, alert: true },
            light: { min: 200, max: 1000, alert: false },
          }
        };
        
        set({ plants: [...plants, newPlant] });
      },

      updatePlant: (id, plantData) => {
        const { plants } = get();
        set({
          plants: plants.map(p => p.id === id ? { ...p, ...plantData } as Plant : p)
        });
      },

      deletePlant: (id) => {
        const { plants } = get();
        set({ plants: plants.filter(p => p.id !== id) });
      },

      addHardware: (newHardware) => {
        const { hardwareList } = get();
        const newId = hardwareList.length > 0 ? Math.max(...hardwareList.map(h => h.id)) + 1 : 1;
        const hardwareToAdd = { ...newHardware, id: newId };
        
        set({ hardwareList: [...hardwareList, hardwareToAdd] });
      },

      updateHardware: (updatedHardware) => {
        const { hardwareList } = get();
        set({
          hardwareList: hardwareList.map(h => h.id === updatedHardware.id ? updatedHardware : h)
        });
      },
    }),
    {
      name: 'ecomonitor-storage',
      partialize: (state) => ({
        user: state.user,
        plants: state.plants,
        hardwareList: state.hardwareList,
      }),
    }
  )
);