import { staticFile, useCurrentFrame } from "remotion";
import { CineVideo, OpenCaption, SceneShell, easeInOut } from "../shared";

// SC03 — La pressione esterna (§5, TC 00:14-00:24, 10s @ 25fps = 250 frame)
// Ripresa 3D reale (Blender/EEVEE): ufficio notturno illuminato dal solo monitor,
// questionario che scorre (illeggibile per design, §2.2), stacco su scrivania.
// Sorgente: production/video/blender/sc03_office.py

const VO = "Non lo chiede più solo il regolatore.\nLo chiedono le banche, i capitolati,\ni clienti a monte della tua filiera.";

export const SC03_Pressione: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <SceneShell bg="#0a0d10">
      <CineVideo src={staticFile("video/sc03-office.mp4")} halation={0.15} drift={1} />
      <OpenCaption text={VO} opacity={easeInOut(frame, 12, 12)} />
    </SceneShell>
  );
};
