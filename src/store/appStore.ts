import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import type { AstronomicalEntity, QualityLevel, SceneKey } from '../types/catalog.js';

export interface AppState {
  scene: SceneKey;
  sceneLabel: string;
  sceneIndex: number;
  quality: QualityLevel;
  audioEnabled: boolean;
  chatOpen: boolean;
  voiceEnabled: boolean;
  selectedObject: AstronomicalEntity | null;
  loading: { pct: number; status: string };
  fps: number;
  benchmarkScore: number | null;
}

export interface AppActions {
  setScene: (scene: SceneKey, label: string, index: number) => void;
  setQuality: (quality: QualityLevel) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setChatOpen: (open: boolean) => void;
  setVoiceEnabled: (enabled: boolean) => void;
  selectObject: (object: AstronomicalEntity | null) => void;
  setLoading: (pct: number, status?: string) => void;
  setFps: (fps: number) => void;
  setBenchmarkScore: (score: number | null) => void;
}

const initialState: AppState = {
  scene: 'earth',
  sceneLabel: 'Terra',
  sceneIndex: 0,
  quality: 'medium',
  audioEnabled: false,
  chatOpen: false,
  voiceEnabled: true,
  selectedObject: null,
  loading: { pct: 0, status: 'Inizializzazione...' },
  fps: 60,
  benchmarkScore: null,
};

/** Store vanilla (senza React) per app Three.js. */
export const appStore = createStore<AppState & AppActions>()(
  persist(
    (set) => ({
      ...initialState,
      setScene: (scene, sceneLabel, sceneIndex) => set({ scene, sceneLabel, sceneIndex }),
      setQuality: (quality) => set({ quality }),
      setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
      setChatOpen: (chatOpen) => set({ chatOpen }),
      setVoiceEnabled: (voiceEnabled) => set({ voiceEnabled }),
      selectObject: (selectedObject) => set({ selectedObject }),
      setLoading: (pct, status) =>
        set((s) => ({
          loading: { pct, status: status ?? s.loading.status },
        })),
      setFps: (fps) => set({ fps }),
      setBenchmarkScore: (benchmarkScore) => set({ benchmarkScore }),
    }),
    {
      name: 'planetario-prefs',
      partialize: (state) => ({
        quality: state.quality,
        voiceEnabled: state.voiceEnabled,
      }),
    }
  )
);

/** Accesso allo store nell'app vanilla. */
export function getAppState() {
  return appStore.getState();
}
