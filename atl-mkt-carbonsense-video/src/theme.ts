/**
 * Palette e tipografia dello stampo.
 *
 * I due colori del marchio Atlas — il blu del lettering e il verde del simbolo —
 * sono la base di tutto il resto. Nel video hanno un ruolo diverso, non
 * decorativo:
 *   • blu  = dato, orbita, registro (ciò che valida)
 *   • verde = suolo, biomassa, misura sul campo (ciò che viene misurato)
 * Il simbolo del marchio contiene entrambi, quindi il video li usa entrambi.
 *
 * I due valori sono **campionati dal file del marchio** con
 * `node scripts/prepare-logo.mjs <file> --colors`. Se il brand book indica
 * coordinate diverse (Pantone/CMYK convertite in RGB), si correggono qui:
 * nessun altro file del progetto contiene esadecimali di brand.
 */
export const brand = {
  blue: '#4CA4D8',
  green: '#7CB844',
} as const;

export const palette = {
  /** Fondi: blu-verde profondo, così sposa i due colori del marchio. */
  night: '#04141A',
  nightDeep: '#020C11',
  canopy: '#0A2833',
  moss: '#123A2B',

  /** Accento primario: il blu del marchio. */
  accent: brand.blue,
  accentSoft: '#8CC7EA',

  /** Accento secondario: il verde del marchio. */
  earth: brand.green,
  earthSoft: '#A4D57C',

  text: '#EDF4F7',
  textMuted: 'rgba(237, 244, 247, 0.62)',
  textFaint: 'rgba(237, 244, 247, 0.38)',
  line: 'rgba(143, 201, 236, 0.22)',
  panel: 'rgba(255, 255, 255, 0.04)',
} as const;

export const font = {
  sans: 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif',
  mono: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
} as const;

/** Solo tre pesi, per tenere il registro asciutto. */
export const weight = {regular: 400, medium: 500, semibold: 600} as const;
