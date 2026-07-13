import { createStore } from 'zustand/vanilla';

export type TimeSpeed = 1 | 100 | 1000 | 10000;

export interface TimeState {
  simulationDate: string;
  timeScale: TimeSpeed;
  paused: boolean;
}

export interface TimeActions {
  setSimulationDate: (iso: string) => void;
  setTimeScale: (scale: TimeSpeed) => void;
  setPaused: (paused: boolean) => void;
  advanceDays: (days: number) => void;
}

export const timeStore = createStore<TimeState & TimeActions>()((set, get) => ({
  simulationDate: new Date().toISOString().slice(0, 10),
  timeScale: 1,
  paused: false,
  setSimulationDate: (simulationDate) => set({ simulationDate }),
  setTimeScale: (timeScale) => set({ timeScale }),
  setPaused: (paused) => set({ paused }),
  advanceDays: (days) => {
    const d = new Date(get().simulationDate);
    d.setUTCDate(d.getUTCDate() + days);
    set({ simulationDate: d.toISOString().slice(0, 10) });
  },
}));

export function getTimeState() {
  return timeStore.getState();
}

export function getSimulationDate(): Date {
  return new Date(getTimeState().simulationDate + 'T12:00:00Z');
}
