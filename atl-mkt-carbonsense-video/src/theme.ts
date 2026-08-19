/**
 * Palette e scala tipografica dello stampo.
 * I colori sono l'unico punto in cui si tocca l'identità visiva: le scene non
 * contengono valori esadecimali.
 */
export const palette = {
  forest: '#04150F',
  forestDeep: '#010A07',
  canopy: '#0A2719',
  moss: '#123A2B',
  green: '#2FBF71',
  greenSoft: '#7BE495',
  text: '#EEF5F1',
  textMuted: 'rgba(238, 245, 241, 0.62)',
  textFaint: 'rgba(238, 245, 241, 0.38)',
  line: 'rgba(123, 228, 149, 0.22)',
  panel: 'rgba(255, 255, 255, 0.04)',
} as const;

export const font = {
  sans: 'Inter, "Helvetica Neue", Helvetica, Arial, sans-serif',
  mono: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
} as const;

/** Solo tre pesi, per tenere il registro asciutto. */
export const weight = {regular: 400, medium: 500, semibold: 600} as const;
