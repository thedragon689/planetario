import * as THREE from 'three';
import { createOrbit } from './orbit.js';
import { updateSunDirection } from './planetBody.js';

const ASTEROID_COLOR = 0x8a7a6a;
const COMET_NUCLEUS = 0x99aabb;
const KUIPER_COLOR = 0x6a8aaa;

function createCometTail(mesh) {
  const geometry = new THREE.ConeGeometry(0.08, 1.8, 8, 1, true);
  geometry.translate(0, -0.9, 0);
  const material = new THREE.MeshBasicMaterial({
    color: 0x88ccff,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const tail = new THREE.Mesh(geometry, material);
  tail.raycast = () => {};
  mesh.add(tail);
  return tail;
}

function addBody(group, data, { color, bodyType, withTail = false }) {
  const orbitGroup = new THREE.Group();
  orbitGroup.name = `Orbita ${data.name}`;
  if (data.inclination) {
    orbitGroup.rotation.x = data.inclination;
  }

  const pivot = new THREE.Group();
  pivot.position.x = data.distanceFromSun;
  orbitGroup.add(pivot);

  const geometry = new THREE.SphereGeometry(data.radius || 0.05, 16, 16);
  const material = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.9,
    metalness: 0.05,
  });
  const mesh = new THREE.Mesh(geometry, material);
  pivot.add(mesh);

  const tail = withTail ? createCometTail(mesh) : null;

  group.add(createOrbit(data.distanceFromSun, color));
  group.add(orbitGroup);

  mesh.userData = {
    type: bodyType,
    id: data.id,
    data,
    selectable: true,
  };

  return { mesh, orbitGroup, pivot, data, material, tail };
}

function createOortShell(group) {
  const geometry = new THREE.SphereGeometry(130, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    color: 0x223355,
    transparent: true,
    opacity: 0.04,
    side: THREE.BackSide,
    depthWrite: false,
  });
  const shell = new THREE.Mesh(geometry, material);
  shell.raycast = () => {};
  group.add(shell);
  return shell;
}

export async function createSmallBodies(group, sun, smallBodiesData) {
  const bodies = [];

  (smallBodiesData?.asteroids || []).forEach((data) => {
    bodies.push(addBody(group, data, { color: ASTEROID_COLOR, bodyType: 'asteroid' }));
  });

  (smallBodiesData?.comets || []).forEach((data) => {
    bodies.push(addBody(group, data, { color: COMET_NUCLEUS, bodyType: 'comet', withTail: true }));
  });

  (smallBodiesData?.kuiper || []).forEach((data) => {
    bodies.push(addBody(group, data, { color: KUIPER_COLOR, bodyType: 'dwarf_planet' }));
  });

  const oortShell = createOortShell(group);
  const oortData = smallBodiesData?.oort;
  if (oortData) {
    const proxy = new THREE.Mesh(
      new THREE.SphereGeometry(125, 12, 12),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    proxy.userData = {
      type: 'oort_cloud',
      id: oortData.id,
      selectable: true,
      data: oortData,
    };
    group.add(proxy);
    bodies.push({ mesh: proxy, orbitGroup: null, pivot: null, data: oortData, material: null, tail: null });
  }

  return {
    bodies,
    oortShell,
    getMeshes() {
      return bodies.map((b) => b.mesh);
    },
    update(_time, delta, sunGroup) {
      bodies.forEach((b) => {
        if (b.orbitGroup && b.data.orbitSpeed) {
          b.orbitGroup.rotation.y += b.data.orbitSpeed * delta;
        }
        if (b.tail && b.mesh && sunGroup) {
          const sunPos = new THREE.Vector3();
          sunGroup.getWorldPosition(sunPos);
          const meshPos = new THREE.Vector3();
          b.mesh.getWorldPosition(meshPos);
          const dist = meshPos.distanceTo(sunPos);
          const away = meshPos.clone().sub(sunPos).normalize();
          b.tail.position.copy(away.multiplyScalar(-0.6));
          b.tail.lookAt(meshPos.clone().add(away));
          b.tail.material.opacity = Math.max(0.1, 0.5 - dist * 0.008);
        }
      });
    },
    updateSunLighting() {
      bodies.forEach(({ mesh, material }) => {
        if (mesh && material) updateSunDirection(mesh, material, sun.group);
      });
    },
  };
}
