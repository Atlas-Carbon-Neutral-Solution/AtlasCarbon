import { OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { AZZURRO, FONT, OpenCaption, SceneShell, easeInOut } from "../shared";

// SC05 — Ingresso Atlas, perno non tagliabile (§5, TC 00:32-00:48, 16s @ 25fps = 400 frame)
//
// Movimento 1 (0-125, 5s): sensore astratto, ora con piu' profondità/luce.
// Movimento 2 (125-275, 6s): rendering 3D reale (Blender, EEVEE).
// Movimento 3 (275-400, 5s): convergenza vettoriale 2D + OST sequenziale, tipografia
//   molto piu' grande e con un anello sigillo piu' definito.

const VO =
  "Atlas misura. Sensori in campo. Dati satellitari.\nModelli calibrati sull'impianto reale. E un registro\nnotarizzato che nessuno può riscrivere: nemmeno noi.";

const MOV1_END = 125;
const MOV2_END = 275;

export const SC05_IngressoAtlas: React.FC = () => {
  const frame = useCurrentFrame();
  const captionIn = easeInOut(frame, 10, 10);

  return (
    <SceneShell bg="#14171a">
      {frame < MOV1_END && <SensorMacro frame={frame} />}
      {frame >= MOV1_END && frame < MOV2_END && <OrbitShot frame={frame - MOV1_END} />}
      {frame >= MOV2_END && <DataConvergence frame={frame - MOV2_END} />}

      <OpenCaption text={VO} opacity={captionIn} />
    </SceneShell>
  );
};

const SensorMacro: React.FC<{ frame: number }> = ({ frame }) => {
  const pulse = 0.5 + 0.5 * Math.sin(frame / 10);
  const drift = frame * 0.15;
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", width: 420, height: 260, transform: `translateX(${drift}px)` }}>
        <div
          style={{
            position: "absolute",
            top: 108,
            left: -40,
            right: -40,
            height: 54,
            background: "linear-gradient(180deg, #4a5058, #2b3036)",
            borderRadius: 8,
            boxShadow: "0 30px 60px rgba(0,0,0,0.55)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 50,
            left: 130,
            width: 160,
            height: 160,
            backgroundColor: "#20242a",
            borderRadius: 14,
            border: "1px solid #4a5058",
            boxShadow: "0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 108,
            left: 190,
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundColor: AZZURRO,
            opacity: 0.5 + pulse * 0.5,
            boxShadow: `0 0 ${18 + pulse * 30}px rgba(83,164,219,${0.35 + pulse * 0.45})`,
          }}
        />
      </div>
    </div>
  );
};

const OrbitShot: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    <OffthreadVideo src={staticFile("video/sc05-orbit.mp4")} startFrom={frame} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  </div>
);

const DataConvergence: React.FC<{ frame: number }> = ({ frame }) => {
  const sealIn = easeInOut(frame, 60, 16);
  const labels = [
    { text: "MISURA", sub: "in campo", at: 5 },
    { text: "VERIFICA", sub: "da satellite", at: 32 },
    { text: "NOTARIZZAZIONE", sub: "immutabile", at: 60 },
  ];

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: 10,
          border: `3px solid ${AZZURRO}`,
          opacity: 0.35 + sealIn * 0.65,
          boxShadow: `0 0 ${sealIn * 50}px rgba(83,164,219,${sealIn * 0.35})`,
          transform: `scale(${1 + sealIn * 0.12}) rotate(${sealIn * 45}deg)`,
          marginBottom: 68,
        }}
      />
      <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
        {labels.map((l, i) => {
          const inAnim = easeInOut(frame, l.at, 14);
          return (
            <div key={l.text} style={{ display: "flex", alignItems: "center", gap: 32 }}>
              {i > 0 && <div style={{ opacity: inAnim, color: AZZURRO, fontSize: 28 }}>→</div>}
              <div style={{ textAlign: "center", opacity: inAnim, transform: `translateY(${(1 - inAnim) * 8}px)` }}>
                <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 32, color: "#fff", letterSpacing: 1.2 }}>{l.text}</div>
                <div style={{ fontFamily: FONT, fontWeight: 400, fontSize: 18, color: "rgba(255,255,255,0.62)", marginTop: 4 }}>{l.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
