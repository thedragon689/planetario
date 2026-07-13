import * as THREE from 'three';

export function createCosmicRuler(
  scene: THREE.Scene,
  camera: THREE.Camera,
  domElement: HTMLElement
) {
  const group = new THREE.Group();
  group.name = 'cosmic-ruler';
  scene.add(group);

  let active = false;
  let pointA: THREE.Vector3 | null = null;
  let pointB: THREE.Vector3 | null = null;
  const markerGeo = new THREE.SphereGeometry(0.8, 12, 12);
  const markerMat = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
  const lineMat = new THREE.LineBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.8 });

  let markerA: THREE.Mesh | null = null;
  let markerB: THREE.Mesh | null = null;
  let line: THREE.Line | null = null;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function clear() {
    if (markerA) group.remove(markerA);
    if (markerB) group.remove(markerB);
    if (line) group.remove(line);
    markerA = markerB = line = null;
    pointA = pointB = null;
  }

  function onClick(event: MouseEvent) {
    if (!active) return;
    const rect = domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(scene.children, true);
    if (!hits.length) return;
    const pt = hits[0].point.clone();

    if (!pointA) {
      clear();
      pointA = pt;
      markerA = new THREE.Mesh(markerGeo, markerMat);
      markerA.position.copy(pt);
      group.add(markerA);
    } else if (!pointB) {
      pointB = pt;
      markerB = new THREE.Mesh(markerGeo, markerMat);
      markerB.position.copy(pt);
      group.add(markerB);
      const geometry = new THREE.BufferGeometry().setFromPoints([pointA, pointB]);
      line = new THREE.Line(geometry, lineMat);
      group.add(line);
    } else {
      clear();
      pointA = pt;
      markerA = new THREE.Mesh(markerGeo, markerMat);
      markerA.position.copy(pt);
      group.add(markerA);
    }
  }

  domElement.addEventListener('click', onClick);

  return {
    setActive(on: boolean) {
      active = on;
      if (!on) clear();
      group.visible = on;
    },
    isActive: () => active,
    getMeasurement() {
      if (!pointA || !pointB) return null;
      const dist = pointA.distanceTo(pointB);
      const dir = pointB.clone().sub(pointA).normalize();
      const angleRad = Math.acos(THREE.MathUtils.clamp(camera.getWorldDirection(new THREE.Vector3()).dot(dir), -1, 1));
      return {
        distance: dist,
        angleDeg: (angleRad * 180) / Math.PI,
      };
    },
    dispose() {
      domElement.removeEventListener('click', onClick);
      clear();
      scene.remove(group);
    },
  };
}
