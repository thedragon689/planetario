import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';

export interface LearningProgress {
  completedSteps: string[];
  startedAt?: string;
  completedAt?: string;
}

export interface LearningState {
  paths: Record<string, LearningProgress>;
  markStepComplete: (pathId: string, stepId: string) => void;
  getPathProgress: (pathId: string, totalSteps: number) => number;
  isPathComplete: (pathId: string, totalSteps: number) => boolean;
}

export const learningStore = createStore<LearningState>()(
  persist(
    (set, get) => ({
      paths: {},
      markStepComplete: (pathId, stepId) => {
        const current = get().paths[pathId] || { completedSteps: [] };
        const steps = new Set(current.completedSteps);
        steps.add(stepId);
        set({
          paths: {
            ...get().paths,
            [pathId]: {
              ...current,
              completedSteps: [...steps],
              startedAt: current.startedAt || new Date().toISOString(),
              completedAt: undefined,
            },
          },
        });
      },
      getPathProgress: (pathId, totalSteps) => {
        const done = get().paths[pathId]?.completedSteps.length || 0;
        return totalSteps ? done / totalSteps : 0;
      },
      isPathComplete: (pathId, totalSteps) => {
        const done = get().paths[pathId]?.completedSteps.length || 0;
        return done >= totalSteps && totalSteps > 0;
      },
    }),
    { name: 'planetario-learning' }
  )
);
