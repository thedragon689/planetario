import * as THREE from 'three';
import { createOrbit } from './orbit.js';
import {
  createEarthSolarMesh,
  createLitPlanetMesh,
  createSaturnRings,
  updateSunDirection,
  FALLBACK_COLORS,
  VISUAL_RADIUS_SCALE,
} from './planetBody.js';
import { createPlanetAtmosphere, hasAtmosphere } from './planetAtmosphere.js';
import { attachHitSphere, disableRaycast } from '../systems/clickTargets.js';

/** Costruisce il sistema planetario completo (Terra inclusa per la vista solare). */
export async function createPlanets(group, sun, planetData) {
  const { planets: planetList } = planetData;
  const planets = [];
  const atmospheres = [];
  const bodyMap = new Map();

  const entries = await Promise.all(
    planetList.map(async (data) => {
      const orbitGroup = new THREE.Group();
      orbitGroup.name = `Orbita ${data.name}`;

      const pivot = new THREE.Group();
      pivot.position.x = data.distanceFromSun;
      orbitGroup.add(pivot);

      let mesh;
      let material;
      let rings = null;

      if (data.id === 'earth') {
        ({ mesh, material } = await createEarthSolarMesh(data));
      } else {
        ({ mesh, material } = await createLitPlanetMesh(data));
      }

      if (data.id === 'saturn') {
        rings = createSaturnRings(1.35, 2.25, data.radius);
        pivot.add(rings.mesh);
      }

      pivot.add(mesh);

      if (hasAtmosphere(data.id)) {
        const atmo = createPlanetAtmosphere(pivot, data.radius, data.id, sun.group);
        if (atmo) atmospheres.push(atmo);
      }

      mesh.userData = {
        type: 'planet',
        id: data.id,
        data,
        selectable: true,
      };
      disableRaycast(mesh);
      attachHitSphere(mesh, data.radius * VISUAL_RADIUS_SCALE * 1.15);

      group.add(createOrbit(data.distanceFromSun, FALLBACK_COLORS[data.id] || 0x56ccf2));
      group.add(orbitGroup);

      return { mesh, orbitGroup, pivot, data, material, rings };
    })
  );

  entries.forEach((entry) => {
    planets.push(entry);
    bodyMap.set(entry.data.id, entry);
  });

  return {
    planets,
    bodyMap,
    getMeshes() {
      return planets.map((p) => p.mesh);
    },
    updateSunLighting() {
      planets.forEach(({ mesh, material }) => {
        updateSunDirection(mesh, material, sun.group);
      });
      atmospheres.forEach((a) => a.update?.());
    },
  };
}
