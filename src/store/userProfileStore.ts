import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';

export type UserMode = 'explorer' | 'student' | 'researcher';
export type ChatLocale = 'it' | 'en' | 'es' | 'fr' | 'de';

export interface CategoryStats {
  visits: number;
  seconds: number;
}

export interface UserProfileState {
  mode: UserMode;
  chatLocale: ChatLocale;
  categoryStats: Record<string, CategoryStats>;
  lastVisitIds: string[];
  quizScores: number[];
  dailyStreak: number;
  lastLoginDate: string | null;
  sessionStart: number;
}

export interface UserProfileActions {
  setMode: (mode: UserMode) => void;
  setChatLocale: (locale: ChatLocale) => void;
  recordVisit: (objectId: string, category?: string, seconds?: number) => void;
  recordQuizScore: (percent: number) => void;
  touchDailyStreak: () => number;
  getQuizDifficulty: () => 'easy' | 'medium' | 'hard';
  getSuggestions: (catalogHints?: string[]) => string[];
  getTopCategories: () => Array<{ category: string; visits: number }>;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

const initialState: UserProfileState = {
  mode: 'explorer',
  chatLocale: 'it',
  categoryStats: {},
  lastVisitIds: [],
  quizScores: [],
  dailyStreak: 0,
  lastLoginDate: null,
  sessionStart: Date.now(),
};

export const userProfileStore = createStore<UserProfileState & UserProfileActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      setMode: (mode) => set({ mode }),
      setChatLocale: (chatLocale) => set({ chatLocale }),
      recordVisit: (objectId, category = 'generale', seconds = 0) => {
        const stats = { ...get().categoryStats };
        const prev = stats[category] || { visits: 0, seconds: 0 };
        stats[category] = { visits: prev.visits + 1, seconds: prev.seconds + seconds };
        const last = [objectId, ...get().lastVisitIds.filter((id) => id !== objectId)].slice(0, 12);
        set({ categoryStats: stats, lastVisitIds: last });
      },
      recordQuizScore: (percent) => {
        const scores = [...get().quizScores, percent].slice(-20);
        set({ quizScores: scores });
      },
      touchDailyStreak: () => {
        const today = todayKey();
        const { lastLoginDate, dailyStreak } = get();
        if (lastLoginDate === today) return dailyStreak;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = yesterday.toISOString().slice(0, 10);
        const next = lastLoginDate === yKey ? dailyStreak + 1 : 1;
        set({ dailyStreak: next, lastLoginDate: today });
        return next;
      },
      getQuizDifficulty: () => {
        const scores = get().quizScores;
        if (scores.length < 3) return 'easy';
        const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
        if (avg >= 85) return 'hard';
        if (avg >= 60) return 'medium';
        return 'easy';
      },
      getSuggestions: (catalogHints = []) => {
        const last = get().lastVisitIds[0];
        const pairs: Record<string, string> = {
          jupiter: 'Saturno e le sue anelli',
          mars: 'Venere o Titano',
          earth: 'La Luna o il Sole',
          'sagittarius-a': 'M87* o un wormhole',
          proxima_centauri: 'Proxima b (esopianeta)',
        };
        if (last && pairs[last]) return [`Ti è piaciuto ${last}? Prova ${pairs[last]}.`];
        const top = get().getTopCategories()[0];
        if (top) return [`Continua con la categoria "${top.category}" (${top.visits} visite).`];
        return catalogHints.slice(0, 2);
      },
      getTopCategories: () =>
        Object.entries(get().categoryStats)
          .map(([category, s]) => ({ category, visits: s.visits }))
          .sort((a, b) => b.visits - a.visits),
    }),
    {
      name: 'planetario-user-profile',
      partialize: (s) => ({
        mode: s.mode,
        chatLocale: s.chatLocale,
        categoryStats: s.categoryStats,
        lastVisitIds: s.lastVisitIds,
        quizScores: s.quizScores,
        dailyStreak: s.dailyStreak,
        lastLoginDate: s.lastLoginDate,
      }),
    }
  )
);
