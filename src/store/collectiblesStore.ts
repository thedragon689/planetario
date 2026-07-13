import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { COLLECTIBLES, type CollectibleDef } from '../data/collectibles.js';

export interface UnlockedCard {
  id: string;
  unlockedAt: string;
}

export interface CollectiblesState {
  cards: UnlockedCard[];
}

export interface CollectiblesActions {
  unlockForObject: (objectId: string, type?: string) => CollectibleDef | null;
  hasCard: (id: string) => boolean;
  getProgress: () => { unlocked: number; total: number; percent: number };
  getBySet: () => Record<string, CollectibleDef[]>;
}

export const collectiblesStore = createStore<CollectiblesState & CollectiblesActions>()(
  persist(
    (set, get) => ({
      cards: [],
      unlockForObject: (objectId, type) => {
        const def = COLLECTIBLES.find((c) => c.match(objectId, type));
        if (!def || get().hasCard(def.id)) return null;
        set((s) => ({
          cards: [...s.cards, { id: def.id, unlockedAt: new Date().toISOString() }],
        }));
        return def;
      },
      hasCard: (id) => get().cards.some((c) => c.id === id),
      getProgress: () => {
        const unlocked = get().cards.length;
        const total = COLLECTIBLES.length;
        return { unlocked, total, percent: total ? Math.round((unlocked / total) * 100) : 0 };
      },
      getBySet: () => {
        const map: Record<string, CollectibleDef[]> = {};
        COLLECTIBLES.forEach((c) => {
          if (!map[c.setId]) map[c.setId] = [];
          map[c.setId].push(c);
        });
        return map;
      },
    }),
    {
      name: 'planetario-collectibles',
      partialize: (s) => ({ cards: s.cards }),
    }
  )
);
