import { Img, staticFile, useCurrentFrame } from "remotion";
import { AZZURRO, FONT, SAFE_BOTTOM, SceneShell, easeInOut } from "../shared";

// SC08 — La prova (chi parla) (§5, TC 01:14-01:22, 8s @ 25fps = 200 frame)
//
// Renderizza SOLO le righe le cui variabili sono confermate: identità societaria
// e V07 — CORRETTO rispetto al testo originale dello script (v.
// production/brand/README.md): il brevetto UIBM n. 102025000029407 è depositato
// per B.R.A.I.N., non per AgroCarbonSense. V08-V12 restano vuote e sono omesse,
// non inventate (§0.1).
//
// Il fondale è un fotogramma renderizzato in Blender ad alta qualità (piastra
// d'acciaio fresata, luce radente) con un movimento lento di scala: austero per
// scelta, qui il contenuto è il testo. Sorgente: blender/sc08_plate.py

const LINES = [
  "Atlas: Carbon Neutral Solutions S.r.l. — Società Benefit",
  "Brevetto depositato n. 102025000029407 — B.R.A.I.N. Engine",
];

const STEP_FRAMES = 40;
const CTA_TEASER_AT = 148; // richiamo CTA prima dell'endcard, non solo in coda

export const SC08_Proof: React.FC = () => {
  const frame = useCurrentFrame();
  const teaserIn = easeInOut(frame, CTA_TEASER_AT, 16);
  const kb = frame / 200;

  return (
    <SceneShell bg="#0a0c0f">
      <Img
        src={staticFile("img/sc08-plate.png")}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${1.04 + kb * 0.05}) translateX(${-kb * 14}px)`,
          filter: "saturate(0.86) contrast(1.04)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingLeft: 140,
          paddingRight: 120,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
          {LINES.map((line, i) => {
            const inAnim = easeInOut(frame, i * STEP_FRAMES, 14);
            return (
              <div
                key={line}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  opacity: inAnim,
                  filter: `blur(${(1 - inAnim) * 8}px)`,
                  transform: `translateY(${(1 - inAnim) * 14}px)`,
                }}
              >
                <div style={{ width: 30 * inAnim, height: 4, backgroundColor: AZZURRO, flexShrink: 0 }} />
                <div
                  style={{
                    fontFamily: FONT,
                    fontWeight: i === 0 ? 700 : 600,
                    fontSize: i === 0 ? 46 : 34,
                    color: "#ffffff",
                    letterSpacing: -0.2,
                    textShadow: "0 3px 20px rgba(0,0,0,0.8)",
                  }}
                >
                  {line}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: SAFE_BOTTOM + 12,
          right: 84,
          opacity: teaserIn,
          transform: `translateY(${(1 - teaserIn) * 10}px)`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 22px",
          borderRadius: 999,
          border: `1.5px solid ${AZZURRO}`,
          backgroundColor: "rgba(0,0,0,0.28)",
        }}
      >
        <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 19, color: AZZURRO }}>www.atlascarbonneutral.com</span>
      </div>
    </SceneShell>
  );
};
