import { NEBULA_DATA, WORMHOLE_DATA } from '../data/phenomena.js';
import { SCENE_LABELS } from '../config.js';

function lines(...parts) {
  return parts.filter(Boolean).join('\n');
}

function formatExoplanet(planet, system) {
  const facts = (planet.facts || []).map((f) => `  - ${f}`).join('\n');
  const jwst = planet.jwst
    ? [
        planet.jwst.atmosphere ? `Atmosfera JWST: ${planet.jwst.atmosphere}` : '',
        planet.jwst.spectroscopy ? `Spettroscopia JWST: ${planet.jwst.spectroscopy}` : '',
      ].filter(Boolean).join('\n')
    : '';
  return lines(
    `### ${planet.name} (esopianeta)`,
    `Sistema: ${system.name}`,
    system.constellation ? `Costellazione: ${system.constellation}` : '',
    system.distanceLy ? `Distanza: ${system.distanceLy} anni luce` : '',
    planet.type ? `Tipo: ${planet.type}` : '',
    planet.classification ? `Classificazione: ${planet.classification}` : '',
    planet.radiusEarth ? `Raggio: ${planet.radiusEarth} R⊕` : '',
    planet.massEarth != null ? `Massa: ${planet.massEarth} M⊕` : '',
    planet.equilibriumTempK ? `Temperatura equilibrio: ${planet.equilibriumTempK} K` : '',
    planet.orbitalPeriodDays ? `Periodo orbitale: ${planet.orbitalPeriodDays} giorni` : '',
    planet.semiMajorAxisAu ? `Semiasse maggiore: ${planet.semiMajorAxisAu} UA` : '',
    planet.habitable != null ? `Zona abitabile: ${planet.habitable ? 'sì' : 'no'}` : '',
    planet.habitabilityScore != null ? `Indice abitabilità: ${planet.habitabilityScore}` : '',
    planet.discoveryYear ? `Scoperta: ${planet.discoveryYear} (${planet.discoveryMethod || 'osservazione'})` : '',
    planet.description ? `Descrizione: ${planet.description}` : '',
    jwst,
    facts ? `Curiosità:\n${facts}` : '',
    (planet.sources || []).length ? `Fonti: ${planet.sources.join(', ')}` : ''
  );
}

function formatEntity(entity, category) {
  const facts = (entity.facts || []).map((f) => `  - ${f}`).join('\n');
  return lines(
    `### ${entity.name} (${category})`,
    entity.type ? `Tipo: ${entity.type}` : '',
    entity.catalog ? `Catalogo: ${entity.catalog}` : '',
    entity.description ? `Descrizione: ${entity.description}` : '',
    entity.diameter ? `Diametro: ${entity.diameter}` : entity.radius ? `Raggio: ${entity.radius}` : '',
    entity.mass ? `Massa: ${entity.mass}` : '',
    entity.distance ? `Distanza: ${entity.distance}` : '',
    entity.temperature ? `Temperatura: ${entity.temperature}` : '',
    entity.orbitalPeriod ? `Periodo orbitale: ${entity.orbitalPeriod}` : '',
    entity.orbitalVelocity ? `Velocità orbitale: ${entity.orbitalVelocity}` : '',
    facts ? `Curiosità:\n${facts}` : '',
    (entity.sources || []).length ? `Fonti: ${entity.sources.join(', ')}` : ''
  );
}

/**
 * Costruisce il catalogo testuale dai documenti JSON caricati nell'app.
 */
export function buildKnowledgeCatalog(datasets) {
  const {
    planets,
    moons,
    stars,
    galaxies,
    sun,
    nasa,
    exoplanets,
    extreme,
    smallBodies,
  } = datasets;

  const sections = [
    '# CATALOGO ASTRONOMICO — Planetario 3D',
    'Nota: posizioni 3D schematiche, non in scala metrica reale.',
    '',
    '## Scale di navigazione',
    ...Object.entries(SCENE_LABELS).map(([key, label]) => `- ${key}: ${label}`),
    '',
    '## Sole',
    formatEntity({ ...sun, name: sun?.name || 'Sole' }, 'stella'),
    '',
    '## Pianeti e pianeti nano',
    ...(planets?.planets || []).map((p) => formatEntity(p, 'pianeta')),
    '',
    '## Lune',
    ...(moons?.moons || []).map((m) => formatEntity(m, 'luna')),
    '',
    '## Asteroidi principali',
    ...(smallBodies?.asteroids || []).map((a) => formatEntity(a, 'asteroide')),
    '',
    '## Comete',
    ...(smallBodies?.comets || []).map((c) => formatEntity(c, 'cometa')),
    '',
    '## Cintura di Kuiper',
    ...(smallBodies?.kuiper || []).map((k) => formatEntity(k, 'pianeta nano')),
    '',
    smallBodies?.oort ? formatEntity(smallBodies.oort, 'regione cometaria') : '',
    '',
    '## Stelle famose',
    ...(stars?.stars || []).map((s) => formatEntity(s, 'stella')),
    '',
    '## Esopianeti',
    ...(exoplanets?.systems || []).flatMap((system) =>
      (system.planets || []).map((p) => formatExoplanet(p, system))
    ),
    '',
    '## Oggetti estremi',
    ...(extreme?.objects || []).map((o) => formatEntity(
      {
        ...o,
        catalog: o.category?.includes('black_hole') ? 'Buco nero' : 'Oggetto estremo',
        discovery: o.discoveryYear ? `${o.discoveryYear} · ${o.discoveryMethod || ''}` : o.discoveryMethod,
      },
      o.category?.includes('black_hole') ? 'buco nero' : o.category || 'oggetto estremo'
    )),
    '',
    '## Galassie e ammassi',
    ...(galaxies?.galaxies || []).map((g) => formatEntity(g, 'galassia')),
  ];

  if (galaxies?.catalog?.clusters) {
    sections.push('', '## Ammassi galattici');
    Object.entries(galaxies.catalog.clusters).forEach(([id, c]) => {
      sections.push(`### ${c.label} (${id})`, `Raggio schematico: ${c.radius} unità`);
    });
  }

  sections.push('', '## Nebulose');
  NEBULA_DATA.forEach((n) => sections.push(formatEntity(n, 'nebulosa')));

  sections.push('', '## Wormhole');
  sections.push(formatEntity(WORMHOLE_DATA, 'fenomeno'));

  if (nasa?.missions?.length) {
    sections.push('', '## Missioni NASA');
    nasa.missions.forEach((m) => {
      sections.push(lines(
        `### ${m.name}`,
        `Lancio: ${m.launch} · Stato: ${m.status}`,
        m.distance ? `Distanza: ${m.distance}` : '',
        m.description ? `Descrizione: ${m.description}` : ''
      ));
    });
  }

  if (nasa?.phenomena?.length) {
    sections.push('', '## Fenomeni (NASA)');
    nasa.phenomena.forEach((p) => {
      sections.push(`### ${p.name}`, p.description ? `Descrizione: ${p.description}` : '');
    });
  }

  return sections.filter(Boolean).join('\n\n');
}

/** Indice per ricerca rapida nel catalogo. */
export function buildKnowledgeIndex(catalogText) {
  return catalogText
    .split(/\n### /)
    .slice(1)
    .map((block) => {
      const title = block.split('\n')[0]?.trim() || '';
      return { title, text: `### ${block}` };
    });
}

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .split(/[^a-z0-9àèéìòù]+/i)
    .filter((w) => w.length > 2);
}

/**
 * Seleziona le sezioni più pertinenti per limitare il contesto inviato a Gemini.
 */
export function selectRelevantSections(query, index, { scene, sceneLabel, selectedObject } = {}, limit = 18) {
  const scores = new Map();
  const queryTokens = tokenize(query);

  const boost = (title, text, weight) => {
    const key = title.toLowerCase();
    scores.set(key, (scores.get(key) || 0) + weight);
    if (!scores.has(`${key}__text`)) scores.set(`${key}__text`, text);
  };

  index.forEach(({ title, text }) => {
    const titleTokens = tokenize(title);
    const textTokens = tokenize(text);
    let score = 0;

    queryTokens.forEach((qt) => {
      if (titleTokens.some((t) => t.includes(qt) || qt.includes(t))) score += 4;
      if (textTokens.some((t) => t.includes(qt) || qt.includes(t))) score += 1;
    });

    if (score > 0) boost(title, text, score);
  });

  if (selectedObject?.name) {
    boost(selectedObject.name, formatEntity(selectedObject, selectedObject.type || 'oggetto'), 100);
  }

  if (sceneLabel) {
    index.forEach(({ title, text }) => {
      if (text.toLowerCase().includes(sceneLabel.toLowerCase())) {
        boost(title, text, 2);
      }
    });
  }

  if (scene === 'local_group' || scene === 'observable' || scene === 'milky_way' || scene === 'exoplanets') {
    index.forEach(({ title, text }) => {
      if (text.includes('galassia') || text.includes('Ammasso')) {
        boost(title, text, 0.5);
      }
    });
  }

  if (scene === 'extreme_objects') {
    index.forEach(({ title, text }) => {
      if (text.includes('buco nero') || text.includes('pulsar') || text.includes('magnetar') || text.includes('LIGO')) {
        boost(title, text, 2);
      }
    });
  }

  if (scene === 'exoplanets') {
    index.forEach(({ title, text }) => {
      if (text.includes('esopianeta') || text.includes('JWST') || text.includes('zona abitabile')) {
        boost(title, text, 1.5);
      }
    });
  }

  const ranked = [...scores.entries()]
    .filter(([k]) => !k.endsWith('__text'))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([title]) => scores.get(`${title}__text`));

  return ranked.length ? ranked.join('\n\n') : index.slice(0, 8).map((e) => e.text).join('\n\n');
}

export function buildChatContext(catalog, index, query, session) {
  const relevant = selectRelevantSections(query, index, session);
  const followUps = suggestFollowUpQuestions(session, index);
  return lines(
    '## Contesto navigazione utente',
    session.sceneLabel ? `Scena attuale: ${session.sceneLabel}` : '',
    session.selectedObject?.name ? `Oggetto selezionato: ${session.selectedObject.name}` : 'Nessun oggetto selezionato.',
    followUps.length ? `## Domande suggerite per follow-up\n${followUps.map((q) => `- ${q}`).join('\n')}` : '',
    '',
    '## Sezioni del catalogo pertinenti',
    relevant,
    '',
    '## Catalogo completo (riferimento)',
    catalog.slice(0, 120000),
  );
}

/** Suggerisce domande di follow-up in base a scena e oggetto selezionato. */
export function suggestFollowUpQuestions(session, index, limit = 3) {
  const suggestions = [];

  if (session.selectedObject?.name) {
    const name = session.selectedObject.name;
    suggestions.push(
      `Quali sono le caratteristiche principali di ${name}?`,
      `Come si colloca ${name} nella scena attuale?`
    );
    if (session.selectedObject.facts?.length) {
      suggestions.push(`Raccontami una curiosità su ${name}`);
    }
  } else if (session.sceneLabel) {
    suggestions.push(
      `Cosa posso esplorare nella scena ${session.sceneLabel}?`,
      `Quali oggetti sono più importanti in ${session.sceneLabel}?`
    );
  }

  const sceneBoost = (session.scene || '').replace('_', ' ');
  index
    .filter(({ title, text }) =>
      text.toLowerCase().includes(sceneBoost) || title.toLowerCase().includes(sceneBoost.split(' ')[0] || '')
    )
    .slice(0, 2)
    .forEach(({ title }) => {
      suggestions.push(`Parlami di ${title.replace(/\s*\([^)]*\)/, '')}`);
    });

  return [...new Set(suggestions)].slice(0, limit);
}
