import { OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { OpenCaption, SceneShell, easeInOut } from "../shared";

// SC04 — Il costo dell'approssimazione (§5, TC 00:24-00:32, 8s @ 25fps = 200 frame)
//
// Ripresa 3D reale renderizzata in Blender (EEVEE): interno impianto di notte.
// Prima il contatore elettrico con le cifre che avanzano (testo 3D emissivo
// reale), poi una valvola che perde vapore in un angolo buio, illuminata da una
// torcia in movimento.
// Sorgente: production/video/blender/sc04_plant.py

const VO = "Chi stima invece di misurare paga due volte.\nPaga l'energia che spreca, e il carbonio\nche non sa di emettere.";

export const SC04_Approssimazione: React.FC = () => {
  const frame = useCurrentFrame();
  const captionIn = easeInOut(frame, 15, 12);

  return (
    <SceneShell bg="#050607">
      <OffthreadVideo
        src={staticFile("video/sc04-plant.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <OpenCaption text={VO} opacity={captionIn} />
    </SceneShell>
  );
};
