/**
 * Capture README gallery screenshots from a running dev server.
 * Usage: npm run dev -- --host 127.0.0.1 --port 5175
 *        node scripts/capture-screenshots.mjs
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../docs/screenshots');
const BASE_URL = process.env.PLANETARIO_URL || 'http://127.0.0.1:5175';

const SCENES = [
  ['earth', 'terra.png'],
  ['solar_system', 'solar-system.png'],
  ['milky_way', 'milky-way.png'],
  ['exoplanets', 'exoplanets.png'],
  ['extreme_objects', 'extreme-objects.png'],
  ['local_group', 'local-group.png'],
  ['observable', 'observable-universe.png'],
  ['wormhole', 'wormhole.png'],
];

async function waitForApp(page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForFunction(
    () => window.__planetario?.navigation?.goTo,
    { timeout: 120_000 },
  );
  await page.waitForSelector('#loading-screen.hidden', { timeout: 120_000 });
  await page.waitForTimeout(1500);
}

async function goToScene(page, sceneKey) {
  await page.evaluate(async (key) => {
    await window.__planetario.navigation.goTo(key);
  }, sceneKey);
  await page.waitForTimeout(2500);
}

async function hideChrome(page) {
  await page.addStyleTag({
    content: `
      #loading-screen { display: none !important; }
    `,
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  try {
    await waitForApp(page);
    await hideChrome(page);

    for (const [sceneKey, filename] of SCENES) {
      console.log(`→ ${sceneKey} → ${filename}`);
      await goToScene(page, sceneKey);
      const canvas = page.locator('#canvas, canvas').first();
      await canvas.waitFor({ state: 'visible', timeout: 30_000 });
      await page.waitForTimeout(800);
      await canvas.screenshot({ path: path.join(OUT_DIR, filename), type: 'png' });
    }

    console.log(`\n✓ ${SCENES.length} screenshot salvati in docs/screenshots/`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
