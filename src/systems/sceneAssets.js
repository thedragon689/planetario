import { SCENES, PERFORMANCE, FEATURES } from '../config.js';

const COSMIC_SCENES = new Set([
  SCENES.MILKY_WAY,
  SCENES.EXOPLANETS,
  SCENES.EXTREME,
  SCENES.LOCAL_GROUP,
  SCENES.OBSERVABLE,
  SCENES.WORMHOLE,
]);

const GALAXY_SCENES = new Set([
  SCENES.MILKY_WAY,
  SCENES.EXOPLANETS,
  SCENES.EXTREME,
  SCENES.LOCAL_GROUP,
  SCENES.OBSERVABLE,
]);

const MARKER_SCENES = {
  [SCENES.LOCAL_GROUP]: 'local_group',
  [SCENES.OBSERVABLE]: 'observable',
};

const STAR_SCENES = new Set([SCENES.MILKY_WAY, SCENES.EXOPLANETS, SCENES.LOCAL_GROUP]);

export function getParticleCounts(qualityLevel) {
  const isMobile = window.innerWidth < 768;
  const presets = {
    high: {
      galaxy: isMobile ? 100000 : PERFORMANCE.galaxyParticlesDesktop,
      stars: isMobile ? 8000 : PERFORMANCE.starCountDesktop,
    },
    medium: {
      galaxy: isMobile ? 50000 : 120000,
      stars: isMobile ? 4000 : 10000,
    },
    low: {
      galaxy: PERFORMANCE.galaxyParticlesMobile,
      stars: PERFORMANCE.starCountMobile,
    },
  };
  return presets[qualityLevel] || presets.medium;
}

export function createSceneAssetManager({ groups, scene, updatables, getQualityLevel }) {
  let stars = null;
  let galaxy = null;
  let nebulae = null;
  let dust = null;
  let wormhole = null;
  let cosmicBackdrop = null;
  let exoplanetSet = null;
  let extremeSet = null;
  let largeScaleSet = null;
  const markerSets = new Map();
  const starMarkerSets = new Map();
  let loadingPromise = null;

  function getStarMarkers() {
    const allMarkers = [];
    for (const set of starMarkerSets.values()) {
      allMarkers.push(...set.markers);
    }
    return {
      markers: allMarkers,
      getMeshes() {
        return allMarkers.map((m) => m.mesh);
      },
      update(time) {
        starMarkerSets.forEach((set) => set.update?.(time));
      },
    };
  }

  function getExtremeObjects() {
    return extremeSet;
  }

  function getExoplanetMarkers() {
    return exoplanetSet;
  }

  function getGalaxyMarkers() {
    const allMarkers = [];
    const clusterAnchors = [];
    for (const set of markerSets.values()) {
      allMarkers.push(...set.markers);
      if (set.clusterAnchors) clusterAnchors.push(...set.clusterAnchors);
    }
    return {
      markers: allMarkers,
      clusterAnchors,
      getMeshes() {
        return allMarkers.map((m) => m.mesh);
      },
      update(time) {
        markerSets.forEach((set) => set.update?.(time));
      },
    };
  }

  function getLargeScaleStructures() {
    return largeScaleSet;
  }

  async function ensureForScene(sceneKey, { galaxyData, starData, phenomenaData, exoplanetData, extremeData, largeScaleData } = {}) {
    if (!COSMIC_SCENES.has(sceneKey)) {
      if (stars) stars.points.visible = false;
      return;
    }

    if (loadingPromise) {
      await loadingPromise;
      return;
    }

    loadingPromise = (async () => {
      const [
        { createStars },
        { createGalaxy },
        { createNebulae },
        { createWormhole },
        { createGalaxyMarkers },
        { createStarMarkers },
        { createCosmicEnvironment },
        { createExoplanetSystems },
        { createExtremeObjects },
        { createLargeScaleStructures },
      ] = await Promise.all([
        import('../objects/stars.js'),
        import('../objects/galaxy.js'),
        import('../objects/nebula.js'),
        import('../objects/wormhole.js'),
        import('../objects/galaxyMarkers.js'),
        import('../objects/starMarkers.js'),
        import('../objects/cosmicEnvironment.js'),
        import('../objects/exoplanetMarkers.js'),
        import('../objects/extremeObjects.js'),
        import('../objects/largeScaleStructures.js'),
      ]);

      const counts = getParticleCounts(getQualityLevel());
      const markerSceneKey = MARKER_SCENES[sceneKey];

      if (!cosmicBackdrop) {
        cosmicBackdrop = createCosmicEnvironment();
        scene.add(cosmicBackdrop.mesh);
      }

      if (!galaxy && GALAXY_SCENES.has(sceneKey)) {
        galaxy = createGalaxy(counts.galaxy, sceneKey);
        groups.milkyWay.add(galaxy.points);
        updatables.push(galaxy);
      }

      if (!stars) {
        stars = createStars(counts.stars, { qualityLevel: getQualityLevel() });
        scene.add(stars.points);
        updatables.push(stars);
      }
      stars.points.visible = true;
      const dimBackground = sceneKey === SCENES.LOCAL_GROUP || sceneKey === SCENES.OBSERVABLE
        ? 0.38
        : sceneKey === SCENES.EXOPLANETS
          ? 0.55
          : sceneKey === SCENES.EXTREME
            ? 0.42
            : 1;
      stars.points.material.opacity = dimBackground;

      if (!nebulae && (sceneKey === SCENES.MILKY_WAY || sceneKey === SCENES.LOCAL_GROUP || sceneKey === SCENES.EXOPLANETS)) {
        nebulae = createNebulae(groups.nebulae, phenomenaData?.nebulae, { qualityLevel: getQualityLevel() });
        updatables.push(nebulae);
      }

      if (FEATURES.dustParticles && !dust && (sceneKey === SCENES.MILKY_WAY || sceneKey === SCENES.LOCAL_GROUP)) {
        const { createDustParticles } = await import('../objects/dustParticles.js');
        dust = createDustParticles(getQualityLevel() === 'low' ? 1400 : 2800);
        groups.milkyWay.add(dust.mesh);
        updatables.push(dust);
      }

      if (
        FEATURES.exoplanets
        && !exoplanetSet
        && sceneKey === SCENES.EXOPLANETS
        && exoplanetData
      ) {
        exoplanetSet = createExoplanetSystems(groups.exoplanets, exoplanetData);
        updatables.push(exoplanetSet);
      }

      if (
        FEATURES.extremeObjects
        && !extremeSet
        && sceneKey === SCENES.EXTREME
        && extremeData
      ) {
        extremeSet = createExtremeObjects(groups.extremeObjects, extremeData);
        updatables.push(extremeSet);
      }

      if (STAR_SCENES.has(sceneKey) && !starMarkerSets.has(sceneKey) && starData) {
        const starSet = createStarMarkers(groups.famousStars, starData, sceneKey, {
          qualityLevel: getQualityLevel(),
        });
        starMarkerSets.set(sceneKey, starSet);
        updatables.push(starSet);
      }

      if (markerSceneKey && !markerSets.has(markerSceneKey) && galaxyData) {
        const targetGroup = markerSceneKey === 'observable' ? groups.observable : groups.localGroup;
        const markerSet = createGalaxyMarkers(targetGroup, galaxyData, markerSceneKey, {
          qualityLevel: getQualityLevel(),
        });
        markerSets.set(markerSceneKey, markerSet);
        updatables.push(markerSet);
      }

      if (
        FEATURES.largeScaleStructures
        && !largeScaleSet
        && sceneKey === SCENES.OBSERVABLE
        && largeScaleData
      ) {
        largeScaleSet = createLargeScaleStructures(groups.observable, largeScaleData);
        updatables.push(largeScaleSet);
      }

      if (!wormhole && sceneKey === SCENES.WORMHOLE) {
        wormhole = createWormhole(groups.wormhole, phenomenaData?.wormhole);
        updatables.push(wormhole);
      }
    })();

    try {
      await loadingPromise;
    } finally {
      loadingPromise = null;
    }
  }

  function updateGalaxyForScene(sceneKey) {
    if (!galaxy?.points) return;

    const scales = {
      [SCENES.MILKY_WAY]: 1,
      [SCENES.EXOPLANETS]: 0.85,
      [SCENES.EXTREME]: 0.72,
      [SCENES.LOCAL_GROUP]: 0.38,
      [SCENES.OBSERVABLE]: 0.32,
    };
    const scale = scales[sceneKey] ?? 1;
    galaxy.points.scale.setScalar(scale);

    if (sceneKey === SCENES.LOCAL_GROUP) {
      galaxy.points.rotation.set(0.52, 0, 0.18);
    } else if (sceneKey === SCENES.OBSERVABLE) {
      galaxy.points.rotation.set(0.38, 0.12, 0);
    } else {
      galaxy.points.rotation.set(0, 0, 0);
    }
  }

  function setCosmicBackdropVisible(visible) {
    cosmicBackdrop?.setVisible(visible);
  }

  function disposeObject3D(object) {
    if (!object) return;
    object.traverse((child) => {
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m) => {
          Object.values(m).forEach((v) => {
            if (v?.isTexture) v.dispose();
          });
          m.dispose?.();
        });
      }
    });
    object.parent?.remove(object);
  }

  function cleanupScene(sceneKey) {
    if (sceneKey === SCENES.WORMHOLE && wormhole) {
      disposeObject3D(wormhole.group);
      const idx = updatables.indexOf(wormhole);
      if (idx >= 0) updatables.splice(idx, 1);
      wormhole = null;
    }
  }

  return {
    ensureForScene,
    cleanupScene,
    getStars: () => stars,
    getGalaxy: () => galaxy,
    getNebulae: () => nebulae,
    getWormhole: () => wormhole,
    getGalaxyMarkers,
    getStarMarkers,
    getExoplanetMarkers,
    getExtremeObjects,
    getLargeScaleStructures,
    setCosmicBackdropVisible,
    updateGalaxyForScene,
    isCosmicScene: (key) => COSMIC_SCENES.has(key),
  };
}
