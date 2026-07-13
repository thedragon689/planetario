import { formatEventDate, getUpcomingEvents, type AstroEventsData } from '../systems/astroEvents.js';

export function createAstroEventsPanel(root: HTMLElement, data: AstroEventsData) {
  const panel = document.createElement('aside');
  panel.className = 'astro-events-panel';
  panel.hidden = true;
  panel.innerHTML = `
    <header class="astro-events-header">
      <h2>Eventi astronomici</h2>
      <button type="button" class="astro-events-close" aria-label="Chiudi eventi">×</button>
    </header>
    <section class="astro-events-upcoming"></section>
    <section class="astro-events-timeline">
      <h3>Timeline storica</h3>
      <ul class="astro-timeline-list"></ul>
    </section>
  `;
  root.appendChild(panel);

  const upcoming = panel.querySelector('.astro-events-upcoming') as HTMLElement;
  const timeline = panel.querySelector('.astro-timeline-list') as HTMLElement;

  function render() {
    const events = getUpcomingEvents(data, 365);
    upcoming.innerHTML = events.length
      ? events
          .map(
            (e) => `
        <article class="astro-event-card">
          <time datetime="${e.date}">${formatEventDate(e.date)}</time>
          <h3>${e.title}</h3>
          <span class="astro-event-type">${e.type}</span>
          <p>${e.description}</p>
        </article>
      `
          )
          .join('')
      : '<p class="panel-empty">Nessun evento imminente nel catalogo.</p>';

    timeline.innerHTML = (data.timeline || [])
      .map((t) => `<li><strong>${t.year}</strong> — ${t.event}</li>`)
      .join('');
  }

  panel.querySelector('.astro-events-close')?.addEventListener('click', () => {
    panel.hidden = true;
  });

  render();

  return {
    element: panel,
    show() {
      render();
      panel.hidden = false;
    },
    hide() {
      panel.hidden = true;
    },
    getUpcoming: () => getUpcomingEvents(data, 30),
  };
}
