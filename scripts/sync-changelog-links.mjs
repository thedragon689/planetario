#!/usr/bin/env node
/**
 * Sincronizza i link compare in CHANGELOG.md da package.json#repository.url
 * Uso: node scripts/sync-changelog-links.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const repoUrl = pkg.repository?.url?.replace(/\.git$/, '');

if (!repoUrl || repoUrl.includes('OWNER')) {
  console.warn('Imposta repository.url in package.json (sostituisci OWNER) prima di sincronizzare.');
  process.exit(0);
}

const changelogPath = join(root, 'CHANGELOG.md');
let changelog = readFileSync(changelogPath, 'utf8');

const links = {
  Unreleased: `${repoUrl}/compare/v2.2.0...HEAD`,
  '2.2.0': `${repoUrl}/compare/v2.1.0...v2.2.0`,
  '2.1.0': `${repoUrl}/compare/v2.0.0...v2.1.0`,
  '2.0.0': `${repoUrl}/compare/v1.0.0...v2.0.0`,
  '1.0.0': `${repoUrl}/releases/tag/v1.0.0`,
};

for (const [version, url] of Object.entries(links)) {
  const key = version === 'Unreleased' ? 'Unreleased' : version;
  changelog = changelog.replace(
    new RegExp(`^\\[${key.replace('.', '\\.')}\\]:.*$`, 'm'),
    `[${key}]: ${url}`
  );
}

writeFileSync(changelogPath, changelog);
console.log('CHANGELOG.md — link compare aggiornati da', repoUrl);
