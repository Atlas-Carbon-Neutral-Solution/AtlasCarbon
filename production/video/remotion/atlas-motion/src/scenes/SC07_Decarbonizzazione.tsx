import { staticFile } from "remotion";
import { SC07_SRC } from "../footage";
import { CineVideo, SceneShell, TimedCaption } from "../shared";
import { VO } from "../vo";

// SC07 — Decarbonizzazione e assorbimento (§5, TC 01:00-01:14, 14s @ 25fps = 350 frame)
//
// Ripresa 3D reale (Blender/EEVEE) al posto delle barre verticali in CSS:
// piantagione di bambù con culmi a nodi, chioma, lettiera, disposti in FILE
// regolari — è una coltura, non un idillio spontaneo (§5). Carrellata fra i
// culmi, macro sulla fascetta dendrometrica, gru che scopre le file.
// Sorgente: production/video/blender/sc07_bamboo.py
//
// La sorgente è dichiarata in ../footage.ts, non qui: è il punto di sostituzione
// per una ripresa reale, che in questo ambiente non è scaricabile (egress negato
// dalla policy) e comunque va licenziata prima della pubblicazione.


export const SC07_Decarbonizzazione: React.FC = () => {
  return (
    <SceneShell bg="#0a0f0a">
      <CineVideo src={staticFile(SC07_SRC)} halation={0.19} saturate={0.86} />
      <TimedCaption cues={VO.SC07} />
    </SceneShell>
  );
};
