import * as THREE from 'three';
import { wormholeVertex, wormholeFragment } from '../shaders/wormhole.js';
import { WORMHOLE_DATA } from '../data/phenomena.js';

export function createWormhole(group, wormholeData = WORMHOLE_DATA) {
  const geometry = new THREE.CylinderGeometry(3, 3, 0.1, 128, 1, true);
  geometry.scale(1, 0.01, 1);

  const material = new THREE.ShaderMaterial({
    vertexShader: wormholeVertex,
    fragmentShader: wormholeFragment,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 1.5 },
      uColorInner: { value: new THREE.Color(0x56ccf2) },
      uColorOuter: { value: new THREE.Color(0x5a2d82) },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const tunnel = new THREE.Mesh(geometry, material);
  tunnel.name = 'Wormhole';
  tunnel.userData = {
    type: 'wormhole',
    id: wormholeData.id,
    selectable: true,
    data: wormholeData,
  };

  const ringGeo = new THREE.TorusGeometry(3, 0.08, 16, 128);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x56ccf2,
    transparent: true,
    opacity: 0.6,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;

  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(2.5, 0.04, 16, 128),
    new THREE.MeshBasicMaterial({ color: 0xeaf6ff, transparent: true, opacity: 0.4 })
  );
  innerRing.rotation.x = Math.PI / 2;

  const wormholeGroup = new THREE.Group();
  wormholeGroup.userData = {
    type: 'wormhole',
    id: wormholeData.id,
    selectable: true,
    data: wormholeData,
  };
  wormholeGroup.add(tunnel, ring, innerRing);
  wormholeGroup.visible = false;
  group.add(wormholeGroup);

  const tunnelPlanes = [];
  for (let i = 0; i < 20; i++) {
    const planeGeo = new THREE.RingGeometry(0.5, 3, 64);
    const planeMat = material.clone();
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.position.z = -i * 2;
    plane.userData.depth = i;
    wormholeGroup.add(plane);
    tunnelPlanes.push(plane);
  }

  return {
    group: wormholeGroup,
    material,
    update(time, _delta, _camera) {
      material.uniforms.uTime.value = time;
      const intensity = 1.5;
      material.uniforms.uIntensity.value = intensity;
      ring.rotation.z = time * 0.5;
      innerRing.rotation.z = -time * 0.8;
      tunnelPlanes.forEach((plane) => {
        plane.material.uniforms.uTime.value = time + plane.userData.depth * 0.2;
        plane.material.uniforms.uIntensity.value = intensity;
        plane.rotation.z = time * (0.3 + plane.userData.depth * 0.05);
      });
    },
    setVisible(visible) {
      wormholeGroup.visible = visible;
    },
  };
}
