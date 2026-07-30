import { getVisualTheme, SCENE_PALETTES } from '../config/visualThemes.js';
import { visualThemeStore } from '../store/visualThemeStore.js';
import type { SceneKey } from '../types/catalog.js';

function applyThemeToRoot(theme = getVisualTheme(visualThemeStore.getState().themeId)) {
  const root = document.documentElement;
  root.dataset.visualTheme = theme.id;

  const { colors, effects } = theme;
  root.style.setProperty('--vt-primary', colors.primary);
  root.style.setProperty('--vt-secondary', colors.secondary);
  root.style.setProperty('--vt-accent', colors.accent);
  root.style.setProperty('--vt-glass-bg', colors.glassBg);
  root.style.setProperty('--vt-glass-border', colors.glassBorder);
  root.style.setProperty('--vt-text', colors.text);
  root.style.setProperty('--vt-text-muted', colors.textMuted);

  root.style.setProperty('--effect-glass-blur', `${effects.glassBlur}px`);
  root.style.setProperty('--effect-glass-saturation', `${effects.glassSaturation}%`);
  root.style.setProperty('--effect-glow-intensity', String(effects.glowIntensity));
  root.style.setProperty('--effect-bloom-strength', String(effects.bloomStrength));
  root.style.setProperty('--effect-vignette-intensity', String(effects.vignetteIntensity));
  root.style.setProperty('--effect-star-brightness', String(effects.starBrightness));
  root.style.setProperty('--effect-nebula-opacity', String(effects.nebulaOpacity));

  window.dispatchEvent(new CustomEvent('visualthemechange', { detail: theme }));
}

export function applyScenePalette(sceneKey: SceneKey) {
  const palette = SCENE_PALETTES[sceneKey];
  if (!palette) return;

  const root = document.documentElement;
  root.dataset.scenePalette = sceneKey;
  root.style.setProperty('--scene-primary', palette.primary);
  root.style.setProperty('--scene-secondary', palette.secondary);
  root.style.setProperty('--scene-accent', palette.accent);
  root.style.setProperty('--scene-glass-bg', palette.glassBg);
  root.style.setProperty('--scene-glass-border', palette.glassBorder);

  // Unisce tema globale con accento di scena per pannelli HUD
  root.style.setProperty('--energy-cyan', palette.primary);
  root.style.setProperty('--glass-border', palette.glassBorder);
}

export function initVisualThemes() {
  applyThemeToRoot();
  visualThemeStore.subscribe(() => applyThemeToRoot());
}

const COSMIC_OVERVIEW_SCENES = new Set([
  'local_group',
  'observable',
  'milky_way',
  'exoplanets',
  'extreme_objects',
]);

export function syncVisualThemePostFX(postFX: { setBloomStrength?: (n: number) => void; passes?: { vignettePass?: { uniforms: { darkness: { value: number } } } } } | null, sceneKey?: string) {
  if (!postFX?.setBloomStrength) return;
  if (sceneKey === 'wormhole') return;
  const theme = getVisualTheme(visualThemeStore.getState().themeId);
  const isCosmicOverview = sceneKey ? COSMIC_OVERVIEW_SCENES.has(sceneKey) : false;

  if (isCosmicOverview) {
    // Cosmic scenes need strong bloom; allow themes to boost, not dim below the scene profile.
    postFX.setBloomStrength(1.25 * Math.max(1, theme.effects.bloomStrength));
    return;
  }

  postFX.setBloomStrength(theme.effects.bloomStrength);
  if (postFX.passes?.vignettePass) {
    postFX.passes.vignettePass.uniforms.darkness.value = 0.65 + theme.effects.vignetteIntensity * 0.85;
  }
}

export function setVisualTheme(themeId: string) {
  visualThemeStore.getState().setThemeId(themeId);
}
