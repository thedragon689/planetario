import { readFileSync, writeFileSync } from 'fs';

const galaxiesPath = 'public/data/galaxies.json';
const starsPath = 'public/data/stars.json';

const data = JSON.parse(readFileSync(galaxiesPath, 'utf8'));

/** Layout proporzionale: 1 Mly ≈ 520 unità 3D nel Gruppo Locale. */
const LG_MLY = 520;

function lgFromMly(mly, azimuthDeg, elevationDeg = 0) {
  const r = mly * LG_MLY;
  const az = (azimuthDeg * Math.PI) / 180;
  const el = (elevationDeg * Math.PI) / 180;
  return [
    Math.round(r * Math.cos(el) * Math.cos(az)),
    Math.round(r * Math.sin(el)),
    Math.round(r * Math.cos(el) * Math.sin(az)),
  ];
}

function lgFromLy(ly, azimuthDeg, elevationDeg = 0) {
  return lgFromMly(ly / 1_000_000, azimuthDeg, elevationDeg);
}

const VIRGO_CENTER = [-6200, 260, 1600];
const FORNAX_CENTER = [5400, -320, -5100];

const VIRGO_IDS = [
  'm87', 'm86', 'm49', 'm84', 'm88', 'm89', 'm90', 'm100',
  'm98', 'm99', 'm61', 'm58', 'm59', 'm60', 'ngc_4526', 'eyes_galaxies',
  'ngc_4565', 'ngc_4636', 'ngc_4643', 'ngc_4258', 'ngc_4477',
];

const FORNAX_IDS = [
  'ngc_1399', 'ngc_1316', 'ngc_1365', 'ngc_1404', 'ngc_1427a',
  'ngc_1350', 'ngc_1326', 'ic_335',
];

function virgoPosition(index, total) {
  const ring = index < Math.ceil(total / 2) ? 520 : 820;
  const angle = (index / total) * Math.PI * 2 - 0.35;
  const y = VIRGO_CENTER[1] + Math.sin(index * 1.4) * 90;
  return [
    Math.round(VIRGO_CENTER[0] + Math.cos(angle) * ring),
    Math.round(y),
    Math.round(VIRGO_CENTER[2] + Math.sin(angle) * ring),
  ];
}

function fornaxPosition(index, total) {
  if (index === 0) return [...FORNAX_CENTER];
  const angle = ((index - 1) / (total - 1)) * Math.PI * 2;
  const ring = 280;
  return [
    Math.round(FORNAX_CENTER[0] + Math.cos(angle) * ring),
    Math.round(FORNAX_CENTER[1] + (index % 2 ? 55 : -40)),
    Math.round(FORNAX_CENTER[2] + Math.sin(angle) * ring),
  ];
}

const markerPositions = {
  // --- Gruppo Locale (distanze da distanceLy) ---
  andromeda: { scenes: ['local_group'], position: lgFromMly(2.5, 18, 4), scale: 15, color: '#9b7fd4' },
  triangulum: { scenes: ['local_group'], position: lgFromMly(2.73, 142, -6), scale: 9, color: '#56ccf2' },
  large_magellanic_cloud: { scenes: ['local_group'], position: lgFromLy(163000, 215, -18), scale: 6, color: '#7ec8e8' },
  small_magellanic_cloud: { scenes: ['local_group'], position: lgFromLy(200000, 208, -22), scale: 4, color: '#a8d4f0' },
  ngc_6822: { scenes: ['local_group'], position: lgFromMly(1.6, 55, -8), scale: 3, color: '#c9a87c' },
  ic_10: { scenes: ['local_group'], position: lgFromMly(2.2, 22, 12), scale: 2.6, color: '#ffaa77' },
  wlm: { scenes: ['local_group'], position: lgFromMly(3.0, 235, 5), scale: 2.8, color: '#8899bb' },
  ic_1613: { scenes: ['local_group'], position: lgFromMly(2.38, 48, 14), scale: 2.4, color: '#99aacc' },
  ngc_185: { scenes: ['local_group'], position: offset(lgFromMly(2.5, 18, 4), [140, 30, -90]), scale: 2.2, color: '#bbaadd' },
  ngc_147: { scenes: ['local_group'], position: offset(lgFromMly(2.5, 18, 4), [180, 5, -55]), scale: 2, color: '#9988bb' },
  m110: { scenes: ['local_group'], position: offset(lgFromMly(2.5, 18, 4), [-90, 80, -130]), scale: 3.2, color: '#aa99cc' },
  ngc_3109: { scenes: ['local_group'], position: lgFromMly(4.3, 168, -12), scale: 3, color: '#77aadd' },
  fornax_dwarf: { scenes: ['local_group'], position: lgFromLy(460000, 195, -28), scale: 1.7, color: '#888899' },
  sculptor_dwarf: { scenes: ['local_group'], position: lgFromLy(290000, 175, -20), scale: 1.5, color: '#777788' },
  sagittarius_dwarf: { scenes: ['local_group'], position: lgFromLy(65000, 160, 8), scale: 1.3, color: '#aa8866' },
  leo_a: { scenes: ['local_group'], position: lgFromMly(2.6, 125, 10), scale: 2, color: '#88bb99' },
  leo_i: { scenes: ['local_group'], position: lgFromLy(820000, 35, 25), scale: 1.4, color: '#9999aa' },

  // --- Vicine / peculiari (settori distanti dal centro) ---
  sombrero: { scenes: ['observable'], position: [3200, 140, -4200], scale: 7.5, color: '#e8d4a8' },
  whirlpool: { scenes: ['observable'], position: [4800, 90, 3200], scale: 8.5, color: '#56ccf2' },
  pinwheel: { scenes: ['observable'], position: [4200, -110, 4500], scale: 9.5, color: '#7ecfff' },
  centaurus_a: { scenes: ['observable'], position: [2800, -90, -4800], scale: 8.5, color: '#ff8866' },
  bodes_m81: { scenes: ['observable'], position: [4600, 210, 3600], scale: 7, color: '#aaccff' },
  cigar_m82: { scenes: ['observable'], position: [4720, 170, 3450], scale: 4.5, color: '#ff6644' },
  southern_pinwheel: { scenes: ['observable'], position: [2400, -140, -4600], scale: 7, color: '#66bbff' },
  sunflower: { scenes: ['observable'], position: [3900, 160, 2800], scale: 6.5, color: '#ffdd88' },
  cartwheel: { scenes: ['observable'], position: [7200, -80, -2800], scale: 10, color: '#ff99cc' },
  antennae: { scenes: ['observable'], position: [-4800, -120, 2200], scale: 9, color: '#ffaa55' },
  hoags_object: { scenes: ['observable'], position: [5800, 240, 1800], scale: 7, color: '#eeddff' },
  ngc_1300: { scenes: ['observable'], position: [-3600, 250, -3800], scale: 6, color: '#88ccff' },
  ic_1101: { scenes: ['observable'], position: [7800, 320, -4200], scale: 13, color: '#ccbbff' },
  tadpole: { scenes: ['observable'], position: [-5200, 190, -1200], scale: 8.5, color: '#99ddff' },
  stephans_quintet: { scenes: ['observable'], position: [4400, -220, 2200], scale: 7.5, color: '#ddaaff' },
  black_eye: { scenes: ['observable'], position: [1800, -240, 5200], scale: 5.5, color: '#554466' },
  ngc_253: { scenes: ['observable'], position: [1500, 60, 5400], scale: 7, color: '#ffaa66' },
  ngc_300: { scenes: ['observable'], position: [1100, -70, 5600], scale: 6, color: '#88ddff' },
  ngc_6744: { scenes: ['observable'], position: [2200, -160, 5500], scale: 8.5, color: '#aaccff' },
  ngc_2403: { scenes: ['observable'], position: [4100, 110, 4000], scale: 6, color: '#77bbee' },
};

function offset(base, delta) {
  return [base[0] + delta[0], base[1] + delta[1], base[2] + delta[2]];
}

const virgoScales = {
  m87: 12, m86: 6.5, m49: 7.5, m84: 6, m88: 5.5, m89: 5, m90: 6,
  m100: 6.5, m98: 5, m99: 5, m61: 5, m58: 4.5, m59: 4, m60: 5.5,
  ngc_4526: 4, eyes_galaxies: 4.5, ngc_4565: 5.5, ngc_4636: 5,
  ngc_4643: 4.5, ngc_4258: 6, ngc_4477: 4,
};

VIRGO_IDS.forEach((id, i) => {
  markerPositions[id] = {
    scenes: ['observable'],
    cluster: 'virgo',
    position: virgoPosition(i, VIRGO_IDS.length),
    scale: virgoScales[id] || 5,
    color: id === 'm87' ? '#ddaaee' : '#bbaacc',
  };
});

const fornaxScales = {
  ngc_1399: 7.5, ngc_1316: 6, ngc_1365: 6.5, ngc_1404: 4.5, ngc_1427a: 2.2,
  ngc_1350: 5.5, ngc_1326: 5, ic_335: 4,
};
const fornaxColors = {
  ngc_1399: '#ccbbaa', ngc_1316: '#ff9977', ngc_1365: '#66bbff', ngc_1404: '#aa9988',
  ngc_1427a: '#88aacc', ngc_1350: '#88ccff', ngc_1326: '#77aadd', ic_335: '#998877',
};

FORNAX_IDS.forEach((id, i) => {
  markerPositions[id] = {
    scenes: ['observable'],
    cluster: 'fornax',
    position: fornaxPosition(i, FORNAX_IDS.length),
    scale: fornaxScales[id],
    color: fornaxColors[id],
  };
});

for (const g of data.galaxies) {
  if (markerPositions[g.id]) g.marker = markerPositions[g.id];
}

data.catalog.version = '1.4';
data.catalog.clusters = {
  virgo: { label: 'Ammasso di Virgo', center: VIRGO_CENTER, radius: 900, labelOffset: 320 },
  fornax: { label: 'Ammasso di Fornax', center: FORNAX_CENTER, radius: 320, labelOffset: 280 },
  local_group: { label: 'Gruppo Locale', center: [0, 0, 0], radius: 520, labelOffset: 280 },
};

writeFileSync(galaxiesPath, JSON.stringify(data, null, 2) + '\n');

// Stelle famose: distanze proporzionali (1 ly ≈ 0.35 unità in vista galattica)
const stars = JSON.parse(readFileSync(starsPath, 'utf8'));
const LY_UNIT = 0.35;

function starPos(ly, az, el = 0) {
  const r = ly * LY_UNIT;
  const azR = (az * Math.PI) / 180;
  const elR = (el * Math.PI) / 180;
  return [
    Math.round(r * Math.cos(elR) * Math.cos(azR)),
    Math.round(r * Math.sin(elR)),
    Math.round(r * Math.cos(elR) * Math.sin(azR)),
  ];
}

const starMarkers = {
  sirius: { position: starPos(8.6, 210, 8), scale: 6, color: '#cceeff', spectral: 'A' },
  betelgeuse: { position: starPos(642, 195, 15), scale: 10, color: '#ff6644', spectral: 'M' },
  proxima_centauri: { position: starPos(4.24, 175, -5), scale: 4, color: '#ff4422', spectral: 'M' },
  vega: { position: starPos(25, 95, 35), scale: 5.5, color: '#ddeeff', spectral: 'A' },
  rigel: { position: starPos(860, 200, -8), scale: 7.5, color: '#99ccff', spectral: 'B' },
  polaris: { position: starPos(433, 10, 72), scale: 5.5, color: '#fff0cc', spectral: 'F' },
  alpha_centauri: { position: starPos(4.37, 168, -3), scale: 5, color: '#fff5dd', spectral: 'G' },
  arcturus: { position: starPos(37, 125, 22), scale: 5.5, color: '#ffaa55', spectral: 'K' },
  antares: { position: starPos(550, 215, -12), scale: 9, color: '#ff5533', spectral: 'M' },
  aldebaran: { position: starPos(65, 45, 18), scale: 6.5, color: '#ff8844', spectral: 'K' },
};

for (const s of stars.stars) {
  if (s.id === 'sun' || !starMarkers[s.id]) continue;
  const m = starMarkers[s.id];
  s.marker = {
    scenes: ['milky_way', 'local_group'],
    position: m.position,
    scale: m.scale,
    color: m.color,
    spectral: m.spectral,
  };
}

writeFileSync(starsPath, JSON.stringify(stars, null, 2) + '\n');

console.log('Layout aggiornato — Gruppo Locale max dist:', LG_MLY * 4.3);
console.log('Virgo ↔ Fornax dist:', Math.hypot(VIRGO_CENTER[0] - FORNAX_CENTER[0], VIRGO_CENTER[2] - FORNAX_CENTER[2]).toFixed(0));
