import { SCENES, SCENE_ORDER, SCENE_LABELS } from '../config.js';

const NO_FOG_SCENES = new Set([
  SCENES.SOLAR_SYSTEM,
]);

const COSMIC_FOG_SCENES = new Set([
  SCENES.MILKY_WAY,
  SCENES.EXOPLANETS,
  SCENES.EXTREME,
  SCENES.LOCAL_GROUP,
  SCENES.OBSERVABLE,
]);

export function createNavigation(transitions, groups, sceneServices, postFX, scene, onSceneChange, controls) {
  const { getWormhole, ensureScene, getStars, applyControls, setCosmicBackdrop, updateGalaxyForScene, cleanupScene } = sceneServices;
  let currentIndex = 0;
  let currentScene = SCENES.EARTH;

  function setGroupVisibility(sceneKey) {
    const visibility = {
      [SCENES.EARTH]: ['earth'],
      [SCENES.SOLAR_SYSTEM]: ['solarSystem'],
      [SCENES.MILKY_WAY]: ['milkyWay', 'nebulae', 'famousStars'],
      [SCENES.EXOPLANETS]: ['milkyWay', 'nebulae', 'exoplanets', 'famousStars'],
      [SCENES.EXTREME]: ['milkyWay', 'extremeObjects'],
      [SCENES.LOCAL_GROUP]: ['milkyWay', 'nebulae', 'localGroup', 'famousStars'],
      [SCENES.OBSERVABLE]: ['milkyWay', 'observable'],
      [SCENES.WORMHOLE]: ['wormhole'],
    };

    Object.entries(groups).forEach(([key, group]) => {
      const visible = visibility[sceneKey]?.includes(key) ?? false;
      group.visible = visible;
    });

    if (scene) {
      if (NO_FOG_SCENES.has(sceneKey)) {
        scene.fog = null;
      } else if (COSMIC_FOG_SCENES.has(sceneKey)) {
        scene.fog = scene.userData._fogCosmic || null;
      } else {
        scene.fog = scene.userData._fog || null;
      }
    }

    const stars = getStars?.();
    if (stars?.points?.material) {
      const opacity = sceneKey === SCENES.LOCAL_GROUP || sceneKey === SCENES.OBSERVABLE
        ? 0.38
        : sceneKey === SCENES.MILKY_WAY
          ? 0.65
          : sceneKey === SCENES.EXOPLANETS
            ? 0.5
            : sceneKey === SCENES.EXTREME
              ? 0.35
              : 1;
      stars.points.material.opacity = opacity;
    }

    applyControls?.(sceneKey);
    setCosmicBackdrop?.(
      sceneKey === SCENES.LOCAL_GROUP
      || sceneKey === SCENES.OBSERVABLE
      || sceneKey === SCENES.MILKY_WAY
      || sceneKey === SCENES.EXOPLANETS
      || sceneKey === SCENES.EXTREME
    );
    if (visibility[sceneKey]?.includes('milkyWay')) {
      updateGalaxyForScene?.(sceneKey);
    }
    controls?.update?.();

    if (sceneKey === SCENES.WORMHOLE) {
      getWormhole()?.setVisible(true);
      postFX?.setBloomStrength(1.5);
    } else {
      getWormhole()?.setVisible(false);
      postFX?.setBloomStrength(0.8);
    }
  }

  function notifySceneChange(sceneKey) {
    postFX?.setSceneProfile(sceneKey);
    onSceneChange?.(sceneKey, SCENE_LABELS[sceneKey]);
  }

  async function goTo(sceneKey) {
    const index = SCENE_ORDER.indexOf(sceneKey);
    if (index === -1) return;
    if (transitions.isActive()) return;

    if (index === currentIndex) {
      await ensureScene?.(sceneKey);
      sceneServices.fitCamera?.(sceneKey);
      await transitions.resetToScene(sceneKey);
      return;
    }

    const previousScene = currentScene;
    const previousIndex = currentIndex;

    if (previousScene !== sceneKey) {
      cleanupScene?.(previousScene);
    }

    currentIndex = index;
    currentScene = sceneKey;

    await ensureScene?.(sceneKey);
    sceneServices.fitCamera?.(sceneKey);

    setGroupVisibility(sceneKey);
    notifySceneChange(sceneKey);

    const completed = await transitions.transitionTo(sceneKey);
    if (!completed) {
      currentIndex = previousIndex;
      currentScene = previousScene;
      setGroupVisibility(previousScene);
      notifySceneChange(previousScene);
      return;
    }
  }

  async function next() {
    const nextIndex = (currentIndex + 1) % SCENE_ORDER.length;
    await goTo(SCENE_ORDER[nextIndex]);
  }

  async function prev() {
    const prevIndex = (currentIndex - 1 + SCENE_ORDER.length) % SCENE_ORDER.length;
    await goTo(SCENE_ORDER[prevIndex]);
  }

  setGroupVisibility(SCENES.EARTH);

  return {
    goTo,
    next,
    prev,
    getCurrent: () => currentScene,
    getCurrentLabel: () => SCENE_LABELS[currentScene],
    getIndex: () => currentIndex,
    getTotal: () => SCENE_ORDER.length,
    syncScene: () => notifySceneChange(currentScene),
  };
}
