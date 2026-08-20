#!/usr/bin/env node
/**
 * Installa il marchio Atlas nel progetto.
 *
 * Copia il file in `public/` e aggiorna il prop `logo` in `src/Root.tsx`, così
 * il marchio compare nello stacco di apertura, nella scena CTA e nello stacco
 * di chiusura senza toccare il codice a mano.
 *
 * Uso:  npm run set:logo -- ~/Downloads/logo-atlas.svg
 *       npm run set:logo -- --none        (torna al segnaposto)
 */

import {copyFileSync, existsSync, readFileSync, writeFileSync} from 'node:fs';
import {basename, extname} from 'node:path';

const arg = process.argv[2];
const ROOT = 'src/Root.tsx';
const ALLOWED = ['.svg', '.png', '.webp'];

if (!arg) {
  console.error('Uso: npm run set:logo -- <percorso del file> | --none');
  process.exit(1);
}

const setProp = (value) => {
  const source = readFileSync(ROOT, 'utf8');
  const next = source.replace(/logo: (?:null|'[^']*'),/, `logo: ${value},`);
  if (next === source) {
    console.error(`Non trovo il prop "logo" in ${ROOT}: aggiornalo a mano.`);
    process.exit(1);
  }
  writeFileSync(ROOT, next);
};

if (arg === '--none') {
  setProp('null');
  console.log('Marchio disattivato: gli stacchi tornano al segnaposto vettoriale.');
  process.exit(0);
}

if (!existsSync(arg)) {
  console.error(`File non trovato: ${arg}`);
  process.exit(1);
}

const ext = extname(arg).toLowerCase();
if (!ALLOWED.includes(ext)) {
  console.error(`Formato non gestito (${ext}). Ammessi: ${ALLOWED.join(', ')}.`);
  console.error('Un PNG deve avere lo sfondo trasparente: su fondo scuro un bianco si vede.');
  process.exit(1);
}

const target = `public/logo-atlas${ext}`;
copyFileSync(arg, target);
setProp(`'${basename(target)}'`);

console.log(`Marchio installato: ${target} (da ${arg}).`);
console.log('Prossimi passi: npm run dev per la revisione visiva, poi npm run render:all -- --draft.');
if (ext !== '.svg') {
  console.log('Nota: con un SVG la resa è migliore su tutti i formati, PNG incluso il 4:5.');
}
