import { learningStore } from '../store/learningStore.js';

export interface LearningPathStep {
  id: string;
  title: string;
  message: string;
  scene?: string;
  objectId?: string;
}

export interface LearningPath {
  id: string;
  title: string;
  level: string;
  description: string;
  steps: LearningPathStep[];
}

export function createLearningPathsPanel(
  root: HTMLElement,
  paths: LearningPath[],
  options: {
    onStep: (path: LearningPath, step: LearningPathStep) => Promise<void>;
    onToast?: (msg: string) => void;
  }
) {
  const panel = document.createElement('aside');
  panel.className = 'learning-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <header class="learning-header">
      <h2>Percorsi didattici</h2>
      <button type="button" class="learning-close" aria-label="Chiudi percorsi">×</button>
    </header>
    <div class="learning-list"></div>
    <div class="learning-active" hidden>
      <h3 class="learning-active-title"></h3>
      <div class="learning-progress-bar"><div class="learning-progress-fill"></div></div>
      <p class="learning-step-msg"></p>
      <button type="button" class="learning-next">Prossima tappa →</button>
      <button type="button" class="learning-back">← Torna ai percorsi</button>
    </div>
  `;
  root.appendChild(panel);

  const list = panel.querySelector('.learning-list') as HTMLElement;
  const active = panel.querySelector('.learning-active') as HTMLElement;
  const activeTitle = panel.querySelector('.learning-active-title') as HTMLElement;
  const stepMsg = panel.querySelector('.learning-step-msg') as HTMLElement;
  const progressFill = panel.querySelector('.learning-progress-fill') as HTMLElement;
  const nextBtn = panel.querySelector('.learning-next') as HTMLButtonElement;

  let currentPath: LearningPath | null = null;
  let stepIndex = 0;

  function renderList() {
    list.innerHTML = paths
      .map((p) => {
        const prog = learningStore.getState().getPathProgress(p.id, p.steps.length);
        const done = learningStore.getState().isPathComplete(p.id, p.steps.length);
        return `
        <button type="button" class="learning-path-btn" data-id="${p.id}">
          <strong>${p.title}</strong>
          <span class="learning-level">${p.level}</span>
          <span class="learning-desc">${p.description}</span>
          <span class="learning-prog">${done ? '✓ Completato' : `${Math.round(prog * 100)}%`}</span>
        </button>
      `;
      })
      .join('');

    list.querySelectorAll('.learning-path-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = (btn as HTMLElement).dataset.id;
        currentPath = paths.find((p) => p.id === id) || null;
        if (!currentPath) return;
        stepIndex = 0;
        list.hidden = true;
        active.hidden = false;
        runStep();
      });
    });
  }

  async function runStep() {
    if (!currentPath) return;
    const step = currentPath.steps[stepIndex];
    if (!step) {
      options.onToast?.(`Percorso "${currentPath.title}" completato!`);
      backToList();
      return;
    }
    activeTitle.textContent = `${currentPath.title} — ${step.title}`;
    stepMsg.textContent = step.message;
    const prog = (stepIndex + 1) / currentPath.steps.length;
    progressFill.style.width = `${Math.round(prog * 100)}%`;
    await options.onStep(currentPath, step);
    learningStore.getState().markStepComplete(currentPath.id, step.id);
  }

  function backToList() {
    currentPath = null;
    stepIndex = 0;
    active.hidden = true;
    list.hidden = false;
    renderList();
  }

  nextBtn.addEventListener('click', async () => {
    stepIndex += 1;
    await runStep();
  });
  panel.querySelector('.learning-back')?.addEventListener('click', backToList);
  panel.querySelector('.learning-close')?.addEventListener('click', () => {
    backToList();
    panel.hidden = true;
  });

  renderList();

  return {
    element: panel,
    show() {
      panel.hidden = false;
      renderList();
    },
    hide() {
      backToList();
      panel.hidden = true;
    },
  };
}
