export function buildNarrationForObject(data, session = {}, { compact = false } = {}) {
  if (!data?.name) return '';
  const { sceneLabel } = session;

  if (compact) {
    const bits = [data.name];
    if (data.description) bits.push(data.description);
    if (data.facts?.[0]) bits.push(data.facts[0]);
    return bits.join('. ').replace(/\s+/g, ' ').trim() + (bits.length ? '.' : '');
  }

  const parts = [];

  if (sceneLabel) {
    parts.push(`Nella sezione ${sceneLabel}, ti presento ${data.name}.`);
  } else {
    parts.push(`Ti presento ${data.name}.`);
  }

  if (data.type) parts.push(data.type + '.');
  if (data.description) parts.push(data.description);

  const fact = data.facts?.[0];
  if (fact) {
    parts.push(fact.endsWith('.') || fact.endsWith('!') ? fact : `${fact}.`);
  }

  const details = [];
  if (data.distance) details.push(`si trova a ${data.distance}`);
  if (data.diameter) details.push(`ha un diametro di ${data.diameter}`);
  if (data.temperature) details.push(`temperatura media ${data.temperature}`);
  if (data.orbitalPeriod) details.push(`orbita in ${data.orbitalPeriod}`);

  if (details.length) {
    parts.push(`${data.name} ${details.join(', ')}.`);
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}
