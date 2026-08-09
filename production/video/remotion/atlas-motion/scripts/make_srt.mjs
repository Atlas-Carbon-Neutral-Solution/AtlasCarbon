// Genera atlas_master_90.srt dalla stessa tabella di battute usata dal video
// (src/vo-cues.json), così sottotitoli e testo a schermo non possono divergere.
//
// Verifica inoltre che le battute di ogni scena, ricomposte, riproducano il testo
// VO del §6.2 LEGGENDOLO DALLO SCRIPT, non da una copia incollata qui: è l'unico
// modo perché la verifica resti valida se lo script cambia. Le battute
// ridistribuiscono il testo nel tempo, non lo riscrivono. Se la verifica
// fallisce, lo script esce con errore invece di scrivere sottotitoli sbagliati.
//
// SC09 non ha didascalia: la sua riga di VO è «Atlas. [PAYOFF V04]», che
// l'endcard rende visivamente col logo e col payoff.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SCRIPT = resolve(here, "../../../script-video-pubblicitario-v1.0.md");
const CUES = resolve(here, "../src/vo-cues.json");
const OUT = resolve(here, "../../../atlas_master_90.srt");
const FPS = 25;

const norm = (s) => s.replace(/\s+/g, " ").trim();

// --- estrae il blocco VO §6.2 dallo script
const md = readFileSync(SCRIPT, "utf8");
const sectionAt = md.indexOf("### 6.2");
if (sectionAt < 0) throw new Error("§6.2 non trovato nello script");
const fenceStart = md.indexOf("```", sectionAt);
const fenceEnd = md.indexOf("```", fenceStart + 3);
if (fenceStart < 0 || fenceEnd < 0) throw new Error("blocco VO §6.2 non delimitato");
const voLines = md
  .slice(fenceStart + 3, fenceEnd)
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean);

const SCENES = ["SC01", "SC02", "SC03", "SC04", "SC05", "SC06", "SC07", "SC08", "SC09"];
if (voLines.length !== SCENES.length) {
  throw new Error(`§6.2 ha ${voLines.length} righe, attese ${SCENES.length} (una per scena)`);
}
const reference = Object.fromEntries(SCENES.map((s, i) => [s, voLines[i]]));

// --- controlli sulle battute
const data = JSON.parse(readFileSync(CUES, "utf8"));
let failed = false;

for (const scene of SCENES) {
  if (scene === "SC09") continue; // resa dall'endcard, non da una didascalia
  const cues = data.cues[scene];
  if (!cues) {
    console.error(`${scene}: nessuna battuta, ma il §6.2 ne prevede il testo`);
    failed = true;
    continue;
  }
  const joined = norm(cues.map((c) => c.text.replace(/\n/g, " ")).join(" "));
  const want = norm(reference[scene]);
  if (joined !== want) {
    failed = true;
    console.error(`${scene}: le battute non riproducono il VO del §6.2`);
    console.error(`  script:  ${want}`);
    console.error(`  battute: ${joined}`);
  }
  let prevTo = -1;
  for (const c of cues) {
    const lines = c.text.split("\n").length;
    if (lines > 2) {
      failed = true;
      console.error(`${scene}: una battuta ha ${lines} righe, il massimo del §7.3 è 2`);
    }
    if (c.to > data.sceneFrames[scene]) {
      failed = true;
      console.error(`${scene}: battuta oltre la fine della scena (${c.to} > ${data.sceneFrames[scene]})`);
    }
    if (c.from <= prevTo) {
      failed = true;
      console.error(`${scene}: battute sovrapposte al frame ${c.from}`);
    }
    prevTo = c.to;
  }
}
if (failed) process.exit(1);

// --- SRT
const ts = (frames) => {
  const total = frames / FPS;
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(Math.floor(total % 60)).padStart(2, "0");
  const ms = String(Math.round((total % 1) * 1000)).padStart(3, "0");
  return `${h}:${m}:${s},${ms}`;
};

const entries = [];
for (const scene of SCENES) {
  if (scene === "SC09") continue;
  for (const c of data.cues[scene]) {
    entries.push({
      from: data.sceneStart[scene] + c.from,
      to: data.sceneStart[scene] + c.to,
      text: c.text,
    });
  }
}
entries.sort((a, b) => a.from - b.from);

writeFileSync(
  OUT,
  entries.map((e, i) => `${i + 1}\n${ts(e.from)} --> ${ts(e.to)}\n${e.text}\n`).join("\n"),
  "utf8"
);
console.log(`SRT scritto: ${OUT} — ${entries.length} battute, VO verificato contro il §6.2 dello script`);
