export function createWarpIndicator(root: HTMLElement) {
  const el = document.createElement('div');
  el.className = 'warp-indicator';
  el.setAttribute('aria-live', 'polite');
  el.hidden = true;
  el.innerHTML = `
    <div class="warp-indicator-inner">
      <span class="warp-indicator-icon">◈</span>
      <div class="warp-indicator-text">
        <strong class="warp-speed">Warp 0.0×</strong>
        <span class="warp-status">In transito…</span>
      </div>
      <div class="warp-bar"><div class="warp-bar-fill"></div></div>
    </div>
  `;
  root.appendChild(el);

  const speedEl = el.querySelector('.warp-speed') as HTMLElement;
  const statusEl = el.querySelector('.warp-status') as HTMLElement;
  const fill = el.querySelector('.warp-bar-fill') as HTMLElement;

  function show(label: string, progress = 0) {
    el.hidden = false;
    statusEl.textContent = label;
    const warp = 1 + progress * 8.5;
    speedEl.textContent = `Warp ${warp.toFixed(1)}×`;
    fill.style.width = `${Math.round(progress * 100)}%`;
  }

  function hide() {
    el.hidden = true;
    fill.style.width = '0%';
  }

  return { element: el, show, hide };
}
