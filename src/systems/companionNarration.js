import { formatTextForSpeech } from './speechFormatting.js';

function normalizeSentence(text) {
  const line = String(text || '').trim();
  if (!line) return '';
  if (/[.!?…]$/.test(line)) return line;
  return `${line}.`;
}

export function buildNarrationForObject(data, session = {}, { compact = false } = {}) {
  if (!data?.name) return '';

  const { sceneLabel } = session;

  if (compact) {
    const bits = [data.name];
    if (data.description) bits.push(data.description);
    if (data.facts?.[0]) bits.push(data.facts[0]);
    return formatTextForSpeech(
      bits.map(normalizeSentence).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
    );
  }

  const parts = [];

  if (sceneLabel) {
    parts.push(`Nella sezione ${sceneLabel}, ti presento ${data.name}.`);
  } else {
    parts.push(`Ti presento ${data.name}.`);
  }

  if (data.type) parts.push(normalizeSentence(data.type));
  if (data.description) parts.push(normalizeSentence(data.description));

  if (Array.isArray(data.facts)) {
    data.facts.forEach((fact) => {
      const line = normalizeSentence(fact);
      if (line) parts.push(line);
    });
  }

  const details = [];
  if (data.distance) details.push(`si trova a ${data.distance}`);
  if (data.diameter) details.push(`ha un diametro di ${data.diameter}`);
  if (data.temperature) details.push(`temperatura media ${data.temperature}`);
  if (data.orbitalPeriod) details.push(`orbita in ${data.orbitalPeriod}`);
  if (data.mass) details.push(`massa ${data.mass}`);
  if (data.orbitalVelocity) details.push(`velocità orbitale ${data.orbitalVelocity}`);

  if (details.length) {
    parts.push(normalizeSentence(`${data.name} ${details.join(', ')}`));
  }

  return formatTextForSpeech(parts.join(' ').replace(/\s+/g, ' ').trim());
}
