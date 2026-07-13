#!/usr/bin/env node
/**
 * Converte texture JPG/PNG in KTX2 (richiede `npm i -g @gltf-transform/cli` o toktx).
 * Uso: node scripts/convert-textures-ktx2.mjs
 */
import { readdir, stat } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = new URL('../assets/textures', import.meta.url).pathname;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(full));
    else if (/\.(jpg|jpeg|png)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

const hasToktx = (() => {
  try {
    execSync('which toktx', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
})();

if (!hasToktx) {
  console.log('toktx non trovato. Installa KTX-Software: https://github.com/KhronosGroup/KTX-Software');
  process.exit(0);
}

const files = await walk(ROOT);
for (const file of files) {
  const out = join(file.replace(extname(file), '.ktx2'));
  try {
    await stat(out);
    continue;
  } catch {
    // convert
  }
  console.log(`Converto ${basename(file)} → ${basename(out)}`);
  execSync(`toktx --bcmp --genmipmap ${out} ${file}`, { stdio: 'inherit' });
}

console.log('Fatto. Le texture .ktx2 verranno caricate automaticamente se presenti.');
