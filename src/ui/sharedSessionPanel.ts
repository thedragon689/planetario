import { createBroadcastSession } from '../systems/broadcastSession.js';

export function createSharedSessionPanel(root: HTMLElement, handlers: {
  onFollowNavigate?: (scene: string) => void;
  onFollowSelect?: (objectId: string) => void;
  onToast?: (msg: string) => void;
}) {
  const panel = document.createElement('aside');
  panel.className = 'v21-panel session-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <header class="v21-header"><h2>Sessione condivisa</h2><button type="button" class="v21-close">×</button></header>
    <div class="v21-body">
      <p class="session-hint">Demo locale: stesso browser / schede vicine (BroadcastChannel).</p>
      <label>Nome <input type="text" class="session-name" placeholder="Esploratore"></label>
      <label><input type="radio" name="session-role" value="leader" checked> Guida</label>
      <label><input type="radio" name="session-role" value="follower"> Partecipante</label>
      <button type="button" class="session-connect">Connetti</button>
      <button type="button" class="session-broadcast" hidden>Invia scena attuale</button>
      <ul class="session-log"></ul>
    </div>
  `;
  root.appendChild(panel);

  let session: ReturnType<typeof createBroadcastSession> | null = null;
  const log = panel.querySelector('.session-log') as HTMLElement;
  const broadcastBtn = panel.querySelector('.session-broadcast') as HTMLButtonElement;

  function addLog(msg: string) {
    const li = document.createElement('li');
    li.textContent = msg;
    log.prepend(li);
  }

  panel.querySelector('.session-connect')?.addEventListener('click', () => {
    session?.close();
    const name = (panel.querySelector('.session-name') as HTMLInputElement).value;
    session = createBroadcastSession(name);
    if (!session.isSupported()) {
      handlers.onToast?.('BroadcastChannel non supportato in questo browser');
      return;
    }
    const role = panel.querySelector<HTMLInputElement>('input[name="session-role"]:checked')?.value || 'leader';
    session.setRole(role as 'leader' | 'follower');
    broadcastBtn.hidden = role !== 'leader';
    session.onMessage((msg) => {
      addLog(`${msg.from}: ${msg.type}${msg.scene ? ` → ${msg.scene}` : ''}`);
      if (role === 'follower' && msg.type === 'navigate' && msg.scene) handlers.onFollowNavigate?.(msg.scene);
      if (role === 'follower' && msg.type === 'select' && msg.objectId) handlers.onFollowSelect?.(msg.objectId);
    });
    session.ping();
    addLog(`Connesso come ${session.displayName} (${role})`);
  });

  broadcastBtn.addEventListener('click', () => {
    handlers.onToast?.('Usa i controlli app per navigare — i follower riceveranno gli aggiornamenti.');
  });

  panel.querySelector('.v21-close')?.addEventListener('click', () => {
    panel.hidden = true;
    session?.close();
  });

  return {
    element: panel,
    show() { panel.hidden = false; },
    hide() { panel.hidden = true; },
    getSession: () => session,
    broadcastNavigate(scene: string) {
      session?.broadcast({ type: 'navigate', scene });
    },
    broadcastSelect(objectId: string) {
      session?.broadcast({ type: 'select', objectId });
    },
  };
}
