import * as THREE from 'three';
import { galaxyVertex, galaxyFragment } from '../shaders/galaxy.js';
import { PERFORMANCE } from '../config.js';

function spiralPosition(i, total, arms = 4) {
  const arm = i % arms;
  const t = i / total;
  const radius = Math.pow(t, 0.6) * 300 + Math.random() * 5;
  const angle = arm * ((2 * Math.PI) / arms) + t * 12 + (Math.random() - 0.5) * 0.3;
  const height = (Math.random() - 0.5) * 20 * (1 - t);

  return {
    x: Math.cos(angle) * radius,
    y: height,
    z: Math.sin(angle) * radius,
    t,
  };
}

export function createGalaxy(count = null, sceneKey = 'milky_way') {
  const isMobile = window.innerWidth < 768;
  const particleCount = count ?? (isMobile ? PERFORMANCE.galaxyParticlesMobile : PERFORMANCE.galaxyParticlesDesktop);

  const scaleByScene = {
    milky_way: 1,
    exoplanets: 0.85,
    extreme_objects: 0.72,
    local_group: 0.38,
    observable: 0.32,
  };
  const sceneScale = scaleByScene[sceneKey] ?? 1;

  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const phases = new Float32Array(particleCount);

  const coreColor = new THREE.Color(0xeaf6ff);
  const armColor1 = new THREE.Color(0x56ccf2);
  const armColor2 = new THREE.Color(0x5a2d82);
  const outerColor = new THREE.Color(0x1a2a6c);

  for (let i = 0; i < particleCount; i++) {
    const pos = spiralPosition(i, particleCount);
    positions[i * 3] = pos.x;
    positions[i * 3 + 1] = pos.y;
    positions[i * 3 + 2] = pos.z;

    const color = new THREE.Color();
    if (pos.t < 0.15) color.copy(coreColor);
    else if (pos.t < 0.5) color.lerpColors(armColor1, armColor2, pos.t * 2);
    else color.lerpColors(armColor2, outerColor, (pos.t - 0.5) * 2);

    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    sizes[i] = 0.3 + Math.random() * 1.5 * (1 - pos.t * 0.5);
    phases[i] = Math.random();
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
  points.frustumCulled = false;
  points.name = 'Via Lattea';
  points.scale.setScalar(sceneScale);

  if (sceneKey === 'local_group') {
    points.rotation.x = 0.52;
    points.rotation.z = 0.18;
  } else if (sceneKey === 'observable') {
    points.rotation.x = 0.38;
    points.rotation.y = 0.12;
  }

  const glowGeo = new THREE.SphereGeometry(40 * sceneScale, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x4a3a72,
    transparent: true,
    opacity: 0.05 + sceneScale * 0.04,
    side: THREE.BackSide,
  });
  const coreGlow = new THREE.Mesh(glowGeo, glowMat);
  points.add(coreGlow);

  return {
    points,
    update(time, delta, camera) {
      material.uniforms.uTime.value = time;
      points.rotation.y = time * 0.02;
      if (camera?.position) {
        const parallax = 0.0001;
        points.position.x = camera.position.x * parallax;
        points.position.y = camera.position.y * parallax * 0.5;
      }
    },
  };
}
