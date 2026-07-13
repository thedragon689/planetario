import * as THREE from 'three';

/**
 * Graticolo terrestre: paralleli, meridiani, equatore e meridiano di Greenwich evidenziati.
 */
export function createEarthGraticule(radius = 1.003) {
  const group = new THREE.Group();
  group.name = 'Graticolo';

  const parallels = [];
  const meridians = [];
  const highlights = [];

  function ringPoints(latDeg, segments = 128) {
    const pts = [];
    const phi = THREE.MathUtils.degToRad(90 - latDeg);
    const y = radius * Math.cos(phi);
    const r = radius * Math.sin(phi);
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      pts.push(r * Math.cos(theta), y, r * Math.sin(theta));
    }
    return pts;
  }

  function meridianPoints(lonDeg, segments = 128) {
    const pts = [];
    const theta = THREE.MathUtils.degToRad(lonDeg);
    for (let i = 0; i <= segments; i++) {
      const lat = -90 + (i / segments) * 180;
      const phi = THREE.MathUtils.degToRad(90 - lat);
      pts.push(
        radius * Math.sin(phi) * Math.cos(theta),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }
    return pts;
  }

  function makeLine(points, color, opacity, linewidth = 1) {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    const material = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const line = new THREE.Line(geometry, material);
    line.renderOrder = 12;
    return line;
  }

  // Paralleli ogni 30°
  for (let lat = -60; lat <= 60; lat += 30) {
    if (lat === 0) continue;
    const line = makeLine(ringPoints(lat), 0x56ccf2, 0.22);
    parallels.push(line);
    group.add(line);
  }

  // Tropici
  for (const lat of [23.436, -23.436]) {
    const line = makeLine(ringPoints(lat, 96), 0xffaa66, 0.18);
    parallels.push(line);
    group.add(line);
  }

  // Equatore
  const equator = makeLine(ringPoints(0), 0x56ccf2, 0.55);
  highlights.push(equator);
  group.add(equator);

  // Meridiani ogni 30°
  for (let lon = 0; lon < 360; lon += 30) {
    if (lon === 0) continue;
    const line = makeLine(meridianPoints(lon), 0x7a9fd4, 0.2);
    meridians.push(line);
    group.add(line);
  }

  // Meridiano di Greenwich (0°)
  const prime = makeLine(meridianPoints(0), 0xc8a0ff, 0.5);
  highlights.push(prime);
  group.add(prime);

  return {
    group,
    setVisible(visible) {
      group.visible = visible;
    },
    dispose() {
      group.traverse((child) => {
        child.geometry?.dispose();
        child.material?.dispose();
      });
    },
  };
}
