import { staticFile } from "remotion";
import { CineVideo, SceneShell, TimedCaption } from "../shared";
import { VO } from "../vo";

// SC07 — Decarbonizzazione e assorbimento (§5, TC 01:00-01:14, 14s @ 25fps = 350 frame)
//
// Ripresa 3D reale (Blender/EEVEE) al posto delle barre verticali in CSS:
// piantagione di bambù con culmi a nodi, chioma, lettiera, disposti in FILE
// regolari — è una coltura, non un idillio spontaneo (§5). Carrellata fra i
// culmi, macro sulla fascetta dendrometrica, gru che scopre le file.
// Sorgente: production/video/blender/sc07_bamboo.py


export const SC07_Decarbonizzazione: React.FC = () => {
  return (
    <SceneShell bg="#0a0f0a">
      <CineVideo src={staticFile("video/sc07-bamboo.mp4")} halation={0.19} saturate={0.86} />
      <TimedCaption cues={VO.SC07} />
    </SceneShell>
  );
};
