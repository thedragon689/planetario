import * as THREE from 'three';
import { attachHitSphere } from '../systems/clickTargets.js';

function createFilament(points, color = 0x56ccf2) {
  const vectors = points.map((p) => new THREE.Vector3(...p));
  const geometry = new THREE.BufferGeometry().setFromPoints(vectors);
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.35,
    linewidth: 1,
  });
  const line = new THREE.Line(geometry, material);
  line.userData = { type: 'filament' };
  return line;
}

function createVoidSphere(def) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(def.radius || 200, 24, 24),
    new THREE.MeshBasicMaterial({
      color: 0x0a1020,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      depthWrite: false,
    })
  );
  mesh.position.set(...(def.position || [0, 0, 0]));
  mesh.userData = {
    type: 'cosmic_void',
    id: def.id,
    selectable: true,
    data: def,
  };
  return mesh;
}

function createSuperclusterAnchor(def) {
  const group = new THREE.Group();
  group.position.set(...(def.position || [0, 0, 0]));

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(12, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.85 })
  );
  group.add(core);

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(def.radius || 150, 20, 20),
    new THREE.MeshBasicMaterial({
      color: 0x5a2d82,
      transparent: true,
      opacity: 0.08,
      depthWrite: false,
    })
  );
  halo.raycast = () => {};
  group.add(halo);
  attachHitSphere(group, Math.max(def.radius || 150, 24) * 0.35);

  group.userData = {
    type: 'supercluster',
    id: def.id,
    selectable: true,
    data: def,
  };
  return group;
}

function createCMBSphere() {
  const uniforms = {
    uTime: { value: 0 },
    uEra: { value: 1 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uEra;
      varying vec3 vDir;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      void main() {
        vec2 uv = vec2(atan(vDir.z, vDir.x) / 6.28318 + 0.5, asin(vDir.y) / 3.14159 + 0.5);
        float n = hash(uv * 512.0) * 0.5 + hash(uv * 128.0) * 0.3 + hash(uv * 32.0) * 0.2;
        float temp = 2.725 + (n - 0.5) * 0.003;
        vec3 col = vec3(0.04, 0.02, 0.08) + vec3(0.9, 0.5, 0.2) * (temp / 3.0) * 0.15;
        col *= mix(0.4, 1.0, uEra);
        gl_FragColor = vec4(col, 0.55);
      }
    `,
  });

  const mesh = new THREE.Mesh(new THREE.SphereGeometry(10500, 64, 32), material);
  mesh.name = 'CMB-Sphere';
  mesh.raycast = () => {};
  return { mesh, uniforms };
}

export function createLargeScaleStructures(group, data) {
  const root = new THREE.Group();
  root.name = 'LargeScaleStructures';
  const meshes = [];

  (data.filaments || []).forEach((fil) => {
    const line = createFilament(fil.points);
    line.userData.data = fil;
    line.userData.id = fil.id;
    root.add(line);
  });

  (data.voids || []).forEach((v) => {
    const voidMesh = createVoidSphere(v);
    root.add(voidMesh);
    meshes.push(voidMesh);
  });

  (data.superclusters || []).forEach((sc) => {
    const anchor = createSuperclusterAnchor(sc);
    root.add(anchor);
    meshes.push(anchor);
  });

  const cmb = createCMBSphere();
  root.add(cmb.mesh);

  group.add(root);

  return {
    group: root,
    cmb: cmb.uniforms,
    meshes,
    getMeshes: () => meshes,
    setEraScale(eraFactor) {
      if (cmb.uniforms.uEra) cmb.uniforms.uEra.value = eraFactor;
      root.children.forEach((child) => {
        if (child.userData?.type === 'filament') {
          child.material.opacity = 0.15 + eraFactor * 0.25;
        }
      });
    },
    setVisible(visible) {
      root.visible = visible;
    },
    update(time) {
      if (cmb.uniforms.uTime) cmb.uniforms.uTime.value = time;
    },
  };
}
