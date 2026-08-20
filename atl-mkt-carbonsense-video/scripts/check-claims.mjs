#!/usr/bin/env node
/**
 * Filtro anti-overclaim automatico sui file di contenuti.
 *
 * Non sostituisce il gate compliance: è un controllo meccanico che intercetta
 * le violazioni banali (claim di superiorità, TRL unico, pricing, proiezioni,
 * nomi di terzi) e i superamenti dei limiti di durata prima del render.
 * I guardrail sono quelli di docs/PIPELINE_AGENT.md.
 *
 * Uso:  node scripts/check-claims.mjs
 * Exit: 0 se non ci sono errori (i warning non bloccano), 1 altrimenti.
 */

import {it} from '../src/content/it.ts';
import {en} from '../src/content/en.ts';

const errors = [];
const warnings = [];

const add = (list, locale, where, message) =>
  list.push(`[${locale}] ${where}: ${message}`);

/** Pattern vietati in materiale diffuso a pubblico indeterminato. */
const FORBIDDEN = [
  {
    re: /\b(unic[oa]|il prim[oa]|la prima|the first|the only|no competitors?|non esistono competitor\w*|nessun competitor\w*|leader di mercato|market leader|best[- ]in[- ]class|migliore sul mercato)\b/i,
    why: 'claim di superiorità assoluta non dimostrabile (pratica commerciale ingannevole)',
  },
  {
    re: /TRL\s*[89]|TRL\s*4\s*(completat[oa]|completed)|TRL\s*7\s*(completat[oa]|completed)/i,
    why: 'TRL non sostenibile o TRL unico di piattaforma: B.R.A.I.N. TRL 7, CarbonSense TRL 3 → 4',
  },
  {
    re: /(TAM|SAM|SOM)\b|\b\d+([.,]\d+)?\s*(mld|miliard\w*|trillion|bn)\b|\$\s*\d/i,
    why: 'proiezione di mercato: non ammessa in materiale pubblicitario',
  },
  {
    re: /(€\s*\d|\d+\s*€|EUR\s*\d|\d+\s*%|\bcanone\b|\bprezzo\b|\bpricing\b|\broyalt\w*)/i,
    why: 'pricing o percentuale Layer 3: non va in un asset pubblico',
  },
  {
    re: /\b(ERC[- ]?20|NFT|tokeniz\w*|token\b|BambooCoin)\b/i,
    why: 'riferimento a token: sposta la conversazione su MiCA senza servire la vendita',
  },
  {
    re: /\b(Veneta\s*Cementi|Luxottica|EssilorLuxottica|Heidelberg\w*|Grigolin|SuperBeton|Contarina|ETRA|SESA|Bellunum|Agertech|SeaTheChange|Biobambuitalia|J4\s*Energy)\b/i,
    why: 'terzo/prospect citato: clienti citabili solo AGESP e MakaNi, e solo con consenso scritto',
  },
  {
    re: /\bCSRD\b/i,
    why: 'post-Omnibus I la CSRD obbligatoria copre una platea ristretta: non usarla come leva',
  },
  {
    re: /\bCTO\b/i,
    why: 'ruolo non dichiarabile: CTO full-time = post-round',
  },
  {
    re: /\bcertificat\w*\s+(da|by)\s+\w+|\baccreditat\w*\s+(da|by)\s+\w+/i,
    why: 'accreditamento di terzi: verificare titolo e autorizzazione prima di dichiararlo',
  },
];

/** Il brevetto si cita solo come depositato, finché non è concesso. */
const PATENT_OK = /brevetto depositato|patent application filed|patent filed/i;
const PATENT_ANY = /brevett\w*|\bpatent\w*/i;

/** Limiti di docs/PIPELINE_AGENT.md §"Vincoli di durata". */
const VO_WORD_LIMITS = {
  hook: 13,
  problem: 21,
  stack: 31,
  space: 28,
  twin: 23,
  whyNow: 23,
  cta: 14,
};

const words = (text) => text.trim().split(/\s+/).filter(Boolean).length;

/** Tutte le stringhe del contenuto, con il percorso in cui si trovano. */
const walk = (node, path = '') => {
  if (typeof node === 'string') return [[path, node]];
  if (Array.isArray(node)) return node.flatMap((v, i) => walk(v, `${path}[${i}]`));
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([k, v]) => walk(v, path ? `${path}.${k}` : k));
  }
  return [];
};

const checkContent = (content) => {
  const locale = content.meta.locale;
  const strings = walk(content).filter(([path]) => !path.startsWith('meta.'));

  for (const [path, text] of strings) {
    for (const {re, why} of FORBIDDEN) {
      const match = text.match(re);
      if (match) add(errors, locale, path, `"${match[0]}" → ${why}`);
    }
    if (PATENT_ANY.test(text) && !PATENT_OK.test(text)) {
      add(errors, locale, path, 'il brevetto va citato come "depositato" fino alla concessione');
    }
  }

  // Riga di stato: TRL sdoppiato + brevetto depositato, sempre presenti.
  const status = content.whyNow.statusLine;
  if (!/B\.R\.A\.I\.N\./.test(status) || !PATENT_OK.test(status)) {
    add(errors, locale, 'whyNow.statusLine', 'manca "B.R.A.I.N. … brevetto depositato UIBM"');
  }
  if (!/TRL\s*3/.test(status) || !/TRL\s*4/.test(status)) {
    add(errors, locale, 'whyNow.statusLine', 'manca "CarbonSense: TRL 3 in consolidamento verso TRL 4"');
  }

  // Vincoli di durata del voiceover.
  for (const [scene, limit] of Object.entries(VO_WORD_LIMITS)) {
    const count = words(content.vo[scene]);
    if (count > limit) {
      add(errors, locale, `vo.${scene}`, `${count} parole contro un massimo di ${limit}`);
    }
  }

  // Testate di scena: senza titolo si perde il contesto, con un titolo lungo si
  // perde la leggibilità.
  for (const scene of ['problem', 'stack', 'space', 'twin', 'whyNow']) {
    const heading = content[scene].heading;
    if (!heading?.title || !heading?.label) {
      add(errors, locale, `${scene}.heading`, 'testata mancante: etichetta + titolo');
      continue;
    }
    if (words(heading.label) > 6) {
      add(errors, locale, `${scene}.heading.label`, `${words(heading.label)} parole (max 6)`);
    }
    if (words(heading.title) > 9) {
      add(errors, locale, `${scene}.heading.title`, `${words(heading.title)} parole (max 9)`);
    }
  }

  // Le figure che somigliano a un grafico vanno dichiarate come schemi.
  if (!content.meta.figureNote) {
    add(errors, locale, 'meta.figureNote', 'nota mancante sulle figure schematiche');
  }

  // Limiti del testo a schermo (leggibilità in autoplay muto).
  content.problem.bullets.forEach((bullet, i) => {
    if (words(bullet) > 13) add(errors, locale, `problem.bullets[${i}]`, `${words(bullet)} parole (max 13)`);
  });
  if (content.problem.bullets.length > 4) {
    add(errors, locale, 'problem.bullets', 'più di 4 bullet: la scena dura 8 secondi');
  }
  content.stack.steps.forEach((step, i) => {
    if (words(step.detail) > 14) add(errors, locale, `stack.steps[${i}].detail`, `${words(step.detail)} parole (max 14)`);
  });
  if (content.stack.steps.length !== 5) {
    add(errors, locale, 'stack.steps', 'lo stampo prevede 5 passaggi, suolo → registry');
  }
  content.space.rows.forEach((row, i) => {
    if (words(row.text) > 14) add(errors, locale, `space.rows[${i}].text`, `${words(row.text)} parole (max 14)`);
  });
  content.twin.cards.forEach((card, i) => {
    if (words(card.title) > 6) add(errors, locale, `twin.cards[${i}].title`, `${words(card.title)} parole (max 6)`);
  });
  content.whyNow.cards.forEach((card, i) => {
    if (card.text && words(card.text) > 14) {
      add(errors, locale, `whyNow.cards[${i}].text`, `${words(card.text)} parole (max 14)`);
    }
  });

  // Gate compliance: warning qui, blocco in render-all.mjs.
  if (!content.meta.approvedBy) {
    add(warnings, locale, 'meta.approvedBy', 'non compilato: bozza non pubblicabile');
  }
};

for (const content of [it, en]) checkContent(content);

const label = (n, singular, plural) => `${n} ${n === 1 ? singular : plural}`;

if (warnings.length) {
  console.log(`\n${label(warnings.length, 'warning', 'warning')}:`);
  for (const w of warnings) console.log(`  ! ${w}`);
}

if (errors.length) {
  console.log(`\n${label(errors.length, 'errore', 'errori')}:`);
  for (const e of errors) console.log(`  ✗ ${e}`);
  console.log(
    '\nUn claim scartato NON va riscritto in modo creativo: si rimuove e si annota\nin docs/COMPLIANCE_DELTA.md con la motivazione.\n',
  );
  process.exit(1);
}

console.log('\n✓ guardrail superati sui contenuti IT e EN.');
console.log('  Il controllo è meccanico: il gate compliance resta necessario (README §6).\n');
