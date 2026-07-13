import * as THREE from 'three';

export function createDarkMatterHalo(radius = 120, color = 0x8844ff) {
  const geo = new THREE.IcosahedronGeometry(radius, 2);
  const edges = new THREE.EdgesGeometry(geo);
  const mat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.12,
    depthWrite: false,
  });
  const lines = new THREE.LineSegments(edges, mat);
  lines.name = 'dark-matter-halo';

  const inner = new THREE.IcosahedronGeometry(radius * 0.72, 1);
  const innerEdges = new THREE.EdgesGeometry(inner);
  const innerLines = new THREE.LineSegments(innerEdges, mat.clone());
  innerLines.material.opacity = 0.08;

  const group = new THREE.Group();
  group.add(lines, innerLines);
  group.visible = false;

  return {
    group,
    setVisible(v) { group.visible = v; },
    update(time) {
      group.rotation.y = time * 0.00002;
      group.rotation.x = Math.sin(time * 0.00001) * 0.1;
    },
    dispose() {
      geo.dispose();
      edges.dispose();
      mat.dispose();
      inner.dispose();
      innerEdges.dispose();
      innerLines.material.dispose();
    },
  };
}
