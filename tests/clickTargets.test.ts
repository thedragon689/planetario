import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  attachHitSphere,
  collectRaycastTargets,
  disableRaycast,
  findSelectable,
  resolveSelectableTarget,
} from '../src/systems/clickTargets.js';

describe('clickTargets', () => {
  it('findSelectable risale al parent con userData.selectable', () => {
    const group = new THREE.Group();
    group.userData = { selectable: true, id: 'g1' };
    const hit = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial());
    group.add(hit);
    expect(findSelectable(hit)?.userData.id).toBe('g1');
  });

  it('attachHitSphere copia userData e parentRef', () => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(1),
      new THREE.MeshBasicMaterial()
    );
    mesh.userData = { selectable: true, id: 'nebula_1', type: 'nebula', data: { name: 'Orione' } };
    const hit = attachHitSphere(mesh, 90);
    expect(hit.userData.selectable).toBe(true);
    expect(hit.userData.id).toBe('nebula_1');
    expect(hit.userData.parentRef).toBe(mesh);
    expect(resolveSelectableTarget(hit)).toBe(mesh);
  });

  it('collectRaycastTargets rispetta raycastDisabled', () => {
    const root = new THREE.Group();
    root.userData = { selectable: true, id: 'root' };
    const visible = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial());
    const blocked = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshBasicMaterial());
    disableRaycast(blocked);
    root.add(visible, blocked);
    attachHitSphere(root, 2);

    const targets = collectRaycastTargets([root]);
    expect(targets.some((m) => m.name === 'hit')).toBe(true);
    expect(targets).toContain(visible);
    expect(targets).not.toContain(blocked);
  });
});
