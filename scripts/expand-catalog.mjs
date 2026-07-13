import { readFileSync, writeFileSync } from 'fs';

const path = 'public/data/galaxies.json';
const data = JSON.parse(readFileSync(path, 'utf8'));

const VIRGO_CENTER = [-1650, 90, 450];
const FORNAX_CENTER = [-750, -160, -1550];

const VIRGO_IDS = [
  'm87', 'm86', 'm49', 'm84', 'm88', 'm89', 'm90', 'm100',
  'm98', 'm99', 'm61', 'm58', 'm59', 'm60', 'ngc_4526', 'eyes_galaxies',
  'ngc_4565', 'ngc_4636', 'ngc_4643', 'ngc_4258', 'ngc_4477',
];

const FORNAX_IDS = [
  'ngc_1399', 'ngc_1316', 'ngc_1365', 'ngc_1404', 'ngc_1427a',
  'ngc_1350', 'ngc_1326', 'ic_335',
];

const newGalaxies = [
  {
    id: 'ngc_4565',
    name: 'Galassia Ago (NGC 4565)',
    catalog: 'NGC 4565',
    group: 'virgo_cluster',
    type: 'Galassia spirale (edge-on)',
    radius: '65.000 anni luce',
    mass: '3 × 10¹¹ M☉',
    distance: '42 milioni di anni luce',
    distanceLy: 42000000,
    description: 'Spirale vista di profilo nell\'Ammasso di Virgo, famosa per il bulge e la banda di polvere.',
    facts: ['Una delle galassie edge-on più fotografate', 'Possibile barra centrale nascosta', 'Parte del sottogruppo di M91'],
    nasa_images: [],
    sources: ['https://science.nasa.gov/universe/galaxies/'],
  },
  {
    id: 'ngc_4636',
    name: 'NGC 4636',
    catalog: 'NGC 4636',
    group: 'virgo_cluster',
    type: 'Galassia ellittica',
    radius: '55.000 anni luce',
    mass: '4 × 10¹¹ M☉',
    distance: '53 milioni di anni luce',
    distanceLy: 53000000,
    description: 'Ellittica dell\'Ammasso di Virgo con getti relativistici e X-ray luminosi.',
    facts: ['Ricca di ammassi globulari', 'Nucleo attivo con emissione radio', 'Gas caldo nel mezzo intracluster'],
    nasa_images: [],
    sources: ['https://science.nasa.gov/universe/galaxies/'],
  },
  {
    id: 'ngc_4643',
    name: 'NGC 4643',
    catalog: 'NGC 4643',
    group: 'virgo_cluster',
    type: 'Galassia spirale (SAB(rs)bc)',
    radius: '40.000 anni luce',
    mass: '2 × 10¹⁰ M☉',
    distance: '63 milioni di anni luce',
    distanceLy: 63000000,
    description: 'Spirale compatta dell\'Ammasso di Virgo con nucleo attivo Seyfert.',
    facts: ['Nucleo Seyfert 2', 'Bracci relativamente corti', 'Studiata in multi-wavelength'],
    nasa_images: [],
    sources: ['https://science.nasa.gov/universe/galaxies/'],
  },
  {
    id: 'ngc_4258',
    name: 'M106 (NGC 4258)',
    catalog: 'M106 / NGC 4258',
    group: 'virgo_cluster',
    type: 'Galassia spirale barrata (SAB(s)bc)',
    radius: '65.000 anni luce',
    mass: '4 × 10¹¹ M☉',
    distance: '23 milioni di anni luce',
    distanceLy: 23000000,
    description: 'Spirale barrata vicina al perimetro dell\'Ammasso di Virgo con maser di idrogeno nel nucleo.',
    facts: ['Maser H₂O usato per misurare distanze cosmologiche', 'Anelli di starburst nel disco', 'Nucleo attivo Seyfert'],
    nasa_images: ['https://images-assets.nasa.gov/image/PIA04294/PIA04294~orig.jpg'],
    sources: ['https://science.nasa.gov/universe/galaxies/'],
  },
  {
    id: 'ngc_4477',
    name: 'NGC 4477',
    catalog: 'NGC 4477',
    group: 'virgo_cluster',
    type: 'Galassia lenticolare',
    radius: '35.000 anni luce',
    mass: '1,5 × 10¹¹ M☉',
    distance: '55 milioni di anni luce',
    distanceLy: 55000000,
    description: 'Lenticolare dell\'Ammasso di Virgo con disco sottile e bulge prominente.',
    facts: ['Povera di gas e formazione stellare', 'Popolazione stellare vecchia', 'Parte del sottogruppo di M49'],
    nasa_images: [],
    sources: ['https://science.nasa.gov/universe/galaxies/'],
  },
  {
    id: 'ngc_1350',
    name: 'NGC 1350',
    catalog: 'NGC 1350',
    group: 'fornax_cluster',
    type: 'Galassia spirale (R\'SAB(rs)ab)',
    radius: '55.000 anni luce',
    mass: '1,5 × 10¹¹ M☉',
    distance: '85 milioni di anni luce',
    distanceLy: 85000000,
    description: 'Spirale anellata dell\'Ammasso di Fornax con anello esterno ben definito.',
    facts: ['Struttura ad anello nel disco', 'Bracci interni e anello esterno', 'Target popolare tra gli astrofotografi'],
    nasa_images: [],
    sources: ['https://science.nasa.gov/universe/galaxies/'],
  },
  {
    id: 'ngc_1326',
    name: 'NGC 1326',
    catalog: 'NGC 1326',
    group: 'fornax_cluster',
    type: 'Galassia spirale barrata (SB(rs)bc)',
    radius: '45.000 anni luce',
    mass: '8 × 10¹⁰ M☉',
    distance: '53 milioni di anni luce',
    distanceLy: 53000000,
    description: 'Spirale barrata dell\'Ammasso di Fornax con barra e anello circumnucleare.',
    facts: ['Barra centrale che alimenta il disco', 'Anello di polvere interno', 'Vicina a NGC 1316 nel cielo'],
    nasa_images: [],
    sources: ['https://science.nasa.gov/universe/galaxies/'],
  },
  {
    id: 'ic_335',
    name: 'IC 335',
    catalog: 'IC 335',
    group: 'fornax_cluster',
    type: 'Galassia lenticolare',
    radius: '30.000 anni luce',
    mass: '5 × 10¹⁰ M☉',
    distance: '60 milioni di anni luce',
    distanceLy: 60000000,
    description: 'Lenticolare compatta dell\'Ammasso di Fornax, vista quasi di profilo.',
    facts: ['Inclinazione elevata', 'Povera di gas interstellare', 'Membro periferico del cluster'],
    nasa_images: [],
    sources: ['https://science.nasa.gov/universe/galaxies/'],
  },
  {
    id: 'ngc_253',
    name: 'Galassia dello Scultore (NGC 253)',
    catalog: 'NGC 253',
    group: 'nearby',
    type: 'Galassia spirale starburst',
    radius: '45.000 anni luce',
    mass: '5 × 10¹⁰ M☉',
    distance: '11,4 milioni di anni luce',
    distanceLy: 11400000,
    description: 'Spirale starburst nel Gruppo di Scultore, una delle galassie starburst più vicine.',
    facts: ['Intensa formazione stellare nel disco', 'Visibile con telescopi amatoriali', 'Getti di gas osservati in X-ray'],
    nasa_images: ['https://images-assets.nasa.gov/image/PIA12817/PIA12817~orig.jpg'],
    sources: ['https://science.nasa.gov/universe/galaxies/'],
  },
  {
    id: 'ngc_300',
    name: 'NGC 300',
    catalog: 'NGC 300',
    group: 'nearby',
    type: 'Galassia spirale (SA(s)d)',
    radius: '35.000 anni luce',
    mass: '2,5 × 10¹⁰ M☉',
    distance: '6 milioni di anni luce',
    distanceLy: 6000000,
    description: 'Spirale a bracci aperti nel Gruppo di Scultore, simile al Triangulum per morfologia.',
    facts: ['Tra le galassie spirali più vicine', 'Cepheid variabili ben studiate', 'Bracci deboli e diffusi'],
    nasa_images: [],
    sources: ['https://science.nasa.gov/universe/galaxies/'],
  },
  {
    id: 'ngc_6744',
    name: 'NGC 6744',
    catalog: 'NGC 6744',
    group: 'distant',
    type: 'Galassia spirale barrata (SBbc)',
    radius: '175.000 anni luce',
    mass: '1 × 10¹¹ M☉',
    distance: '30 milioni di anni luce',
    distanceLy: 30000000,
    description: 'Spirale barrata nella costellazione del Pavone, considerata un analogo della Via Lattea.',
    facts: ['Dimensioni simili alla Via Lattea', 'Bracci grandi e ben definiti', 'Visibile dall\'emisfero australe'],
    nasa_images: [],
    sources: ['https://science.nasa.gov/universe/galaxies/'],
  },
  {
    id: 'ngc_2403',
    name: 'NGC 2403',
    catalog: 'NGC 2403',
    group: 'nearby',
    type: 'Galassia spirale (SAB(s)cd)',
    radius: '50.000 anni luce',
    mass: '3 × 10¹⁰ M☉',
    distance: '8 milioni di anni luce',
    distanceLy: 8000000,
    description: 'Spirale nel Gruppo di M81, ricca di regioni H II e supernovae.',
    facts: ['SN 2004dj osservata amatorialmente', 'Oltre 150 regioni H II', 'Bracci aperti e simmetrici'],
    nasa_images: [],
    sources: ['https://science.nasa.gov/universe/galaxies/'],
  },
];

const existingIds = new Set(data.galaxies.map((g) => g.id));
for (const g of newGalaxies) {
  if (!existingIds.has(g.id)) {
    data.galaxies.push(g);
    existingIds.add(g.id);
  }
}

function virgoPosition(index, total) {
  const ring = index < Math.ceil(total / 2) ? 220 : 380;
  const angle = (index / total) * Math.PI * 2 - 0.4;
  const y = VIRGO_CENTER[1] + Math.sin(index * 1.5) * 60;
  return [
    Math.round(VIRGO_CENTER[0] + Math.cos(angle) * ring),
    Math.round(y),
    Math.round(VIRGO_CENTER[2] + Math.sin(angle) * ring),
  ];
}

function fornaxPosition(index, total) {
  if (index === 0) return [...FORNAX_CENTER];
  const angle = ((index - 1) / (total - 1)) * Math.PI * 2;
  const ring = 150;
  return [
    Math.round(FORNAX_CENTER[0] + Math.cos(angle) * ring),
    Math.round(FORNAX_CENTER[1] + (index % 2 ? 40 : -30)),
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
  ngc_253: { scenes: ['observable'], position: [500, 50, 1950], scale: 7.5, color: '#ffaa66' },
  ngc_300: { scenes: ['observable'], position: [350, -60, 2100], scale: 6.5, color: '#88ddff' },
  ngc_6744: { scenes: ['observable'], position: [900, -150, 2050], scale: 9, color: '#aaccff' },
  ngc_2403: { scenes: ['observable'], position: [1600, 100, 1400], scale: 6.5, color: '#77bbee' },
};

const virgoScales = {
  m87: 13, m86: 7, m49: 8, m84: 6.5, m88: 6, m89: 5.5, m90: 6.5,
  m100: 7, m98: 5.5, m99: 5.5, m61: 5.5, m58: 5, m59: 4.5, m60: 6,
  ngc_4526: 4.5, eyes_galaxies: 5, ngc_4565: 6, ngc_4636: 5.5,
  ngc_4643: 5, ngc_4258: 6.5, ngc_4477: 4.5,
};

VIRGO_IDS.forEach((id, i) => {
  markerPositions[id] = {
    scenes: ['observable'],
    cluster: 'virgo',
    position: virgoPosition(i, VIRGO_IDS.length),
    scale: virgoScales[id] || 5.5,
    color: id === 'm87' ? '#ddaaee' : '#bbaacc',
  };
});

const fornaxScales = {
  ngc_1399: 8, ngc_1316: 6.5, ngc_1365: 7, ngc_1404: 5, ngc_1427a: 2.5,
  ngc_1350: 6, ngc_1326: 5.5, ic_335: 4.5,
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

data.catalog.version = '1.3';
data.catalog.clusters = {
  virgo: { label: 'Ammasso di Virgo', center: VIRGO_CENTER, radius: 400, labelOffset: 240 },
  fornax: { label: 'Ammasso di Fornax', center: FORNAX_CENTER, radius: 170, labelOffset: 200 },
  local_group: { label: 'Gruppo Locale', center: [0, 0, 0], radius: 280, labelOffset: 220 },
};

writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
console.log('Galassie totali:', data.galaxies.length);
console.log('Virgo:', data.galaxies.filter((g) => g.marker?.cluster === 'virgo').length);
console.log('Fornax:', data.galaxies.filter((g) => g.marker?.cluster === 'fornax').length);
console.log('Observable:', data.galaxies.filter((g) => g.marker?.scenes?.includes('observable')).length);
