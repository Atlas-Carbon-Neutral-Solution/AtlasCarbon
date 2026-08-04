import { staticFile } from "remotion";
import { CineVideo, SceneShell, TimedCaption } from "../shared";
import { VO } from "../vo";

// SC02 — Lo stacco sul reale (§5, TC 00:07-00:14, 7s @ 25fps = 175 frame)
//
// Ripresa 3D reale (Blender/EEVEE) al posto dello skyline in CSS: impianto
// industriale all'alba con torri di raffreddamento, camini, silos, parco
// serbatoi e tralicci; sole radente in controluce e foschia volumetrica.
// Due inquadrature con stacco netto: aerea in discesa, poi carrellata bassa
// fra le torri. Sorgente: production/video/blender/sc02_aerial.py
// Impianto generico: nessuna insegna, nessun logo, nessun volto (§2.1).


export const SC02_StaccoReale: React.FC = () => {
  return (
    <SceneShell bg="#0b1116">
      <CineVideo src={staticFile("video/sc02-aerial.mp4")} halation={0.22} contrast={1.14} />
      <TimedCaption cues={VO.SC02} />
    </SceneShell>
  );
};
