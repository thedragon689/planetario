/**
 * Audit responsive layout at common phone widths.
 * Usage: npm run dev & node scripts/audit-responsive.mjs
 */
import { chromium } from 'playwright';

const BASE = process.env.PLANETARIO_URL || 'http://127.0.0.1:5175';
const VIEWPORTS = [
  { w: 320, h: 568, label: '320 compact' },
  { w: 360, h: 640, label: '360 compact' },
  { w: 375, h: 812, label: '375 phone' },
  { w: 414, h: 896, label: '414 phone' },
  { w: 480, h: 320, label: '480 landscape' },
];

function audit(page) {
  return page.evaluate(() => {
    const vw = window.innerWidth;
    const issues = [];
    if (document.documentElement.scrollWidth > vw + 1) {
      issues.push(`overflow ${document.documentElement.scrollWidth}px`);
    }
    for (const sel of ['.app-topbar', '.scene-nav', '.overlay-controls', '.companion-bar', '.hud']) {
      const el = document.querySelector(sel);
      if (!el || el.offsetParent === null && getComputedStyle(el).display === 'none') continue;
      const r = el.getBoundingClientRect();
      if (r.right > vw + 1) issues.push(`${sel} right ${Math.round(r.right)}`);
      if (r.left < -1) issues.push(`${sel} left ${Math.round(r.left)}`);
    }
    const small = [...document.querySelectorAll('.topbar-btn,.ctrl-btn,.nav-step,.sidebar-launcher')]
      .filter((el) => {
        const b = el.getBoundingClientRect();
        return b.width > 0 && b.height > 0 && (b.width < 48 || b.height < 48);
      }).length;
    if (small) issues.push(`touch<48px: ${small}`);
    return {
      tier: document.documentElement.dataset.widthTier,
      layout: document.documentElement.dataset.layout,
      companionVisible: getComputedStyle(document.querySelector('.companion-bar')).display !== 'none',
      issues,
    };
  });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(BASE, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#loading-screen.hidden', { timeout: 120_000 });
await page.waitForTimeout(1000);

for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.w, height: vp.h });
  await page.waitForTimeout(400);
  const result = await audit(page);
  const status = result.issues.length ? 'FAIL' : 'OK';
  console.log(`${status} ${vp.label} (${vp.w}×${vp.h}) tier=${result.tier} companion=${result.companionVisible ? 'on' : 'off'} ${result.issues.join('; ') || ''}`);
}

await browser.close();
