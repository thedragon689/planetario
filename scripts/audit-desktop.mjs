/**
 * Audit desktop/tablet layout for overlaps and viewport overflow.
 */
import { chromium } from 'playwright';

const BASE = process.env.PLANETARIO_URL || 'http://127.0.0.1:5174';
const VIEWPORTS = [
  { w: 1024, h: 768, label: '1024' },
  { w: 1280, h: 800, label: '1280' },
  { w: 1440, h: 900, label: '1440' },
  { w: 1920, h: 1080, label: '1920' },
];

const UI_SELECTORS = [
  '.app-topbar',
  '.hud',
  '.cosmic-minimap',
  '.hud-compass',
  '.hud-scale-bar',
  '.coords-hud:not(.topbar-coords)',
  '.time-controls',
  '.scene-nav',
  '.companion-bar',
  '.overlay-controls',
  '.chat-widget.open',
  '.info-panel.visible',
  '.app-sidebar.open',
  '.v21-panel:not([hidden])',
  '.settings-panel:not([hidden])',
];

function audit(page) {
  return page.evaluate(({ selectors, margin }) => {
    const vw = innerWidth;
    const vh = innerHeight;
    const issues = [];
    if (document.documentElement.scrollWidth > vw + 1) issues.push(`overflow-x ${document.documentElement.scrollWidth}`);
    if (document.documentElement.scrollHeight > vh + 1) issues.push(`overflow-y ${document.documentElement.scrollHeight}`);

    const visible = [];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (!el || el.hidden) continue;
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) === 0) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      visible.push({ sel, r: { t: r.top, l: r.left, r: r.right, b: r.bottom } });
      if (r.right > vw + 2) issues.push(`${sel}→right ${Math.round(r.right)}`);
      if (r.left < -1) issues.push(`${sel}→left ${Math.round(r.left)}`);
      if (r.bottom > vh + 1) issues.push(`${sel}→bottom ${Math.round(r.bottom)}`);
    }

    const allowed = new Set([
      '.app-topbar|.hud', '.app-topbar|.cosmic-minimap', '.app-topbar|.hud-compass',
      '.app-topbar|.coords-hud:not(.topbar-coords)', '.app-topbar|.time-controls',
      '.scene-nav|.companion-bar', '.scene-nav|.overlay-controls', '.scene-nav|.chat-widget.open',
      '.companion-bar|.overlay-controls', '.hud|.cosmic-minimap', '.cosmic-minimap|.hud-compass',
      '.overlay-controls|.cosmic-minimap', '.overlay-controls|.hud-compass',
      '.hud-scale-bar|.companion-bar', '.hud-scale-bar|.scene-nav',
      '.info-panel.visible|.overlay-controls', '.info-panel.visible|.cosmic-minimap',
      '.info-panel.visible|.hud-compass', '.info-panel.visible|.hud',
      '.app-sidebar.open|.app-topbar', '.app-sidebar.open|.coords-hud:not(.topbar-coords)',
      '.app-sidebar.open|.time-controls', '.app-sidebar.open|.hud-scale-bar',
      '.app-sidebar.open|.companion-bar', '.app-sidebar.open|.scene-nav',
      '.app-sidebar.open|.hud',
      '.settings-panel:not([hidden])|.cosmic-minimap',
      '.settings-panel:not([hidden])|.hud',
      '.settings-panel:not([hidden])|.scene-nav',
      '.settings-panel:not([hidden])|.overlay-controls',
      '.settings-panel:not([hidden])|.companion-bar',
      '.info-panel.visible|.scene-nav',
    ]);

    const overlaps = [];
    const hit = (a, b) => !(a.r.r <= b.r.l + margin || a.r.l >= b.r.r - margin || a.r.b <= b.r.t + margin || a.r.t >= b.r.b - margin);
    for (let i = 0; i < visible.length; i++) {
      for (let j = i + 1; j < visible.length; j++) {
        const a = visible[i]; const b = visible[j];
        const k1 = `${a.sel}|${b.sel}`; const k2 = `${b.sel}|${a.sel}`;
        if (allowed.has(k1) || allowed.has(k2)) continue;
        if (hit(a, b)) overlaps.push(`${a.sel}×${b.sel}`);
      }
    }
    if (overlaps.length) issues.push(`overlap: ${overlaps.join('; ')}`);
    return { layout: document.documentElement.dataset.layout, issues, count: visible.length };
  }, { selectors: UI_SELECTORS, margin: 8 });
}

async function resetUI(page) {
  await page.evaluate(() => {
    document.documentElement.classList.remove('sidebar-open', 'chat-open', 'panel-open');
    document.querySelector('.app-sidebar')?.classList.remove('open');
    document.querySelector('.info-panel')?.classList.remove('visible');
    document.querySelector('.chat-widget')?.classList.remove('open');
    document.querySelector('.settings-panel')?.setAttribute('hidden', '');
    document.querySelector('.settings-panel')?.classList.remove('visible');
    document.querySelector('.sidebar-launcher')?.removeAttribute('hidden');
  });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(BASE);
await page.waitForSelector('#loading-screen.hidden', { timeout: 120_000 });
await page.waitForTimeout(1000);

let fails = 0;
for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.w, height: vp.h });
  await page.waitForTimeout(350);
  console.log(`\n=== ${vp.label} (${vp.w}×${vp.h}) ===`);

  const cases = [
    ['default', async () => {}],
    ['sidebar', async () => page.evaluate(() => {
      const aside = document.querySelector('.app-sidebar');
      aside?.classList.add('open');
      document.documentElement.classList.add('sidebar-open');
      aside?.removeAttribute('aria-hidden');
      if (aside) aside.inert = false;
    })],
    ['panel', async () => page.evaluate(async () => {
      await window.__planetario?.openObjectById?.('earth', 'earth');
      document.documentElement.classList.add('panel-open');
    })],
    ['chat', async () => page.evaluate(() => {
      document.querySelector('.chat-widget')?.classList.add('open');
      document.documentElement.classList.add('chat-open');
    })],
    ['settings', async () => {
      await page.evaluate(() => document.querySelector('[data-action="settings"]')?.click());
      await page.waitForTimeout(200);
    }],
  ];

  for (const [name, setup] of cases) {
    await resetUI(page);
    await setup();
    await page.waitForTimeout(name === 'panel' ? 2000 : 450);
    const r = await audit(page);
    const ok = !r.issues.length;
    if (!ok) fails += r.issues.length;
    console.log(`  ${ok ? 'OK' : 'FAIL'} [${name}] layout=${r.layout} ui=${r.count}`);
    r.issues.forEach((i) => console.log(`       ${i}`));
  }
}

console.log(fails ? `\n⚠ ${fails} issue(s)` : '\n✓ Desktop audit passed');
await browser.close();
process.exit(fails ? 1 : 0);
