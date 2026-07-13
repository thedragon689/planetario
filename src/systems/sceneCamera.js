import * as THREE from 'three';
import { buildObservableLayout, getObservablePosition } from './observableLayout.js';

const _box = new THREE.Box3();
const _center = new THREE.Vector3();
const _size = new THREE.Vector3();

/**
 * Calcola posizione camera per inquadrare un insieme di punti 3D.
 * @param {THREE.Vector3[]} points
 * @param {{ fov?: number, padding?: number, minDistance?: number }} [opts]
 */
export function computeFraming(points, opts = {}) {
  if (!points.length) return null;

  _box.makeEmpty();
  points.forEach((p) => _box.expandByPoint(p));
  _box.getCenter(_center);
  _box.getSize(_size);

  const maxDim = Math.max(_size.x, _size.y, _size.z, 1);
  const fov = opts.fov ?? 68;
  const padding = opts.padding ?? 1.35;
  const fovRad = THREE.MathUtils.degToRad(fov);
  const distance = Math.max(
    (maxDim * padding) / (2 * Math.tan(fovRad / 2)),
    opts.minDistance ?? 400
  );

  return {
    target: _center.clone(),
    position: new THREE.Vector3(
      _center.x + maxDim * 0.06,
      _center.y + distance * 0.32,
      _center.z + distance * 0.92
    ),
    fov,
    radius: maxDim * 0.5,
  };
}

export function collectDataPositions(galaxyData, starData, sceneKey, exoplanetData, extremeData) {
  const points = [];
  const observableLayout = sceneKey === 'observable' ? buildObservableLayout(galaxyData) : null;

  (galaxyData?.galaxies || []).forEach((g) => {
    if (g.marker?.scenes?.includes(sceneKey)) {
      const position = observableLayout
        ? getObservablePosition(g, galaxyData)
        : g.marker.position;
      points.push(new THREE.Vector3(...position));
    }
  });

  if (sceneKey === 'milky_way' || sceneKey === 'local_group' || sceneKey === 'exoplanets') {
    (starData?.stars || []).forEach((s) => {
      if (s.marker?.scenes?.includes(sceneKey === 'exoplanets' ? 'milky_way' : sceneKey)) {
        points.push(new THREE.Vector3(...s.marker.position));
      }
    });
  }

  if (sceneKey === 'exoplanets' && exoplanetData?.systems) {
    exoplanetData.systems.forEach((system) => {
      if (system.marker?.position) {
        points.push(new THREE.Vector3(...system.marker.position));
      }
    });
  }

  if (sceneKey === 'extreme_objects' && extremeData?.objects) {
    extremeData.objects.forEach((obj) => {
      if (obj.marker?.position) {
        points.push(new THREE.Vector3(...obj.marker.position));
      }
    });
  }

  if (['milky_way', 'local_group', 'observable', 'exoplanets', 'extreme_objects'].includes(sceneKey)) {
    points.push(new THREE.Vector3(0, 0, 0));
  }

  const clusters = galaxyData?.catalog?.clusters || {};
  Object.entries(clusters).forEach(([id, def]) => {
    const sceneForCluster =
      id === 'local_group' ? 'local_group' : id === 'virgo' || id === 'fornax' ? 'observable' : null;
    if (sceneForCluster === sceneKey && def.center) {
      const center = observableLayout?.clusterCenters?.get(id) || def.center;
      points.push(new THREE.Vector3(...center));
    }
  });

  return points;
}

export function applyFraming(camera, controls, framing) {
  if (!framing) return;
  camera.position.copy(framing.position);
  camera.fov = framing.fov;
  camera.updateProjectionMatrix();
  controls.target.copy(framing.target);
  controls.update();
}
