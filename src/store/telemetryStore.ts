import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';

export interface TelemetryEvent {
  type: string;
  label?: string;
  at: string;
  meta?: Record<string, unknown>;
}

export interface TelemetryState {
  enabled: boolean;
  events: TelemetryEvent[];
  sceneDurations: Record<string, number>;
  clickHeatmap: Record<string, number>;
  sessionCount: number;
}

export interface TelemetryActions {
  setEnabled: (on: boolean) => void;
  track: (type: string, label?: string, meta?: Record<string, unknown>) => void;
  trackSceneTime: (scene: string, seconds: number) => void;
  trackClick: (target: string) => void;
  getSummary: () => { topScenes: string[]; topClicks: string[]; eventCount: number };
  exportJson: () => string;
}

const MAX_EVENTS = 500;

export const telemetryStore = createStore<TelemetryState & TelemetryActions>()(
  persist(
    (set, get) => ({
      enabled: false,
      events: [],
      sceneDurations: {},
      clickHeatmap: {},
      sessionCount: 0,
      setEnabled: (enabled) => {
        set({ enabled });
        if (enabled) get().track('telemetry_opt_in');
      },
      track: (type, label, meta) => {
        if (!get().enabled) return;
        const ev: TelemetryEvent = { type, label, at: new Date().toISOString(), meta };
        set((s) => ({ events: [...s.events, ev].slice(-MAX_EVENTS) }));
      },
      trackSceneTime: (scene, seconds) => {
        if (!get().enabled || seconds <= 0) return;
        const d = { ...get().sceneDurations };
        d[scene] = (d[scene] || 0) + seconds;
        set({ sceneDurations: d });
      },
      trackClick: (target) => {
        if (!get().enabled) return;
        const h = { ...get().clickHeatmap };
        h[target] = (h[target] || 0) + 1;
        set({ clickHeatmap: h });
        get().track('ui_click', target);
      },
      getSummary: () => {
        const scenes = Object.entries(get().sceneDurations)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([k]) => k);
        const clicks = Object.entries(get().clickHeatmap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([k]) => k);
        return { topScenes: scenes, topClicks: clicks, eventCount: get().events.length };
      },
      exportJson: () => JSON.stringify({
        sceneDurations: get().sceneDurations,
        clickHeatmap: get().clickHeatmap,
        events: get().events,
      }, null, 2),
    }),
    {
      name: 'planetario-telemetry',
      partialize: (s) => ({
        enabled: s.enabled,
        events: s.events,
        sceneDurations: s.sceneDurations,
        clickHeatmap: s.clickHeatmap,
        sessionCount: s.sessionCount,
      }),
    }
  )
);
