export function createToastHost(root: HTMLElement) {
  const host = document.createElement('div');
  host.className = 'toast-host';
  host.setAttribute('aria-live', 'polite');
  host.setAttribute('aria-atomic', 'true');
  root.appendChild(host);

  function show(message: string, { type = 'info', duration = 3200 } = {}) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    host.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    const timer = window.setTimeout(() => {
      toast.classList.remove('visible');
      window.setTimeout(() => toast.remove(), 300);
    }, duration);
    toast.addEventListener('click', () => {
      clearTimeout(timer);
      toast.remove();
    });
  }

  return { show, element: host };
}
