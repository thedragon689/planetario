import { TOUR_PRESETS, type GuidedTourPreset } from '../data/tours.js';

export interface TourRunnerOptions {
  onStep: (step: { scene: string; objectId?: string; message: string }) => Promise<void>;
  onToast?: (message: string) => void;
}

export function createTourRunner(root: HTMLElement, options: TourRunnerOptions) {
  const panel = document.createElement('aside');
  panel.className = 'tour-runner-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <header class="tour-runner-header">
      <h2>Tour guidati</h2>
      <button type="button" class="tour-runner-close" aria-label="Chiudi tour">×</button>
    </header>
    <div class="tour-runner-list"></div>
    <div class="tour-runner-progress" hidden>
      <p class="tour-runner-step"></p>
      <button type="button" class="tour-runner-next">Prossima tappa →</button>
      <button type="button" class="tour-runner-stop">Interrompi</button>
    </div>
  `;
  root.appendChild(panel);

  const list = panel.querySelector('.tour-runner-list') as HTMLElement;
  const progress = panel.querySelector('.tour-runner-progress') as HTMLElement;
  const stepEl = panel.querySelector('.tour-runner-step') as HTMLElement;
  const nextBtn = panel.querySelector('.tour-runner-next') as HTMLButtonElement;

  let activeTour: GuidedTourPreset | null = null;
  let stepIndex = 0;

  list.innerHTML = TOUR_PRESETS.map(
    (t) => `
    <button type="button" class="tour-preset-btn" data-id="${t.id}">
      <strong>${t.title}</strong>
      <span>${t.description}</span>
    </button>
  `
  ).join('');

  async function runStep() {
    if (!activeTour) return;
    const step = activeTour.steps[stepIndex];
    if (!step) {
      options.onToast?.(`Tour "${activeTour.title}" completato!`);
      stop();
      return;
    }
    stepEl.textContent = `${stepIndex + 1}/${activeTour.steps.length}: ${step.message}`;
    progress.hidden = false;
    list.hidden = true;
    await options.onStep(step);
  }

  function stop() {
    activeTour = null;
    stepIndex = 0;
    progress.hidden = true;
    list.hidden = false;
  }

  list.querySelectorAll('.tour-preset-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = (btn as HTMLElement).dataset.id;
      activeTour = TOUR_PRESETS.find((t) => t.id === id) || null;
      if (!activeTour) return;
      stepIndex = 0;
      options.onToast?.(`Avvio: ${activeTour.title}`);
      await runStep();
    });
  });

  nextBtn.addEventListener('click', async () => {
    stepIndex += 1;
    await runStep();
  });

  panel.querySelector('.tour-runner-stop')?.addEventListener('click', stop);
  panel.querySelector('.tour-runner-close')?.addEventListener('click', () => {
    stop();
    panel.hidden = true;
  });

  return {
    element: panel,
    show() {
      panel.hidden = false;
    },
    hide() {
      stop();
      panel.hidden = true;
    },
  };
}
