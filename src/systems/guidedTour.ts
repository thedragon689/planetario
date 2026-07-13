import { SCENE_LABELS, SCENES } from '../config.js';
import type { SceneKey } from '../types/catalog.js';

const TOUR_STEPS: Record<string, string[]> = {
  [SCENES.EARTH]: [
    'Cosa posso osservare sulla Terra in questa scena?',
    'Spiegami la graticola e i meridiani in modo semplice.',
  ],
  [SCENES.SOLAR_SYSTEM]: [
    'Quali pianeti posso cliccare nel Sistema Solare?',
    'Dove si trovano asteroidi, comete e la fascia di Kuiper?',
  ],
  [SCENES.MILKY_WAY]: [
    'Quali stelle famose posso esplorare nella Via Lattea?',
    'Cos\'è una nebulosa e dove la trovo qui?',
  ],
  [SCENES.EXOPLANETS]: [
    'Quali esopianeti sono nella zona abitabile?',
    'Cosa ha rilevato JWST sulle atmosfere extrasolari?',
  ],
  [SCENES.EXTREME]: [
    'Cos\'è Sagittarius A* e come è stata fotografata?',
    'Cosa sono i pulsar e i magnetar?',
  ],
  [SCENES.LOCAL_GROUP]: [
    'Quali galassie compongono il Gruppo Locale?',
    'Quanto è distante Andromeda dalla Via Lattea?',
  ],
  [SCENES.OBSERVABLE]: [
    'Cosa rappresentano gli ammassi Virgo e Fornax?',
    'Qual è la scala dell\'universo osservabile?',
  ],
  [SCENES.WORMHOLE]: [
    'Cos\'è il wormhole in questa esperienza?',
    'Come si collega al resto del percorso cosmico?',
  ],
};

export function getTourStepsForScene(sceneKey: string) {
  return TOUR_STEPS[sceneKey] || [
    `Cosa posso esplorare nella scena ${SCENE_LABELS[sceneKey as SceneKey] || sceneKey}?`,
  ];
}

export function createGuidedTour({ chat, getScene }: { chat: { open: () => void; ask: (q: string) => void }; getScene: () => string }) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'ctrl-btn ctrl-btn-tour';
  btn.setAttribute('aria-label', 'Tour guidato della scena');
  btn.title = 'Tour guidato';
  btn.textContent = '✧';

  let step = 0;

  btn.addEventListener('click', () => {
    const scene = getScene();
    const steps = getTourStepsForScene(scene);
    const question = steps[step % steps.length];
    step++;
    chat.open();
    chat.ask(question);
  });

  return { button: btn, reset: () => { step = 0; } };
}
