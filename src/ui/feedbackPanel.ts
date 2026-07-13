export function createFeedbackPanel(root: HTMLElement, onToast?: (msg: string) => void) {
  const panel = document.createElement('aside');
  panel.className = 'v21-panel feedback-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <header class="v21-header"><h2>Feedback</h2><button type="button" class="v21-close">×</button></header>
    <form class="v21-body feedback-form">
      <label>Tipo
        <select name="type">
          <option value="bug">Segnala bug</option>
          <option value="feature">Richiesta funzione</option>
          <option value="general">Generale</option>
        </select>
      </label>
      <label>Messaggio<textarea name="message" rows="4" required></textarea></label>
      <label><input type="checkbox" name="includeShot" checked> Allega screenshot (se disponibile)</label>
      <button type="submit">Invia (salva in locale)</button>
    </form>
  `;
  root.appendChild(panel);

  const form = panel.querySelector('.feedback-form') as HTMLFormElement;
  const STORAGE_KEY = 'planetario-feedback';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const entry = {
      type: String(fd.get('type')),
      message: String(fd.get('message')),
      at: new Date().toISOString(),
      url: location.href,
      shot: null as string | null,
    };
    if (fd.get('includeShot')) {
      try {
        const canvas = document.getElementById('canvas') as HTMLCanvasElement | null;
        if (canvas) entry.shot = canvas.toDataURL('image/jpeg', 0.6);
      } catch { /* ignore */ }
    }
    const prev = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    prev.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prev.slice(-30)));
    form.reset();
    onToast?.('Grazie! Feedback salvato in locale.');
    panel.hidden = true;
  });

  panel.querySelector('.v21-close')?.addEventListener('click', () => { panel.hidden = true; });

  return { element: panel, show() { panel.hidden = false; }, hide() { panel.hidden = true; } };
}
