import * as THREE from 'three';
import { TEXTURES } from '../config.js';
import { loadTextureSafe, createPlanetTexture } from '../core/loader.js';
import { earthVertex, earthFragment } from '../shaders/earth.js';
import { planetVertex, planetFragment } from '../shaders/planet.js';
import sunFragmentShader from '../shaders/sun.glsl?raw';
import saturnRingsFragment from '../shaders/saturnRings.glsl?raw';

const RING_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SUN_VERTEX = `
  varying vec3 vNormalW;
  varying vec3 vViewDirW;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vViewDirW = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const FALLBACK_COLORS = {
  mercury: 0x8c7853,
  venus: 0xe8cda2,
  earth: 0x1a5a8a,
  mars: 0xc1440e,
  jupiter: 0xd4a574,
  saturn: 0xf4d59e,
  uranus: 0x4fd0e7,
  neptune: 0x4166f5,
  pluto: 0xc9b8a8,
  ceres: 0x9a8a7a,
  eris: 0xe8e8f0,
  haumea: 0xd8d0c8,
  makemake: 0xc8b8a8,
  luna: 0xaaaaaa,
  europa: 0xd4e8f0,
  io: 0xd4a030,
  titan: 0xd4a050,
  ganymede: 0x999999,
  callisto: 0x8a8a8a,
  enceladus: 0xe8f4ff,
  charon: 0x9a8a7a,
  triton: 0xc8d8e8,
};

export const PLANET_TYPES = {
  mercury: 'rocky', venus: 'rocky', earth: 'rocky', mars: 'rocky',
  jupiter: 'gas', saturn: 'gas', uranus: 'ice', neptune: 'ice', pluto: 'rocky',
  ceres: 'rocky', eris: 'rocky', haumea: 'rocky', makemake: 'rocky',
  luna: 'rocky', europa: 'ice', io: 'rocky', titan: 'rocky', ganymede: 'rocky',
  callisto: 'rocky', enceladus: 'ice', charon: 'rocky', triton: 'ice',
  phobos: 'rocky', deimos: 'rocky', miranda: 'ice', rhea: 'rocky', iapetus: 'rocky',
};

export const PLANET_STYLE = {
  mercury: { tint: 0xffffff, ambient: 0.32, rimColor: 0x998877, rimStrength: 0.12 },
  venus: { tint: 0xffeedd, ambient: 0.38, rimColor: 0xffcc88, rimStrength: 0.28 },
  mars: { tint: 0xffddcc, ambient: 0.34, rimColor: 0xff5533, rimStrength: 0.18 },
  jupiter: { tint: 0xfff0dd, ambient: 0.42, rimColor: 0xffaa55, rimStrength: 0.24 },
  saturn: { tint: 0xfff5e8, ambient: 0.4, rimColor: 0xffdd99, rimStrength: 0.22 },
  uranus: { tint: 0xddffff, ambient: 0.36, rimColor: 0x88eeff, rimStrength: 0.26 },
  neptune: { tint: 0xccddee, ambient: 0.34, rimColor: 0x5577ff, rimStrength: 0.24 },
  pluto: { tint: 0xffffff, ambient: 0.3, rimColor: 0xbb9988, rimStrength: 0.14 },
  ceres: { tint: 0xeeeedd, ambient: 0.3, rimColor: 0x998877, rimStrength: 0.12 },
  eris: { tint: 0xffffff, ambient: 0.32, rimColor: 0xccccdd, rimStrength: 0.16 },
  haumea: { tint: 0xffffff, ambient: 0.3, rimColor: 0xbbbbcc, rimStrength: 0.14 },
  makemake: { tint: 0xeeddcc, ambient: 0.28, rimColor: 0xaa9988, rimStrength: 0.12 },
  luna: { tint: 0xffffff, ambient: 0.28, rimColor: 0xcccccc, rimStrength: 0.1 },
  europa: { tint: 0xeeffff, ambient: 0.32, rimColor: 0x99ccff, rimStrength: 0.2 },
  io: { tint: 0xffeeaa, ambient: 0.3, rimColor: 0xff8800, rimStrength: 0.18 },
  titan: { tint: 0xffeecc, ambient: 0.32, rimColor: 0xff9933, rimStrength: 0.22 },
  ganymede: { tint: 0xdddddd, ambient: 0.28, rimColor: 0xaaaaaa, rimStrength: 0.12 },
  callisto: { tint: 0xcccccc, ambient: 0.26, rimColor: 0x888888, rimStrength: 0.1 },
  enceladus: { tint: 0xf0ffff, ambient: 0.34, rimColor: 0xaaddff, rimStrength: 0.24 },
  charon: { tint: 0xddccbb, ambient: 0.28, rimColor: 0x887766, rimStrength: 0.12 },
  triton: { tint: 0xeeffff, ambient: 0.32, rimColor: 0x88bbdd, rimStrength: 0.2 },
  phobos: { tint: 0xccccbb, ambient: 0.26, rimColor: 0x887766, rimStrength: 0.1 },
  deimos: { tint: 0xbbbbaa, ambient: 0.24, rimColor: 0x776655, rimStrength: 0.08 },
  miranda: { tint: 0xeeeeff, ambient: 0.3, rimColor: 0x99aacc, rimStrength: 0.16 },
  rhea: { tint: 0xdddddd, ambient: 0.28, rimColor: 0x999999, rimStrength: 0.1 },
  iapetus: { tint: 0xddccbb, ambient: 0.28, rimColor: 0x554433, rimStrength: 0.14 },
};

const _sunPos = new THREE.Vector3();
const _meshPos = new THREE.Vector3();
const _sunDir = new THREE.Vector3();

function proceduralOptions(id) {
  return {
    color: FALLBACK_COLORS[id] || 0x888888,
    seed: id.length * 13,
    type: PLANET_TYPES[id] || 'rocky',
  };
}

export async function loadBodyMap(id, texturePath) {
  if (id === 'earth') {
    return loadTextureSafe(TEXTURES.earth.albedo, {
      fallback: FALLBACK_COLORS.earth,
      procedural: proceduralOptions('earth'),
      maxSize: 2048,
    });
  }

  return loadTextureSafe(texturePath, {
    fallback: FALLBACK_COLORS[id] || 0x888888,
    procedural: proceduralOptions(id),
    maxSize: 2048,
  });
}

export function updateSunDirection(mesh, material, sunGroup) {
  if (!material?.uniforms?.uSunDirection) return;
  sunGroup.getWorldPosition(_sunPos);
  mesh.getWorldPosition(_meshPos);
  _sunDir.copy(_sunPos).sub(_meshPos).normalize();
  if (_sunDir.lengthSq() < 0.001) _sunDir.set(1, 0, 0);
  material.uniforms.uSunDirection.value.copy(_sunDir);
}

const VISUAL_RADIUS_SCALE = 2.2;

export async function createEarthSolarMesh(data) {
  const [dayMap, nightMap, specularMap] = await Promise.all([
    loadTextureSafe(TEXTURES.earth.albedo, { fallback: 0x1a5a8a, maxSize: 2048 }),
    loadTextureSafe(TEXTURES.earth.night, { fallback: 0x0a1520, maxSize: 2048 }),
    loadTextureSafe(TEXTURES.earth.specular, { fallback: 0x224466, maxSize: 2048 }),
  ]);
  dayMap.anisotropy = 8;

  const material = new THREE.ShaderMaterial({
    vertexShader: earthVertex,
    fragmentShader: earthFragment,
    uniforms: {
      uDayMap: { value: dayMap },
      uNightMap: { value: nightMap },
      uSpecularMap: { value: specularMap },
      uSunDirection: { value: new THREE.Vector3(1, 0.2, 0).normalize() },
      uNightBoost: { value: 2.0 },
    },
  });

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(data.radius * VISUAL_RADIUS_SCALE, 64, 64),
    material
  );
  mesh.name = data.name;
  mesh.renderOrder = 10;
  return { mesh, material };
}

export async function createLitPlanetMesh(data) {
  const id = data.id;
  const map = await loadBodyMap(id, data.texture);
  map.anisotropy = 4;

  const style = PLANET_STYLE[id] || { tint: 0xffffff, ambient: 0.15, rimColor: 0x56ccf2, rimStrength: 0.08 };
  const type = PLANET_TYPES[id] || 'rocky';

  const material = new THREE.ShaderMaterial({
    vertexShader: planetVertex,
    fragmentShader: planetFragment,
    uniforms: {
      uMap: { value: map },
      uSunDirection: { value: new THREE.Vector3(1, 0.2, 0).normalize() },
      uTint: { value: new THREE.Color(style.tint) },
      uAmbient: { value: style.ambient },
      uRimColor: { value: new THREE.Color(style.rimColor) },
      uRimStrength: { value: style.rimStrength },
      uGasBoost: { value: type === 'gas' ? 1.0 : type === 'ice' ? 0.4 : 0.0 },
      uRoughness: { value: type === 'gas' ? 0.85 : type === 'ice' ? 0.35 : 0.72 },
      uMetalness: { value: type === 'gas' ? 0.05 : type === 'ice' ? 0.1 : 0.02 },
      uEnvMap: { value: null },
      uEnvIntensity: { value: type === 'ice' ? 0.45 : type === 'gas' ? 0.25 : 0.12 },
    },
  });

  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(data.radius * VISUAL_RADIUS_SCALE, 64, 64),
    material
  );
  mesh.name = data.name;
  mesh.renderOrder = 10;
  if (data.tilt) mesh.rotation.z = THREE.MathUtils.degToRad(data.tilt);
  return { mesh, material };
}

/** Anelli procedurali di Saturno con shader dedicato. */
export function createSaturnRings(innerRadius, outerRadius, planetRadius) {
  const scaled = planetRadius * VISUAL_RADIUS_SCALE;
  const inner = innerRadius * scaled;
  const outer = outerRadius * scaled;
  const geometry = new THREE.RingGeometry(inner, outer, 128, 1);
  const material = new THREE.ShaderMaterial({
    vertexShader: RING_VERTEX,
    fragmentShader: saturnRingsFragment,
    uniforms: {
      uTime: { value: 0 },
      uInnerRadius: { value: inner },
      uOuterRadius: { value: outer },
      uRingColorA: { value: new THREE.Color(0xd8cbb0) },
      uRingColorB: { value: new THREE.Color(0x8a7355) },
      uGlowStrength: { value: 0.85 },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const ring = new THREE.Mesh(geometry, material);
  ring.rotation.x = Math.PI / 2;
  return { mesh: ring, material };
}

export function createSunMaterial(shaderParams = {}) {
  const core = new THREE.Color(shaderParams.coreColor || '#fff8e0');
  const mid = new THREE.Color(shaderParams.midColor || '#ffaa44');
  const corona = new THREE.Color(shaderParams.coronaColor || '#ff5500');

  return new THREE.ShaderMaterial({
    vertexShader: SUN_VERTEX,
    fragmentShader: sunFragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uNoiseScale: { value: shaderParams.noiseScale ?? 3.5 },
      uPlasmaSpeed: { value: shaderParams.plasmaSpeed ?? 0.35 },
      uGlowIntensity: { value: shaderParams.glowIntensity ?? 1.4 },
      uDistortion: { value: shaderParams.distortion ?? 0.08 },
      uCoreColor: { value: core },
      uMidColor: { value: mid },
      uCoronaColor: { value: corona },
    },
  });
}

export function createCoronaMesh(radius, color, opacity = 0.12) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 32),
    new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
}
