import { describe, expect, it } from 'vitest';
import { formatNumbersForSpeech, formatTextForSpeech } from '../src/systems/speechFormatting.js';
import { buildNarrationForObject } from '../src/systems/companionNarration.js';

describe('formatTextForSpeech', () => {
  it('sostituisce km con kilometri', () => {
    expect(formatTextForSpeech('12.746 km (medio)')).toContain('kilometri');
    expect(formatTextForSpeech('12.746 km (medio)')).not.toMatch(/\bkm\b/i);
  });

  it('legge i decimali con virgola', () => {
    expect(formatTextForSpeech('149,6 milioni km (1 UA)')).toBe(
      '149 virgola 6 milioni di kilometri (1 unità astronomiche)'
    );
  });

  it('separa le migliaia senza dire "punto"', () => {
    expect(formatNumbersForSpeech('12.746')).toBe('12 746');
  });

  it('espande la notazione scientifica con apice', () => {
    expect(formatTextForSpeech('5,97 × 10²⁴ kg')).toBe(
      '5 virgola 97 per 10 alla 24 chilogrammi'
    );
  });
});

describe('buildNarrationForObject speech output', () => {
  const earth = {
    id: 'earth',
    name: 'Terra',
    type: 'Pianeta roccioso',
    description: "Il nostro pianeta natale, l'unico conosciuto ad ospitare vita.",
    facts: ['71% superficie coperta da acqua'],
    distance: '149,6 milioni km (1 UA)',
    diameter: '12.746 km (medio)',
  };

  it('narrazione completa usa kilometri e virgola decimale', () => {
    const text = buildNarrationForObject(earth, { sceneLabel: 'Terra' }, { compact: false });
    expect(text).toContain('12 746 kilometri');
    expect(text).toContain('149 virgola 6 milioni di kilometri');
    expect(text).not.toMatch(/\bkm\b/i);
  });
});
