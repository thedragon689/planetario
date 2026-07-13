import * as THREE from 'three';
import { galaxyVertex, galaxyFragment } from '../shaders/galaxy.js';

const PARTICLE_PRESETS = {
  high: 220,
  medium: 120,
  low: 50,
};

function parseColor(hex) {
  return new THREE.Color(hex || '#56ccf2');
}

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Deduce la morfologia 3D dal campo `type` del catalogo. */
export function inferGalaxyMorphology(type) {
  const t = (type || '').toLowerCase();
  if (t.includes('anellare') || t.includes('ring') || t.includes('ruota')) return 'ring';
  if (t.includes('fusione') || t.includes('interagent') || t.includes('coppia') || t.includes('gruppo compatto')) {
    return 'merger';
  }
  if (t.includes('irregolare') || t.includes('irregular') || t.includes('starburst') || t.includes('nana')) {
    return 'irregular';
  }
  if (t.includes('ellittica') || t.includes('elliptical') || t.includes('lenticolare') || t.includes('radio') || t.includes('sferoidal')) {
    return 'elliptical';
  }
  if (t.includes('spirale') || t.includes('spiral') || t.includes('barrat')) return 'spiral';
  return 'spiral';
}

function spiralPosition(i, total, arms, seed) {
  const arm = i % arms;
  const t = i / total;
  const jitter = ((seed + i * 17) % 100) / 100 - 0.5;
  const radius = Math.pow(t, 0.55) * 1 + jitter * 0.08;
  const angle = arm * ((2 * Math.PI) / arms) + t * 10 + jitter * 0.25;
  const height = jitter * 0.06 * (1 - t);
  return { x: Math.cos(angle) * radius, y: height, z: Math.sin(angle) * radius, t };
}

function addSubtleHalo(group, scale, color) {
  const base = parseColor(color);
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(scale * 0.48, 12, 12),
    new THREE.MeshBasicMaterial({
      color: base,
      transparent: true,
      opacity: 0.045,
      side: THREE.BackSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  halo.raycast = () => {};
  group.add(halo);
}

function addHitSphere(group, scale) {
  const radius = Math.max(scale * 1.1, 28);
  const hit = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 12, 12),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hit.name = 'hit';
  group.add(hit);
  return hit;
}

function disableChildRaycast(object) {
  object.traverse((child) => {
    if (child.isMesh && child.name !== 'hit') {
      child.raycast = () => {};
    }
  });
}

function createSpiralBody(scale, color, id, particleCount) {
  const group = new THREE.Group();
  const base = parseColor(color);
  const seed = hashSeed(id);
  const count = particleCount;
  const arms = seed % 2 === 0 ? 3 : 2;

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);

  const core = base.clone();
  const arm = base.clone().lerp(new THREE.Color(0x56ccf2), 0.35);
  const outer = base.clone().lerp(new THREE.Color(0x1a2a6c), 0.55);

  for (let i = 0; i < count; i++) {
    const pos = spiralPosition(i, count, arms, seed);
    positions[i * 3] = pos.x;
    positions[i * 3 + 1] = pos.y;
    positions[i * 3 + 2] = pos.z;

    const c = new THREE.Color();
    if (pos.t < 0.2) c.copy(core);
    else if (pos.t < 0.55) c.lerpColors(arm, core, (pos.t - 0.2) * 2.8);
    else c.lerpColors(outer, arm, (pos.t - 0.55) * 2.2);

    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
    sizes[i] = 0.45 + (1 - pos.t) * 1.2;
    phases[i] = (seed + i) % 100 / 100;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: galaxyVertex,
    fragmentShader: galaxyFragment,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.scale.setScalar(scale * 0.28);
  group.add(points);

  const bulge = new THREE.Mesh(
    new THREE.SphereGeometry(scale * 0.16, 16, 16),
    new THREE.MeshBasicMaterial({ color: base, transparent: true, opacity: 0.62 })
  );
  group.add(bulge);

  addHitSphere(group, scale);
  addSubtleHalo(group, scale, color);
  disableChildRaycast(group);

  return {
    group,
    update(time) {
      material.uniforms.uTime.value = time;
      group.rotation.y = time * 0.04 + seed * 0.001;
    },
  };
}

function createEllipticalBody(scale, color, id) {
  const group = new THREE.Group();
  const base = parseColor(color);
  const seed = hashSeed(id);
  const stretch = 1.2 + (seed % 5) * 0.08;

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(1, 20, 16),
    new THREE.MeshBasicMaterial({ color: base, transparent: true, opacity: 0.82 })
  );
  body.scale.set(stretch, 0.55 + (seed % 3) * 0.08, 0.85);
  body.scale.multiplyScalar(scale * 0.62);
  group.add(body);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(scale * 0.42, 14, 14),
    new THREE.MeshBasicMaterial({
      color: base,
      transparent: true,
      opacity: 0.14,
      side: THREE.BackSide,
    })
  );
  group.add(halo);

  addHitSphere(group, scale);
  addSubtleHalo(group, scale, color);
  disableChildRaycast(group);

  return {
    group,
    update(time) {
      group.rotation.y = time * 0.015;
    },
  };
}

function createIrregularBody(scale, color, id) {
  const group = new THREE.Group();
  const base = parseColor(color);
  const seed = hashSeed(id);
  const blobs = 3 + (seed % 3);

  for (let i = 0; i < blobs; i++) {
    const blob = new THREE.Mesh(
      new THREE.SphereGeometry(scale * (0.12 + (i % 3) * 0.04), 12, 12),
      new THREE.MeshBasicMaterial({
        color: base.clone().offsetHSL(i * 0.03, 0, (i % 2) * 0.05),
        transparent: true,
        opacity: 0.78,
      })
    );
    const angle = (i / blobs) * Math.PI * 2 + seed * 0.01;
    blob.position.set(
      Math.cos(angle) * scale * 0.18,
      (i % 2 ? 1 : -1) * scale * 0.06,
      Math.sin(angle) * scale * 0.15
    );
    group.add(blob);
  }

  addHitSphere(group, scale);
  addSubtleHalo(group, scale, color);
  disableChildRaycast(group);

  return {
    group,
    update(time) {
      group.rotation.y = time * 0.025;
    },
  };
}

function createRingBody(scale, color) {
  const group = new THREE.Group();
  const base = parseColor(color);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(scale * 0.28, scale * 0.05, 12, 48),
    new THREE.MeshBasicMaterial({ color: base, transparent: true, opacity: 0.85 })
  );
  ring.rotation.x = Math.PI / 2.3;
  group.add(ring);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(scale * 0.13, 14, 14),
    new THREE.MeshBasicMaterial({ color: base.clone().offsetHSL(0, -0.1, 0.15), transparent: true, opacity: 0.9 })
  );
  group.add(core);

  addHitSphere(group, scale);
  addSubtleHalo(group, scale, color);
  disableChildRaycast(group);

  return {
    group,
    update(time) {
      ring.rotation.z = time * 0.02;
    },
  };
}

function createMergerBody(scale, color, id) {
  const group = new THREE.Group();
  const base = parseColor(color);
  const seed = hashSeed(id);

  for (let i = 0; i < 2; i++) {
    const g = new THREE.Mesh(
      new THREE.SphereGeometry(scale * 0.2, 16, 16),
      new THREE.MeshBasicMaterial({
        color: base.clone().offsetHSL(i * 0.06, 0, 0),
        transparent: true,
        opacity: 0.8,
      })
    );
    g.position.set((i === 0 ? -1 : 1) * scale * 0.17, scale * 0.03, (seed % 2) * scale * 0.06);
    g.scale.set(1.1, 0.75, 0.95);
    group.add(g);
  }

  const bridge = new THREE.Mesh(
    new THREE.SphereGeometry(scale * 0.07, 10, 10),
    new THREE.MeshBasicMaterial({ color: base, transparent: true, opacity: 0.45 })
  );
  group.add(bridge);

  addHitSphere(group, scale);
  addSubtleHalo(group, scale, color);
  disableChildRaycast(group);

  return {
    group,
    update(time) {
      group.rotation.y = time * 0.018;
    },
  };
}

/** Orientamento casuale ma stabile per inclinazione galattica realistica. */
export function applyGalaxyOrientation(group, id, morphology) {
  const seed = hashSeed(id);
  group.rotation.x = ((seed % 70) - 35) * (Math.PI / 180) * 1.6;
  group.rotation.z = ((seed % 90) - 45) * (Math.PI / 180) * 1.2;
  group.rotation.y = ((seed % 120) - 60) * (Math.PI / 180) * (morphology === 'elliptical' ? 2.2 : 1.4);
}

/** Crea una mini-rappresentazione 3D morfologica della galassia. */
export function createMiniGalaxy(data, { qualityLevel = 'medium' } = {}) {
  const { scale: markerScale, color } = data.marker;
  const scale = markerScale;
  const morphology = inferGalaxyMorphology(data.type);
  const particles = PARTICLE_PRESETS[qualityLevel] || PARTICLE_PRESETS.medium;

  const builders = {
    spiral: () => createSpiralBody(scale, color, data.id, particles),
    elliptical: () => createEllipticalBody(scale, color, data.id),
    irregular: () => createIrregularBody(scale, color, data.id),
    ring: () => createRingBody(scale, color),
    merger: () => createMergerBody(scale, color, data.id),
  };

  return (builders[morphology] || builders.spiral)();
}
