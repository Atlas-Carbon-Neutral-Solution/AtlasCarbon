import { AbsoluteFill, useCurrentFrame } from "remotion";
import { AZZURRO, OpenCaption, easeInOut } from "../shared";

// SC06 — Efficientamento energetico (§5, TC 00:48-01:00, 12s @ 25fps = 300 frame)
//
// Il taglio A/B netto (senza transizione) e' la figura retorica esplicitamente
// richiesta dallo script ("il taglio e' secco, A/B, senza transizione... non
// spiega, dimostra") — qui riprodotta come frame netto tra frame 99 e 100.

const VO = "Dove misuri, trovi lo spreco. Dove trovi lo spreco, tagli il costo prima\nancora dell'emissione. L'efficienza energetica si ripaga da sola.";

const BEFORE_END = 100; // 4s
const AFTER_END = 200; // 4s
// resto: operatore che chiude il quadro (4s)

export const SC06_Efficientamento: React.FC = () => {
  const frame = useCurrentFrame();
  const captionIn = easeInOut(frame, 15, 9);

  return (
    <AbsoluteFill style={{ backgroundColor: "#15181b" }}>
      {frame < AFTER_END && <ThermalPipe hot={frame < BEFORE_END} />}
      {frame >= AFTER_END && <PanelClose frame={frame - AFTER_END} />}

      <OpenCaption text={VO} opacity={captionIn} />
    </AbsoluteFill>
  );
};

const ThermalPipe: React.FC<{ hot: boolean }> = ({ hot }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <div style={{ position: "relative", width: 640, height: 200, backgroundColor: "#1f2327", borderRadius: 100, overflow: "hidden" }}>
      {/* mappatura falsi colori IR, autentica (non arcobaleno cartoon) */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #1a3a4a 0%, #2c5f6e 50%, #1a3a4a 100%)" }} />
      {hot && (
        <div
          style={{
            position: "absolute",
            left: "38%",
            top: "20%",
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: "radial-gradient(circle, #f2c14e 0%, #e0673a 45%, rgba(224,103,58,0) 75%)",
          }}
        />
      )}
    </div>
    <div
      style={{
        position: "absolute",
        bottom: 90,
        fontFamily: "monospace",
        fontSize: 15,
        color: hot ? "#f2c14e" : AZZURRO,
        letterSpacing: 1,
      }}
    >
      {hot ? "ΔT +18.4°C — dispersione rilevata" : "ΔT +0.2°C — uniforme"}
    </div>
  </AbsoluteFill>
);

const PanelClose: React.FC<{ frame: number }> = ({ frame }) => {
  const close = easeInOut(frame, 10, 20);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", width: 260, height: 340, backgroundColor: "#22262a", borderRadius: 6, border: "1px solid #34383c" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: `${close * 100}%`,
            backgroundColor: "#15181b",
            borderRadius: 6,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
