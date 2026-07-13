#!/usr/bin/env node
/**
 * Converte gli asset sorgente in `musica/` e `icon/` per l'app web.
 * Richiede ffmpeg-static (devDependency).
 */
import { mkdir, access, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Mappa file sorgente WMA → MP3 web (slug) */
const SOUNDTRACK_MAP = [
  { input: 'Cosmos Main Title.wma', output: 'cosmos-main-title.mp3' },
  { input: 'Jean-Michel Jarre - Oxygene Pt. 4.wma', output: 'oxygene-part-4.mp3' },
  { input: 'Vangelis - Chariots Of Fire.wma', output: 'chariots-of-fire.mp3' },
];

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { stdio: 'inherit' });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exit ${code}`));
    });
  });
}

async function convertSoundtracks() {
  const musicDir = join(root, 'musica');
  const outputDir = join(root, 'public', 'assets', 'audio');
  await mkdir(outputDir, { recursive: true });

  if (!(await exists(musicDir))) {
    console.warn('[convert-assets] Cartella musica/ assente.');
    return;
  }

  const files = await readdir(musicDir);
  let converted = 0;

  for (const { input, output } of SOUNDTRACK_MAP) {
    const inputPath = join(musicDir, input);
    if (!(await exists(inputPath))) {
      console.warn(`[convert-assets] Saltato (mancante): ${input}`);
      continue;
    }
    const outPath = join(outputDir, output);
    await runFfmpeg(['-y', '-i', inputPath, '-codec:a', 'libmp3lame', '-qscale:a', '4', outPath]);
    console.log('[convert-assets] Soundtrack:', outPath);
    converted += 1;
  }

  if (!converted) {
    const wma = files.filter((f) => f.toLowerCase().endsWith('.wma'));
    if (wma.length) {
      console.warn('[convert-assets] File WMA presenti ma non mappati:', wma.join(', '));
    } else {
      console.warn('[convert-assets] Nessun file WMA in musica/.');
    }
  }
}

async function exportPng(input, out, size) {
  await runFfmpeg([
    '-y',
    '-i',
    input,
    '-vf',
    `scale=${size}:${size}:force_original_aspect_ratio=decrease,pad=${size}:${size}:(ow-iw)/2:(oh-ih)/2:color=black`,
    '-frames:v',
    '1',
    '-update',
    '1',
    out,
  ]);
  console.log('[convert-assets] Icona:', out);
}

async function convertIcons() {
  const input = join(root, 'icon', 'palnetario.png');
  const iconsDir = join(root, 'public', 'icons');

  if (!(await exists(input))) {
    console.warn('[convert-assets] Nessuna icona in icon/ da convertire.');
    return;
  }

  await mkdir(iconsDir, { recursive: true });

  const sizes = [
    { out: join(iconsDir, 'planetario-512.png'), size: 512 },
    { out: join(iconsDir, 'planetario-192.png'), size: 192 },
    { out: join(iconsDir, 'favicon-128.png'), size: 128 },
    { out: join(iconsDir, 'favicon-64.png'), size: 64 },
    { out: join(root, 'public', 'favicon.png'), size: 64 },
    { out: join(root, 'public', 'favicon.ico'), size: 32 },
  ];

  for (const { out, size } of sizes) {
    await exportPng(input, out, size);
  }
}

await convertSoundtracks();
await convertIcons();
console.log('[convert-assets] Completato.');
