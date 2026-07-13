import * as THREE from 'three';

export interface LodLevel {
  distance: number;
  visible: boolean;
  scale?: number;
  opacity?: number;
}

export interface LodObject {
  object: THREE.Object3D;
  levels: LodLevel[];
  currentLevel: number;
}

/**
 * Sistema LOD base: mostra/nasconde o scala oggetti in base alla distanza dalla camera.
 */
export function createLodManager(camera: THREE.Camera) {
  const entries: LodObject[] = [];
  const _pos = new THREE.Vector3();
  const _camPos = new THREE.Vector3();

  function register(object: THREE.Object3D, levels: LodLevel[]) {
    const sorted = [...levels].sort((a, b) => a.distance - b.distance);
    const entry: LodObject = { object, levels: sorted, currentLevel: -1 };
    entries.push(entry);
    applyLevel(entry, 0);
    return () => {
      const idx = entries.indexOf(entry);
      if (idx >= 0) entries.splice(idx, 1);
    };
  }

  function applyLevel(entry: LodObject, levelIdx: number) {
    if (entry.currentLevel === levelIdx) return;
    entry.currentLevel = levelIdx;
    const level = entry.levels[levelIdx] ?? entry.levels[entry.levels.length - 1];
    entry.object.visible = level.visible;
    if (level.scale !== undefined) entry.object.scale.setScalar(level.scale);
    if (level.opacity !== undefined) {
      entry.object.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.material) {
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          mats.forEach((m) => {
            if ('opacity' in m) {
              m.opacity = level.opacity!;
              m.transparent = level.opacity! < 1;
            }
          });
        }
      });
    }
  }

  function update() {
    camera.getWorldPosition(_camPos);
    for (const entry of entries) {
      entry.object.getWorldPosition(_pos);
      const dist = _pos.distanceTo(_camPos);
      let levelIdx = 0;
      for (let i = entry.levels.length - 1; i >= 0; i--) {
        if (dist >= entry.levels[i].distance) {
          levelIdx = i;
          break;
        }
      }
      applyLevel(entry, levelIdx);
    }
  }

  return { register, update, dispose: () => entries.splice(0, entries.length) };
}

/** Preset LOD per marker galattici/stellari. */
export const MARKER_LOD_LEVELS: LodLevel[] = [
  { distance: 0, visible: true, scale: 1 },
  { distance: 400, visible: true, scale: 0.65 },
  { distance: 900, visible: true, scale: 0.35 },
  { distance: 1600, visible: false },
];
