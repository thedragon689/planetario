import { readFileSync, writeFileSync } from 'fs';

const path = 'public/data/galaxies.json';
const data = JSON.parse(readFileSync(path, 'utf8'));

const VIRGO_CENTER = [-1650, 90, 450];
const FORNAX_CENTER = [-750, -160, -1550];

const VIRGO_IDS = [
  'm87', 'm86', 'm49', 'm84', 'm88', 'm89', 'm90', 'm100',
  'm98', 'm99', 'm61', 'm58', 'm59', 'm60', 'ngc_4526', 'eyes_galaxies',
];

const FORNAX_IDS = ['ngc_1399', 'ngc_1316', 'ngc_1365', 'ngc_1404', 'ngc_1427a'];

function virgoPosition(index) {
  const ring = index < 8 ? 210 : 340;
  const angle = (index / VIRGO_IDS.length) * Math.PI * 2 - 0.4;
  const y = VIRGO_CENTER[1] + Math.sin(index * 1.7) * 55;
  return [
    Math.round(VIRGO_CENTER[0] + Math.cos(angle) * ring),
    Math.round(y),
    Math.round(VIRGO_CENTER[2] + Math.sin(angle) * ring),
  ];
}

function fornaxPosition(index) {
  const angles = [0, 1.35, 2.7, 4.05, 5.4];
  const ring = index === 0 ? 0 : 130;
  const angle = angles[index] ?? 0;
  return [
    Math.round(FORNAX_CENTER[0] + Math.cos(angle) * ring),
    Math.round(FORNAX_CENTER[1] + (index % 2 ? 35 : -25)),
    Math.round(FORNAX_CENTER[2] + Math.sin(angle) * ring),
  ];
}

const markerPositions = {
  andromeda: { scenes: ['local_group'], position: [580, 45, -320], scale: 16, color: '#9b7fd4' },
  triangulum: { scenes: ['local_group'], position: [-420, -35, 480], scale: 9, color: '#56ccf2' },
  large_magellanic_cloud: { scenes: ['local_group'], position: [-200, -80, -340], scale: 6.5, color: '#7ec8e8' },
  small_magellanic_cloud: { scenes: ['local_group'], position: [-140, -120, -420], scale: 4, color: '#a8d4f0' },
  ngc_6822: { scenes: ['local_group'], position: [260, -55, 460], scale: 3.2, color: '#c9a87c' },
  ic_10: { scenes: ['local_group'], position: [720, 70, -180], scale: 2.8, color: '#ffaa77' },
  wlm: { scenes: ['local_group'], position: [-580, 20, -580], scale: 3, color: '#8899bb' },
  ic_1613: { scenes: ['local_group'], position: [100, 160, 560], scale: 2.6, color: '#99aacc' },
  ngc_185: { scenes: ['local_group'], position: [820, 50, -280], scale: 2.3, color: '#bbaadd' },
  ngc_147: { scenes: ['local_group'], position: [880, 15, -220], scale: 2, color: '#9988bb' },
  m110: { scenes: ['local_group'], position: [680, 110, -420], scale: 3.4, color: '#aa99cc' },
  ngc_3109: { scenes: ['local_group'], position: [-360, -170, 660], scale: 3.2, color: '#77aadd' },
  fornax_dwarf: { scenes: ['local_group'], position: [-110, -200, -180], scale: 1.8, color: '#888899' },
  sculptor_dwarf: { scenes: ['local_group'], position: [80, -170, -140], scale: 1.6, color: '#777788' },
  sagittarius_dwarf: { scenes: ['local_group'], position: [35, 50, -70], scale: 1.4, color: '#aa8866' },
  leo_a: { scenes: ['local_group'], position: [-460, 95, 300], scale: 2.2, color: '#88bb99' },
  leo_i: { scenes: ['local_group'], position: [140, 260, -90], scale: 1.5, color: '#9999aa' },

  sombrero: { scenes: ['observable'], position: [1200, 110, -1700], scale: 8, color: '#e8d4a8' },
  whirlpool: { scenes: ['observable'], position: [1850, 70, 1100], scale: 9, color: '#56ccf2' },
  pinwheel: { scenes: ['observable'], position: [1650, -90, 1500], scale: 10, color: '#7ecfff' },
  centaurus_a: { scenes: ['observable'], position: [1050, -80, -1850], scale: 9, color: '#ff8866' },
  bodes_m81: { scenes: ['observable'], position: [1750, 190, 1250], scale: 7.5, color: '#aaccff' },
  cigar_m82: { scenes: ['observable'], position: [1810, 150, 1180], scale: 5, color: '#ff6644' },
  southern_pinwheel: { scenes: ['observable'], position: [850, -130, -1750], scale: 7.5, color: '#66bbff' },
  sunflower: { scenes: ['observable'], position: [1450, 150, 950], scale: 7, color: '#ffdd88' },
  cartwheel: { scenes: ['observable'], position: [2200, -70, -700], scale: 11, color: '#ff99cc' },
  antennae: { scenes: ['observable'], position: [-1950, -100, 250], scale: 10, color: '#ffaa55' },
  hoags_object: { scenes: ['observable'], position: [1950, 220, 550], scale: 7.5, color: '#eeddff' },
  ngc_1300: { scenes: ['observable'], position: [-950, 230, -1450], scale: 6.5, color: '#88ccff' },
  ic_1101: { scenes: ['observable'], position: [2400, 300, -1100], scale: 14, color: '#ccbbff' },
  tadpole: { scenes: ['observable'], position: [-2100, 170, -280], scale: 9, color: '#99ddff' },
  stephans_quintet: { scenes: ['observable'], position: [1700, -200, 750], scale: 8, color: '#ddaaff' },
  black_eye: { scenes: ['observable'], position: [650, -220, 1750], scale: 6, color: '#554466' },
};

VIRGO_IDS.forEach((id, i) => {
  const scales = {
    m87: 13, m86: 7, m49: 8, m84: 6.5, m88: 6, m89: 5.5, m90: 6.5,
    m100: 7, m98: 5.5, m99: 5.5, m61: 5.5, m58: 5, m59: 4.5, m60: 6,
    ngc_4526: 4.5, eyes_galaxies: 5,
  };
  markerPositions[id] = {
    scenes: ['observable'],
    cluster: 'virgo',
    position: virgoPosition(i),
    scale: scales[id] || 6,
    color: id === 'm87' ? '#ddaaee' : '#bbaacc',
  };
});

FORNAX_IDS.forEach((id, i) => {
  const scales = { ngc_1399: 8, ngc_1316: 6.5, ngc_1365: 7, ngc_1404: 5, ngc_1427a: 2.5 };
  const colors = { ngc_1399: '#ccbbaa', ngc_1316: '#ff9977', ngc_1365: '#66bbff', ngc_1404: '#aa9988', ngc_1427a: '#88aacc' };
  markerPositions[id] = {
    scenes: ['observable'],
    cluster: 'fornax',
    position: fornaxPosition(i),
    scale: scales[id],
    color: colors[id],
  };
});

for (const g of data.galaxies) {
  if (markerPositions[g.id]) {
    g.marker = markerPositions[g.id];
  }
}

data.catalog.clusters = {
  virgo: { label: 'Ammasso di Virgo', center: VIRGO_CENTER, radius: 360, labelOffset: 220 },
  fornax: { label: 'Ammasso di Fornax', center: FORNAX_CENTER, radius: 150, labelOffset: 180 },
  local_group: { label: 'Gruppo Locale', center: [0, 0, 0], radius: 280, labelOffset: 220 },
};

writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
console.log('Posizioni aggiornate.');
