import type { SceneKey } from '../types/catalog.js';

export interface VisualThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  glassBg: string;
  glassBorder: string;
  text: string;
  textMuted: string;
}

export interface VisualThemeEffects {
  glassBlur: number;
  glassSaturation: number;
  glowIntensity: number;
  bloomStrength: number;
  vignetteIntensity: number;
  starBrightness: number;
  nebulaOpacity: number;
}

export interface VisualTheme {
  id: string;
  name: string;
  nameIt: string;
  colors: VisualThemeColors;
  effects: VisualThemeEffects;
}

export interface ScenePalette {
  primary: string;
  secondary: string;
  accent: string;
  glassBg: string;
  glassBorder: string;
}

export const VISUAL_THEMES: VisualTheme[] = [
  {
    id: 'deep-space',
    name: 'Deep Space',
    nameIt: 'Spazio profondo',
    colors: {
      primary: '#4FC3F7',
      secondary: '#0288D1',
      accent: '#00BCD4',
      glassBg: 'rgba(4, 30, 66, 0.65)',
      glassBorder: 'rgba(79, 195, 247, 0.2)',
      text: '#EAF6FF',
      textMuted: '#81D4FA',
    },
    effects: {
      glassBlur: 20,
      glassSaturation: 180,
      glowIntensity: 0.5,
      bloomStrength: 1,
      vignetteIntensity: 0.4,
      starBrightness: 1,
      nebulaOpacity: 0.6,
    },
  },
  {
    id: 'golden-age',
    name: 'Golden Age',
    nameIt: "Era d'oro",
    colors: {
      primary: '#FFD700',
      secondary: '#FFA000',
      accent: '#FFECB3',
      glassBg: 'rgba(66, 40, 4, 0.65)',
      glassBorder: 'rgba(255, 215, 0, 0.2)',
      text: '#FFF8E1',
      textMuted: '#FFE082',
    },
    effects: {
      glassBlur: 16,
      glassSaturation: 150,
      glowIntensity: 0.7,
      bloomStrength: 1.2,
      vignetteIntensity: 0.5,
      starBrightness: 1.2,
      nebulaOpacity: 0.4,
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    nameIt: 'Cyberpunk',
    colors: {
      primary: '#FF00FF',
      secondary: '#00FFFF',
      accent: '#FFFF00',
      glassBg: 'rgba(40, 4, 66, 0.7)',
      glassBorder: 'rgba(255, 0, 255, 0.25)',
      text: '#F0F0F0',
      textMuted: '#B0B0B0',
    },
    effects: {
      glassBlur: 12,
      glassSaturation: 200,
      glowIntensity: 1,
      bloomStrength: 1.5,
      vignetteIntensity: 0.6,
      starBrightness: 0.8,
      nebulaOpacity: 0.8,
    },
  },
  {
    id: 'star-chart',
    name: 'Star Chart',
    nameIt: 'Carta stellare',
    colors: {
      primary: '#3949AB',
      secondary: '#283593',
      accent: '#5C6BC0',
      glassBg: 'rgba(245, 245, 220, 0.88)',
      glassBorder: 'rgba(26, 35, 126, 0.2)',
      text: '#1A237E',
      textMuted: '#5C6BC0',
    },
    effects: {
      glassBlur: 8,
      glassSaturation: 100,
      glowIntensity: 0.15,
      bloomStrength: 0.35,
      vignetteIntensity: 0.2,
      starBrightness: 0.7,
      nebulaOpacity: 0.2,
    },
  },
];

/** Palette adattiva per scena (Glassmorphism 2.0) */
export const SCENE_PALETTES: Record<SceneKey, ScenePalette> = {
  earth: {
    primary: '#4FC3F7',
    secondary: '#0288D1',
    accent: '#00BCD4',
    glassBg: 'rgba(4, 30, 66, 0.65)',
    glassBorder: 'rgba(79, 195, 247, 0.2)',
  },
  solar_system: {
    primary: '#FF9800',
    secondary: '#F57C00',
    accent: '#FFC107',
    glassBg: 'rgba(66, 30, 4, 0.65)',
    glassBorder: 'rgba(255, 152, 0, 0.2)',
  },
  milky_way: {
    primary: '#E040FB',
    secondary: '#7B1FA2',
    accent: '#EA80FC',
    glassBg: 'rgba(40, 4, 66, 0.65)',
    glassBorder: 'rgba(224, 64, 251, 0.2)',
  },
  exoplanets: {
    primary: '#CE93D8',
    secondary: '#8E24AA',
    accent: '#E1BEE7',
    glassBg: 'rgba(36, 8, 48, 0.65)',
    glassBorder: 'rgba(206, 147, 216, 0.22)',
  },
  extreme_objects: {
    primary: '#FF5252',
    secondary: '#C62828',
    accent: '#FF8A80',
    glassBg: 'rgba(48, 8, 8, 0.68)',
    glassBorder: 'rgba(255, 82, 82, 0.22)',
  },
  local_group: {
    primary: '#7E57C2',
    secondary: '#5E35B1',
    accent: '#B39DDB',
    glassBg: 'rgba(28, 12, 52, 0.68)',
    glassBorder: 'rgba(126, 87, 194, 0.22)',
  },
  observable: {
    primary: '#536DFE',
    secondary: '#304FFE',
    accent: '#8C9EFF',
    glassBg: 'rgba(4, 10, 40, 0.75)',
    glassBorder: 'rgba(83, 109, 254, 0.15)',
  },
  wormhole: {
    primary: '#18FFFF',
    secondary: '#00B8D4',
    accent: '#84FFFF',
    glassBg: 'rgba(4, 24, 32, 0.78)',
    glassBorder: 'rgba(24, 255, 255, 0.18)',
  },
};

export function getVisualTheme(id: string): VisualTheme {
  return VISUAL_THEMES.find((t) => t.id === id) ?? VISUAL_THEMES[0];
}
