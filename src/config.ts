import type { QualityLevel, SceneKey } from './types/catalog.js';

export const COLORS = {
  cosmicBlack: 0x03050a,
  quantumBlue: 0x1a2a6c,
  nebulaViolet: 0x5a2d82,
  energyCyan: 0x56ccf2,
  coldWhite: 0xeaf6ff,
} as const;

export const PALETTE = {
  cosmicBlack: '#03050A',
  quantumBlue: '#1A2A6C',
  nebulaViolet: '#5A2D82',
  energyCyan: '#56CCF2',
  coldWhite: '#EAF6FF',
} as const;

export const SCENES = {
  EARTH: 'earth',
  SOLAR_SYSTEM: 'solar_system',
  MILKY_WAY: 'milky_way',
  EXOPLANETS: 'exoplanets',
  EXTREME: 'extreme_objects',
  LOCAL_GROUP: 'local_group',
  OBSERVABLE: 'observable',
  WORMHOLE: 'wormhole',
} as const;

export type SceneId = (typeof SCENES)[keyof typeof SCENES];

export const SCENE_ORDER: SceneKey[] = [
  SCENES.EARTH,
  SCENES.SOLAR_SYSTEM,
  SCENES.MILKY_WAY,
  SCENES.EXOPLANETS,
  SCENES.EXTREME,
  SCENES.LOCAL_GROUP,
  SCENES.OBSERVABLE,
  SCENES.WORMHOLE,
];

export const SCENE_LABELS: Record<SceneKey, string> = {
  [SCENES.EARTH]: 'Terra',
  [SCENES.SOLAR_SYSTEM]: 'Sistema Solare',
  [SCENES.MILKY_WAY]: 'Via Lattea',
  [SCENES.EXOPLANETS]: 'Esopianeti',
  [SCENES.EXTREME]: 'Oggetti Estremi',
  [SCENES.LOCAL_GROUP]: 'Gruppo Locale',
  [SCENES.OBSERVABLE]: 'Universo Osservabile',
  [SCENES.WORMHOLE]: 'Wormhole',
};

export const SCENE_META: Record<
  SceneKey,
  { icon: string; short: string; scale: string; hint: string }
> = {
  [SCENES.EARTH]: {
    icon: '⊕',
    short: 'Terra',
    scale: '1 r⊕',
    hint: 'Ruota con il mouse · Zoom rotella · Clicca la Terra per i dati · Attiva/disattiva meridiani con ⊞',
  },
  [SCENES.SOLAR_SYSTEM]: {
    icon: '☉',
    short: 'Solare',
    scale: 'UA',
    hint: 'Clicca pianeti e lune · Frecce ← → cambiano scena · ◎ ripristina la vista',
  },
  [SCENES.MILKY_WAY]: {
    icon: '✦',
    short: 'Via Lattea',
    scale: 'anni luce',
    hint: 'Esplora stelle famose e nebulose · Passa il mouse per i nomi · Clicca per aprire il pannello',
  },
  [SCENES.EXOPLANETS]: {
    icon: '⊕',
    short: 'Esopianeti',
    scale: 'anni luce',
    hint: 'Sistemi extrasolari con zona abitabile · Clicca un pianeta per dati JWST e scoperta · Anelli ciano = Goldilocks',
  },
  [SCENES.EXTREME]: {
    icon: '◉',
    short: 'Estremi',
    scale: 'M☉+',
    hint: 'Buchi neri, pulsar e magnetar · Sgr A* e M87* · Clicca per dati EHT/LIGO · Anello = lente gravitazionale',
  },
  [SCENES.LOCAL_GROUP]: {
    icon: '◎',
    short: 'Gruppo',
    scale: 'Mly',
    hint: 'Trascina per orbitare a 360° · Rotella zoom · Andromeda a ~2,5 Mly · Clicca per la scheda',
  },
  [SCENES.OBSERVABLE]: {
    icon: '∞',
    short: 'Cosmo',
    scale: 'Mly+',
    hint: 'Orbita libera 360° attorno agli ammassi · Virgo e Fornax · Tasto destro per spostare il punto di vista',
  },
  [SCENES.WORMHOLE]: {
    icon: '◈',
    short: 'Tunnel',
    scale: '—',
    hint: 'Attraversa il wormhole · Musica spaziale con ♪ · ESC chiude i pannelli',
  },
};

export const NAV_SHORTCUTS = [
  { keys: '← →', action: 'Scena precedente / successiva' },
  { keys: 'Trascina', action: 'Ruota vista 360°' },
  { keys: 'Rotella', action: 'Zoom avanti / indietro' },
  { keys: 'Tasto destro', action: 'Sposta il punto di vista' },
  { keys: '?', action: 'Guida didattica Gemini' },
  { keys: 'ESC', action: 'Chiudi pannello info' },
  { keys: '◎', action: 'Ripristina inquadratura' },
];

export const TRANSITION = {
  duration: 2.5,
  ease: 'power2.inOut',
};

export const PERFORMANCE = {
  targetFpsDesktop: 60,
  targetFpsMobile: 30,
  galaxyParticlesDesktop: 200000,
  galaxyParticlesMobile: 80000,
  starCountDesktop: 12000,
  starCountMobile: 5000,
  instancedStarsDesktop: 12000,
  instancedStarsMobile: 4000,
};

export const FEATURES = {
  ktx2: true,
  ibl: true,
  instancedStars: true,
  instancedMarkers: true,
  exoplanets: true,
  extendedNebulae: true,
  extremeObjects: true,
  smallBodies: true,
  timeSimulation: true,
  gamification: true,
  webxr: true,
  lagrangePoints: true,
  cosmicRuler: true,
  sizeCompare: true,
  largeScaleStructures: true,
  spaceProbes: true,
  apodWidget: true,
  scenePlaylists: true,
  proceduralTextures: true,
  planetAtmospheres: true,
  sonification: true,
  learningPaths: true,
  extendedGlossary: true,
  planetEditor: true,
  astroEvents: true,
  // v2.1 supplementare
  geminiVision: true,
  userProfile: true,
  adaptiveSuggestions: true,
  sharedSessions: true,
  spacetimeGrid: true,
  darkMatterHalo: true,
  drakeCalculator: true,
  stellarEvolution: true,
  coordinatesHud: true,
  spectrumChart: true,
  cinemaMode: true,
  relaxMode: true,
  starryNight: true,
  skillTree: true,
  collectibles: true,
  hiddenAchievements: true,
  voiceCommands: true,
  audioDescription: true,
  advancedAccessibility: true,
  telemetry: true,
  feedbackWidget: true,
  i18n: true,
  // v2.2 grafica / UI
  visualThemes: true,
  scenePalettes: true,
  mobileGestures: true,
  auroraEffect: true,
  glassV22: true,
  nebulaRaymarch: true,
  blackholeLensing: true,
  compass3d: true,
  dustParticles: true,
  proceduralPlanets: true,
  mobileBottomSheet: true,
  experimentalWebGPU: import.meta.env.VITE_EXPERIMENTAL_WEBGPU === 'true',
};

export const SENTRY = {
  dsn: import.meta.env.VITE_SENTRY_DSN || '',
};

export const TEXTURES = {
  earth: {
    albedo: '/textures/earth/day.jpg',
    bump: '/textures/earth/bump.png',
    specular: '/textures/earth/specular.png',
    night: '/textures/earth/night.jpg',
  },
  planets: {
    mercury: '/assets/textures/planets/mercury_diffuse.jpg',
    venus: '/assets/textures/planets/venus_diffuse.jpg',
    mars: '/assets/textures/planets/mars_diffuse.jpg',
    jupiter: '/assets/textures/planets/jupiter_diffuse.jpg',
    saturn: '/assets/textures/planets/saturn_diffuse.jpg',
    uranus: '/assets/textures/planets/uranus_diffuse.jpg',
    neptune: '/assets/textures/planets/neptune_diffuse.jpg',
    pluto: '/assets/textures/planets/pluto_diffuse.jpg',
    earth: '/assets/textures/planets/earth_diffuse.jpg',
  },
  moons: {
    luna: '/assets/textures/moons/luna_diffuse.jpg',
    europa: '/assets/textures/moons/europa_diffuse.jpg',
    io: '/assets/textures/moons/io_diffuse.jpg',
    titan: '/assets/textures/moons/titan_diffuse.jpg',
    ganymede: '/assets/textures/moons/ganymede_diffuse.jpg',
  },
};

export const NASA_API = {
  root: 'https://images-api.nasa.gov',
  pageSize: 6,
};

export const WIKIPEDIA_API = {
  lang: 'it',
  restRoot: 'https://it.wikipedia.org/api/rest_v1',
  apiRoot: 'https://it.wikipedia.org/w/api.php',
};

export const GEMINI = {
  model: 'gemini-2.5-flash',
  fallbackModels: ['gemini-3.5-flash', 'gemini-2.0-flash'],
  apiRoot: 'https://generativelanguage.googleapis.com/v1beta',
  proxyRoot: '/api/gemini',
  apiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY || '',
  maxHistory: 12,
  maxOutputTokens: 2048,
};

export const CHAT_SYSTEM_PROMPT = `Sei l'assistente didattico del Planetario 3D Interstellar Edition.

REGOLE DI STILE (obbligatorie):
- Sei una guida astronomica dal tono calmo, accogliente e rassicurante.
- Sii un'insegnante paziente e spiega i concetti in modo semplice.
- Usa analogie della vita quotidiana quando aiutano a capire.
- Dividi le spiegazioni lunghe in paragrafi brevi (2-4 frasi ciascuno).
- Scrivi sempre in italiano.

REGOLE SUI CONTENUTI (obbligatorie):
- Rispondi SOLO usando le informazioni presenti nel CATALOGO ASTRONOMICO fornito nel contesto.
- Se una domanda non è coperta dal catalogo, dillo con gentilezza e suggerisci cosa puoi spiegare.
- Non inventare dati scientifici, distanze, missioni o nomi non presenti nel catalogo.
- Se l'utente sta esplorando una scena o un oggetto specifico, collega la risposta a quel contesto quando utile.`;

export const CHAT_VOICE = {
  provider: 'gemini',
  geminiModel: 'gemini-2.5-flash-preview-tts',
  geminiFallbackModels: ['gemini-2.5-flash-tts', 'gemini-3.1-flash-tts-preview'],
  geminiVoice: 'Aoede',
  geminiLang: 'it-IT',
  geminiPrompt:
    'Leggi il seguente testo in italiano con voce femminile calma, dolce e paziente, come una guida di planetario:\n\n',
  maxChunkBytes: 2800,
  geminiMinRequestGapMs: 1200,
  geminiPrefetchGapMs: 900,
  geminiPrefetchStaggerMs: 700,
  paragraphPauseMs: 280,
  browserFallback: {
    lang: 'it-IT',
    rate: 0.86,
    pitch: 1.06,
    volume: 0.9,
    preferredVoiceHints: [
      'microsoft elsa',
      'microsoft silvia',
      'elsa',
      'silvia',
      'alice',
      'federica',
      'paola',
      'lucia',
      'elisa',
      'giulia',
      'chiara',
      'female',
      'donna',
      'woman',
      'google italiano',
    ],
    naturalVoiceHints: ['natural', 'neural', 'premium', 'enhanced', 'online', 'wavenet'],
    avoidVoiceHints: [
      'paolo',
      'diego',
      'cosimo',
      'riccardo',
      'luca',
      'marco',
      'matteo',
      'giorgio',
      'franco',
      'male',
      'uomo',
      'man',
      'espeak',
      'mbrola',
      'festival',
      'pico',
      'compact',
    ],
  },
  lang: 'it-IT',
  rate: 0.88,
  pitch: 1.04,
  volume: 0.92,
};

/** Volume colonna sonora 70–75% (non copre la guida vocale Gemini) */
const MUSIC_VOLUME = 0.72;

export const AUDIO_TRACKS = {
  cosmos: {
    src: '/assets/audio/cosmos-main-title.mp3',
    title: 'Cosmos (Main Title)',
    artist: 'Vangelis',
    narrative: 'intro',
  },
  cosmosFinale: {
    src: '/assets/audio/cosmos-main-title.mp3',
    title: 'Cosmos (Finale)',
    artist: 'Vangelis',
    narrative: 'climax',
  },
  oxygene: {
    src: '/assets/audio/oxygene-part-4.mp3',
    title: 'Oxygène (Part IV)',
    artist: 'Jean-Michel Jarre',
    narrative: 'exploration',
  },
} as const;

export const AUDIO = {
  soundtrack: {
    ...AUDIO_TRACKS.cosmos,
    source: 'Colonna sonora narrativa',
    loop: true,
    volume: MUSIC_VOLUME,
  },
  /** Crossfade morbido 3–5 s tra i brani */
  crossfadeMs: 4000,
  /** Volume residuo quando Gemini parla (ducking) */
  duckFactor: 0.28,
  playlists: {
    // 2. Esplorazione — Oxygène
    earth: {
      ...AUDIO_TRACKS.oxygene,
      volume: 0.7,
      narrative: 'exploration',
    },
    solar_system: {
      ...AUDIO_TRACKS.oxygene,
      volume: 0.72,
      narrative: 'exploration',
    },
    exoplanets: {
      ...AUDIO_TRACKS.oxygene,
      volume: 0.73,
      narrative: 'exploration',
    },
    milky_way: {
      ...AUDIO_TRACKS.oxygene,
      volume: 0.72,
      narrative: 'exploration',
    },
    local_group: {
      ...AUDIO_TRACKS.oxygene,
      volume: 0.74,
      narrative: 'exploration',
    },
    extreme_objects: {
      ...AUDIO_TRACKS.oxygene,
      volume: 0.75,
      narrative: 'exploration',
    },
    // 1. Intro — Cosmos
    observable: {
      ...AUDIO_TRACKS.cosmos,
      volume: 0.75,
      narrative: 'intro',
    },
    // 4. Climax — Cosmos (finale; stesso brano finché non aggiungi un file dedicato)
    wormhole: {
      ...AUDIO_TRACKS.cosmosFinale,
      volume: 0.75,
      narrative: 'climax',
    },
  },
};

export const SCALE = {
  earthRadius: 1,
  au: 50,
  ly: 5000,
};
