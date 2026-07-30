import * as THREE from 'three';
import { createMoonOrbit } from './orbit.js';
import { createLitPlanetMesh, updateSunDirection } from './planetBody.js';
import { createMoonEffects } from './moonEffects.js';

/** Crea le lune principali orbitanti attorno ai pianeti genitori. */
export async function createMoons(planetBodyMap, sun, moonData) {
  const { moons: moonList } = moonData;
  const moons = [];
  const moonEffects = [];

  for (const data of moonList) {
    const parent = planetBodyMap.get(data.parentPlanet);
    if (!parent) continue;

    const orbitGroup = new THREE.Group();
    const pivot = new THREE.Group();
    pivot.position.x = data.distanceFromPlanet;
    orbitGroup.add(pivot);

    const { mesh, material } = await createLitPlanetMesh(data);
    const effects = createMoonEffects(pivot, data, sun.group);
    if (effects) moonEffects.push(effects);

    mesh.userData = {
      type: 'moon',
      id: data.id,
      data,
      selectable: true,
    };

    pivot.add(mesh);
    parent.pivot.add(createMoonOrbit(data.distanceFromPlanet));
    parent.pivot.add(orbitGroup);

    moons.push({ mesh, orbitGroup, pivot, data, material, parentId: data.parentPlanet });
  }

  return {
    moons,
    moonEffects,
    getMeshes() {
      return moons.map((m) => m.mesh);
    },
    updateSunLighting() {
      moons.forEach(({ mesh, material }) => {
        updateSunDirection(mesh, material, sun.group);
      });
    },
    updateEffects(time) {
      moonEffects.forEach((fx) => fx.update?.(time));
    },
  };
}
