import { readFileSync, writeFileSync } from 'fs';

const galaxiesPath = 'public/data/galaxies.json';
const starsPath = 'public/data/stars.json';
const data = JSON.parse(readFileSync(galaxiesPath, 'utf8'));

/**
 * Layout realistico schematico:
 * - Gruppo Locale: distanze proporzionali (~300 unità / Mly), dispersione 3D
 * - Cosmo: ammassi a distanze maggiori, galassie vicine su guscio sferico
 */
const MLY = 300;
const mly = (d) => Math.round(d * MLY);

const VIRGO_CENTER = [-mly(16.5), 45, mly(2.2)];
const FORNAX_CENTER = [mly(19), -35, -mly(3.8)];

const VIRGO_IDS = [
  'm87', 'm86', 'm49', 'm84', 'm88', 'm89', 'm90', 'm100',
  'm98', 'm99', 'm61', 'm58', 'm59', 'm60', 'ngc_4526', 'eyes_galaxies',
  'ngc_4565', 'ngc_4636', 'ngc_4643', 'ngc_4258', 'ngc_4477',
];

const FORNAX_IDS = [
  'ngc_1399', 'ngc_1316', 'ngc_1365', 'ngc_1404', 'ngc_1427a',
  'ngc_1350', 'ngc_1326', 'ic_335',
];

function vec3(dir, dist, yJitter = 0) {
  const len = Math.hypot(dir[0], dir[1], dir[2]) || 1;
  return [
    Math.round((dir[0] / len) * dist),
    Math.round(yJitter),
    Math.round((dir[2] / len) * dist),
  ];
}

function ring3d(center, radius, angleDeg, y = 0, tilt = 0) {
  const a = (angleDeg * Math.PI) / 180;
  const x = center[0] + Math.cos(a) * radius;
  const z = center[2] + Math.sin(a) * radius * Math.cos(tilt);
  const yPos = center[1] + y + Math.sin(a) * radius * Math.sin(tilt) * 0.35;
  return [Math.round(x), Math.round(yPos), Math.round(z)];
}

function virgoPos(i, total) {
  const r = i < total / 2 ? 220 : 360;
  const angle = (i / total) * 360 - 75;
  return ring3d(VIRGO_CENTER, r, angle, Math.sin(i * 1.1) * 40, 0.22);
}

function fornaxPos(i, total) {
  if (i === 0) return [...FORNAX_CENTER];
  const angle = ((i - 1) / (total - 1)) * 360;
  return ring3d(FORNAX_CENTER, 175, angle, (i % 2 ? 32 : -28), 0.18);
}

function off(base, d) {
  return [base[0] + d[0], base[1] + d[1], base[2] + d[2]];
}

// Andromeda ~2.5 Mly verso costellazione Andromeda (approssimazione 3D)
const ANDROMEDA_POS = vec3([0.78, 0.08, -0.62], mly(2.5), 18);

const markerPositions = {
  andromeda: { scenes: ['local_group'], position: ANDROMEDA_POS, scale: 26, color: '#8b72c4' },
  triangulum: { scenes: ['local_group'], position: vec3([-0.55, 0.05, 0.83], mly(2.73), -12), scale: 16, color: '#4a9fc8' },
  large_magellanic_cloud: { scenes: ['local_group'], position: vec3([-0.42, -0.12, -0.9], mly(0.163), -38), scale: 12, color: '#6eb0d4' },
  small_magellanic_cloud: { scenes: ['local_group'], position: vec3([-0.35, -0.18, -0.92], mly(0.2), -52), scale: 8, color: '#94c4e0' },
  ngc_6822: { scenes: ['local_group'], position: vec3([0.5, -0.08, 0.86], mly(0.49), -28), scale: 7, color: '#b89870' },
  ic_10: { scenes: ['local_group'], position: off(ANDROMEDA_POS, [-85, 42, 95]), scale: 6, color: '#dd9955' },
  wlm: { scenes: ['local_group'], position: vec3([-0.7, 0.04, -0.71], mly(0.93), 8), scale: 6, color: '#7a8aaa' },
  ic_1613: { scenes: ['local_group'], position: vec3([0.22, 0.14, 0.96], mly(0.76), 42), scale: 5.5, color: '#8899b8' },
  ngc_185: { scenes: ['local_group'], position: off(ANDROMEDA_POS, [120, 18, -75]), scale: 5.5, color: '#a899cc' },
  ngc_147: { scenes: ['local_group'], position: off(ANDROMEDA_POS, [155, 6, -48]), scale: 4.5, color: '#8877aa' },
  m110: { scenes: ['local_group'], position: off(ANDROMEDA_POS, [-62, 55, -88]), scale: 7.5, color: '#9988bb' },
  ngc_3109: { scenes: ['local_group'], position: vec3([-0.48, -0.22, 0.85], mly(1.34), -72), scale: 6.5, color: '#6699cc' },
  fornax_dwarf: { scenes: ['local_group'], position: vec3([-0.2, -0.35, -0.91], mly(0.147), -95), scale: 4.5, color: '#777788' },
  sculptor_dwarf: { scenes: ['local_group'], position: vec3([0.15, -0.32, -0.93], mly(0.29), -88), scale: 4, color: '#666677' },
  sagittarius_dwarf: { scenes: ['local_group'], position: vec3([0.08, 0.22, -0.97], mly(0.07), 28), scale: 3.8, color: '#997755' },
  leo_a: { scenes: ['local_group'], position: vec3([-0.62, 0.18, 0.76], mly(0.84), 35), scale: 5.5, color: '#77aa88' },
  leo_i: { scenes: ['local_group'], position: vec3([0.18, 0.42, -0.89], mly(0.82), 68), scale: 4, color: '#888899' },

  sombrero: { scenes: ['observable'], position: vec3([-0.55, 0.22, -0.8], mly(9.55), 55), scale: 14, color: '#d8c898' },
  whirlpool: { scenes: ['observable'], position: vec3([0.48, 0.12, 0.87], mly(8.58), 38), scale: 15, color: '#48b8e0' },
  pinwheel: { scenes: ['observable'], position: vec3([0.42, -0.1, 0.9], mly(6.87), -32), scale: 16, color: '#6eb8e8' },
  centaurus_a: { scenes: ['observable'], position: vec3([-0.5, -0.08, -0.86], mly(4.2), -48), scale: 15, color: '#ee7755' },
  bodes_m81: { scenes: ['observable'], position: vec3([0.58, 0.2, 0.78], mly(3.63), 62), scale: 13, color: '#99bbee' },
  cigar_m82: { scenes: ['observable'], position: vec3([0.6, 0.15, 0.75], mly(3.63), 48), scale: 9, color: '#ee5533' },
  southern_pinwheel: { scenes: ['observable'], position: vec3([-0.45, -0.15, -0.88], mly(4.9), -58), scale: 13, color: '#55aadd' },
  sunflower: { scenes: ['observable'], position: vec3([0.35, 0.18, 0.92], mly(8.99), 45), scale: 12, color: '#eedd77' },
  cartwheel: { scenes: ['observable'], position: vec3([0.05, -0.06, -0.99], mly(15), -25), scale: 18, color: '#ee88bb' },
  antennae: { scenes: ['observable'], position: vec3([-0.72, -0.12, 0.68], mly(14.5), -42), scale: 15, color: '#ee9944' },
  hoags_object: { scenes: ['observable'], position: vec3([0.82, 0.18, 0.54], mly(18), 72), scale: 13, color: '#ddccff' },
  ngc_1300: { scenes: ['observable'], position: vec3([-0.65, 0.2, -0.73], mly(21.5), 52), scale: 11, color: '#77bbee' },
  ic_1101: { scenes: ['observable'], position: vec3([0.12, 0.28, -0.95], mly(35), 85), scale: 20, color: '#bbaadd' },
  tadpole: { scenes: ['observable'], position: vec3([-0.88, 0.16, -0.44], mly(15), 38), scale: 14, color: '#88ccee' },
  stephans_quintet: { scenes: ['observable'], position: vec3([0.75, -0.2, 0.63], mly(9), -55), scale: 13, color: '#cc99ee' },
  black_eye: { scenes: ['observable'], position: vec3([0.28, -0.24, 0.93], mly(6.8), -68), scale: 11, color: '#443355' },
  ngc_253: { scenes: ['observable'], position: vec3([-0.1, 0.08, 0.99], mly(3.47), 22), scale: 13, color: '#ee9955' },
  ngc_300: { scenes: ['observable'], position: vec3([-0.22, -0.06, 0.97], mly(2.01), -18), scale: 11, color: '#77ccee' },
  ngc_6744: { scenes: ['observable'], position: vec3([0.25, -0.12, 0.96], mly(9.88), -35), scale: 14, color: '#99bbdd' },
  ngc_2403: { scenes: ['observable'], position: vec3([0.52, 0.08, 0.85], mly(3.33), 28), scale: 11, color: '#66aadd' },
};

const virgoScales = {
  m87: 22, m86: 12, m49: 13, m84: 11, m88: 10, m89: 9, m90: 11,
  m100: 12, m98: 10, m99: 10, m61: 10, m58: 9, m59: 8.5, m60: 11,
  ngc_4526: 8.5, eyes_galaxies: 9, ngc_4565: 11, ngc_4636: 10,
  ngc_4643: 9, ngc_4258: 11, ngc_4477: 8.5,
};

VIRGO_IDS.forEach((id, i) => {
  markerPositions[id] = {
    scenes: ['observable'],
    cluster: 'virgo',
    position: virgoPos(i, VIRGO_IDS.length),
    scale: virgoScales[id] || 9,
    color: id === 'm87' ? '#c899dd' : '#a899bb',
  };
});

const fornaxScales = {
  ngc_1399: 13, ngc_1316: 11, ngc_1365: 12, ngc_1404: 9, ngc_1427a: 5.5,
  ngc_1350: 10, ngc_1326: 10, ic_335: 7.5,
};

FORNAX_IDS.forEach((id, i) => {
  markerPositions[id] = {
    scenes: ['observable'],
    cluster: 'fornax',
    position: fornaxPos(i, FORNAX_IDS.length),
    scale: fornaxScales[id],
    color: {
      ngc_1399: '#bb9988', ngc_1316: '#ee8866', ngc_1365: '#55aadd', ngc_1404: '#998877',
      ngc_1427a: '#7799bb', ngc_1350: '#77bbee', ngc_1326: '#6699cc', ic_335: '#887766',
    }[id],
  };
});

for (const g of data.galaxies) {
  if (markerPositions[g.id]) g.marker = markerPositions[g.id];
}

data.catalog.version = '1.8';
data.catalog.notes = 'Posizioni schematiche con rapporti di distanza reali compressi (≈300 unità/Mly nel Gruppo Locale).';
data.catalog.clusters = {
  virgo: { label: 'Ammasso di Virgo', center: VIRGO_CENTER, radius: 360, labelOffset: 280 },
  fornax: { label: 'Ammasso di Fornax', center: FORNAX_CENTER, radius: 190, labelOffset: 260 },
  local_group: { label: 'Gruppo Locale', center: [0, 0, 0], radius: mly(2.8), labelOffset: 320 },
};

writeFileSync(galaxiesPath, JSON.stringify(data, null, 2) + '\n');

const stars = JSON.parse(readFileSync(starsPath, 'utf8'));
const starLayout = {
  sirius: vec3([0.35, 0.12, -0.92], mly(0.0086), 28),
  betelgeuse: vec3([-0.62, 0.45, 0.64], mly(0.22), 95),
  proxima_centauri: vec3([-0.55, -0.05, -0.83], mly(0.0042), 12),
  vega: vec3([0.28, 0.52, -0.8], mly(0.0078), 78),
  rigel: vec3([-0.48, -0.22, 0.84], mly(0.34), -42),
  polaris: vec3([0.05, 0.98, -0.18], mly(0.133), 195),
  alpha_centauri: vec3([-0.58, 0.08, -0.81], mly(0.0044), 18),
  arcturus: vec3([-0.38, 0.38, -0.84], mly(0.011), 62),
  antares: vec3([-0.52, -0.28, -0.8], mly(0.17), -55),
  aldebaran: vec3([0.42, 0.28, 0.86], mly(0.021), 48),
};

for (const s of stars.stars) {
  if (s.id === 'sun' || !starLayout[s.id]) continue;
  const pos = starLayout[s.id];
  s.marker = {
    scenes: ['milky_way', 'local_group'],
    position: pos,
    scale: s.id === 'betelgeuse' || s.id === 'antares' ? 9 : 6.5,
    color: s.marker?.color || '#b8d8f0',
    spectral: s.marker?.spectral || 'A',
  };
}

writeFileSync(starsPath, JSON.stringify(stars, null, 2) + '\n');
console.log('Layout realistico applicato');
