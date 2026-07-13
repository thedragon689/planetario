import { timeStore, type TimeSpeed } from '../store/timeStore.js';

const SPEEDS: TimeSpeed[] = [1, 100, 1000, 10000];

export function createTimeControls(root: HTMLElement) {
  const bar = document.createElement('div');
  bar.className = 'time-controls';
  bar.innerHTML = `
    <div class="time-controls-row">
      <label for="sim-date">Data simulazione</label>
      <input id="sim-date" type="date" />
      <button type="button" class="time-btn" data-action="today">Oggi</button>
      <button type="button" class="time-btn" data-action="pause" aria-pressed="false">⏸ Pausa</button>
    </div>
    <div class="time-controls-row">
      <label for="time-scale">Velocità</label>
      <input id="time-scale" type="range" min="0" max="3" step="1" value="0" />
      <output class="time-scale-label" for="time-scale">1× (1 giorno/s)</output>
    </div>
  `;
  root.appendChild(bar);

  const dateInput = bar.querySelector('#sim-date') as HTMLInputElement;
  const scaleInput = bar.querySelector('#time-scale') as HTMLInputElement;
  const scaleLabel = bar.querySelector('.time-scale-label') as HTMLOutputElement;
  const pauseBtn = bar.querySelector('[data-action="pause"]') as HTMLButtonElement;

  function syncFromStore() {
    const s = timeStore.getState();
    dateInput.value = s.simulationDate;
    scaleInput.value = String(SPEEDS.indexOf(s.timeScale));
    scaleLabel.textContent = `${s.timeScale}× (${s.timeScale} giorno${s.timeScale > 1 ? 'i' : ''}/s)`;
    pauseBtn.setAttribute('aria-pressed', String(s.paused));
    pauseBtn.textContent = s.paused ? '▶ Riprendi' : '⏸ Pausa';
  }

  syncFromStore();
  timeStore.subscribe(syncFromStore);

  dateInput.addEventListener('change', () => {
    timeStore.getState().setSimulationDate(dateInput.value);
  });

  bar.querySelector('[data-action="today"]')?.addEventListener('click', () => {
    const today = new Date().toISOString().slice(0, 10);
    timeStore.getState().setSimulationDate(today);
  });

  pauseBtn.addEventListener('click', () => {
    const s = timeStore.getState();
    s.setPaused(!s.paused);
  });

  scaleInput.addEventListener('input', () => {
    const speed = SPEEDS[Number(scaleInput.value)] || 1;
    timeStore.getState().setTimeScale(speed);
  });

  return {
    element: bar,
    setVisible(visible: boolean) {
      bar.style.display = visible ? '' : 'none';
    },
  };
}
