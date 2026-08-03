import { OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { OpenCaption, SceneShell, easeInOut } from "../shared";

// SC03 — La pressione esterna (§5, TC 00:14-00:24, 10s @ 25fps = 250 frame)
//
// Ripresa 3D reale renderizzata in Blender (EEVEE): interno ufficio notturno,
// luce fredda da monitor. Questionario fornitori che scorre sullo schermo
// (testo NON leggibile per design, §2.2/§5), poi stacco su inquadratura ampia
// della scrivania con calendario a muro e una data cerchiata.
// Sorgente: production/video/blender/sc03_office.py

const VO = "Non lo chiede più solo il regolatore.\nLo chiedono le banche, i capitolati,\ni clienti a monte della tua filiera.";

export const SC03_Pressione: React.FC = () => {
  const frame = useCurrentFrame();
  const captionIn = easeInOut(frame, 12, 12);

  return (
    <SceneShell bg="#0a0d10">
      <OffthreadVideo
        src={staticFile("video/sc03-office.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <OpenCaption text={VO} opacity={captionIn} />
    </SceneShell>
  );
};
