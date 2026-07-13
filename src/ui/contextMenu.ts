/** Menu contestuale mobile (long press) */
export function createContextMenu(root: HTMLElement) {
  const menu = document.createElement('div');
  menu.className = 'mobile-context-menu';
  menu.hidden = true;
  menu.innerHTML = `
    <button type="button" data-action="info">Apri info</button>
    <button type="button" data-action="share">Condividi</button>
    <button type="button" data-action="bookmark">Preferiti</button>
    <button type="button" data-action="close">Chiudi</button>
  `;
  root.appendChild(menu);

  let onAction: ((action: string) => void) | null = null;

  function hide() {
    menu.hidden = true;
  }

  menu.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = (btn as HTMLElement).dataset.action;
      if (action === 'close') hide();
      else onAction?.(action || '');
      hide();
    });
  });

  document.addEventListener('click', hide);

  return {
    show(x: number, y: number, handler: (action: string) => void) {
      onAction = handler;
      menu.hidden = false;
      menu.style.left = `${Math.min(x, window.innerWidth - 220)}px`;
      menu.style.top = `${Math.min(y, window.innerHeight - 180)}px`;
    },
    hide,
    destroy() {
      menu.remove();
    },
  };
}
