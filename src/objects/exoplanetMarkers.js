import * as THREE from 'three';
import { flattenExoplanetForPanel } from '../data/exoplanetCatalog.js';
import { FEATURES } from '../config.js';
import { createProceduralPlanetMaterial, updateProceduralPlanetMaterial } from './proceduralPlanet.js';

const CLASS_COLORS = {
  rocky: 0x8b7355,
  super_earth: 0x4a9b8e,
  hot_jupiter: 0xe85d04,
  mini_neptune: 0x3d8bfd,
  ice_giant: 0x2ec4b6,
  gas_giant: 0xf4a261,
};

const ORBIT_SCALE = 200;
const _worldPos = new THREE.Vector3();

function spectralToColor(spectral) {
  const letter = (spectral || 'G').charAt(0).toUpperCase();
  const map = {
    O: 0x9bb0ff,
    B: 0xaabfff,
    A: 0xcad7ff,
    F: 0xf8f7ff,
    G: 0xfff4ea,
    K: 0xffd2a1,
    M: 0xffad6a,
  };
  return map[letter] || map.G;
}

function createHabitableZoneRing(innerAu, outerAu) {
  const inner = innerAu * ORBIT_SCALE;
  const outer = outerAu * ORBIT_SCALE;
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(inner, outer, 72),
    new THREE.MeshBasicMaterial({
      color: 0x56ccf2,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.raycast = () => {};
  return ring;
}

function createOrbitTrail(radius, color = 0x334466) {
  const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
  const points = curve.getPoints(96);
  const geometry = new THREE.BufferGeometry().setFromPoints(
    points.map((p) => new THREE.Vector3(p.x, 0, p.y))
  );
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });
  const line = new THREE.Line(geometry, material);
  line.raycast = () => {};
  return line;
}

export function createExoplanetSystems(group, exoplanetData) {
  const markers = [];
  const systems = exoplanetData?.systems || [];

  systems.forEach((system) => {
    const sysGroup = new THREE.Group();
    sysGroup.name = `exo_${system.id}`;
    const pos = system.marker?.position || [0, 0, 0];
    sysGroup.position.set(...pos);

    const starScale = (system.marker?.scale || 4) * 0.32;
    const starMesh = new THREE.Mesh(
      new THREE.SphereGeometry(starScale, 20, 20),
      new THREE.MeshBasicMaterial({
        color: spectralToColor(system.hostStar?.spectral),
      })
    );
    const corona = new THREE.Mesh(
      new THREE.SphereGeometry(starScale * 1.6, 16, 16),
      new THREE.MeshBasicMaterial({
        color: spectralToColor(system.hostStar?.spectral),
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    corona.raycast = () => {};
    sysGroup.add(corona, starMesh);

    if (system.habitableZone) {
      sysGroup.add(
        createHabitableZoneRing(system.habitableZone.innerAu, system.habitableZone.outerAu)
      );
    }

    (system.planets || []).forEach((planet, index) => {
      const au = planet.semiMajorAxisAu || 0.05 * (index + 1);
      const orbitR = au * ORBIT_SCALE;
      const phase = planet.orbitPhase ?? index * 1.37 + 0.4;
      const radius = Math.max(0.4, Math.min(2.4, (planet.radiusEarth || 1) * 0.5));
      const color = CLASS_COLORS[planet.classification] || 0xaaaaaa;

      sysGroup.add(createOrbitTrail(orbitR));

      let planetMaterial;
      if (FEATURES.proceduralPlanets) {
        const temp = planet.habitable ? 0.58 : planet.classification === 'hot_jupiter' ? 0.82 : 0.48;
        planetMaterial = createProceduralPlanetMaterial({
          temperature: temp,
          waterLevel: planet.habitable ? 0.48 : 0.32,
          tint: color,
        });
      } else {
        planetMaterial = new THREE.MeshStandardMaterial({
          color,
          roughness: 0.82,
          metalness: 0.06,
          emissive: planet.habitable ? new THREE.Color(0x1a3a4a) : new THREE.Color(0x000000),
          emissiveIntensity: planet.habitable ? 0.25 : 0,
        });
      }

      const planetMesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 18, 18),
        planetMaterial
      );
      planetMesh.position.set(Math.cos(phase) * orbitR, 0, Math.sin(phase) * orbitR);

      const panelData = flattenExoplanetForPanel(system, planet);
      planetMesh.userData = {
        type: 'exoplanet',
        id: planet.id,
        selectable: true,
        data: panelData,
        orbit: { radius: orbitR, phase, speed: 0.12 / Math.sqrt(Math.max(au, 0.02)) },
      };
      sysGroup.add(planetMesh);
      markers.push({ mesh: planetMesh, data: panelData, systemGroup: sysGroup });
    });

    group.add(sysGroup);
  });

  return {
    markers,
    getMeshes() {
      return markers.map((m) => m.mesh);
    },
    update(time) {
      markers.forEach(({ mesh, systemGroup }) => {
        const orbit = mesh.userData.orbit;
        if (!orbit) return;
        const angle = orbit.phase + time * orbit.speed;
        mesh.position.set(
          Math.cos(angle) * orbit.radius,
          0,
          Math.sin(angle) * orbit.radius
        );
        if (FEATURES.proceduralPlanets && mesh.material?.uniforms) {
          updateProceduralPlanetMaterial(mesh.material, time, new THREE.Vector3(1, 0.15, 0.4));
        }
        mesh.getWorldPosition(_worldPos);
        mesh.userData.worldLabelPosition = _worldPos.clone();
      });
    },
  };
}
