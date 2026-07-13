import * as THREE from 'three';
import { starsVertex, starsFragment } from '../shaders/stars.js';
import { FEATURES, PERFORMANCE } from '../config.js';

const _matrix = new THREE.Matrix4();
const _position = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _scale = new THREE.Vector3();

function createInstancedStars(starCount) {
  const geometry = new THREE.SphereGeometry(1, 5, 5);
  const material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    toneMapped: false,
    vertexColors: true,
  });

  const mesh = new THREE.InstancedMesh(geometry, material, starCount);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

  const instanceColors = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 800 + Math.random() * 4000;

    _position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.sin(phi) * Math.sin(theta),
      r * Math.cos(phi)
    );
    _scale.setScalar(0.4 + Math.random() * 1.6);
    _matrix.compose(_position, _quaternion.identity(), _scale);
    mesh.setMatrixAt(i, _matrix);

    const tint = 0.75 + Math.random() * 0.25;
    instanceColors[i * 3] = tint;
    instanceColors[i * 3 + 1] = tint * (0.9 + Math.random() * 0.1);
    instanceColors[i * 3 + 2] = 1;
  }

  mesh.instanceColor = new THREE.InstancedBufferAttribute(instanceColors, 3);
  mesh.frustumCulled = false;
  mesh.name = 'StarFieldInstanced';

  return {
    points: mesh,
    update(time) {
      material.opacity = 0.88 + Math.sin(time * 0.0015) * 0.06;
    },
  };
}

function createPointsStars(starCount) {
  const positions = new Float32Array(starCount * 3);
  const sizes = new Float32Array(starCount);
  const phases = new Float32Array(starCount);

  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 800 + Math.random() * 4000;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    sizes[i] = 0.5 + Math.random() * 2;
    phases[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: starsVertex,
    fragmentShader: starsFragment,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.name = 'StarField';

  return {
    points,
    update(time) {
      material.uniforms.uTime.value = time;
    },
  };
}

export function createStars(count = null, { qualityLevel = 'high' } = {}) {
  const isMobile = window.innerWidth < 768;
  const useInstancing = FEATURES.instancedStars && qualityLevel !== 'low';

  const starCount =
    count ??
    (useInstancing
      ? isMobile
        ? PERFORMANCE.instancedStarsMobile
        : PERFORMANCE.instancedStarsDesktop
      : isMobile
        ? PERFORMANCE.starCountMobile
        : PERFORMANCE.starCountDesktop);

  return useInstancing ? createInstancedStars(starCount) : createPointsStars(starCount);
}
