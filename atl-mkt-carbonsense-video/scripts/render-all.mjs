#!/usr/bin/env node
/**
 * Render batch con naming Atlas.
 *
 * Ordine: guardrail → verifica approvazione → render.
 * Senza `meta.approvedBy` compilato il render pubblico è rifiutato; con
 * `--draft` si ottengono comunque i file, marcati _DRAFT nel nome.
 *
 * Uso:  node scripts/render-all.mjs [--draft] [--only=IT|EN] [--ratio=16x9]
 */

import {spawnSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';
import {it} from '../src/content/it.ts';
import {en} from '../src/content/en.ts';

const args = process.argv.slice(2);
const flag = (name) => args.some((a) => a === `--${name}`);
const value = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? null;

const draft = flag('draft');
const onlyLocale = value('only')?.toUpperCase() ?? null;
const onlyRatio = value('ratio') ?? null;

const RATIOS = ['16x9', '9x16', '1x1'];
const LOCALES = {IT: it, EN: en};
const VERSION = 'v1';

const run = (command, commandArgs) => {
  const result = spawnSync(command, commandArgs, {stdio: 'inherit', shell: process.platform === 'win32'});
  return result.status === 0;
};

// 1 · Guardrail sui contenuti.
if (!run(process.execPath, ['--disable-warning=MODULE_TYPELESS_PACKAGE_JSON', 'scripts/check-claims.mjs'])) {
  console.error('\nRender interrotto: i contenuti non superano i guardrail.\n');
  process.exit(1);
}

// 2 · Gate approvazione.
const unapproved = Object.entries(LOCALES)
  .filter(([, content]) => !content.meta.approvedBy)
  .map(([code]) => code);

if (unapproved.length && !draft) {
  console.error(
    [
      '',
      `Render pubblico rifiutato: meta.approvedBy non compilato (${unapproved.join(', ')}).`,
      'Il render non è approvazione (README §6). Due strade:',
      '  • compilare meta.approvedBy / approvedOn dopo il gate compliance, oppure',
      '  • lanciare `npm run render:all -- --draft` per file marcati _DRAFT, non pubblicabili.',
      '',
    ].join('\n'),
  );
  process.exit(1);
}

// 3 · Render.
mkdirSync('out', {recursive: true});

const jobs = Object.entries(LOCALES)
  .filter(([code]) => !onlyLocale || code === onlyLocale)
  .flatMap(([code]) =>
    RATIOS.filter((ratio) => !onlyRatio || ratio === onlyRatio).map((ratio) => ({code, ratio})),
  );

if (!jobs.length) {
  console.error('Nessuna composizione corrisponde ai filtri richiesti.');
  process.exit(1);
}

const failed = [];

for (const {code, ratio} of jobs) {
  const composition = `CarbonSense60-${code}-${ratio}`;
  const suffix = draft ? '_DRAFT' : '';
  const output = `out/ATL_MKT_CarbonSense_Video60_${code}_${ratio}_${VERSION}${suffix}.mp4`;

  console.log(`\n→ ${composition} → ${output}`);
  if (!run('npx', ['remotion', 'render', composition, output])) failed.push(composition);
}

console.log('');
if (failed.length) {
  console.error(`Render falliti: ${failed.join(', ')}`);
  process.exit(1);
}

console.log(`Render completati: ${jobs.length} file in out/.`);
if (draft) {
  console.log('File marcati _DRAFT: uso interno, nessuna pubblicazione prima del gate compliance.');
}
