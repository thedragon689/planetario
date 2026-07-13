import { SCENES } from '../config.js';
import { getUiState } from '../store/uiStore.js';

const SCALE_LABELS = {
  [SCENES.EARTH]: 'Locale',
  [SCENES.SOLAR_SYSTEM]: 'Sistema Solare',
  [SCENES.MILKY_WAY]: 'Galattico',
  [SCENES.EXOPLANETS]: 'Esopianeti',
  [SCENES.EXTREME]: 'Estremi',
  [SCENES.LOCAL_GROUP]: 'Gruppo Locale',
  [SCENES.OBSERVABLE]: 'Cosmico',
  [SCENES.WORMHOLE]: 'Iper-spazio',
};

export function createHUD(root) {
  const hud = document.createElement('div');
  hud.className = 'hud';
  hud.innerHTML = `
    <div class="hud-top">
      <div class="hud-brand">
        <img class="brand-icon" src="/icons/planetario-192.png" width="36" height="36" alt="" decoding="async" />
        <span class="hud-title">PLANETARIO 3D</span>
        <span class="hud-edition">Interstellar Edition</span>
      </div>
      <div class="hud-metrics">
        <div class="metric"><span class="metric-label">FPS</span><span class="metric-value" data-fps>--</span></div>
        <div class="metric"><span class="metric-label">DIST</span><span class="metric-value" data-dist>0 UA</span></div>
        <div class="metric"><span class="metric-label">SCALA</span><span class="metric-value" data-scale>Locale</span></div>
        <div class="metric"><span class="metric-label">CAM</span><span class="metric-value" data-cam>2.8 UA</span></div>
        <div class="metric hud-xp" data-gamification hidden><span class="metric-label">LV</span><span class="metric-value" data-level>1</span><span class="metric-value metric-xp" data-xp>0 XP</span></div>
      </div>
    </div>
    <div class="hud-coords">
      <span data-coords>X: 0.00 Y: 0.00 Z: 0.00</span>
    </div>
  `;
  root.appendChild(hud);

  const fpsEl = hud.querySelector('[data-fps]');
  const distEl = hud.querySelector('[data-dist]');
  const scaleEl = hud.querySelector('[data-scale]');
  const camEl = hud.querySelector('[data-cam]');
  const coordsEl = hud.querySelector('[data-coords]');
  const levelEl = hud.querySelector('[data-level]');
  const xpEl = hud.querySelector('[data-xp]');
  const xpMetric = hud.querySelector('[data-gamification]');

  let frameCount = 0;
  let lastTime = performance.now();
  let fps = 60;

  function updateFPS() {
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      fps = Math.round((frameCount * 1000) / (now - lastTime));
      fpsEl.textContent = fps;
      frameCount = 0;
      lastTime = now;
    }
    return fps;
  }

  function formatDistance(dist, sceneKey) {
    if (sceneKey === SCENES.EARTH) return `${dist.toFixed(2)} r⊕`;
    if (sceneKey === SCENES.SOLAR_SYSTEM) return `${(dist / 50).toFixed(1)} UA`;
    if (sceneKey === SCENES.WORMHOLE) return 'Tunnel';
    return `${(dist / 50).toFixed(0)} UA eq.`;
  }

  function setGamification({ level, xp, visible }) {
    if (xpMetric) xpMetric.hidden = !visible;
    if (levelEl) levelEl.textContent = String(level);
    if (xpEl) xpEl.textContent = `${xp} XP`;
  }

  function update(camera, sceneLabel, sceneKey = SCENES.EARTH) {
    const fps = updateFPS();
    const showFps = getUiState?.()?.showFps ?? true;
    const fpsMetric = hud.querySelector('.metric:first-child');
    if (fpsMetric) fpsMetric.style.display = showFps ? '' : 'none';

    const dist = camera.position.length();
    scaleEl.textContent = SCALE_LABELS[sceneKey] || sceneLabel || 'Locale';
    distEl.textContent = formatDistance(dist, sceneKey);
    camEl.textContent = `${dist.toFixed(1)} u`;
    coordsEl.textContent = `X: ${camera.position.x.toFixed(1)} Y: ${camera.position.y.toFixed(1)} Z: ${camera.position.z.toFixed(1)}`;
    return fps;
  }

  return { update, setGamification, element: hud, getFPS: () => fps };
}
