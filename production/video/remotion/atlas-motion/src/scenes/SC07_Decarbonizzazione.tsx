import { staticFile, useCurrentFrame } from "remotion";
import { AirParticles, DepthHaze, FocusSettle, GodRays } from "../cine-layers";
import { SC07_SRC } from "../footage";
import { CineVideo, SceneShell, TimedCaption, easeInOut } from "../shared";
import { VO } from "../vo";

// SC07 — Decarbonizzazione e assorbimento (§5, TC 01:00-01:14, 14s @ 25fps = 350 frame)
//
// La piantagione è ripresa in 3D (Blender/EEVEE): culmi rastremati con nodi,
// chioma vera, lettiera, disposti in FILE regolari — è una coltura, non un idillio
// spontaneo (§5). Carrellata nella corsia di servizio, macro sulla fascetta
// dendrometrica, gru che scopre le file.
// Sorgente: production/video/blender/sc07_bamboo.py
//
// La sorgente del filmato è dichiarata in ../footage.ts, non qui: è il punto di
// sostituzione per una ripresa reale, che in questo ambiente non è scaricabile
// (egress negato dalla policy) e comunque va licenziata prima della pubblicazione.
//
// ---------------------------------------------------------------------------
// Composito multipiano.
//
// Il piano unico era il limite dell'inquadratura: un girato 3D messo a schermo
// intero, per quanto pulito, resta una lastra. Qui sopra il girato lavorano
// quattro livelli atmosferici, ognuno agganciato all'inquadratura in corso —
// perché applicarli indistintamente sarebbe l'errore opposto: i fasci di luce
// hanno senso nel bosco e non in una macro a 135 mm, dove il fondo è già
// completamente sciolto.
//
//   A  1-150    bosco: fasci di luce, particolato, prospettiva aerea piena
//   B  151-250  macro: nessun fascio, spinta lentissima, alone caldo appena
//   C  251-350  gru: fasci più radenti man mano che la camera sale
//
// Il sole del 3D entra da destra e in basso (azimut 132°, elevazione 9°): i fasci
// sono ancorati lì, non al centro, altrimenti la luce dipinta contraddirebbe le
// ombre del render — ed è la contraddizione che fa sembrare finto un composito.

const A_END = 150;
const B_END = 250;

export const SC07_Decarbonizzazione: React.FC = () => {
  const frame = useCurrentFrame();
  const inMacro = frame > A_END && frame <= B_END;
  const inCrane = frame > B_END;

  // La macro è quasi immobile nel 3D (la camera fa mezzo metro in quattro
  // secondi): una spinta lentissima le dà il respiro che le manca, senza
  // contraddire il movimento del girato.
  const push = inMacro ? 1 + easeInOut(frame, A_END, 100) * 0.024 : 1;

  // I fasci si spengono sulla macro e tornano sulla gru, dove la camera sale
  // verso il sole e la luce si fa più radente.
  const rays = inMacro ? 0 : inCrane ? 0.55 + easeInOut(frame, B_END, 70) * 0.45 : 0.9;
  const sunY = inCrane ? 10 + easeInOut(frame, B_END, 100) * 16 : 11;

  // Grading per inquadratura, non per scena. La gru guarda attraverso tutta la
  // colonna di foschia e arriva slavata: lì serve contrasto e un recupero di
  // saturazione, non altra atmosfera. Aggiungere foschia dipinta su un piatto
  // già lattiginoso peggiorava esattamente il difetto che doveva curare.
  const grade = inCrane
    ? { contrast: 1.28, saturate: 1.08, brightness: 0.98, halation: 0.20 }
    : inMacro
      ? { contrast: 1.10, saturate: 1.00, brightness: 1.02, halation: 0.30 }
      : { contrast: 1.14, saturate: 0.98, brightness: 1.02, halation: 0.26 };

  // Sulla gru la prospettiva aerea è già nel girato: il livello dipinto scende a
  // un terzo e serve solo a tenere insieme l'alone attorno al sole.
  const haze = inCrane ? 0.22 : inMacro ? 0.35 : 0.62;

  return (
    <SceneShell bg="#0a0f0a">
      {/* Il fuoco si riassesta dopo i due stacchi interni, come farebbe un
          operatore. Sta fuori dalla spinta così la sfocatura non scala. */}
      <FocusSettle cuts={[A_END, B_END]} amount={3.6} frames={10}>
        <div style={{ position: "absolute", inset: 0, transform: `scale(${push})` }}>
          {/* saturazione più alta della prima versione: la foschia volumetrica
              del 3D porta via il verde, e una piantagione che legge kaki non
              racconta assorbimento di carbonio */}
          <CineVideo src={staticFile(SC07_SRC)} {...grade} />
        </div>
      </FocusSettle>

      <GodRays sunX={68} sunY={sunY} angle={-19} count={9} opacity={rays} breathe={1} />
      <DepthHaze sunX={68} sunY={sunY} strength={haze} floor={inCrane ? 0.04 : inMacro ? 0.06 : 0.15} />
      <AirParticles count={inMacro ? 10 : 28} seed={7} opacity={inMacro ? 0.45 : 0.9} size={inMacro ? 26 : 15} />

      <TimedCaption cues={VO.SC07} />
    </SceneShell>
  );
};
