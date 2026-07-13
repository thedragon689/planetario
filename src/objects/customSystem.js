import * as THREE from 'three';
import { createPlanetTexture } from '../core/loader.js';
import { createOrbit } from './orbit.js';

export function buildCustomSystemMeshes(system, group) {
  const built = { group: new THREE.Group(), meshes: [] };

  const star = new THREE.Mesh(
    new THREE.SphereGeometry(system.starRadius || 2, 32, 32),
    new THREE.MeshStandardMaterial({
      color: system.starColor || 0xffdd88,
      emissive: system.starColor || 0xffaa44,
      emissiveIntensity: 0.8,
    })
  );
  star.userData = {
    type: 'custom_star',
    id: `${system.id}-star`,
    selectable: true,
    data: { id: `${system.id}-star`, name: system.name, type: 'Stella personalizzata' },
  };
  built.group.add(star);
  built.meshes.push(star);

  (system.planets || []).forEach((planet, i) => {
    const orbitGroup = new THREE.Group();
    const pivot = new THREE.Group();
    pivot.position.x = planet.distance || 10 + i * 6;

    const tex = createPlanetTexture({
      color: planet.color || 0x888888,
      seed: planet.name.length * 17 + i,
      type: planet.type || 'rocky',
      craters: planet.type === 'rocky',
    });

    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(planet.radius || 0.3, 32, 32),
      new THREE.MeshStandardMaterial({ map: tex })
    );
    mesh.userData = {
      type: 'custom_planet',
      id: planet.id,
      selectable: true,
      data: { ...planet, name: planet.name, type: `Pianeta ${planet.type}` },
    };
    pivot.add(mesh);
    orbitGroup.add(pivot);
    orbitGroup.add(createOrbit(planet.distance || 10 + i * 6, 0x56ccf2));
    built.group.add(orbitGroup);
    built.meshes.push(mesh);
  });

  built.group.name = `CustomSystem:${system.name}`;
  group.add(built.group);
  return built;
}

export function disposeCustomSystem(built) {
  if (!built?.group) return;
  built.group.parent?.remove(built.group);
  built.group.traverse((child) => {
    child.geometry?.dispose();
    if (child.material) {
      const mats = Array.isArray(child.material) ? child.material : [child.material];
      mats.forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
    }
  });
}
