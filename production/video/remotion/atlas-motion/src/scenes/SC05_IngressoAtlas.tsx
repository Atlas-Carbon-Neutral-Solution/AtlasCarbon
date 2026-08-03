import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { AZZURRO, BG, FONT, OpenCaption, easeInOut } from "../shared";

// SC05 — Ingresso Atlas, perno non tagliabile (§5, TC 00:32-00:48, 16s @ 25fps = 400 frame)
//
// Movimento 1 (0-125, 5s): sensore astratto — nessuna camera reale disponibile.
// Movimento 2 (125-275, 6s): rendering 3D reale (Blender, EEVEE) — sfera opaca +
//   anello orbitale, deliberatamente non un "globo verde" (cliche' bandito §2.3)
//   e non un'estetica sci-fi/hologram (bandita dal NEG prompt originale).
// Movimento 3 (275-400, 5s): convergenza vettoriale 2D + OST sequenziale.

const VO =
  "Atlas misura. Sensori in campo. Dati satellitari. Modelli calibrati sull'impianto reale.\nE un registro notarizzato che nessuno può riscrivere a posteriori: nemmeno noi.";

const MOV1_END = 125;
const MOV2_END = 275;

export const SC05_IngressoAtlas: React.FC = () => {
  const frame = useCurrentFrame();
  const captionIn = easeInOut(frame, 10, 9);

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      {frame < MOV1_END && <SensorMacro frame={frame} />}
      {frame >= MOV1_END && frame < MOV2_END && <OrbitShot frame={frame - MOV1_END} />}
      {frame >= MOV2_END && <DataConvergence frame={frame - MOV2_END} />}

      <OpenCaption text={VO} opacity={captionIn} />
    </AbsoluteFill>
  );
};

const SensorMacro: React.FC<{ frame: number }> = ({ frame }) => {
  const pulse = 0.5 + 0.5 * Math.sin(frame / 10);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "relative", width: 300, height: 180 }}>
        <div style={{ position: "absolute", top: 70, left: 0, right: 0, height: 40, backgroundColor: "#3a3f45", borderRadius: 6 }} />
        <div style={{ position: "absolute", top: 30, left: 90, width: 120, height: 120, backgroundColor: "#22262a", borderRadius: 10, border: "1px solid #454a50" }} />
        <div
          style={{
            position: "absolute",
            top: 78,
            left: 140,
            width: 20,
            height: 20,
            borderRadius: "50%",
            backgroundColor: AZZURRO,
            opacity: 0.4 + pulse * 0.6,
            boxShadow: `0 0 ${pulse * 14}px rgba(83,164,219,${pulse * 0.5})`,
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const OrbitShot: React.FC<{ frame: number }> = ({ frame }) => {
  return (
    <AbsoluteFill>
      <OffthreadVideo src={staticFile("video/sc05-orbit.mp4")} startFrom={frame} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </AbsoluteFill>
  );
};

const DataConvergence: React.FC<{ frame: number }> = ({ frame }) => {
  const sealIn = easeInOut(frame, 60, 15);
  const labels = [
    { text: "MISURA", sub: "in campo", at: 5 },
    { text: "VERIFICA", sub: "da satellite", at: 30 },
    { text: "NOTARIZZAZIONE", sub: "immutabile", at: 55 },
  ];

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          width: 90,
          height: 90,
          borderRadius: 6,
          border: `2px solid ${AZZURRO}`,
          opacity: 0.3 + sealIn * 0.7,
          transform: `scale(${1 + sealIn * 0.1}) rotate(${sealIn * 45}deg)`,
          marginBottom: 56,
        }}
      />
      <div style={{ display: "flex", gap: 26, alignItems: "center" }}>
        {labels.map((l, i) => {
          const inAnim = easeInOut(frame, l.at, 12);
          return (
            <div key={l.text} style={{ display: "flex", alignItems: "center", gap: 26 }}>
              {i > 0 && <div style={{ opacity: inAnim, color: AZZURRO, fontSize: 22 }}>→</div>}
              <div style={{ textAlign: "center", opacity: inAnim, transform: `translateY(${(1 - inAnim) * 6}px)` }}>
                <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 24, color: "#fff", letterSpacing: 1 }}>{l.text}</div>
                <div style={{ fontFamily: FONT, fontWeight: 400, fontSize: 15, color: "rgba(255,255,255,0.6)" }}>{l.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
