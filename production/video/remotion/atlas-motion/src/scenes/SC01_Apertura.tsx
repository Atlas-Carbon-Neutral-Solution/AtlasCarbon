import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BG, OpenCaption, easeInOut } from "../shared";

// SC01 — L'apertura che nega il settore (§5, TC 00:00-00:07, 7s @ 25fps = 175 frame)
//
// Nessuna ripresa reale possibile in questo ambiente (nessuna camera, nessun talent,
// nessun generatore text-to-video connesso): rappresentazione astratta dell'azione
// descritta (un fascicolo patinato che si chiude di scatto), senza dati riconoscibili
// a schermo, come richiesto dallo script stesso ("nessun testo leggibile").

const VO = "Oggi ogni azienda ha un bilancio di sostenibilità.";

export const SC01_Apertura: React.FC = () => {
  const frame = useCurrentFrame();

  // il "fascicolo" si chiude di scatto verso la fine della scena
  const snapFrame = 140;
  const closed = frame >= snapFrame;
  const snapProgress = easeInOut(frame, snapFrame, 4);
  const foldScaleY = 1 - snapProgress * 0.94;

  const captionIn = easeInOut(frame, 20, 9);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: 640,
          height: 420,
          backgroundColor: "#dfe1e3",
          borderRadius: 4,
          transform: `scaleY(${foldScaleY})`,
          transformOrigin: "top",
          boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
          overflow: "hidden",
          filter: closed ? "none" : "blur(0.4px)",
        }}
      >
        <div style={{ padding: 42, opacity: 0.5 }}>
          {/* grafici a torta grigi, fuori fuoco, nessun testo leggibile — §5/§2.2 */}
          <div style={{ display: "flex", gap: 36 }}>
            <PieGhost />
            <PieGhost reverse />
          </div>
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 10 }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ height: 6, width: `${80 - i * 12}%`, backgroundColor: "#b9bcc0", borderRadius: 3 }} />
            ))}
          </div>
        </div>
      </div>

      <OpenCaption text={VO} opacity={captionIn * (closed ? 1 - snapProgress : 1)} />
    </AbsoluteFill>
  );
};

const PieGhost: React.FC<{ reverse?: boolean }> = ({ reverse }) => (
  <div
    style={{
      width: 96,
      height: 96,
      borderRadius: "50%",
      background: `conic-gradient(#9aa0a6 0deg ${reverse ? 210 : 140}deg, #c4c7ca ${reverse ? 210 : 140}deg 360deg)`,
      filter: "blur(3px)",
    }}
  />
);
