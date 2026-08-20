#!/usr/bin/env node
/**
 * Prepara un marchio consegnato come PNG su fondo bianco.
 *
 * Ritaglia i margini, rende trasparente il bianco e ricostruisce i bordi
 * antialiasati sul colore di brand, così il marchio sta su fondo scuro senza
 * alone. Stampa anche i colori campionati: sono i valori esatti del brand, non
 * più stimati a occhio.
 *
 * Uso:  node scripts/prepare-logo.mjs <input.png> [--out=public/logo-atlas.png]
 *       node scripts/prepare-logo.mjs <input.png> --colors    (solo campionamento)
 *
 * Un SVG originale resta preferibile: qui si parte da pixel, quindi la
 * risoluzione è quella del file consegnato.
 */

import {deflateSync, inflateSync} from 'node:zlib';
import {readFileSync, writeFileSync} from 'node:fs';

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith('--'));
const out = args.find((a) => a.startsWith('--out='))?.slice(6) ?? 'public/logo-atlas.png';
const colorsOnly = args.includes('--colors');

if (!input) {
  console.error('Uso: node scripts/prepare-logo.mjs <input.png> [--out=...] [--colors]');
  process.exit(1);
}

/* ---------------------------------- PNG ---------------------------------- */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

const decodePng = (buf) => {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('Non è un PNG.');
  let off = 8;
  let width = 0;
  let height = 0;
  let colorType = 0;
  const idat = [];

  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8) throw new Error('Servono 8 bit per canale.');
      colorType = data[9];
      if (data[12] !== 0) throw new Error('PNG interlacciato non gestito.');
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      break;
    }
    off += 12 + len;
  }

  const channels = {0: 1, 2: 3, 4: 2, 6: 4}[colorType];
  if (!channels) throw new Error(`Tipo di colore ${colorType} non gestito.`);

  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const pixels = Buffer.alloc(width * height * 4);
  const line = Buffer.alloc(stride);
  const prev = Buffer.alloc(stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    raw.copy(line, 0, y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);

    for (let i = 0; i < stride; i++) {
      const a = i >= channels ? line[i - channels] : 0;
      const b = prev[i];
      const c = i >= channels ? prev[i - channels] : 0;
      if (filter === 1) line[i] = (line[i] + a) & 0xff;
      else if (filter === 2) line[i] = (line[i] + b) & 0xff;
      else if (filter === 3) line[i] = (line[i] + ((a + b) >> 1)) & 0xff;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        line[i] = (line[i] + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xff;
      }
    }

    for (let x = 0; x < width; x++) {
      const s = x * channels;
      const d = (y * width + x) * 4;
      if (channels === 1 || channels === 2) {
        pixels[d] = pixels[d + 1] = pixels[d + 2] = line[s];
        pixels[d + 3] = channels === 2 ? line[s + 1] : 255;
      } else {
        pixels[d] = line[s];
        pixels[d + 1] = line[s + 1];
        pixels[d + 2] = line[s + 2];
        pixels[d + 3] = channels === 4 ? line[s + 3] : 255;
      }
    }
    line.copy(prev);
  }

  return {width, height, pixels};
};

const encodePng = (width, height, pixels) => {
  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filtro "none": il peso non conta, il file è piccolo
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  const chunk = (type, data) => {
    const head = Buffer.alloc(8);
    head.writeUInt32BE(data.length, 0);
    head.write(type, 4, 'ascii');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([Buffer.from(type, 'ascii'), data])), 0);
    return Buffer.concat([head, data, crc]);
  };

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, {level: 9})),
    chunk('IEND', Buffer.alloc(0)),
  ]);
};

/* --------------------------------- lavoro -------------------------------- */

const hex = (r, g, b) => '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0').toUpperCase()).join('');
const {width, height, pixels} = decodePng(readFileSync(input));

// Colori di brand: i più frequenti fra i pixel saturi, uno per tinta.
const histogram = new Map();
for (let i = 0; i < width * height; i++) {
  const r = pixels[i * 4];
  const g = pixels[i * 4 + 1];
  const b = pixels[i * 4 + 2];
  if (pixels[i * 4 + 3] < 128) continue;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max - min < 40 || max > 250) continue;
  const key = `${r >> 2 << 2},${g >> 2 << 2},${b >> 2 << 2}`;
  histogram.set(key, (histogram.get(key) ?? 0) + 1);
}

const ranked = [...histogram.entries()]
  .sort((a, b) => b[1] - a[1])
  .map(([key, count]) => {
    const [r, g, b] = key.split(',').map(Number);
    return {r, g, b, count, blueish: b > g};
  });

const brandColors = [];
for (const color of ranked) {
  if (brandColors.some((c) => c.blueish === color.blueish)) continue;
  brandColors.push(color);
  if (brandColors.length === 2) break;
}

console.log(`Sorgente: ${input} (${width}×${height})`);
for (const c of brandColors) {
  console.log(`  ${c.blueish ? 'blu  ' : 'verde'} ${hex(c.r, c.g, c.b)}  (${c.count} px)`);
}
if (colorsOnly) process.exit(0);

/**
 * Alpha per proiezione: un pixel antialiasato su bianco è
 * osservato = a·C + (1−a)·255, quindi a si ricava esattamente. Così i bordi
 * restano puliti su fondo scuro invece di lasciare un alone bianco.
 */
const alphaFor = (r, g, b) => {
  if (r > 247 && g > 247 && b > 247) return null;
  const target = brandColors.reduce((best, c) => {
    const d = (c.r - r) ** 2 + (c.g - g) ** 2 + (c.b - b) ** 2;
    return d < best.d ? {c, d} : best;
  }, {c: brandColors[0], d: Infinity}).c;

  let num = 0;
  let den = 0;
  for (const [obs, col] of [[r, target.r], [g, target.g], [b, target.b]]) {
    num += (255 - obs) * (255 - col);
    den += (255 - col) ** 2;
  }
  const a = den > 0 ? Math.max(0, Math.min(1, num / den)) : 1;
  return {a, target};
};

const rebuilt = Buffer.alloc(width * height * 4);
let minX = width;
let minY = height;
let maxX = -1;
let maxY = -1;

for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    const result = alphaFor(pixels[i], pixels[i + 1], pixels[i + 2]);
    if (!result || result.a < 0.02) continue;
    rebuilt[i] = result.target.r;
    rebuilt[i + 1] = result.target.g;
    rebuilt[i + 2] = result.target.b;
    rebuilt[i + 3] = Math.round(result.a * 255);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
}

if (maxX < 0) {
  console.error('Nessun contenuto trovato: il file è bianco?');
  process.exit(1);
}

const cropW = maxX - minX + 1;
const cropH = maxY - minY + 1;
const cropped = Buffer.alloc(cropW * cropH * 4);
for (let y = 0; y < cropH; y++) {
  rebuilt.copy(
    cropped,
    y * cropW * 4,
    ((y + minY) * width + minX) * 4,
    ((y + minY) * width + minX + cropW) * 4,
  );
}

writeFileSync(out, encodePng(cropW, cropH, cropped));
console.log(`Scritto ${out} — ${cropW}×${cropH}, sfondo trasparente, margini ritagliati.`);
console.log('Se i colori sopra non coincidono con il brand book, aggiornare src/theme.ts.');
