import { useCurrentFrame } from "remotion";
import { AZZURRO, FONT, SceneShell, easeInOut } from "../shared";

// SC08 — La prova (chi parla) (§5, TC 01:14-01:22, 8s @ 25fps = 200 frame)
//
// Renderizza SOLO le righe le cui variabili sono confermate: identità societaria
// e V07 — CORRETTO rispetto al testo originale dello script (v. production/brand/README.md):
// il brevetto UIBM n. 102025000029407 e' depositato per B.R.A.I.N., non per
// AgroCarbonSense. V08-V12 restano vuote e sono omesse, non inventate (§0.1).

const LINES = [
  "Atlas: Carbon Neutral Solutions S.r.l. — Società Benefit",
  "Brevetto depositato n. 102025000029407 — B.R.A.I.N. Engine",
];

const STEP_FRAMES = 42;

export const SC08_Proof: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <SceneShell bg="#12151a">
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingLeft: 150,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {LINES.map((line, i) => {
            const inAnim = easeInOut(frame, i * STEP_FRAMES, 14);
            return (
              <div
                key={line}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 26,
                  opacity: inAnim,
                  filter: `blur(${(1 - inAnim) * 8}px)`,
                  transform: `translateY(${(1 - inAnim) * 14}px)`,
                }}
              >
                <div style={{ width: 34, height: 3, backgroundColor: AZZURRO }} />
                <div
                  style={{
                    fontFamily: FONT,
                    fontWeight: i === 0 ? 700 : 500,
                    fontSize: i === 0 ? 46 : 34,
                    color: "#ffffff",
                    letterSpacing: 0.2,
                  }}
                >
                  {line}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SceneShell>
  );
};
