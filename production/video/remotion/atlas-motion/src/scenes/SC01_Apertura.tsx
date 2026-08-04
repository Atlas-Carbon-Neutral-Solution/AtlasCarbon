import { staticFile } from "remotion";
import { CineVideo, SceneShell, TimedCaption } from "../shared";
import { VO } from "../vo";

// SC01 — L'apertura che nega il settore (§5, TC 00:00-00:07, 7s @ 25fps = 175 frame)
// Ripresa 3D reale (Blender/EEVEE): bilancio patinato su scrivania, luce radente,
// copertina incernierata che si chiude di scatto sui grafici stampati.
// Sorgente: production/video/blender/sc01_report.py


export const SC01_Apertura: React.FC = () => {
  return (
    <SceneShell bg="#07090a">
      <CineVideo src={staticFile("video/sc01-report.mp4")} halation={0.2} drift={1} brightness={0.94} contrast={1.12} />
      <TimedCaption cues={VO.SC01} />
    </SceneShell>
  );
};
