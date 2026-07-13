import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';

export interface CustomPlanet {
  id: string;
  name: string;
  distance: number;
  radius: number;
  type: 'rocky' | 'gas' | 'ice';
  color?: number;
}

export interface CustomSystem {
  id: string;
  name: string;
  starColor: number;
  starRadius: number;
  planets: CustomPlanet[];
  createdAt: string;
}

export interface CustomSystemsState {
  systems: CustomSystem[];
  saveSystem: (system: Omit<CustomSystem, 'id' | 'createdAt'> & { id?: string }) => string;
  deleteSystem: (id: string) => void;
  getSystem: (id: string) => CustomSystem | undefined;
}

export const customSystemsStore = createStore<CustomSystemsState>()(
  persist(
    (set, get) => ({
      systems: [],
      saveSystem: (system) => {
        const id = system.id || `custom-${Date.now()}`;
        const entry: CustomSystem = {
          ...system,
          id,
          createdAt: system.id
            ? get().systems.find((s) => s.id === id)?.createdAt || new Date().toISOString()
            : new Date().toISOString(),
        };
        const others = get().systems.filter((s) => s.id !== id);
        set({ systems: [...others, entry] });
        return id;
      },
      deleteSystem: (id) => {
        set({ systems: get().systems.filter((s) => s.id !== id) });
      },
      getSystem: (id) => get().systems.find((s) => s.id === id),
    }),
    { name: 'planetario-custom-systems' }
  )
);
