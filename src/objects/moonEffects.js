import * as THREE from 'three';
import { createPlanetAtmosphere } from './planetAtmosphere.js';

const VISUAL_RADIUS_SCALE = 2.2;

function createVolcanicHotspots(parent, radius) {
  const count = 10;
  const group = new THREE.Group();
  group.name = 'IoVolcanism';

  for (let i = 0; i < count; i++) {
    const lat = (Math.random() - 0.5) * Math.PI * 0.85;
    const lon = Math.random() * Math.PI * 2;
    const r = radius * VISUAL_RADIUS_SCALE * 1.01;
    const cosLat = Math.cos(lat);
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(radius * 0.06, 8, 8),
      new THREE.MeshBasicMaterial({
        color: 0xff6622,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    mesh.position.set(r * cosLat * Math.cos(lon), r * Math.sin(lat), r * cosLat * Math.sin(lon));
    mesh.userData.phase = Math.random() * Math.PI * 2;
    mesh.userData.speed = 1.2 + Math.random() * 1.5;
    group.add(mesh);
  }

  parent.add(group);
  return {
    update(time) {
      group.children.forEach((spot) => {
        const pulse = 0.55 + Math.sin(time * spot.userData.speed + spot.userData.phase) * 0.45;
        spot.material.opacity = pulse;
        spot.scale.setScalar(0.7 + pulse * 0.5);
      });
    },
  };
}

function createPolarPlume(parent, radius, { pole = 1, color = 0xaaddff, count = 120 } = {}) {
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const lat = pole * (Math.PI * 0.5 - 0.08 - Math.random() * 0.12);
    const lon = Math.random() * Math.PI * 2;
    const r = radius * VISUAL_RADIUS_SCALE * (1.01 + Math.random() * 0.04);
    const cosLat = Math.cos(lat);
    positions[i * 3] = r * cosLat * Math.cos(lon);
    positions[i * 3 + 1] = r * Math.sin(lat);
    positions[i * 3 + 2] = r * cosLat * Math.sin(lon);
    speeds[i] = 0.6 + Math.random() * 1.1;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
    },
    vertexShader: `
      attribute float aSpeed;
      uniform float uTime;
      varying float vAlpha;
      void main() {
        vec3 pos = position + normalize(position) * sin(uTime * aSpeed + aSpeed * 3.0) * 0.025;
        vec4 mv = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = 2.2 * (120.0 / max(-mv.z, 1.0));
        vAlpha = 0.45 + 0.35 * sin(uTime * aSpeed * 1.4);
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float glow = pow(smoothstep(0.5, 0.0, d), 1.6);
        gl_FragColor = vec4(uColor, glow * vAlpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.name = 'PolarPlume';
  parent.add(points);

  return {
    update(time) {
      material.uniforms.uTime.value = time;
    },
  };
}

/** Effetti visivi dedicati per lune con fenomeni distintivi. */
export function createMoonEffects(parent, data, sunGroup) {
  const radius = data.radius || 0.1;
  const updaters = [];

  switch (data.id) {
    case 'io':
      updaters.push(createVolcanicHotspots(parent, radius));
      break;
    case 'enceladus':
      updaters.push(createPolarPlume(parent, radius, { pole: -1, color: 0xd8f4ff, count: 100 }));
      break;
    case 'triton':
      updaters.push(createPolarPlume(parent, radius, { pole: 1, color: 0xffaacc, count: 80 }));
      break;
    case 'titan': {
      const atmo = createPlanetAtmosphere(parent, radius, 'titan', sunGroup);
      if (atmo) updaters.push({ update: () => atmo.update?.() });
      break;
    }
    default:
      break;
  }

  if (!updaters.length) return null;

  return {
    update(time) {
      updaters.forEach((fx) => fx.update?.(time));
    },
  };
}
