import { readFileSync, writeFileSync } from 'fs';

const galaxiesPath = 'public/data/galaxies.json';
const starsPath = 'public/data/stars.json';
const data = JSON.parse(readFileSync(galaxiesPath, 'utf8'));

/** Layout v3 — oggetti enormi, massima separazione, camera ravvicinata. */
const VIRGO_CENTER = [-1520, 95, 240];
const FORNAX_CENTER = [1520, -75, -200];

const VIRGO_IDS = [
  'm87', 'm86', 'm49', 'm84', 'm88', 'm89', 'm90', 'm100',
  'm98', 'm99', 'm61', 'm58', 'm59', 'm60', 'ngc_4526', 'eyes_galaxies',
  'ngc_4565', 'ngc_4636', 'ngc_4643', 'ngc_4258', 'ngc_4477',
];

const FORNAX_IDS = [
  'ngc_1399', 'ngc_1316', 'ngc_1365', 'ngc_1404', 'ngc_1427a',
  'ngc_1350', 'ngc_1326', 'ic_335',
];

function ring(center, radius, angleDeg, y = 0) {
  const a = (angleDeg * Math.PI) / 180;
  return [
    Math.round(center[0] + Math.cos(a) * radius),
    Math.round(center[1] + y),
    Math.round(center[2] + Math.sin(a) * radius),
  ];
}

function virgoPos(i, total) {
  const r = i < total / 2 ? 290 : 480;
  const angle = (i / total) * 360 - 90;
  return ring(VIRGO_CENTER, r, angle, Math.sin(i * 1.3) * 55);
}

function fornaxPos(i, total) {
  if (i === 0) return [...FORNAX_CENTER];
  const angle = ((i - 1) / (total - 1)) * 360;
  return ring(FORNAX_CENTER, 240, angle, (i % 2 ? 48 : -40));
}

function off(base, d) {
  return [base[0] + d[0], base[1] + d[1], base[2] + d[2]];
}

const markerPositions = {
  andromeda: { scenes: ['local_group'], position: [1120, 48, -510], scale: 52, color: '#9b7fd4' },
  triangulum: { scenes: ['local_group'], position: [-830, -28, 635], scale: 31, color: '#56ccf2' },
  large_magellanic_cloud: { scenes: ['local_group'], position: [-390, -78, -440], scale: 23, color: '#7ec8e8' },
  small_magellanic_cloud: { scenes: ['local_group'], position: [-270, -118, -550], scale: 16, color: '#a8d4f0' },
  ngc_6822: { scenes: ['local_group'], position: [465, -65, 685], scale: 14, color: '#c9a87c' },
  ic_10: { scenes: ['local_group'], position: off([1120, 48, -510], [-135, 95, 160]), scale: 12, color: '#ffaa77' },
  wlm: { scenes: ['local_group'], position: [-880, 24, -710], scale: 12, color: '#8899bb' },
  ic_1613: { scenes: ['local_group'], position: [190, 160, 760], scale: 11, color: '#99aacc' },
  ngc_185: { scenes: ['local_group'], position: off([1120, 48, -510], [200, 40, -130]), scale: 11, color: '#bbaadd' },
  ngc_147: { scenes: ['local_group'], position: off([1120, 48, -510], [255, 16, -80]), scale: 9, color: '#9988bb' },
  m110: { scenes: ['local_group'], position: off([1120, 48, -510], [-105, 120, -175]), scale: 15, color: '#aa99cc' },
  ngc_3109: { scenes: ['local_group'], position: [-560, -160, 835], scale: 13, color: '#77aadd' },
  fornax_dwarf: { scenes: ['local_group'], position: [-200, -230, -270], scale: 9, color: '#888899' },
  sculptor_dwarf: { scenes: ['local_group'], position: [140, -205, -215], scale: 8.5, color: '#777788' },
  sagittarius_dwarf: { scenes: ['local_group'], position: [70, 82, -115], scale: 8, color: '#aa8866' },
  leo_a: { scenes: ['local_group'], position: [-685, 130, 440], scale: 11, color: '#88bb99' },
  leo_i: { scenes: ['local_group'], position: [215, 315, -140], scale: 8.5, color: '#9999aa' },

  sombrero: { scenes: ['observable'], position: [-585, 155, -880], scale: 29, color: '#e8d4a8' },
  whirlpool: { scenes: ['observable'], position: [635, 105, 830], scale: 31, color: '#56ccf2' },
  pinwheel: { scenes: ['observable'], position: [510, -105, 955], scale: 34, color: '#7ecfff' },
  centaurus_a: { scenes: ['observable'], position: [-440, -88, -1000], scale: 31, color: '#ff8866' },
  bodes_m81: { scenes: ['observable'], position: [755, 215, 710], scale: 26, color: '#aaccff' },
  cigar_m82: { scenes: ['observable'], position: [805, 175, 660], scale: 18, color: '#ff6644' },
  southern_pinwheel: { scenes: ['observable'], position: [-365, -155, -1050], scale: 26, color: '#66bbff' },
  sunflower: { scenes: ['observable'], position: [390, 195, 635], scale: 25, color: '#ffdd88' },
  cartwheel: { scenes: ['observable'], position: [0, -58, -1200], scale: 37, color: '#ff99cc' },
  antennae: { scenes: ['observable'], position: [-830, -130, 510], scale: 31, color: '#ffaa55' },
  hoags_object: { scenes: ['observable'], position: [950, 215, 390], scale: 26, color: '#eeddff' },
  ngc_1300: { scenes: ['observable'], position: [-710, 230, -710], scale: 23, color: '#88ccff' },
  ic_1101: { scenes: ['observable'], position: [115, 305, -1080], scale: 43, color: '#ccbbff' },
  tadpole: { scenes: ['observable'], position: [-1000, 195, -340], scale: 29, color: '#99ddff' },
  stephans_quintet: { scenes: ['observable'], position: [830, -215, 510], scale: 26, color: '#ddaaff' },
  black_eye: { scenes: ['observable'], position: [280, -240, 1000], scale: 22, color: '#554466' },
  ngc_253: { scenes: ['observable'], position: [-130, 78, 1100], scale: 26, color: '#ffaa66' },
  ngc_300: { scenes: ['observable'], position: [-295, -72, 1150], scale: 23, color: '#88ddff' },
  ngc_6744: { scenes: ['observable'], position: [365, -155, 1125], scale: 28, color: '#aaccff' },
  ngc_2403: { scenes: ['observable'], position: [685, 120, 880], scale: 23, color: '#77bbee' },
};

const virgoScales = {
  m87: 42, m86: 23, m49: 26, m84: 22, m88: 20, m89: 18, m90: 22,
  m100: 23, m98: 20, m99: 20, m61: 20, m58: 18, m59: 17, m60: 22,
  ngc_4526: 17, eyes_galaxies: 18, ngc_4565: 22, ngc_4636: 20,
  ngc_4643: 18, ngc_4258: 22, ngc_4477: 17,
};

VIRGO_IDS.forEach((id, i) => {
  markerPositions[id] = {
    scenes: ['observable'],
    cluster: 'virgo',
    position: virgoPos(i, VIRGO_IDS.length),
    scale: virgoScales[id] || 18,
    color: id === 'm87' ? '#ddaaee' : '#bbaacc',
  };
});

const fornaxScales = {
  ngc_1399: 26, ngc_1316: 22, ngc_1365: 23, ngc_1404: 18, ngc_1427a: 11,
  ngc_1350: 20, ngc_1326: 20, ic_335: 15,
};

FORNAX_IDS.forEach((id, i) => {
  markerPositions[id] = {
    scenes: ['observable'],
    cluster: 'fornax',
    position: fornaxPos(i, FORNAX_IDS.length),
    scale: fornaxScales[id],
    color: {
      ngc_1399: '#ccbbaa', ngc_1316: '#ff9977', ngc_1365: '#66bbff', ngc_1404: '#aa9988',
      ngc_1427a: '#88aacc', ngc_1350: '#88ccff', ngc_1326: '#77aadd', ic_335: '#998877',
    }[id],
  };
});

for (const g of data.galaxies) {
  if (markerPositions[g.id]) g.marker = markerPositions[g.id];
}

data.catalog.version = '1.7';
data.catalog.clusters = {
  virgo: { label: 'Ammasso di Virgo', center: VIRGO_CENTER, radius: 480, labelOffset: 340 },
  fornax: { label: 'Ammasso di Fornax', center: FORNAX_CENTER, radius: 250, labelOffset: 320 },
  local_group: { label: 'Gruppo Locale', center: [0, 0, 0], radius: 650, labelOffset: 360 },
};

writeFileSync(galaxiesPath, JSON.stringify(data, null, 2) + '\n');

const stars = JSON.parse(readFileSync(starsPath, 'utf8'));
const starLayout = {
  sirius: [440, 82, -310],
  betelgeuse: [-620, 150, 415],
  proxima_centauri: [-750, -38, 200],
  vega: [360, 240, -585],
  rigel: [-530, -98, 505],
  polaris: [35, 505, -185],
  alpha_centauri: [-805, 48, -165],
  arcturus: [-415, 230, -440],
  antares: [-675, -135, -400],
  aldebaran: [500, 125, 480],
};

for (const s of stars.stars) {
  if (s.id === 'sun' || !starLayout[s.id]) continue;
  const pos = starLayout[s.id];
  s.marker = {
    scenes: ['milky_way', 'local_group'],
    position: pos,
    scale: s.id === 'betelgeuse' || s.id === 'antares' ? 22 : 16,
    color: s.marker?.color || '#cceeff',
    spectral: s.marker?.spectral || 'A',
  };
}

writeFileSync(starsPath, JSON.stringify(stars, null, 2) + '\n');
console.log('Layout visibilità v3 applicato');
