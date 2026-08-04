import { staticFile } from "remotion";
import { CineVideo, SceneShell, TimedCaption } from "../shared";
import { VO } from "../vo";

// SC04 — Il costo dell'approssimazione (§5, TC 00:24-00:32, 8s @ 25fps = 200 frame)
// Ripresa 3D reale (Blender/EEVEE): interno impianto di notte, contatore con
// cifre 3D emissive, poi valvola che perde vapore sotto una torcia in movimento.
// Sorgente: production/video/blender/sc04_plant.py


export const SC04_Approssimazione: React.FC = () => {
  return (
    <SceneShell bg="#050607">
      <CineVideo src={staticFile("video/sc04-plant.mp4")} halation={0.2} brightness={1.28} contrast={1.14} />
      <TimedCaption cues={VO.SC04} />
    </SceneShell>
  );
};
