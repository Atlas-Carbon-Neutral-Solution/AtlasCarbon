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
    /** 4 bullet, ≤ 13 parole ciascuno. */
    bullets: string[];
    key: string;
  };
  stack: {
    title: string;
    /** 5 passaggi: suolo → registry. */
    steps: Step[];
  };
  space: {
    title: string;
    rows: TaggedRow[];
    payoff: string;
  };
  twin: {
    title: string;
    /** 4 card ≤ 6 parole. */
    cards: Card[];
    output: string;
  };
  whyNow: {
    title: string;
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
