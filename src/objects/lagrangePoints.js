import * as THREE from 'three';

/** Punti di Lagrange L1–L5 per sistema Sole–Terra (schematico). */
export function createLagrangePoints(group, earthDistance = 15) {
  const points = [];
  const l1 = earthDistance * 0.99;
  const l2 = earthDistance * 1.01;
  const l3 = -earthDistance;
  const l4Angle = Math.PI / 3;
  const l5Angle = -Math.PI / 3;
  const triR = earthDistance;

  const defs = [
    { id: 'l1', name: 'L1', pos: [l1, 0, 0], color: 0x56ccf2 },
    { id: 'l2', name: 'L2', pos: [l2, 0, 0], color: 0x56ccf2 },
    { id: 'l3', name: 'L3', pos: [l3, 0, 0], color: 0x8899aa },
    { id: 'l4', name: 'L4', pos: [Math.cos(l4Angle) * triR, 0, Math.sin(l4Angle) * triR], color: 0xaaddff },
    { id: 'l5', name: 'L5', pos: [Math.cos(l5Angle) * triR, 0, Math.sin(l5Angle) * triR], color: 0xaaddff },
  ];

  defs.forEach((def) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 12, 12),
      new THREE.MeshBasicMaterial({ color: def.color, transparent: true, opacity: 0.85 })
    );
    mesh.position.set(...def.pos);
    mesh.userData = {
      type: 'lagrange',
      id: def.id,
      selectable: true,
      data: {
        id: def.id,
        name: `Punto di Lagrange ${def.name}`,
        type: 'Punto di Lagrange',
        description: `Equilibrio gravitazionale nel sistema Terra–Sole (posizione schematica ${def.name}).`,
        facts: [
          'I punti L4 e L5 sono zone di accumulo di asteroidi troiani',
          'L1 ospita telescopi solari come SOHO e DSCOVR',
          'L2 è la posizione di JWST',
        ],
      },
    };
    group.add(mesh);
    points.push(mesh);
  });

  return {
    points,
    getMeshes: () => points,
    setVisible(visible) {
      points.forEach((p) => { p.visible = visible; });
    },
  };
}
