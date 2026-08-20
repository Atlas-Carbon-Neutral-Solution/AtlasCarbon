#!/usr/bin/env node
/**
 * Genera la traccia musicale dello spot.
 *
 * Perché generarla invece di comprarla: una traccia di libreria va licenziata,
 * archiviata e ri-verificata ogni volta che il video finisce in un materiale
 * grant/ESA. Questa è prodotta qui, quindi è di Atlas e non ha licenze di terzi
 * da dimostrare (docs/COMPLIANCE_DELTA.md, punti aperti).
 *
 * Impianto sonoro: bordone in La minore, pad che respira, battito lento e un
 * accento su ogni stacco di scena della TIMELINE. Volutamente sottotono: sopra
 * ci va il voiceover.
 *
 * Uso:  node scripts/make-music.mjs [--seconds=60] [--out=public/music-atlas-ambient.mp3]
 */

import {spawnSync} from 'node:child_process';
import {mkdirSync, unlinkSync, writeFileSync} from 'node:fs';
import {dirname} from 'node:path';

const args = process.argv.slice(2);
const value = (name, fallback) =>
  args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? fallback;

const SECONDS = Number(value('seconds', 60));
const OUT = value('out', 'public/music-atlas-ambient.mp3');
const RATE = 44100;
const FPS = 30;

/** Stacchi di scena: gli stessi frame della TIMELINE in src/CarbonSenseAd.tsx. */
const SCENE_CUTS = [0, 150, 390, 750, 1080, 1350, 1620].map((frame) => frame / FPS);

const TAU = Math.PI * 2;
const total = Math.round(SECONDS * RATE);
const left = new Float64Array(total);
const right = new Float64Array(total);

/** La minore: bordone, quinta, ottava, più la terza che entra a metà. */
const DRONE = [
  {hz: 110.0, gain: 0.5, pan: 0.0},
  {hz: 164.81, gain: 0.28, pan: -0.35},
  {hz: 220.0, gain: 0.2, pan: 0.35},
  {hz: 329.63, gain: 0.12, pan: 0.15, from: 24},
];

const softClip = (x) => Math.tanh(x * 1.2) / 1.2;

for (let i = 0; i < total; i++) {
  const t = i / RATE;
  let sampleL = 0;
  let sampleR = 0;

  // Bordone con leggero battimento: due oscillatori scordati per voce.
  for (const voice of DRONE) {
    if (voice.from && t < voice.from) continue;
    const entry = voice.from ? Math.min((t - voice.from) / 6, 1) : 1;
    const breathe = 0.82 + 0.18 * Math.sin(TAU * 0.055 * t + voice.hz);
    const a = Math.sin(TAU * voice.hz * t);
    const b = Math.sin(TAU * (voice.hz * 1.0016) * t + 0.6);
    const v = (a * 0.6 + b * 0.4) * voice.gain * breathe * entry;
    sampleL += v * (1 - Math.max(voice.pan, 0));
    sampleR += v * (1 + Math.min(voice.pan, 0));
  }

  // Pad: armoniche superiori tenute basse, danno aria senza sporcare la voce.
  const padEnv = 0.5 + 0.5 * Math.sin(TAU * 0.03 * t - 1.2);
  for (const [mult, gain] of [[3, 0.05], [4, 0.035], [6, 0.02]]) {
    const v = Math.sin(TAU * 110 * mult * t + mult) * gain * padEnv;
    sampleL += v * 0.9;
    sampleR += v;
  }

  // Battito lento: un impulso ogni due secondi, in crescendo verso la chiusura.
  const beatPhase = (t % 2) / 2;
  const beatEnv = Math.exp(-beatPhase * 26);
  const drive = 0.55 + 0.45 * (t / SECONDS);
  const beat = Math.sin(TAU * 54 * t) * beatEnv * 0.32 * drive;
  sampleL += beat;
  sampleR += beat;

  // Accento su ogni stacco di scena: lega la musica al montaggio.
  for (const cut of SECONDS >= 60 ? SCENE_CUTS : []) {
    const dt = t - cut;
    if (dt < 0 || dt > 2.6) continue;
    const env = Math.exp(-dt * 2.4) * 0.16;
    const bell =
      Math.sin(TAU * 440 * dt) * 0.6 + Math.sin(TAU * 660 * dt) * 0.3 + Math.sin(TAU * 880 * dt) * 0.1;
    sampleL += bell * env * 0.9;
    sampleR += bell * env;
  }

  // Dissolvenze: mezzo secondo in ingresso, due secondi in uscita.
  const fadeIn = Math.min(t / 0.5, 1);
  const fadeOut = Math.min((SECONDS - t) / 2, 1);
  const fade = Math.max(Math.min(fadeIn, fadeOut), 0);

  left[i] = softClip(sampleL * 0.22) * fade;
  right[i] = softClip(sampleR * 0.22) * fade;
}

// Normalizzazione a -14 dBFS di picco: headroom per il voiceover.
let peak = 0;
for (let i = 0; i < total; i++) {
  peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
}
const target = Math.pow(10, -14 / 20);
const gain = peak > 0 ? target / peak : 1;

const buffer = Buffer.alloc(44 + total * 4);
buffer.write('RIFF', 0, 'ascii');
buffer.writeUInt32LE(36 + total * 4, 4);
buffer.write('WAVEfmt ', 8, 'ascii');
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20); // PCM
buffer.writeUInt16LE(2, 22); // stereo
buffer.writeUInt32LE(RATE, 24);
buffer.writeUInt32LE(RATE * 4, 28);
buffer.writeUInt16LE(4, 32);
buffer.writeUInt16LE(16, 34);
buffer.write('data', 36, 'ascii');
buffer.writeUInt32LE(total * 4, 40);

for (let i = 0; i < total; i++) {
  const l = Math.max(-1, Math.min(1, left[i] * gain));
  const r = Math.max(-1, Math.min(1, right[i] * gain));
  buffer.writeInt16LE(Math.round(l * 32767), 44 + i * 4);
  buffer.writeInt16LE(Math.round(r * 32767), 46 + i * 4);
}

mkdirSync(dirname(OUT), {recursive: true});
const wav = OUT.replace(/\.mp3$/, '.wav');
writeFileSync(wav, buffer);

if (!OUT.endsWith('.mp3')) {
  console.log(`Traccia scritta: ${wav} (${SECONDS}s)`);
  process.exit(0);
}

// ffmpeg è già nel pacchetto Remotion: nessuna dipendenza in più.
const FFMPEG = 'node_modules/@remotion/compositor-linux-x64-gnu/ffmpeg';
const result = spawnSync(FFMPEG, ['-y', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '128k', OUT], {
  stdio: ['ignore', 'ignore', 'pipe'],
});

if (result.status === 0) {
  unlinkSync(wav);
  console.log(`Traccia scritta: ${OUT} (${SECONDS}s, -14 dBFS di picco)`);
} else {
  console.log(`ffmpeg non disponibile o senza libmp3lame: resta il WAV ${wav}`);
  console.log(String(result.stderr ?? '').split('\n').slice(-3).join('\n'));
}
