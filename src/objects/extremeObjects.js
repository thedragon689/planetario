import * as THREE from 'three';
import {
  accretionDiskVertex,
  accretionDiskFragment,
  eventHorizonVertex,
  eventHorizonFragment,
  relativisticJetVertex,
  relativisticJetFragment,
  lensRingVertex,
  lensRingFragment,
  pulsarBeamVertex,
  pulsarBeamFragment,
} from '../shaders/blackHole.js';
import { formatExtremeObjectForPanel } from '../data/extremeObjectCatalog.js';
import { FEATURES } from '../config.js';
import { createBlackholeLens } from './blackholeLens.js';
import { attachHitSphere, disableRaycast } from '../systems/clickTargets.js';

function createAccretionDisk(visual, scale) {
  const inner = (visual.diskInner ?? 0.35) * scale;
  const outer = (visual.diskOuter ?? 1.0) * scale;
  const geometry = new THREE.RingGeometry(inner, outer, 128, 1);
  const material = new THREE.ShaderMaterial({
    vertexShader: accretionDiskVertex,
    fragmentShader: accretionDiskFragment,
    uniforms: {
      uTime: { value: 0 },
      uInnerRadius: { value: 0.35 },
      uOuterRadius: { value: 1.0 },
      uSpin: { value: 1.8 },
      uHotColor: { value: new THREE.Color(0xd4e8ff) },
      uCoolColor: { value: new THREE.Color(0xff6622) },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const disk = new THREE.Mesh(geometry, material);
  disk.rotation.x = Math.PI / 2 + (visual.diskTilt ?? 0.5);
  return { disk, material };
}

function createEventHorizon(scale) {
  const geometry = new THREE.SphereGeometry(scale * 0.28, 48, 48);
  const material = new THREE.ShaderMaterial({
    vertexShader: eventHorizonVertex,
    fragmentShader: eventHorizonFragment,
    uniforms: {
      uTime: { value: 0 },
      uPhotonRing: { value: 1.0 },
      uRingColor: { value: new THREE.Color(0xffaa66) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(scale * 0.24, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
  );
  const halo = new THREE.Mesh(geometry, material);
  return { core, halo, material };
}

function createLensRing(scale) {
  const geometry = new THREE.RingGeometry(scale * 0.55, scale * 0.72, 96);
  const material = new THREE.ShaderMaterial({
    vertexShader: lensRingVertex,
    fragmentShader: lensRingFragment,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x88ccff) },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const ring = new THREE.Mesh(geometry, material);
  ring.rotation.x = Math.PI / 2;
  ring.raycast = () => {};
  return { ring, material };
}

function createJet(length, scale, color = 0x56ccf2) {
  const geometry = new THREE.ConeGeometry(scale * 0.12, length, 16, 1, true);
  geometry.translate(0, length / 2, 0);
  const material = new THREE.ShaderMaterial({
    vertexShader: relativisticJetVertex,
    fragmentShader: relativisticJetFragment,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uIntensity: { value: 1.2 },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const jetUp = new THREE.Mesh(geometry, material);
  const jetDown = jetUp.clone();
  jetDown.rotation.x = Math.PI;
  jetUp.raycast = () => {};
  jetDown.raycast = () => {};
  return { jets: [jetUp, jetDown], material };
}

function createBlackHole(obj) {
  const scale = obj.marker?.scale ?? 8;
  const visual = obj.visual || {};
  const group = new THREE.Group();
  group.position.set(...(obj.marker?.position || [0, 0, 0]));

  const { core, halo, material: horizonMat } = createEventHorizon(scale);
  const { disk, material: diskMat } = createAccretionDisk(visual, scale);
  group.add(core, halo, disk);

  const updatables = [{ material: horizonMat }, { material: diskMat }];
  let lensVolume = null;

  if (FEATURES.blackholeLensing && (visual.lensing || obj.category === 'black_hole_supermassive')) {
    lensVolume = createBlackholeLens(obj.marker?.position || [0, 0, 0], scale * 0.32);
    group.add(lensVolume.mesh);
  }

  if (visual.lensing) {
    const { ring, material: lensMat } = createLensRing(scale);
    group.add(ring);
    updatables.push({ material: lensMat });
  }

  if (visual.jet) {
    const { jets, material: jetMat } = createJet(visual.jetLength ?? 80, scale);
    jets.forEach((j) => group.add(j));
    updatables.push({ material: jetMat });
  }

  const hitSphere = new THREE.Mesh(
    new THREE.SphereGeometry(scale * 1.1, 16, 16),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  const panelData = formatExtremeObjectForPanel(obj);
  hitSphere.userData = {
    type: 'black_hole',
    id: obj.id,
    selectable: true,
    data: panelData,
  };
  group.add(hitSphere);

  return {
    group,
    mesh: hitSphere,
    data: panelData,
    update(time, delta, camera) {
      updatables.forEach(({ material }) => {
        material.uniforms.uTime.value = time;
      });
      disk.rotation.z = time * 0.35;
      lensVolume?.update(time, delta, camera);
    },
  };
}

function createPulsarLike(obj, { isMagnetar = false } = {}) {
  const scale = obj.marker?.scale ?? 4;
  const visual = obj.visual || {};
  const group = new THREE.Group();
  group.position.set(...(obj.marker?.position || [0, 0, 0]));

  const star = new THREE.Mesh(
    new THREE.SphereGeometry(scale * 0.18, 24, 24),
    new THREE.MeshBasicMaterial({
      color: isMagnetar ? 0xff4466 : 0xccf0ff,
    })
  );
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(scale * 0.35, 16, 16),
    new THREE.MeshBasicMaterial({
      color: isMagnetar ? 0xff2244 : 0x56ccf2,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  );
  glow.raycast = () => {};
  group.add(glow, star);

  const beamLen = visual.beamLength ?? 30;
  const beamGeo = new THREE.ConeGeometry(scale * 0.06, beamLen, 8, 1, true);
  beamGeo.translate(0, beamLen / 2, 0);

  const beamMat = new THREE.ShaderMaterial({
    vertexShader: pulsarBeamVertex,
    fragmentShader: pulsarBeamFragment,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(isMagnetar ? 0xff6688 : 0x88ddff) },
      uPhase: { value: 0 },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const beamA = new THREE.Mesh(beamGeo, beamMat);
  const beamB = beamA.clone();
  beamB.rotation.x = Math.PI;
  beamA.raycast = () => {};
  beamB.raycast = () => {};
  group.add(beamA, beamB);

  if (isMagnetar && visual.fieldLines) {
    for (let i = 0; i < 4; i++) {
      const arc = new THREE.Mesh(
        new THREE.TorusGeometry(scale * 0.5, scale * 0.02, 8, 48, Math.PI),
        new THREE.MeshBasicMaterial({
          color: 0xff88aa,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      arc.rotation.y = (i / 4) * Math.PI;
      arc.rotation.x = Math.PI / 2;
      arc.raycast = () => {};
      group.add(arc);
    }
  }

  const panelData = formatExtremeObjectForPanel(obj);
  group.userData = {
    type: isMagnetar ? 'magnetar' : 'pulsar',
    id: obj.id,
    selectable: true,
    data: panelData,
  };
  disableRaycast(star);
  attachHitSphere(group, Math.max(scale * 0.85, 6));

  const spinRate = visual.spinRate ?? 10;

  return {
    group,
    mesh: group,
    data: panelData,
    update(time) {
      beamMat.uniforms.uTime.value = time;
      star.rotation.y = time * spinRate * 0.1;
      beamA.rotation.z = time * spinRate * 0.15;
      beamB.rotation.z = time * spinRate * 0.15 + Math.PI;
    },
  };
}

export function createExtremeObjects(group, extremeData) {
  const markers = [];
  const objects = extremeData?.objects || [];

  objects.forEach((obj) => {
    let entry;
    switch (obj.category) {
      case 'black_hole_supermassive':
      case 'black_hole_stellar':
        entry = createBlackHole(obj);
        break;
      case 'pulsar':
        entry = createPulsarLike(obj);
        break;
      case 'magnetar':
        entry = createPulsarLike(obj, { isMagnetar: true });
        break;
      default:
        return;
    }
    group.add(entry.group);
    markers.push(entry);
  });

  return {
    markers,
    getMeshes() {
      return markers.map((m) => m.mesh);
    },
    update(time) {
      markers.forEach((m) => m.update(time));
    },
  };
}
