export function createCompass(root: HTMLElement, getAzimuth: () => number) {
  const el = document.createElement('div');
  el.className = 'hud-compass';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = `
    <div class="hud-compass-dial">
      <span class="hud-compass-n">N</span>
      <span class="hud-compass-e">E</span>
      <span class="hud-compass-s">S</span>
      <span class="hud-compass-w">W</span>
      <div class="hud-compass-needle"></div>
    </div>
    <span class="hud-compass-label">Bussola</span>
  `;
  root.appendChild(el);

  const needle = el.querySelector('.hud-compass-needle') as HTMLElement;

  function update() {
    const deg = ((getAzimuth() * 180) / Math.PI + 360) % 360;
    needle.style.transform = `rotate(${deg}deg)`;
  }

  return { element: el, update };
}
