import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { levelTitle } from '../data/levelNames.js';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'solar_explorer', title: 'Esploratore del Sistema Solare', description: 'Visita tutti i pianeti principali', icon: '☉', xp: 100 },
  { id: 'exoplanet_hunter', title: 'Cacciatore di esopianeti', description: 'Apri 5 esopianeti', icon: '⊕', xp: 80 },
  { id: 'black_hole_pilot', title: 'Pilota del buco nero', description: 'Esplora Sagittarius A* e M87*', icon: '◉', xp: 90 },
  { id: 'wormhole_traveler', title: 'Pilota del wormhole', description: 'Attraversa tutte le scene', icon: '◈', xp: 120 },
  { id: 'quiz_master', title: 'Astrofisico', description: 'Completa un quiz con 100%', icon: '✧', xp: 150 },
  { id: 'cosmic_photographer', title: 'Fotografo cosmico', description: 'Condividi 3 screenshot', icon: '📷', xp: 60 },
  { id: 'star_gazer', title: 'Osservatore stellare', description: 'Consulta 10 stelle famose', icon: '✦', xp: 70 },
  { id: 'glossary_scholar', title: 'Studioso del cosmo', description: 'Leggi 10 voci del glossario', icon: '📖', xp: 40 },
];

export const HIDDEN_ACHIEVEMENTS: Achievement[] = [
  { id: 'sun_stare', title: 'Occhi al Sole', description: 'Hai guardato il Sole troppo a lungo', icon: '☀', xp: 30 },
  { id: 'time_traveler', title: 'Viaggiatore del tempo', description: 'Hai usato la timeline fino al Big Bang', icon: '⏳', xp: 80 },
  { id: 'first_contact', title: 'Primo contatto', description: 'Visita 10 esopianeti', icon: '👽', xp: 100 },
  { id: 'hitchhiker', title: 'Hitchhiker', description: 'Segui la traiettoria di Voyager 1', icon: '🛸', xp: 70 },
];

export const ALL_ACHIEVEMENTS = [...ACHIEVEMENTS, ...HIDDEN_ACHIEVEMENTS];

export interface GamificationState {
  xp: number;
  unlocked: string[];
  visitedScenes: string[];
  visitedObjects: string[];
  exoplanetsOpened: number;
  screenshotsShared: number;
  glossaryRead: string[];
  quizzesPerfect: number;
  blackHolesSeen: string[];
}

export interface GamificationActions {
  addXp: (amount: number, reason?: string) => string | null;
  unlock: (id: string) => Achievement | null;
  visitScene: (scene: string) => void;
  visitObject: (id: string, meta?: { type?: string }) => void;
  recordScreenshot: () => void;
  recordGlossaryTerm: (term: string) => void;
  recordQuizPerfect: () => void;
  recordSunStare: (seconds: number) => void;
  recordBigBangEra: () => void;
  recordVoyagerFollow: () => void;
  getLevel: () => number;
  getLevelTitle: () => string;
}

function levelFromXp(xp: number) {
  return Math.floor(xp / 200) + 1;
}

export const gamificationStore = createStore<GamificationState & GamificationActions>()(
  persist(
    (set, get) => ({
      xp: 0,
      unlocked: [],
      visitedScenes: [],
      visitedObjects: [],
      exoplanetsOpened: 0,
      screenshotsShared: 0,
      glossaryRead: [],
      quizzesPerfect: 0,
      blackHolesSeen: [],
      addXp: (amount) => {
        set((s) => ({ xp: s.xp + amount }));
        return null;
      },
      unlock: (id) => {
        if (get().unlocked.includes(id)) return null;
        const def = ALL_ACHIEVEMENTS.find((a) => a.id === id);
        set((s) => ({
          unlocked: [...s.unlocked, id],
          xp: s.xp + (def?.xp ?? 0),
        }));
        return def ?? null;
      },
      visitScene: (scene) => {
        const scenes = new Set(get().visitedScenes);
        scenes.add(scene);
        set({ visitedScenes: [...scenes] });
        const allMain = ['earth', 'solar_system', 'milky_way', 'exoplanets', 'extreme_objects', 'local_group', 'observable', 'wormhole'];
        if (allMain.every((s) => scenes.has(s))) get().unlock('wormhole_traveler');
      },
      visitObject: (id, meta = {}) => {
        const objs = new Set(get().visitedObjects);
        objs.add(id);
        set({ visitedObjects: [...objs] });
        get().addXp(5);
        const type = (meta.type || '').toLowerCase();
        if (type.includes('esopian')) {
          const n = get().exoplanetsOpened + 1;
          set({ exoplanetsOpened: n });
          if (n >= 5) get().unlock('exoplanet_hunter');
          if (n >= 10) get().unlock('first_contact');
        }
        if (id === 'sagittarius-a' || id === 'm87-star') {
          const bh = new Set(get().blackHolesSeen);
          bh.add(id);
          set({ blackHolesSeen: [...bh] });
          if (bh.has('sagittarius-a') && bh.has('m87-star')) get().unlock('black_hole_pilot');
        }
        const planets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
        if (planets.every((p) => objs.has(p))) get().unlock('solar_explorer');
        if (type.includes('stella') || ['sirius', 'vega', 'betelgeuse', 'proxima_centauri'].includes(id)) {
          const stars = [...objs].filter((o) => planets.indexOf(o) === -1);
          if (stars.length >= 10) get().unlock('star_gazer');
        }
      },
      recordScreenshot: () => {
        const n = get().screenshotsShared + 1;
        set({ screenshotsShared: n });
        get().addXp(15);
        if (n >= 3) get().unlock('cosmic_photographer');
      },
      recordGlossaryTerm: (term) => {
        const read = new Set(get().glossaryRead);
        read.add(term);
        set({ glossaryRead: [...read] });
        get().addXp(3);
        if (read.size >= 10) get().unlock('glossary_scholar');
      },
      recordQuizPerfect: () => {
        set({ quizzesPerfect: get().quizzesPerfect + 1 });
        get().unlock('quiz_master');
        get().addXp(50);
      },
      recordSunStare: (seconds) => {
        if (seconds >= 30) get().unlock('sun_stare');
      },
      recordBigBangEra: () => {
        get().unlock('time_traveler');
      },
      recordVoyagerFollow: () => {
        get().unlock('hitchhiker');
      },
      getLevel: () => levelFromXp(get().xp),
      getLevelTitle: () => levelTitle(levelFromXp(get().xp)),
    }),
    {
      name: 'planetario-gamification',
      partialize: (s) => ({
        xp: s.xp,
        unlocked: s.unlocked,
        visitedScenes: s.visitedScenes,
        visitedObjects: s.visitedObjects,
        exoplanetsOpened: s.exoplanetsOpened,
        screenshotsShared: s.screenshotsShared,
        glossaryRead: s.glossaryRead,
        quizzesPerfect: s.quizzesPerfect,
        blackHolesSeen: s.blackHolesSeen,
      }),
    }
  )
);

export function getGamificationState() {
  return gamificationStore.getState();
}
