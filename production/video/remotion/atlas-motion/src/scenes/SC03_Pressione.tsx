import { staticFile } from "remotion";
import { CineVideo, SceneShell, TimedCaption } from "../shared";
import { VO } from "../vo";

// SC03 — La pressione esterna (§5, TC 00:14-00:24, 10s @ 25fps = 250 frame)
// Ripresa 3D reale (Blender/EEVEE): ufficio notturno illuminato dal solo monitor,
// questionario che scorre (illeggibile per design, §2.2), stacco su scrivania.
// Sorgente: production/video/blender/sc03_office.py


export const SC03_Pressione: React.FC = () => {
  return (
    <SceneShell bg="#0a0d10">
      <CineVideo src={staticFile("video/sc03-office.mp4")} halation={0.15} drift={1} brightness={0.88} contrast={1.2} />
      <TimedCaption cues={VO.SC03} />
    </SceneShell>
  );
};
