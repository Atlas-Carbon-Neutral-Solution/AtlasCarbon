/**
 * Contratto dati ↔ grafica.
 * Per un nuovo spot si scrive un nuovo file di contenuti conforme a questo
 * tipo: i componenti grafici non vanno toccati (vedi docs/PIPELINE_AGENT.md).
 *
 * I limiti indicati nei commenti sono quelli della tabella "Vincoli di durata"
 * in docs/PIPELINE_AGENT.md e sono verificati da `npm run check:claims`.
 */

export type SceneKey =
  | 'hook'
  | 'problem'
  | 'stack'
  | 'space'
  | 'twin'
  | 'whyNow'
  | 'cta';

/**
 * Testata di scena: l'etichetta numerata dà il posto nella narrazione, il
 * titolo dà il contesto. Sono i titoli delle slide del deck, riportati nel
 * video: senza, lo spettatore legge una lista senza sapere di cosa parla.
 */
export type Heading = {
  /** ≤ 6 parole, in maiuscoletto. */
  label: string;
  /** ≤ 9 parole. */
  title: string;
};

export type Meta = {
  /** Codice interno del file di contenuti. */
  id: string;
  locale: 'it' | 'en';
  /** Documento sorgente da cui è stato estratto il testo. */
  source: string;
  /** Uso previsto: determina il livello di esposizione accettabile. */
  audience: string;
  /**
   * Gate compliance. Deve restare `null` finché una persona non ha approvato
   * la versione: `scripts/render-all.mjs` rifiuta il render pubblico se è nullo.
   */
  approvedBy: string | null;
  approvedOn: string | null;
  version: string;
  /**
   * Nota mostrata sotto le figure che somigliano a un grafico: dichiara che
   * sono schemi, non misure. Vedi `src/components/figures.tsx`.
   */
  figureNote: string;
};

export type Step = {
  /** Numero di passaggio, es. "01". */
  index: string;
  label: string;
  /** ≤ 14 parole. */
  detail: string;
};

export type TaggedRow = {
  /** Etichetta tecnica, es. "Sentinel-1 SAR". */
  tag: string;
  /** ≤ 14 parole. */
  text: string;
};

export type Card = {
  title: string;
  /** ≤ 14 parole; omesso nelle card brevi. */
  text?: string;
};

export type AdContent = {
  meta: Meta;
  /** Testo del voiceover per scena: usato per sottotitoli e incisione VO. */
  vo: Record<SceneKey, string>;
  hook: {
    kicker: string;
    /** Massimo 2 righe brevi. */
    lines: [string, string];
  };
  problem: {
    heading: Heading;
    /** 4 bullet, ≤ 13 parole ciascuno. */
    bullets: string[];
    key: string;
  };
  stack: {
    heading: Heading;
    /** 5 passaggi: suolo → registry. */
    steps: Step[];
  };
  space: {
    heading: Heading;
    rows: TaggedRow[];
    payoff: string;
  };
  twin: {
    heading: Heading;
    /** 4 card ≤ 6 parole. */
    cards: Card[];
    output: string;
  };
  whyNow: {
    heading: Heading;
    /** 3 card ≤ 14 parole. */
    cards: Card[];
    /**
     * Riga di stato obbligatoria: TRL sdoppiato + "brevetto depositato".
     * Non è decorativa, è ciò che tiene lo spot dentro il perimetro
     * dichiarabile (docs/ATL_MKT_CarbonSense_Script60_v1.md §6).
     */
    statusLine: string;
  };
  cta: {
    claim: string;
    site: string;
    email: string;
    /** Solo accreditamenti verificati; nessun logo di terzi. */
    badges: string[];
    legal: string;
  };
};

/** Props di ogni scena: i contenuti e, quando serve, il marchio da `public/`. */
export type SceneProps = {
  content: AdContent;
  logo?: string | null;
};
