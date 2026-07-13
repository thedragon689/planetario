import { describe, expect, it } from 'vitest';
import { suggestFollowUpQuestions } from '../src/systems/knowledgeBase.js';

const index = [
  { title: 'Terra (pianeta)', text: '### Terra (pianeta)\nDescrizione: il nostro pianeta.' },
  { title: 'Andromeda (galassia)', text: '### Andromeda\nDistanza: 2,5 Mly' },
];

describe('suggestFollowUpQuestions', () => {
  it('suggerisce domande sull\'oggetto selezionato', () => {
    const questions = suggestFollowUpQuestions(
      {
        scene: 'local_group',
        sceneLabel: 'Gruppo Locale',
        selectedObject: { id: 'andromeda', name: 'Andromeda', facts: ['Collisione futura'] },
      },
      index
    );

    expect(questions.some((q) => q.includes('Andromeda'))).toBe(true);
  });

  it('suggerisce domande sulla scena senza selezione', () => {
    const questions = suggestFollowUpQuestions(
      { scene: 'earth', sceneLabel: 'Terra' },
      index
    );

    expect(questions.length).toBeGreaterThan(0);
    expect(questions.some((q) => q.includes('Terra'))).toBe(true);
  });
});
