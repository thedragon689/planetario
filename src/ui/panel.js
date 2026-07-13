import gsap from 'gsap';
import { slideIn } from '../systems/animations.js';
import { uiStore } from '../store/uiStore.js';
import { captureCanvasScreenshot, copyShareLink, shareNative } from './share.js';
import { fetchApod } from '../systems/apod.js';

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('it-IT', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const CATEGORY_ICONS = {
  pianeta: '☉',
  luna: '☽',
  stella: '✦',
  galassia: '◎',
  nebulosa: '✧',
  esopianeta: '⊕',
  'buco nero': '◉',
  asteroide: '·',
  cometa: '☄',
  default: '✶',
};

function categoryIcon(data) {
  const t = (data.type || data.category || '').toLowerCase();
  if (t.includes('buco nero') || t.includes('black')) return CATEGORY_ICONS['buco nero'];
  if (t.includes('pianeta') && !t.includes('nano')) return CATEGORY_ICONS.pianeta;
  if (t.includes('nano') || t.includes('kuiper')) return CATEGORY_ICONS.asteroide;
  if (t.includes('luna')) return CATEGORY_ICONS.luna;
  if (t.includes('stella') || t.includes('pulsar') || t.includes('magnetar')) return CATEGORY_ICONS.stella;
  if (t.includes('galass')) return CATEGORY_ICONS.galassia;
  if (t.includes('nebul')) return CATEGORY_ICONS.nebulosa;
  if (t.includes('esopian') || t.includes('super-terra')) return CATEGORY_ICONS.esopianeta;
  if (t.includes('comet')) return CATEGORY_ICONS.cometa;
  if (t.includes('asteroid')) return CATEGORY_ICONS.asteroide;
  return CATEGORY_ICONS.default;
}

export function createPanel(root, { onClose, getCanvas, getScene, onToast, onScreenshot, onCompare } = {}) {
  const panel = document.createElement('aside');
  panel.className = 'info-panel';
  panel.innerHTML = `
    <div class="panel-header">
      <div class="panel-header-main">
        <span class="panel-icon" aria-hidden="true"></span>
        <div>
          <span class="panel-category"></span>
          <h2 class="panel-title"></h2>
        </div>
      </div>
      <div class="panel-header-actions">
        <button type="button" class="panel-action panel-bookmark" aria-label="Aggiungi ai preferiti" title="Preferiti">♡</button>
        <div class="panel-share-wrap">
          <button type="button" class="panel-action panel-share" aria-label="Condividi" title="Condividi">⎘</button>
          <div class="panel-share-menu" hidden>
            <button type="button" data-share="screenshot">Screenshot 3D</button>
            <button type="button" data-share="link">Copia link</button>
            <button type="button" data-share="native">Condividi…</button>
          </div>
        </div>
        <button type="button" class="panel-action panel-compare" aria-label="Confronta oggetto" title="Confronta">⇄</button>
        <button type="button" class="panel-close" aria-label="Chiudi">&times;</button>
      </div>
    </div>
    <div class="panel-tabs" role="tablist">
      <button type="button" class="panel-tab active" data-tab="overview" role="tab">Panoramica</button>
      <button type="button" class="panel-tab" data-tab="data" role="tab">Dati</button>
      <button type="button" class="panel-tab" data-tab="gallery" role="tab">Galleria</button>
      <button type="button" class="panel-tab" data-tab="video" role="tab">Video</button>
      <button type="button" class="panel-tab" data-tab="news" role="tab">Notizie</button>
      <button type="button" class="panel-tab" data-tab="sources" role="tab">Fonti</button>
    </div>
    <div class="panel-body">
      <section class="panel-pane active" data-pane="overview">
        <p class="panel-description"></p>
        <div class="panel-wiki"></div>
        <div class="panel-facts"></div>
      </section>
      <section class="panel-pane" data-pane="data" hidden>
        <div class="panel-unit-toggle">
          <button type="button" data-unit="metric" class="active">Metriche</button>
          <button type="button" data-unit="imperial">Imperiali</button>
        </div>
        <div class="panel-stats"></div>
      </section>
      <section class="panel-pane" data-pane="gallery" hidden>
        <div class="panel-images"></div>
      </section>
      <section class="panel-pane" data-pane="video" hidden>
        <div class="panel-nasa-header"></div>
        <div class="panel-videos"></div>
      </section>
      <section class="panel-pane" data-pane="news" hidden>
        <div class="panel-news"></div>
      </section>
      <section class="panel-pane" data-pane="sources" hidden>
        <div class="panel-sources"></div>
      </section>
    </div>
  `;
  root.appendChild(panel);

  const els = {
    icon: panel.querySelector('.panel-icon'),
    category: panel.querySelector('.panel-category'),
    title: panel.querySelector('.panel-title'),
    stats: panel.querySelector('.panel-stats'),
    description: panel.querySelector('.panel-description'),
    wiki: panel.querySelector('.panel-wiki'),
    facts: panel.querySelector('.panel-facts'),
    nasaHeader: panel.querySelector('.panel-nasa-header'),
    videos: panel.querySelector('.panel-videos'),
    images: panel.querySelector('.panel-images'),
    news: panel.querySelector('.panel-news'),
    sources: panel.querySelector('.panel-sources'),
    close: panel.querySelector('.panel-close'),
    bookmark: panel.querySelector('.panel-bookmark'),
    compare: panel.querySelector('.panel-compare'),
    shareMenu: panel.querySelector('.panel-share-menu'),
    shareBtn: panel.querySelector('.panel-share'),
  };

  let currentData = null;
  let currentExtras = {};

  els.close.addEventListener('click', (e) => {
    e.stopPropagation();
    hide();
  });

  panel.querySelectorAll('.panel-tab').forEach((tab) => {
    tab.addEventListener('click', () => setActiveTab(tab.dataset.tab));
  });

  panel.querySelectorAll('.panel-unit-toggle button').forEach((btn) => {
    btn.addEventListener('click', () => {
      panel.querySelectorAll('.panel-unit-toggle button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      uiStore.getState().setUnitSystem(btn.dataset.unit);
      if (currentData) renderStats(currentData);
    });
  });

  els.bookmark.addEventListener('click', () => {
    if (!currentData) return;
    const added = uiStore.getState().toggleBookmark({
      id: currentData.id,
      name: currentData.name,
      type: currentData.type,
      scene: getScene?.(),
    });
    syncBookmarkBtn();
    onToast?.(added ? 'Aggiunto ai preferiti' : 'Rimosso dai preferiti', { type: 'success' });
  });

  els.compare?.addEventListener('click', () => {
    if (!currentData) return;
    onCompare?.(currentData);
  });

  els.shareBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = els.shareMenu.hidden;
    els.shareMenu.hidden = !open;
  });

  els.shareMenu.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', async () => {
      els.shareMenu.hidden = true;
      if (!currentData) return;
      const action = btn.dataset.share;
      if (action === 'screenshot') {
        const canvas = getCanvas?.();
        if (canvas) {
          await captureCanvasScreenshot(canvas, `planetario-${currentData.id}.png`);
          onScreenshot?.();
          onToast?.('Screenshot salvato', { type: 'success' });
        }
      } else if (action === 'link') {
        await copyShareLink({ scene: getScene?.(), objectId: currentData.id });
        onToast?.('Link copiato negli appunti', { type: 'success' });
      } else if (action === 'native') {
        const url = await copyShareLink({ scene: getScene?.(), objectId: currentData.id });
        const ok = await shareNative({
          title: currentData.name,
          text: currentData.description,
          url,
        });
        if (!ok) onToast?.('Condivisione non disponibile', { type: 'info' });
      }
    });
  });

  document.addEventListener('click', () => {
    els.shareMenu.hidden = true;
  });

  function setActiveTab(tabId) {
    const prevPane = panel.querySelector('.panel-pane.active');
    panel.querySelectorAll('.panel-tab').forEach((t) => {
      const active = t.dataset.tab === tabId;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
    });
    panel.querySelectorAll('.panel-pane').forEach((p) => {
      const active = p.dataset.pane === tabId;
      p.classList.toggle('active', active);
      p.hidden = !active;
    });

    const nextPane = panel.querySelector(`.panel-pane[data-pane="${tabId}"]`);
    if (!uiStore.getState().reducedMotion && prevPane && nextPane && prevPane !== nextPane) {
      gsap.fromTo(nextPane, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.32, ease: 'power2.out' });
      gsap.from(nextPane.querySelectorAll('.data-row, li, p'), {
        opacity: 0,
        x: 14,
        duration: 0.28,
        stagger: 0.03,
        ease: 'power2.out',
      });
    }

    if (tabId === 'news') renderNews();
  }

  function syncBookmarkBtn() {
    if (!currentData) return;
    const on = uiStore.getState().isBookmarked(currentData.id);
    els.bookmark.textContent = on ? '♥' : '♡';
    els.bookmark.classList.toggle('active', on);
    els.bookmark.setAttribute('aria-pressed', String(on));
  }

  function parseNumericValue(value) {
    if (value == null) return null;
    const str = String(value);
    const match = str.match(/[\d.,]+/);
    if (!match) return null;
    const num = parseFloat(match[0].replace(',', '.'));
    return Number.isFinite(num) ? { num, suffix: str.slice(match.index + match[0].length) } : null;
  }

  function animateCounterCell(cell, target, suffix = '') {
    if (uiStore.getState().reducedMotion) {
      cell.textContent = `${target}${suffix}`;
      return;
    }
    const obj = { value: 0 };
    gsap.to(obj, {
      value: target,
      duration: 1.1,
      ease: 'power2.out',
      onUpdate: () => {
        cell.textContent = `${obj.value.toFixed(target < 10 ? 2 : 0)}${suffix}`;
      },
    });
  }

  function renderStats(data) {
    const imperial = uiStore.getState().unitSystem === 'imperial';
    const stats = [
      ['Diametro', data.diameter || data.radius],
      ['Massa', data.mass],
      ['Temperatura', data.temperature],
      ['Distanza', imperial && data.distance ? `${data.distance} (conv.)` : data.distance],
      ['Periodo orbitale', data.orbitalPeriod || data.orbitalPeriodDays],
      ['Velocità orbitale', data.orbitalVelocity],
      ['Scoperta', data.discovery],
      ['Abitabilità', data.habitability],
      ['Stella madre', data.hostStar],
    ].filter(([, v]) => v);

    els.stats.innerHTML = stats.length
      ? `<table class="stats-table"><tbody>${stats
          .map(([label, value]) => `<tr class="data-row"><th>${label}</th><td data-raw="${escapeHtml(String(value))}">${escapeHtml(String(value))}</td></tr>`)
          .join('')}</tbody></table>`
      : '<p class="panel-empty">Dati tecnici non disponibili.</p>';

    if (stats.length && !uiStore.getState().reducedMotion) {
      els.stats.querySelectorAll('td').forEach((cell) => {
        const parsed = parseNumericValue(cell.dataset.raw);
        if (parsed) animateCounterCell(cell, parsed.num, parsed.suffix);
      });
    }
  }

  function renderWiki(wikiResult, { loading = false } = {}) {
    if (loading) {
      els.wiki.innerHTML = `
        <div class="wiki-block wiki-block--loading">
          <div class="wiki-loading"><span class="wiki-spinner"></span> Caricamento definizione...</div>
        </div>
      `;
      return;
    }
    if (!wikiResult?.extract) {
      els.wiki.innerHTML = '';
      return;
    }
    const thumb = wikiResult.thumbnail
      ? `<img class="wiki-thumb" src="${wikiResult.thumbnail}" alt="" loading="lazy" />`
      : '';
    els.wiki.innerHTML = `
      <section class="wiki-block">
        <div class="wiki-header"><span class="wiki-badge">Wikipedia</span></div>
        <div class="wiki-content">${thumb}<p class="wiki-extract">${escapeHtml(wikiResult.extract)}</p></div>
        ${wikiResult.pageUrl ? `<a class="wiki-link" href="${wikiResult.pageUrl}" target="_blank" rel="noopener">Leggi su Wikipedia →</a>` : ''}
      </section>
    `;
  }

  function renderVideos(nasaResults) {
    const videos = nasaResults?.videoItems || [];
    els.videos.innerHTML = videos.length
      ? videos.slice(0, 2).map((v) => `
        <figure class="nasa-video-figure">
          <video controls preload="metadata" poster="${v.previewUrl || ''}" playsinline>
            <source src="${v.videoUrl}" type="video/mp4" />
          </video>
          <figcaption><span class="nasa-fig-title">${escapeHtml(v.title)}</span></figcaption>
        </figure>
      `).join('')
      : '<p class="panel-empty">Nessun video NASA per questo oggetto.</p>';
  }

  function renderImages(data, nasaResults) {
    const staticImages = (data.nasa_images || []).map((url) => ({ url, title: data.name }));
    const apiImages = (nasaResults?.items || []).map((item) => ({
      url: item.imageUrl,
      title: item.title,
      detailUrl: item.detailUrl,
    }));
    const images = [...apiImages, ...staticImages].slice(0, 8);
    els.images.innerHTML = images.length
      ? images.map((img) => `
        <figure class="nasa-figure">
          <img src="${img.url}" alt="${escapeHtml(img.title)}" loading="lazy" />
          <figcaption>${escapeHtml(img.title)}</figcaption>
        </figure>
      `).join('')
      : '<p class="panel-empty">Nessuna immagine disponibile.</p>';
  }

  function renderNasaHeader(nasaResults, searchUrl) {
    els.nasaHeader.innerHTML = nasaResults || searchUrl
      ? `<div class="nasa-header">
          <span class="nasa-badge">NASA</span>
          ${searchUrl ? `<a class="nasa-more" href="${searchUrl}" target="_blank" rel="noopener">Archivio →</a>` : ''}
        </div>`
      : '';
  }

  function renderSources(data, searchUrl, wikiResult) {
    const sources = [...(data.sources || [])];
    const papers = data.papers || data.arxiv || [];
    if (wikiResult?.pageUrl) sources.unshift(wikiResult.pageUrl);
    if (searchUrl) sources.push(searchUrl);
    const paperLinks = (Array.isArray(papers) ? papers : []).map((p) => {
      if (typeof p === 'string') return `<a href="${p}" target="_blank" rel="noopener">${escapeHtml(p)}</a>`;
      const url = p.url || (p.id ? `https://arxiv.org/abs/${p.id}` : '');
      return url ? `<a href="${url}" target="_blank" rel="noopener">${escapeHtml(p.title || p.id || url)}</a>` : '';
    }).filter(Boolean);
    els.sources.innerHTML = (sources.length || paperLinks.length)
      ? [...paperLinks, ...sources.map((s) => `<a href="${s}" target="_blank" rel="noopener">${escapeHtml(s)}</a>`)].join('')
      : '<p class="panel-empty">Nessuna fonte elencata.</p>';
  }

  async function renderNews() {
    els.news.innerHTML = '<p class="panel-empty">Caricamento APOD NASA…</p>';
    const apod = await fetchApod();
    if (!apod) {
      els.news.innerHTML = '<p class="panel-empty">Immagine del giorno NASA non disponibile.</p>';
      return;
    }
    const img = apod.media_type === 'image' && (apod.hdurl || apod.url)
      ? `<img src="${apod.hdurl || apod.url}" alt="${escapeHtml(apod.title)}" loading="lazy" />`
      : '';
    els.news.innerHTML = `
      <article class="panel-apod">
        <span class="nasa-badge">NASA APOD</span>
        <h3>${escapeHtml(apod.title)}</h3>
        <time datetime="${apod.date}">${formatDate(apod.date)}</time>
        ${img}
        <p>${escapeHtml(apod.explanation?.slice(0, 480) || '')}${(apod.explanation?.length || 0) > 480 ? '…' : ''}</p>
        <a href="${apod.url}" target="_blank" rel="noopener">Apri su NASA →</a>
      </article>
    `;
  }

  function renderContent(data) {
    currentData = data;
    els.icon.textContent = categoryIcon(data);
    els.category.textContent = data.type || data.category || 'Oggetto celeste';
    els.title.textContent = data.name;
    renderStats(data);
    els.description.textContent = data.description || '';
    els.facts.innerHTML = (data.facts || []).length
      ? `<h3 class="facts-title">Curiosità</h3><ul>${(data.facts || []).map((f) => `<li>${escapeHtml(f)}</li>`).join('')}</ul>`
      : '';
    syncBookmarkBtn();
  }

  function applyExtras() {
    const { nasaResults, searchUrl, wikiResult } = currentExtras;
    renderWiki(wikiResult);
    renderNasaHeader(nasaResults, searchUrl);
    renderVideos(nasaResults);
    renderImages(currentData, nasaResults);
    renderSources(currentData, searchUrl, wikiResult);
  }

  function animatePanelIn() {
    const reduced = uiStore.getState().reducedMotion;
    gsap.killTweensOf(panel);
    if (reduced) {
      slideIn(panel, 'right');
      return;
    }
    gsap.fromTo(
      panel,
      { x: '105%', opacity: 0.6 },
      { x: '0%', opacity: 1, duration: 0.42, ease: 'power3.out' }
    );
    const staggerTargets = panel.querySelectorAll('.stats-table tr, .panel-facts li, .wiki-block, .panel-description');
    if (staggerTargets.length) {
      gsap.from(staggerTargets, {
        opacity: 0,
        x: 18,
        duration: 0.35,
        stagger: 0.04,
        delay: 0.12,
        ease: 'power2.out',
      });
    }
  }

  function show(data, extras = {}) {
    if (!data) return hide();
    currentExtras = extras;
    setActiveTab('overview');
    renderContent(data);
    applyExtras();
    panel.classList.add('visible');
    animatePanelIn();
  }

  function showLoading(data) {
    if (!data) return hide();
    currentExtras = {};
    setActiveTab('overview');
    renderContent(data);
    renderWiki(null, { loading: true });
    els.images.innerHTML = '<div class="nasa-loading"><span class="nasa-spinner"></span> Caricamento...</div>';
    els.videos.innerHTML = '';
    els.sources.innerHTML = '';
    panel.classList.add('visible');
    animatePanelIn();
  }

  function hide() {
    panel.classList.remove('visible');
    gsap.killTweensOf(panel);
    gsap.set(panel, { clearProps: 'transform,opacity,x,y' });
    currentData = null;
    onClose?.();
  }

  uiStore.subscribe(() => {
    if (currentData) renderStats(currentData);
    syncBookmarkBtn();
  });

  return { show, showLoading, hide, element: panel, setActiveTab, enableMobileBottomSheet: null };
}
