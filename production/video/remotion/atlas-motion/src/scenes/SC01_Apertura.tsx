import { OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { OpenCaption, SceneShell, easeInOut } from "../shared";

// SC01 — L'apertura che nega il settore (§5, TC 00:00-00:07, 7s @ 25fps = 175 frame)
//
// Ripresa 3D reale renderizzata in Blender (EEVEE): bilancio di sostenibilita'
// patinato su scrivania, luce radente, profondita' di campo ottica vera. La
// copertina si chiude di scatto sulla pagina coprendo i grafici.
// Sorgente: production/video/blender/sc01_report.py
// Nessun testo leggibile a schermo (§2.2): solo anelli/barre astratti.

const VO = "Oggi ogni azienda ha un bilancio\ndi sostenibilità.";

export const SC01_Apertura: React.FC = () => {
  const frame = useCurrentFrame();
  const captionIn = easeInOut(frame, 24, 12);

  return (
    <SceneShell bg="#07090a">
      <OffthreadVideo
        src={staticFile("video/sc01-report.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <OpenCaption text={VO} opacity={captionIn} />
    </SceneShell>
  );
};
