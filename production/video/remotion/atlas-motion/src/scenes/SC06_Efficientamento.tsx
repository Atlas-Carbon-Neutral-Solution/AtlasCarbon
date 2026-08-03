import { useCurrentFrame } from "remotion";
import { AZZURRO, FONT, OpenCaption, SceneShell, easeInOut } from "../shared";

// SC06 — Efficientamento energetico (§5, TC 00:48-01:00, 12s @ 25fps = 300 frame)
//
// Il taglio A/B netto (senza transizione) e' la figura retorica esplicitamente
// richiesta dallo script — qui riprodotta come frame netto tra 100 e 101, con
// mappatura IR piu' satura e leggibile.

const VO = "Dove misuri, trovi lo spreco. Dove trovi lo spreco,\ntagli il costo prima ancora dell'emissione.\nSi ripaga da sola.";

const BEFORE_END = 100;
const AFTER_END = 200;

export const SC06_Efficientamento: React.FC = () => {
  const frame = useCurrentFrame();
  const captionIn = easeInOut(frame, 15, 10);

  return (
    <SceneShell bg="#0d0f11">
      {frame < AFTER_END && <ThermalPipe hot={frame < BEFORE_END} />}
      {frame >= AFTER_END && <PanelClose frame={frame - AFTER_END} />}

      <OpenCaption text={VO} opacity={captionIn} />
    </SceneShell>
  );
};

const ThermalPipe: React.FC<{ hot: boolean }> = ({ hot }) => (
  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
    <div
      style={{
        position: "relative",
        width: 780,
        height: 240,
        borderRadius: 120,
        overflow: "hidden",
        boxShadow: "0 60px 120px rgba(0,0,0,0.6)",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, #0d2b38 0%, #1c4c5c 50%, #0d2b38 100%)" }} />
      {hot && (
        <div
          style={{
            position: "absolute",
            left: "34%",
            top: "14%",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "radial-gradient(circle, #fff3c4 0%, #f2c14e 30%, #e0673a 55%, rgba(224,103,58,0) 78%)",
          }}
        />
      )}
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 60px rgba(0,0,0,0.5)" }} />
    </div>
    <div
      style={{
        marginTop: 44,
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: 26,
        color: hot ? "#f2c14e" : AZZURRO,
        letterSpacing: 1.5,
      }}
    >
      {hot ? "Δ T  +18.4°C  —  DISPERSIONE RILEVATA" : "Δ T  +0.2°C  —  UNIFORME"}
    </div>
  </div>
);

const PanelClose: React.FC<{ frame: number }> = ({ frame }) => {
  const close = easeInOut(frame, 10, 24);
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          position: "relative",
          width: 340,
          height: 440,
          backgroundColor: "#26292d",
          borderRadius: 10,
          border: "1px solid #3a3e43",
          boxShadow: "0 60px 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: `${close * 100}%`,
            background: "linear-gradient(180deg, #16181a, #0d0f11)",
          }}
        />
      </div>
    </div>
  );
};
