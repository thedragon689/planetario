import * as THREE from 'three';

const MARKERS = [
  { id: 'N', position: new THREE.Vector3(0, 2.2, 0), color: 0x00ff66 },
  { id: 'S', position: new THREE.Vector3(0, -2.2, 0), color: 0xff4466 },
  { id: 'GC', position: new THREE.Vector3(2.2, 0, 0), color: 0xffd700 },
  { id: 'AC', position: new THREE.Vector3(-2.2, 0, 0), color: 0x88aaff },
];

/** Bussola 3D ancorata alla camera (HUD spaziale) */
export function createCompass3D(camera: THREE.Camera, lighting?: { sun?: THREE.Object3D }) {
  const anchor = new THREE.Group();
  anchor.name = 'Compass3DAnchor';
  camera.add(anchor);

  const orient = new THREE.Group();
  orient.name = 'Compass3DOrient';
  anchor.add(orient);

  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 24, 16),
    new THREE.MeshBasicMaterial({
      color: 0x4fc3f7,
      wireframe: true,
      transparent: true,
      opacity: 0.14,
    })
  );
  orient.add(sphere);

  const equator = new THREE.Mesh(
    new THREE.TorusGeometry(2.2, 0.02, 8, 64),
    new THREE.MeshBasicMaterial({ color: 0x56ccf2, transparent: true, opacity: 0.35 })
  );
  equator.rotation.x = Math.PI / 2;
  orient.add(equator);

  const markers = new THREE.Group();
  MARKERS.forEach(({ position, color }) => {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 8, 8),
      new THREE.MeshBasicMaterial({ color })
    );
    dot.position.copy(position);
    markers.add(dot);
  });
  orient.add(markers);

  const sunNeedle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 1.6, 6),
    new THREE.MeshBasicMaterial({ color: 0xffcc44 })
  );
  sunNeedle.position.set(0, 0.8, 0);
  orient.add(sunNeedle);

  anchor.position.set(3.8, -2.4, -7.5);
  anchor.scale.setScalar(0.55);

  const _sunDir = new THREE.Vector3();

  return {
    anchor,
    orient,
    setVisible(visible: boolean) {
      anchor.visible = visible;
    },
    update(cameraObj: THREE.Camera) {
      orient.quaternion.copy(cameraObj.quaternion).invert();
      if (lighting?.sun) {
        _sunDir.copy(lighting.sun.position).normalize();
        sunNeedle.lookAt(_sunDir);
        sunNeedle.rotateX(Math.PI / 2);
      }
    },
  };
}
