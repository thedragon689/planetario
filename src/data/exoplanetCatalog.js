const CLASS_LABELS = {
  rocky: 'Esopianeta roccioso',
  super_earth: 'Super-Terra',
  hot_jupiter: 'Gioviano caldo',
  mini_neptune: 'Mini-Nettuno',
  ice_giant: 'Gigante gassoso ghiacciato',
  gas_giant: 'Gigante gassoso',
};

function formatMass(massEarth) {
  if (massEarth == null) return 'Non misurata';
  if (massEarth < 2) return `${massEarth.toFixed(2)} M⊕`;
  if (massEarth < 20) return `${massEarth.toFixed(1)} M⊕`;
  return `${(massEarth / 317.8).toFixed(2)} MJ`;
}

function formatRadius(radiusEarth) {
  if (radiusEarth == null) return 'Non misurato';
  return `${radiusEarth.toFixed(2)} R⊕`;
}

export function flattenExoplanetForPanel(system, planet) {
  const distance = `${system.distanceLy} anni luce`;
  const host = system.hostStar?.name || system.name;
  const jwstLines = [];
  if (planet.jwst?.atmosphere) jwstLines.push(`Atmosfera (JWST): ${planet.jwst.atmosphere}`);
  if (planet.jwst?.spectroscopy) jwstLines.push(`Spettroscopia: ${planet.jwst.spectroscopy}`);

  return {
    ...planet,
    type: planet.type || CLASS_LABELS[planet.classification] || 'Esopianeta',
    catalog: `Sistema ${system.name}`,
    distance,
    hostStar: host,
    constellation: system.constellation,
    temperature: planet.equilibriumTempK ? `${planet.equilibriumTempK} K (equilibrio)` : undefined,
    orbitalPeriod: planet.orbitalPeriodDays ? `${planet.orbitalPeriodDays} giorni` : undefined,
    mass: formatMass(planet.massEarth),
    radius: planet.radiusEarth,
    diameter: formatRadius(planet.radiusEarth),
    habitability: planet.habitable
      ? `Zona abitabile${planet.habitabilityScore ? ` (indice ${planet.habitabilityScore})` : ''}`
      : 'Fuori zona abitabile',
    discovery: planet.discoveryYear
      ? `${planet.discoveryYear} · ${planet.discoveryMethod || 'Osservazione'}`
      : planet.discoveryMethod,
    facts: [
      ...(planet.facts || []),
      `Stella madre: ${host} (${system.hostStar?.spectral || '—'})`,
      planet.semiMajorAxisAu ? `Semiasse maggiore: ${planet.semiMajorAxisAu} UA` : null,
      ...jwstLines,
    ].filter(Boolean),
    sources: planet.sources || [],
  };
}

export function findExoplanetInDataset(exoplanetData, id) {
  for (const system of exoplanetData?.systems || []) {
    const planet = system.planets?.find((p) => p.id === id);
    if (planet) return flattenExoplanetForPanel(system, planet);
  }
  return null;
}
