import * as THREE from 'three';

const vertexShader = `
  varying vec3 vWorldPos;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const fragmentShader = `
  uniform float uMass;
  uniform vec3 uCenter;
  varying vec3 vWorldPos;

  void main() {
    float d = length(vWorldPos.xz - uCenter.xz);
    float well = uMass / (d + 0.35);
    float grid = abs(sin(vWorldPos.x * 3.0)) * abs(sin(vWorldPos.z * 3.0));
    vec3 col = mix(vec3(0.05, 0.12, 0.25), vec3(0.2, 0.7, 1.0), grid);
    col *= 1.0 - clamp(well * 0.15, 0.0, 0.85);
    float alpha = 0.35 + grid * 0.25;
    gl_FragColor = vec4(col, alpha);
  }
`;

export function createSpacetimeGrid(massSolar = 1) {
  const group = new THREE.Group();
  group.name = 'spacetime-grid';

  const geo = new THREE.PlaneGeometry(24, 24, 64, 64);
  geo.rotateX(-Math.PI / 2);

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uMass: { value: massSolar },
      uCenter: { value: new THREE.Vector3(0, 0, 0) },
    },
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = -2;
  group.add(mesh);

  const ringGeo = new THREE.RingGeometry(0.5, 0.55, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xff6644, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
  const rs = 2.95 * massSolar * 0.02;
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.scale.setScalar(rs);
  ring.position.y = 0.02;
  group.add(ring);

  return {
    group,
    setMass(m) {
      mat.uniforms.uMass.value = m;
      ring.scale.setScalar(2.95 * m * 0.02);
    },
    setVisible(v) {
      group.visible = v;
    },
    dispose() {
      geo.dispose();
      mat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
    },
  };
}
