import { SCENES } from '../config.js';
import type { SceneKey } from '../types/catalog.js';

export interface CinemaSequence {
  id: string;
  title: string;
  durationMs: number;
  steps: Array<{ scene?: SceneKey; objectId?: string; narration: string; pauseMs?: number }>;
}

export const CINEMA_SEQUENCES: CinemaSequence[] = [
  {
    id: 'solar_tour',
    title: 'Viaggio nel Sistema Solare',
    durationMs: 90000,
    steps: [
      { scene: SCENES.SOLAR_SYSTEM, objectId: 'sun', narration: 'Al centro arde il Sole, una stella di sequenza principale.', pauseMs: 4000 },
      { scene: SCENES.SOLAR_SYSTEM, objectId: 'earth', narration: 'La Terra orbita a distanza abitabile, con acqua liquida in superficie.', pauseMs: 4000 },
      { scene: SCENES.SOLAR_SYSTEM, objectId: 'jupiter', narration: 'Giove, il gigante gassoso che protegge il sistema interno.', pauseMs: 4000 },
      { scene: SCENES.SOLAR_SYSTEM, objectId: 'saturn', narration: 'Saturno e i suoi anelli di ghiaccio e polveri.', pauseMs: 4000 },
    ],
  },
  {
    id: 'cosmic_scale',
    title: 'Dalla galassia al cosmo',
    durationMs: 75000,
    steps: [
      { scene: SCENES.MILKY_WAY, narration: 'La Via Lattea: centinaia di miliardi di stelle in una spirale.', pauseMs: 5000 },
      { scene: SCENES.LOCAL_GROUP, narration: 'Il Gruppo Locale: galassie vicine legate dalla gravità.', pauseMs: 5000 },
      { scene: SCENES.OBSERVABLE, narration: 'L\'universo osservabile si estende per quasi 14 miliardi di anni luce.', pauseMs: 5000 },
    ],
  },
];

export function createCinemaMode(root: HTMLElement, handlers: {
  onStep: (step: CinemaSequence['steps'][0]) => Promise<void>;
  speak?: (text: string) => void;
  onEnd?: () => void;
}) {
  const panel = document.createElement('aside');
  panel.className = 'v21-panel cinema-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <header class="v21-header"><h2>Modalità cinema</h2><button type="button" class="v21-close">×</button></header>
    <div class="v21-body cinema-list"></div>
    <p class="cinema-status"></p>
    <button type="button" class="cinema-stop" hidden>Ferma</button>
  `;
  root.appendChild(panel);

  const list = panel.querySelector('.cinema-list') as HTMLElement;
  const status = panel.querySelector('.cinema-status') as HTMLElement;
  const stopBtn = panel.querySelector('.cinema-stop') as HTMLButtonElement;
  let running = false;
  let abort = false;

  CINEMA_SEQUENCES.forEach((seq) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cinema-seq-btn';
    btn.textContent = `${seq.title} (~${Math.round(seq.durationMs / 60000)} min)`;
    btn.addEventListener('click', () => play(seq));
    list.appendChild(btn);
  });

  async function play(seq: CinemaSequence) {
    if (running) return;
    running = true;
    abort = false;
    stopBtn.hidden = false;
    status.textContent = `In riproduzione: ${seq.title}`;
    for (const step of seq.steps) {
      if (abort) break;
      status.textContent = step.narration;
      handlers.speak?.(step.narration);
      await handlers.onStep(step);
      await new Promise((r) => setTimeout(r, step.pauseMs || 3000));
    }
    running = false;
    stopBtn.hidden = true;
    status.textContent = abort ? 'Sequenza interrotta' : 'Sequenza completata';
    handlers.onEnd?.();
  }

  stopBtn.addEventListener('click', () => { abort = true; });
  panel.querySelector('.v21-close')?.addEventListener('click', () => { panel.hidden = true; abort = true; });

  return { element: panel, show() { panel.hidden = false; }, hide() { panel.hidden = true; }, isRunning: () => running };
}
