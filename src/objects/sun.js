import * as THREE from 'three';
import {
  createSunMaterial,
  createCoronaMesh,
} from './planetBody.js';

/** Sole volumetrico stile Interstellar con corona e alone. */
export async function createSun(group, sunData) {
  const sunConfig = sunData || {};
  const params = sunConfig.shaderParams || {};
  const radius = sunConfig.radius ?? 8;

  const material = createSunMaterial(params);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(radius, 64, 64), material);
  sun.name = 'Sole';
  sun.renderOrder = 5;
  sun.userData = {
    type: 'star',
    id: 'sun',
    selectable: true,
    data: sunConfig,
  };

  const coronaScale = params.coronaScale ?? 2.5;
  const haloScale = params.haloScale ?? 3.2;
  const corona = createCoronaMesh(radius * coronaScale, params.coronaColor || '#ff6600', 0.14);
  const halo = createCoronaMesh(radius * haloScale, params.midColor || '#ffaa44', 0.06);

  const sunGroup = new THREE.Group();
  sunGroup.add(sun, corona, halo);
  group.add(sunGroup);

  const light = new THREE.PointLight(
    sunConfig.coreColor || 0xfff5e0,
    sunConfig.intensity ?? 6,
    sunConfig.lightDistance ?? 1200
  );
  sunGroup.add(light);

  return {
    sun,
    group: sunGroup,
    light,
    material,
    corona,
    halo,
    update(time) {
      material.uniforms.uTime.value = time;
      const pulse = 1 + Math.sin(time * 0.6) * 0.025;
      corona.scale.setScalar(pulse);
      halo.scale.setScalar(pulse * 1.08);
    },
  };
}
