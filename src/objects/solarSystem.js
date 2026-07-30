import {
  animatePlanets,
  animateMoons,
  animateSaturnRings,
} from '../systems/animations.js';

/** Aggregatore animazioni del Sistema Solare. */
export function createSolarSystemController(sun, planets, moons, smallBodies = null, lagrange = null, probes = null) {
  let ephemerisMode = false;
  let getSimulationDate = () => new Date();

  return {
    sun,
    planets,
    moons,
    smallBodies,
    lagrange,
    probes,
    setEphemerisMode(enabled, dateProvider) {
      ephemerisMode = !!enabled;
      if (dateProvider) getSimulationDate = dateProvider;
    },
    getMeshes() {
      const meshes = [...planets.getMeshes(), ...moons.getMeshes()];
      if (smallBodies) meshes.push(...smallBodies.getMeshes());
      if (lagrange) meshes.push(...lagrange.getMeshes());
      if (probes) meshes.push(...probes.getMeshes());
      return meshes;
    },
    update(time, delta) {
      animatePlanets(planets.planets, delta, {
        useEphemeris: ephemerisMode,
        simulationDate: ephemerisMode ? getSimulationDate() : null,
      });
      animateMoons(moons.moons, delta);
      animateSaturnRings(planets.planets, time);
      planets.planets.forEach(({ material }) => {
        if (material?.uniforms?.uTime) material.uniforms.uTime.value = time;
      });
      moons.moons.forEach(({ material }) => {
        if (material?.uniforms?.uTime) material.uniforms.uTime.value = time;
      });
      sun.update?.(time);
      planets.updateSunLighting();
      moons.updateSunLighting();
      moons.updateEffects?.(time);
      smallBodies?.updateSunLighting?.();
      smallBodies?.update?.(time, delta, sun.group);
      probes?.update?.(time, delta);
    },
  };
}
