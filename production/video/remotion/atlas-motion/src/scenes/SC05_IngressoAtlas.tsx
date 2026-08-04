import { Series, staticFile, useCurrentFrame } from "remotion";
import { CineVideo, OpenCaption, SceneShell, easeInOut } from "../shared";

// SC05 — Ingresso Atlas, perno non tagliabile (§5, TC 00:32-00:48, 16s = 400 frame)
//
// Tre movimenti, tutti girati in 3D (Blender/EEVEE), montati in <Series> con
// durate che sommano ESATTAMENTE a 400: nessun clip può finire prima della
// sequenza che lo ospita. La versione precedente lasciava un clip di 150 frame
// dentro una scena di 400 e `OffthreadVideo` congelava l'ultimo fotogramma per
// dieci secondi — il difetto segnalato come "il 3D che si blocca sul niente".
//
//   1  125 frame  sensore fascettato su tubazione, LED di stato, stacco di fuoco
//                 (sc05a_sensor.py)
//   2  150 frame  satellite di osservazione sopra il lembo di un pianeta con
//                 rilievo reale (sc05b_orbit.py) — sostituisce la sfera con
//                 anello, che leggeva come Saturno ed era estranea al messaggio
//   3  125 frame  blocchi d'acciaio che si incatenano con saldature di luce: il
//                 registro notarizzato come oggetto fisico (sc05c_ledger.py)

const VO =
  "Atlas misura. Sensori in campo. Dati satellitari.\nModelli calibrati sull'impianto reale. E un registro\nnotarizzato che nessuno può riscrivere: nemmeno noi.";

export const MOV = { SENSOR: 125, ORBIT: 150, LEDGER: 125 } as const;
export const SC05_TOTAL = MOV.SENSOR + MOV.ORBIT + MOV.LEDGER; // 400

export const SC05_IngressoAtlas: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneShell bg="#0a0c0f">
      <Series>
        <Series.Sequence durationInFrames={MOV.SENSOR}>
          <CineVideo src={staticFile("video/sc05a-sensor.mp4")} halation={0.22} drift={1} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={MOV.ORBIT}>
          <CineVideo src={staticFile("video/sc05b-orbit.mp4")} halation={0.26} contrast={1.16} saturate={0.84} />
        </Series.Sequence>
        <Series.Sequence durationInFrames={MOV.LEDGER}>
          <CineVideo src={staticFile("video/sc05c-ledger.mp4")} halation={0.24} />
        </Series.Sequence>
      </Series>
      <OpenCaption text={VO} opacity={easeInOut(frame, 10, 12)} />
    </SceneShell>
  );
};
