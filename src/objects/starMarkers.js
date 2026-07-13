import * as THREE from 'three';
import { FEATURES } from '../config.js';

function parseColor(hex) {
  return new THREE.Color(hex || '#eaf6ff');
}

const SPECTRAL_STYLE = {
  O: { corona: 1.8, pulse: 1.3 },
  B: { corona: 1.6, pulse: 1.2 },
  A: { corona: 1.4, pulse: 1.15 },
  F: { corona: 1.25, pulse: 1.1 },
  G: { corona: 1.2, pulse: 1.05 },
  K: { corona: 1.15, pulse: 1.0 },
  M: { corona: 1.5, pulse: 0.9 },
  C: { corona: 1.3, pulse: 0.85 },
};

const _matrix = new THREE.Matrix4();
const _position = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _scale = new THREE.Vector3();

function inferSpectral(type, colorHex) {
  const t = (type || '').toLowerCase();
  if (t.includes('supergigante') || t.includes('supergiant')) return 'M';
  if (t.includes('nana rossa') || t.includes('red dwarf') || t.includes('m5')) return 'M';
  if (t.includes('g2') || t.includes('gialla') || t.includes('sole')) return 'G';
  if (t.includes('a1') || t.includes('binario')) return 'A';
  if (t.includes('k')) return 'K';
  if (t.includes('f')) return 'F';
  if (t.includes('b')) return 'B';
  const c = parseColor(colorHex);
  if (c.r > 0.9 && c.g < 0.6) return 'M';
  if (c.b > c.r && c.b > c.g) return 'A';
  return 'F';
}

function createCoronaMesh(scale, baseColor, style) {
  const corona = new THREE.Mesh(
    new THREE.SphereGeometry(scale * 0.85 * style.corona, 16, 16),
    new THREE.MeshBasicMaterial({
      color: baseColor,
      transparent: true,
      opacity: 0.18,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  corona.raycast = () => {};
  return corona;
}

function createInstancedCoronas(group, markerDefs) {
  const geometry = new THREE.SphereGeometry(1, 12, 12);
  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.18,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, markerDefs.length);
  const colors = new Float32Array(markerDefs.length * 3);

  markerDefs.forEach((def, i) => {
    const radius = def.scale * 0.85 * def.style.corona;
    _position.copy(def.worldPosition);
    _scale.setScalar(radius);
    _matrix.compose(_position, _quaternion.identity(), _scale);
    mesh.setMatrixAt(i, _matrix);

    colors[i * 3] = def.color.r;
    colors[i * 3 + 1] = def.color.g;
    colors[i * 3 + 2] = def.color.b;
  });

  mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.name = 'star_coronas_instanced';
  mesh.raycast = () => {};
  group.add(mesh);

  return {
    mesh,
    update(time) {
      markerDefs.forEach((def, i) => {
        const pulse = def.style.pulse + Math.sin(time * 2.2 + def.pulseSeed) * 0.08;
        const radius = def.scale * 0.85 * def.style.corona * pulse;
        _position.copy(def.worldPosition);
        _scale.setScalar(radius);
        _matrix.compose(_position, _quaternion.identity(), _scale);
        mesh.setMatrixAt(i, _matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    },
  };
}

/** Marker 3D cliccabili per le stelle famose documentate in stars.json. */
export function createStarMarkers(group, starData, sceneKey, { qualityLevel = 'medium' } = {}) {
  const markers = [];
  const entries = (starData?.stars || []).filter(
    (s) => s.id !== 'sun' && s.marker?.scenes?.includes(sceneKey)
  );
  const useInstancedCoronas =
    FEATURES.instancedMarkers && qualityLevel !== 'low' && entries.length >= 2;

  const coronaDefs = entries.map((data) => {
    const { position, scale, color } = data.marker;
    const baseColor = parseColor(color);
    const spec = data.marker.spectral || inferSpectral(data.type, color);
    const style = SPECTRAL_STYLE[spec] || SPECTRAL_STYLE.F;
    return {
      data,
      scale,
      color: baseColor,
      style,
      pulseSeed: data.id.length,
      worldPosition: new THREE.Vector3(...position),
    };
  });

  const instancedCoronas = useInstancedCoronas ? createInstancedCoronas(group, coronaDefs) : null;

  coronaDefs.forEach((def) => {
    const { data, scale, color: baseColor, style } = def;
    const { position } = data.marker;

    const body = new THREE.Group();
    body.position.set(...position);
    body.name = data.name;

    const core = new THREE.Mesh(
      new THREE.SphereGeometry(scale * 0.32, 16, 16),
      new THREE.MeshBasicMaterial({ color: baseColor, transparent: true, opacity: 0.95 })
    );
    body.add(core);

    let corona = null;
    if (!useInstancedCoronas) {
      corona = createCoronaMesh(scale, baseColor, style);
      body.add(corona);
    }

    const rays = new THREE.Mesh(
      new THREE.SphereGeometry(scale * 0.48, 8, 8),
      new THREE.MeshBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0.08,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    rays.raycast = () => {};
    body.add(rays);

    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(Math.max(scale * 1.4, 24), 10, 10),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hit.name = 'hit';
    body.add(hit);

    core.raycast = () => {};
    rays.raycast = () => {};

    body.userData = {
      type: 'star',
      id: data.id,
      selectable: true,
      data: { ...data, category: data.type },
    };

    group.add(body);
    markers.push({ mesh: body, core, corona, rays, data, style });
  });

  return {
    markers,
    sceneKey,
    getMeshes() {
      return markers.map((m) => m.mesh);
    },
    update(time) {
      instancedCoronas?.update(time);
      markers.forEach(({ mesh, corona, rays, data, style }) => {
        if (corona) {
          const pulse = style.pulse + Math.sin(time * 2.2 + data.id.length) * 0.08;
          corona.scale.setScalar(pulse);
        }
        rays.scale.setScalar(1 + Math.sin(time * 1.5 + mesh.position.x * 0.01) * 0.12);
        mesh.rotation.y = time * 0.05;
      });
    },
  };
}
