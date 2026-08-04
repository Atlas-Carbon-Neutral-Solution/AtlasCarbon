import { staticFile } from "remotion";
import { CineVideo, SceneShell, TimedCaption } from "../shared";
import { VO } from "../vo";

// SC06 — Efficientamento energetico (§5, TC 00:48-01:00, 12s @ 25fps = 300 frame)
//
// Ripresa 3D reale (Blender/EEVEE) al posto dell'ellisse in CSS: nodo di
// tubazioni con valvola a volantino e coibentazione in lamiera. Il taglio A/B
// che chiede lo script è letterale — la camera NON si muove fra le due
// inquadrature, cambia solo la resa termica; poi la coibentazione viene
// applicata e la mappa si uniforma.
// Sorgente: production/video/blender/sc06_thermal.py
// Falsi colori IR ambra/ciano: fuori dalla palette di marchio, che resta
// riservata agli elementi grafici (V01).


export const SC06_Efficientamento: React.FC = () => {
  return (
    <SceneShell bg="#05070a">
      <CineVideo src={staticFile("video/sc06-thermal.mp4")} halation={0.26} contrast={1.16} saturate={0.98} />
      <TimedCaption cues={VO.SC06} />
    </SceneShell>
  );
};
