import * as THREE from 'three';

/** @param {THREE.Object3D | null | undefined} object */
export function findSelectable(object) {
  let node = object;
  while (node) {
    if (node.userData?.selectable) return node;
    node = node.parent;
  }
  return null;
}

/** Oggetto logico da selezionare (salta hitbox verso parentRef). */
export function resolveSelectableTarget(object) {
  const selectable = findSelectable(object);
  if (!selectable) return null;
  return selectable.userData?.parentRef || selectable;
}

/**
 * @param {THREE.Object3D} parent
 * @param {THREE.Object3D} hit
 */
function copyHitUserData(parent, hit) {
  hit.userData = {
    selectable: true,
    id: parent.userData?.id,
    type: parent.userData?.type,
    data: parent.userData?.data,
    isHitbox: true,
    parentRef: parent.userData?.parentRef || parent,
  };
}

/**
 * Raccoglie mesh intersecabili da una lista di root (galassie, stelle, hitbox, ecc.).
 * @param {THREE.Object3D[]} roots
 * @returns {THREE.Mesh[]}
 */
export function collectRaycastTargets(roots) {
  const targets = [];
  const seen = new Set();

  for (const root of roots) {
    if (!root?.visible) continue;

    root.traverse((obj) => {
      if (!obj.isMesh || !obj.visible) return;
      if (obj.userData?.raycastDisabled) return;
      if (seen.has(obj)) return;

      const selectable = findSelectable(obj);
      if (!selectable) return;

      seen.add(obj);
      targets.push(obj);
    });
  }

  return targets;
}

/**
 * Crea una hitbox sferica invisibile come figlio del parent.
 * @param {THREE.Object3D} parent
 * @param {number} radius
 * @param {string} [name]
 */
export function attachHitSphere(parent, radius, name = 'hit') {
  const worldScale = new THREE.Vector3();
  parent.getWorldScale(worldScale);
  const maxScale = Math.max(worldScale.x, worldScale.y, worldScale.z, 0.001);
  const scaledRadius = radius / maxScale;

  const hit = new THREE.Mesh(
    new THREE.SphereGeometry(scaledRadius, 16, 16),
    new THREE.MeshBasicMaterial({
      visible: false,
      transparent: true,
      opacity: 0,
    })
  );
  hit.name = name;
  copyHitUserData(parent, hit);
  parent.add(hit);
  return hit;
}

/**
 * Hitbox in coordinate mondiali (per parent con scale estreme).
 * @param {THREE.Object3D} parent
 * @param {number} radius
 * @param {THREE.Scene} scene
 * @param {string} [name]
 */
export function attachHitSphereWorld(parent, radius, scene, name = 'hit') {
  const hit = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 16, 16),
    new THREE.MeshBasicMaterial({
      visible: false,
      transparent: true,
      opacity: 0,
    })
  );
  hit.name = name;
  copyHitUserData(parent, hit);

  parent.getWorldPosition(hit.position);
  scene.add(hit);

  hit.userData.updatePosition = () => {
    parent.getWorldPosition(hit.position);
  };

  return hit;
}

/** @param {THREE.Mesh} mesh */
export function disableRaycast(mesh) {
  mesh.userData.raycastDisabled = true;
}

/** @param {THREE.Mesh} mesh */
export function enableRaycast(mesh) {
  delete mesh.userData.raycastDisabled;
}
