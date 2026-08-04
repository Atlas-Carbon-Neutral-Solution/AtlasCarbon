import { staticFile, useCurrentFrame } from "remotion";
import { CineVideo, OpenCaption, SceneShell, easeInOut } from "../shared";

// SC04 — Il costo dell'approssimazione (§5, TC 00:24-00:32, 8s @ 25fps = 200 frame)
// Ripresa 3D reale (Blender/EEVEE): interno impianto di notte, contatore con
// cifre 3D emissive, poi valvola che perde vapore sotto una torcia in movimento.
// Sorgente: production/video/blender/sc04_plant.py

const VO = "Chi stima invece di misurare paga due volte.\nPaga l'energia che spreca, e il carbonio\nche non sa di emettere.";

export const SC04_Approssimazione: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneShell bg="#050607">
      <CineVideo src={staticFile("video/sc04-plant.mp4")} halation={0.2} />
      <OpenCaption text={VO} opacity={easeInOut(frame, 14, 12)} />
    </SceneShell>
  );
};
