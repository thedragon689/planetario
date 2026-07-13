import * as THREE from 'three';

/** Sfondo cosmico con gradiente radiale e leggera nebulosità procedurale. */
export function createCosmicEnvironment() {
  const uniforms = {
    uColorInner: { value: new THREE.Color(0x0a1028) },
    uColorOuter: { value: new THREE.Color(0x020308) },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
    vertexShader: `
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 uColorInner;
      uniform vec3 uColorOuter;
      varying vec3 vWorldPos;

      float hash(vec3 p) {
        return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
      }

      void main() {
        float r = length(vWorldPos) / 12000.0;
        vec3 col = mix(uColorInner, uColorOuter, smoothstep(0.15, 1.0, r));

        float n = hash(normalize(vWorldPos) * 180.0);
        col += vec3(0.02, 0.03, 0.06) * smoothstep(0.82, 1.0, n);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  const dome = new THREE.Mesh(new THREE.SphereGeometry(12000, 48, 32), material);
  dome.name = 'CosmicBackdrop';
  dome.frustumCulled = false;
  dome.raycast = () => {};

  return {
    mesh: dome,
    visible: false,
    setVisible(v) {
      this.visible = v;
      dome.visible = v;
    },
  };
}
