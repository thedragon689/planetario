export function createModal(root) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content">
      <button class="modal-close" aria-label="Chiudi">&times;</button>
      <div class="modal-body"></div>
    </div>
  `;
  root.appendChild(modal);

  const body = modal.querySelector('.modal-body');
  const backdrop = modal.querySelector('.modal-backdrop');
  const closeBtn = modal.querySelector('.modal-close');

  function show(html) {
    body.innerHTML = html;
    modal.classList.add('visible');
  }

  function hide() {
    modal.classList.remove('visible');
  }

  closeBtn.addEventListener('click', hide);
  backdrop.addEventListener('click', hide);

  return { show, hide };
}
