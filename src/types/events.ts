import type { AstronomicalEntity, QualityLevel, SceneKey } from './catalog.js';

export const APP_EVENTS = {
  SCENE_CHANGED: 'scene:changed',
  OBJECT_SELECTED: 'object:selected',
  OBJECT_DESELECTED: 'object:deselected',
  QUALITY_CHANGED: 'quality:changed',
  AUDIO_TOGGLED: 'audio:toggled',
  CHAT_TOGGLED: 'chat:toggled',
  LOADING_PROGRESS: 'loading:progress',
  ERROR: 'app:error',
} as const;

export type AppEventName = (typeof APP_EVENTS)[keyof typeof APP_EVENTS];

export interface AppEventMap {
  [APP_EVENTS.SCENE_CHANGED]: { scene: SceneKey; label: string; index: number };
  [APP_EVENTS.OBJECT_SELECTED]: { object: AstronomicalEntity };
  [APP_EVENTS.OBJECT_DESELECTED]: Record<string, never>;
  [APP_EVENTS.QUALITY_CHANGED]: { level: QualityLevel; source: 'manual' | 'auto' };
  [APP_EVENTS.AUDIO_TOGGLED]: { enabled: boolean };
  [APP_EVENTS.CHAT_TOGGLED]: { open: boolean };
  [APP_EVENTS.LOADING_PROGRESS]: { pct: number; status?: string };
  [APP_EVENTS.ERROR]: { message: string; recoverable?: boolean };
}

export type AppEventHandler<K extends AppEventName> = (
  payload: AppEventMap[K]
) => void;
