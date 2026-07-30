import { describe, expect, it } from 'vitest';
import { buildNarrationForObject } from '../src/systems/companionNarration.js';
import { createBrowserTts } from '../src/systems/browserTts.js';

const earth = {
  id: 'earth',
  name: 'Terra',
  type: 'Pianeta roccioso',
  description: "Il nostro pianeta natale, l'unico conosciuto ad ospitare vita.",
  facts: ['71% superficie coperta da acqua', 'Campo magnetico protettivo', 'Atmosfera ricca di ossigeno'],
  distance: '149,6 milioni km (1 UA)',
  diameter: '12.746 km (medio)',
};

describe('buildNarrationForObject', () => {
  it('in modalità compact include solo la prima curiosità', () => {
    const text = buildNarrationForObject(earth, {}, { compact: true });
    expect(text).toContain('Terra');
    expect(text).toContain('vita');
    expect(text).toContain('71% superficie coperta da acqua');
    expect(text).not.toContain('Campo magnetico protettivo');
  });

  it('in modalità completa include descrizione, tutte le curiosità e dati', () => {
    const text = buildNarrationForObject(earth, { sceneLabel: 'Terra' }, { compact: false });
    expect(text).toContain('Nella sezione Terra, ti presento Terra.');
    expect(text).toContain('Pianeta roccioso');
    expect(text).toContain('71% superficie coperta da acqua');
    expect(text).toContain('Campo magnetico protettivo');
    expect(text).toContain('Atmosfera ricca di ossigeno');
    expect(text).toContain('12 746 kilometri');
    expect(text).toContain('149 virgola 6 milioni di kilometri');
    expect(text).not.toMatch(/\bkm\b/i);
  });
});

describe('browser TTS chunking', () => {
  it('spezza testi lunghi in frasi gestibili', () => {
    const { splitSpeechChunks } = createBrowserTts();
    const long = 'Prima frase lunga. Seconda frase lunga. Terza frase lunga.';
    const chunks = splitSpeechChunks(long, 20);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.join(' ')).toContain('Prima frase lunga.');
  });
});
