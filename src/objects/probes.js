import * as THREE from 'three';

function interpolateWaypoints(waypoints, t) {
  if (!waypoints?.length) return new THREE.Vector3();
  if (waypoints.length === 1) return new THREE.Vector3(...waypoints[0].pos);

  const segments = waypoints.length - 1;
  const scaled = t * segments;
  const idx = Math.min(Math.floor(scaled), segments - 1);
  const localT = scaled - idx;
  const a = new THREE.Vector3(...waypoints[idx].pos);
  const b = new THREE.Vector3(...waypoints[idx + 1].pos);
  return a.lerp(b, localT);
}

function createProbeMesh(color = 0xffcc66) {
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.8),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.3, metalness: 0.6, roughness: 0.4 })
  );
  const dish = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.2, 0.08, 12),
    new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8, roughness: 0.2 })
  );
  dish.rotation.x = Math.PI / 2;
  dish.position.z = 0.5;
  const group = new THREE.Group();
  group.add(body, dish);
  return group;
}

function createTrail(waypoints, color) {
  const points = waypoints.map((w) => new THREE.Vector3(...w.pos));
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const colors = [];
  const count = points.length;
  points.forEach((_, i) => {
    const t = i / Math.max(1, count - 1);
    colors.push(0.33 + t * 0.55, 0.8, 1.0);
  });
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.45,
  });
  return new THREE.Line(geometry, material);
}

export function createProbes(group, probeData, { getSimulationYear } = {}) {
  const root = new THREE.Group();
  root.name = 'SpaceProbes';
  const probes = [];

  (probeData.probes || []).forEach((def) => {
    const probeGroup = new THREE.Group();
    const mesh = createProbeMesh(def.id === 'parker-solar' ? 0xff6644 : 0x56ccf2);
    probeGroup.add(mesh);

    if (def.waypoints?.length > 1) {
      probeGroup.add(createTrail(def.waypoints, 0x56ccf2));
    }

    probeGroup.userData = {
      type: 'probe',
      id: def.id,
      selectable: true,
      data: def,
    };

    root.add(probeGroup);
    probes.push({ mesh: probeGroup, def, progress: 1 });
  });

  group.add(root);

  function yearToProgress(def) {
    const year = getSimulationYear?.() ?? new Date().getFullYear();
    const wps = def.waypoints;
    if (!wps?.length) return 1;
    const start = wps[0].year;
    const end = wps[wps.length - 1].year;
    if (year <= start) return 0;
    if (year >= end) return 1;
    return (year - start) / (end - start);
  }

  return {
    group: root,
    probes,
    getMeshes: () => probes.map((p) => p.mesh),
    setVisible(visible) {
      root.visible = visible;
    },
    update(_time, _delta) {
      probes.forEach((p) => {
        const t = yearToProgress(p.def);
        const pos = interpolateWaypoints(p.def.waypoints, t);
        p.mesh.position.copy(pos);
        p.mesh.lookAt(interpolateWaypoints(p.def.waypoints, Math.min(1, t + 0.02)));
      });
    },
  };
}
