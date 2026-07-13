import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import type { SceneKey } from '../types/catalog.js';

export type ThemeMode = 'dark' | 'light';
export type FontSizeLevel = 'small' | 'medium' | 'large';
export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
export type UnitSystem = 'metric' | 'imperial';

export interface BookmarkEntry {
  id: string;
  name: string;
  type?: string;
  scene?: SceneKey;
  addedAt: string;
}

export type LocaleCode = 'it' | 'en';

export interface UiState {
  theme: ThemeMode;
  highContrast: boolean;
  colorBlindMode: ColorBlindMode;
  fontSize: FontSizeLevel;
  reducedMotion: boolean | null;
  sidebarOpen: boolean;
  showFps: boolean;
  unitSystem: UnitSystem;
  bookmarks: BookmarkEntry[];
  dyslexicFont: boolean;
  simplifiedUi: boolean;
  locale: LocaleCode;
}

export interface UiActions {
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setHighContrast: (on: boolean) => void;
  setColorBlindMode: (mode: ColorBlindMode) => void;
  setFontSize: (size: FontSizeLevel) => void;
  setReducedMotion: (value: boolean | null) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setShowFps: (show: boolean) => void;
  setUnitSystem: (system: UnitSystem) => void;
  setDyslexicFont: (on: boolean) => void;
  setSimplifiedUi: (on: boolean) => void;
  setLocale: (locale: LocaleCode) => void;
  toggleBookmark: (entry: Omit<BookmarkEntry, 'addedAt'>) => boolean;
  isBookmarked: (id: string) => boolean;
  removeBookmark: (id: string) => void;
  clearBookmarks: () => void;
}

const initialState: UiState = {
  theme: 'dark',
  highContrast: false,
  colorBlindMode: 'none',
  fontSize: 'medium',
  reducedMotion: null,
  sidebarOpen: false,
  showFps: true,
  unitSystem: 'metric',
  bookmarks: [],
  dyslexicFont: false,
  simplifiedUi: false,
  locale: 'it',
};

export const uiStore = createStore<UiState & UiActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setHighContrast: (highContrast) => set({ highContrast }),
      setColorBlindMode: (colorBlindMode) => set({ colorBlindMode }),
      setFontSize: (fontSize) => set({ fontSize }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setShowFps: (showFps) => set({ showFps }),
      setUnitSystem: (unitSystem) => set({ unitSystem }),
      setDyslexicFont: (dyslexicFont) => {
        set({ dyslexicFont });
        document.documentElement.classList.toggle('dyslexic-font', dyslexicFont);
      },
      setSimplifiedUi: (simplifiedUi) => {
        set({ simplifiedUi });
        document.documentElement.classList.toggle('simplified-ui', simplifiedUi);
      },
      setLocale: (locale) => set({ locale }),
      toggleBookmark: (entry) => {
        const exists = get().bookmarks.some((b) => b.id === entry.id);
        if (exists) {
          set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== entry.id) }));
          return false;
        }
        set((s) => ({
          bookmarks: [
            ...s.bookmarks,
            { ...entry, addedAt: new Date().toISOString() },
          ],
        }));
        return true;
      },
      isBookmarked: (id) => get().bookmarks.some((b) => b.id === id),
      removeBookmark: (id) =>
        set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) })),
      clearBookmarks: () => set({ bookmarks: [] }),
    }),
    {
      name: 'planetario-ui',
      partialize: (state) => ({
        theme: state.theme,
        highContrast: state.highContrast,
        colorBlindMode: state.colorBlindMode,
        fontSize: state.fontSize,
        reducedMotion: state.reducedMotion,
        showFps: state.showFps,
        unitSystem: state.unitSystem,
        bookmarks: state.bookmarks,
        dyslexicFont: state.dyslexicFont,
        simplifiedUi: state.simplifiedUi,
        locale: state.locale,
      }),
    }
  )
);

export function getUiState() {
  return uiStore.getState();
}
