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
 * ATTENZIONE: i due valori qui sotto sono **stimati dall'immagine del marchio**.
 * Se il brand book ha i codici esatti (o le coordinate Pantone/CMYK), si
 * correggono qui e cambia tutto il progetto: nessun altro file contiene
 * esadecimali di brand.
 */
export const brand = {
  blue: '#4FA3DC',
  green: '#7AC043',
} as const;

export const palette = {
  /** Fondi: blu-verde profondo, così sposa i due colori del marchio. */
  night: '#04141A',
  nightDeep: '#020C11',
  canopy: '#0A2833',
  moss: '#123A2B',

  /** Accento primario: il blu del marchio. */
  accent: brand.blue,
  accentSoft: '#8FC9EC',

  /** Accento secondario: il verde del marchio. */
  earth: brand.green,
  earthSoft: '#A2D77A',

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
