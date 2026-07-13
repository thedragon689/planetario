import { userProfileStore, type UserMode } from '../store/userProfileStore.js';
import { gamificationStore } from '../store/gamificationStore.js';
import { levelTitle } from '../data/levelNames.js';
import { telemetryStore } from '../store/telemetryStore.js';

export function createProfilePanel(root: HTMLElement) {
  const panel = document.createElement('aside');
  panel.className = 'v21-panel profile-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <header class="v21-header">
      <h2>Profilo esploratore</h2>
      <button type="button" class="v21-close" aria-label="Chiudi">×</button>
    </header>
    <div class="v21-body">
      <p class="profile-level"></p>
      <p class="profile-streak"></p>
      <fieldset class="profile-modes">
        <legend>Modalità</legend>
        <label><input type="radio" name="user-mode" value="explorer"> Esploratore</label>
        <label><input type="radio" name="user-mode" value="student"> Studente</label>
        <label><input type="radio" name="user-mode" value="researcher"> Ricercatore</label>
      </fieldset>
      <label class="profile-locale">Lingua chat
        <select class="profile-chat-locale">
          <option value="it">Italiano</option>
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
        </select>
      </label>
      <section class="profile-suggestions"><h3>Suggerimenti</h3><ul></ul></section>
      <section class="profile-stats"><h3>Categorie visitate</h3><ul></ul></section>
      <label class="profile-telemetry">
        <input type="checkbox" class="profile-telemetry-toggle"> Telemetria anonima (opt-in)
      </label>
    </div>
  `;
  root.appendChild(panel);

  const levelEl = panel.querySelector('.profile-level') as HTMLElement;
  const streakEl = panel.querySelector('.profile-streak') as HTMLElement;
  const suggestionsUl = panel.querySelector('.profile-suggestions ul') as HTMLElement;
  const statsUl = panel.querySelector('.profile-stats ul') as HTMLElement;
  const telemetryToggle = panel.querySelector('.profile-telemetry-toggle') as HTMLInputElement;
  const localeSelect = panel.querySelector('.profile-chat-locale') as HTMLSelectElement;

  function render() {
    const g = gamificationStore.getState();
    const p = userProfileStore.getState();
    const lvl = g.getLevel();
    levelEl.textContent = `${levelTitle(lvl)} · Livello ${lvl} · ${g.xp} XP`;
    streakEl.textContent = p.dailyStreak > 1 ? `🔥 Serie giornaliera: ${p.dailyStreak} giorni` : 'Inizia la tua serie giornaliera oggi!';
    panel.querySelectorAll<HTMLInputElement>('input[name="user-mode"]').forEach((r) => {
      r.checked = r.value === p.mode;
    });
    localeSelect.value = p.chatLocale;
    telemetryToggle.checked = telemetryStore.getState().enabled;
    suggestionsUl.innerHTML = p.getSuggestions().map((s) => `<li>${s}</li>`).join('') || '<li>Esplora il catalogo per ricevere suggerimenti.</li>';
    const tops = p.getTopCategories().slice(0, 5);
    statsUl.innerHTML = tops.map((t) => `<li>${t.category}: ${t.visits} visite</li>`).join('') || '<li>Nessuna statistica ancora.</li>';
  }

  panel.querySelectorAll<HTMLInputElement>('input[name="user-mode"]').forEach((r) => {
    r.addEventListener('change', () => {
      if (r.checked) userProfileStore.getState().setMode(r.value as UserMode);
      render();
    });
  });
  localeSelect.addEventListener('change', () => userProfileStore.getState().setChatLocale(localeSelect.value as 'it' | 'en' | 'es' | 'fr' | 'de'));
  telemetryToggle.addEventListener('change', () => telemetryStore.getState().setEnabled(telemetryToggle.checked));

  panel.querySelector('.v21-close')?.addEventListener('click', () => { panel.hidden = true; });
  userProfileStore.subscribe(render);
  gamificationStore.subscribe(render);

  return {
    element: panel,
    show() { panel.hidden = false; render(); },
    hide() { panel.hidden = true; },
  };
}
