import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { getVisualTheme, VISUAL_THEMES } from '../config/visualThemes.js';

interface VisualThemeState {
  themeId: string;
  setThemeId: (id: string) => void;
}

export const visualThemeStore = createStore<VisualThemeState>()(
  persist(
    (set) => ({
      themeId: 'deep-space',
      setThemeId: (themeId) => {
        if (getVisualTheme(themeId)) set({ themeId });
      },
    }),
    {
      name: 'planetario-visual-theme',
      partialize: (s) => ({ themeId: s.themeId }),
    }
  )
);

export function listVisualThemes() {
  return VISUAL_THEMES;
}
