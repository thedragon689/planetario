const GOLDEN = Math.PI * (3 - Math.sqrt(5));

const CONFIG = {
  fieldSpread: 1.52,
  clusterSpread: 1.3,
  scaleFactor: 0.82,
  clusterRadius: {
    virgo: 520,
    fornax: 270,
  },
  minGap: 72,
};


function spreadFromOrigin(position, factor) {
  return position.map((v) => v * factor);
}

function resolveClusterCenter(clusterId, catalog) {
  const def = catalog?.clusters?.[clusterId];
  if (!def?.center) return [0, 0, 0];
  return spreadFromOrigin(def.center, CONFIG.clusterSpread);
}

function layoutClusterMembers(members, center, radius) {
  const sorted = [...members].sort(
    (a, b) => (b.marker?.scale || 10) - (a.marker?.scale || 10)
  );
  const positions = new Map();

  sorted.forEach((galaxy, index) => {
    const scale = galaxy.marker?.scale || 10;

    if (index === 0) {
      positions.set(galaxy.id, [center[0], center[1] + scale * 0.18, center[2]]);
      return;
    }

    const t = (index + 0.6) / sorted.length;
    const ring = radius * Math.sqrt(t);
    const angle = index * GOLDEN;
    const lane = ((index % 3) - 1) * scale * 0.32;

    positions.set(galaxy.id, [
      center[0] + Math.cos(angle) * ring,
      center[1] + lane,
      center[2] + Math.sin(angle) * ring,
    ]);
  });

  return positions;
}

function relaxFieldPositions(items, iterations = 10) {
  const positions = items.map((item) => ({
    id: item.id,
    scale: item.marker?.scale || 10,
    pos: spreadFromOrigin(item.marker.position, CONFIG.fieldSpread),
  }));

  for (let pass = 0; pass < iterations; pass += 1) {
    for (let i = 0; i < positions.length; i += 1) {
      for (let j = i + 1; j < positions.length; j += 1) {
        const a = positions[i];
        const b = positions[j];
        const minDist = Math.max(CONFIG.minGap, (a.scale + b.scale) * 3.2);
        const dx = b.pos[0] - a.pos[0];
        const dy = b.pos[1] - a.pos[1];
        const dz = b.pos[2] - a.pos[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.001;

        if (dist >= minDist) continue;

        const push = (minDist - dist) * 0.55;
        const nx = dx / dist;
        const ny = dy / dist;
        const nz = dz / dist;

        a.pos[0] -= nx * push * 0.5;
        a.pos[1] -= ny * push * 0.35;
        a.pos[2] -= nz * push * 0.5;
        b.pos[0] += nx * push * 0.5;
        b.pos[1] += ny * push * 0.35;
        b.pos[2] += nz * push * 0.5;
      }
    }
  }

  return new Map(positions.map((entry) => [entry.id, entry.pos]));
}

let cachedLayout = null;
let cachedVersion = null;

export function buildObservableLayout(galaxyData) {
  const version = galaxyData?.catalog?.version || '0';
  if (cachedLayout && cachedVersion === version) return cachedLayout;

  const entries = (galaxyData?.galaxies || []).filter((g) =>
    g.marker?.scenes?.includes('observable')
  );

  const byCluster = new Map();
  const field = [];

  entries.forEach((galaxy) => {
    const clusterId = galaxy.marker?.cluster;
    if (clusterId) {
      if (!byCluster.has(clusterId)) byCluster.set(clusterId, []);
      byCluster.get(clusterId).push(galaxy);
    } else {
      field.push(galaxy);
    }
  });

  const positions = new Map();
  const clusterCenters = new Map();

  byCluster.forEach((members, clusterId) => {
    const center = resolveClusterCenter(clusterId, galaxyData?.catalog);
    clusterCenters.set(clusterId, center);
    const clusterPositions = layoutClusterMembers(
      members,
      center,
      CONFIG.clusterRadius[clusterId] || 360
    );
    clusterPositions.forEach((pos, id) => positions.set(id, pos));
  });

  const fieldPositions = relaxFieldPositions(field);
  fieldPositions.forEach((pos, id) => positions.set(id, pos));

  cachedLayout = {
    positions,
    clusterCenters,
    scaleFactor: CONFIG.scaleFactor,
    clusterRadius: CONFIG.clusterRadius,
  };
  cachedVersion = version;
  return cachedLayout;
}

export function getObservablePosition(galaxy, galaxyData) {
  const layout = buildObservableLayout(galaxyData);
  return layout.positions.get(galaxy.id) || galaxy.marker.position;
}

export function getObservableScale(markerScale, galaxyData) {
  const layout = buildObservableLayout(galaxyData);
  return markerScale * layout.scaleFactor;
}
