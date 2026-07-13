import * as THREE from 'three';
import { createMiniGalaxy, inferGalaxyMorphology, applyGalaxyOrientation } from './galaxyBody.js';
import { buildObservableLayout, getObservablePosition, getObservableScale } from '../systems/observableLayout.js';

function parseColor(hex) {
  return new THREE.Color(hex || '#56ccf2');
}

const CLUSTER_HALOS = {
  virgo: { color: '#3a2868', radius: 560, opacity: 0.022, stretch: [1.15, 0.5, 0.95] },
  fornax: { color: '#283858', radius: 300, opacity: 0.024, stretch: [1.1, 0.48, 0.92] },
  local_group: { color: '#2a3a68', radius: 840, opacity: 0.022, stretch: [1, 0.35, 1] },
};

function averagePosition(positions) {
  const sum = positions.reduce(
    (acc, [x, y, z]) => [acc[0] + x, acc[1] + y, acc[2] + z],
    [0, 0, 0]
  );
  return sum.map((v) => v / positions.length);
}

function addClusterHalos(group, clusterMap, layoutCenters = null) {
  const haloEntries = [];

  clusterMap.forEach(({ positions, clusterId }) => {
    if (positions.length < 2) return;
    const cfg = CLUSTER_HALOS[clusterId];
    if (!cfg) return;

    const centroid = layoutCenters?.get(clusterId) || averagePosition(positions);
    haloEntries.push({ centroid, cfg, clusterId });
  });

  if (!haloEntries.length) return;

  const geometry = new THREE.SphereGeometry(1, 20, 16);
  const material = new THREE.MeshBasicMaterial({
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    vertexColors: true,
  });
  const mesh = new THREE.InstancedMesh(geometry, material, haloEntries.length);
  const colors = new Float32Array(haloEntries.length * 3);
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();

  haloEntries.forEach(({ centroid, cfg, clusterId }, i) => {
    position.set(centroid[0], centroid[1], centroid[2]);
    const stretch = cfg.stretch || [1, 1, 1];
    scale.set(cfg.radius * stretch[0], cfg.radius * stretch[1], cfg.radius * stretch[2]);
    matrix.compose(position, quaternion.identity(), scale);
    mesh.setMatrixAt(i, matrix);

    const color = parseColor(cfg.color);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    mesh.userData.clusterIds = mesh.userData.clusterIds || [];
    mesh.userData.clusterIds[i] = clusterId;
  });

  mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
  material.opacity = haloEntries[0].cfg.opacity;
  mesh.name = 'cluster_halos_instanced';
  mesh.raycast = () => {};
  group.add(mesh);
}

function resolveCentroid(clusterId, def, positions, layoutCenters) {
  if (layoutCenters?.get(clusterId)) return layoutCenters.get(clusterId);
  if (Array.isArray(def?.center) && def.center.length >= 3) return def.center;
  if (positions?.length) return averagePosition(positions);
  return null;
}

function addClusterAnchors(group, clusterMap, catalogClusters, sceneKey, layoutCenters = null) {
  const anchors = [];
  const addedClusterIds = new Set();

  clusterMap.forEach(({ positions, clusterId }) => {
    const def = catalogClusters?.[clusterId];
    if (!def) return;

    const centroid = resolveCentroid(clusterId, def, positions, layoutCenters);
    if (!centroid) return;

    const anchor = new THREE.Object3D();
    anchor.position.set(
      centroid[0],
      centroid[1] + (def.labelOffset ?? 150),
      centroid[2]
    );
    anchor.name = def.label;
    anchor.userData = {
      type: 'cluster',
      id: `cluster_${clusterId}`,
      clusterId,
      sceneKey,
    };
    group.add(anchor);
    anchors.push({ anchor, label: def.label, clusterId });
    addedClusterIds.add(clusterId);
  });

  if (sceneKey === 'local_group' && catalogClusters?.local_group && !addedClusterIds.has('local_group')) {
    const def = catalogClusters.local_group;
    const centroid = resolveCentroid('local_group', def, [], layoutCenters);
    if (!centroid) return anchors;

    const anchor = new THREE.Object3D();
    anchor.position.set(
      centroid[0],
      centroid[1] + (def.labelOffset ?? 120),
      centroid[2]
    );
    anchor.name = def.label;
    anchor.userData = {
      type: 'cluster',
      id: 'cluster_local_group',
      clusterId: 'local_group',
      sceneKey,
    };
    group.add(anchor);
    anchors.push({ anchor, label: def.label, clusterId: 'local_group' });
  }

  return anchors;
}

/** Crea marker 3D cliccabili per le galassie documentate in galaxies.json. */
export function createGalaxyMarkers(group, galaxyData, sceneKey, { qualityLevel = 'medium' } = {}) {
  const markers = [];
  const entries = (galaxyData?.galaxies || []).filter((g) =>
    g.marker?.scenes?.includes(sceneKey)
  );
  const observableLayout = sceneKey === 'observable' ? buildObservableLayout(galaxyData) : null;

  const clusterMap = new Map();

  entries.forEach((data) => {
    const position = sceneKey === 'observable'
      ? getObservablePosition(data, galaxyData)
      : data.marker.position;
    const markerData = sceneKey === 'observable'
      ? {
          ...data,
          marker: {
            ...data.marker,
            scale: getObservableScale(data.marker.scale, galaxyData),
          },
        }
      : data;

    const morphology = inferGalaxyMorphology(data.type);
    const { group: bodyGroup, update: bodyUpdate } = createMiniGalaxy(markerData, { qualityLevel });

    bodyGroup.position.set(...position);
    applyGalaxyOrientation(bodyGroup, data.id, morphology);
    bodyGroup.name = data.name;
    bodyGroup.userData = {
      type: 'galaxy',
      id: data.id,
      selectable: true,
      data: {
        ...data,
        category: data.type,
      },
    };

    group.add(bodyGroup);
    markers.push({ mesh: bodyGroup, update: bodyUpdate, data });

    const clusterId = data.marker?.cluster;
    if (clusterId) {
      if (!clusterMap.has(clusterId)) clusterMap.set(clusterId, { clusterId, positions: [] });
      clusterMap.get(clusterId).positions.push(position);
    }
  });

  addClusterHalos(group, clusterMap, observableLayout?.clusterCenters);
  const clusterAnchors = addClusterAnchors(
    group,
    clusterMap,
    galaxyData?.catalog?.clusters,
    sceneKey,
    observableLayout?.clusterCenters
  );

  return {
    markers,
    clusterAnchors,
    sceneKey,
    getMeshes() {
      return markers.map((m) => m.mesh);
    },
    update(time) {
      markers.forEach(({ update }) => {
        update?.(time);
      });
    },
  };
}
