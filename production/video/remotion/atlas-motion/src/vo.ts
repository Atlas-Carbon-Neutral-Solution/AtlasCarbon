// Testo VO (§6.2) suddiviso in battute agganciate agli stacchi interni di ogni
// scena.
//
// Perché non un blocco unico per scena: con un solo blocco il testo di SC05
// restava immobile per sedici secondi e quello di SC07 per quattordici, mentre
// sotto l'immagine cambiava inquadratura due volte. Le battute entrano ed escono
// sugli stacchi, così la tipografia si muove insieme al montaggio.
//
// Vincolo §7.3 (massimo due righe per cartello): ogni battuta ne ha al più due.
// I blocchi precedenti da tre righe non lo rispettavano.
//
// Le parole sono quelle dello script, nell'ordine dello script: le battute
// ridistribuiscono il testo nel tempo, non lo riscrivono.
//
// La tabella vive in `vo-cues.json` perché è la SORGENTE UNICA usata sia dalle
// scene sia dal generatore dei sottotitoli (`scripts/make_srt.mjs`): testo a
// schermo e file SRT non possono divergere.
import cues from "./vo-cues.json";

export type Cue = {
  /** testo della battuta; "\n" separa le righe (massimo due) */
  text: string;
  /** frame di ingresso, relativo all'inizio della scena */
  from: number;
  /** frame di uscita, relativo all'inizio della scena */
  to: number;
};

// SC09 non compare: la sua riga di VO («Atlas. [PAYOFF V04]») e' resa
// visivamente dall'endcard, col logo e col payoff, non da una didascalia.
export type SceneKey = "SC01" | "SC02" | "SC03" | "SC04" | "SC05" | "SC06" | "SC07" | "SC08";

export const SCENE_FRAMES = cues.sceneFrames as Record<SceneKey, number>;
export const SCENE_START = cues.sceneStart as Record<SceneKey, number>;
export const VO = cues.cues as Record<SceneKey, Cue[]>;

/** Testo completo di una scena, per verificare che le battute non alterino il VO. */
export function voFullText(scene: SceneKey): string {
  return VO[scene].map((c) => c.text.replace(/\n/g, " ")).join(" ");
}
