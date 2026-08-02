import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

// SC08 — La prova (chi parla) (script §5, TC 01:14-01:22, 8s @ 25fps = 200 frame)
//
// Comparsa sequenziale di righe, una ogni 1,5s (§5: "uno ogni 1,5s, fade + 4px").
// Renderizza SOLO le righe le cui variabili sono confermate:
//  - identità societaria (non è una variabile, è il nome legale dell'azienda)
//  - V07: brevetto — CORRETTO rispetto al testo originale dello script. Lo
//    script chiedeva "Brevetto AgroCarbonSense n. ____", ma il brevetto
//    UIBM n. 102025000029407 risulta depositato per B.R.A.I.N., non per
//    AgroCarbonSense/CarbonSense. Citarlo come "AgroCarbonSense" sarebbe un
//    claim falso; qui è riferito al progetto corretto e con lo stato
//    corretto ("depositato", non concesso).
// V08 (ESA BIC), V09 (RIR AIR), V10 (Premio), V11 (standard), V12 (metrica)
// restano vuote e sono quindi omesse, non inventate (§0.1).

const BG = "#14171a";
const AZZURRO = "#53a4db"; // V01
const FONT = "Arial, Helvetica, sans-serif"; // V02 fallback §7.2

const LINES = [
  "Atlas: Carbon Neutral Solutions S.r.l. — Società Benefit",
  "Brevetto depositato n. 102025000029407 — B.R.A.I.N. Engine",
];

const STEP_FRAMES = 38; // ~1.5s @ 25fps

const easeInOut = (frame: number, from: number, durationInFrames: number) =>
  interpolate(frame, [from, from + durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const SC08_Proof: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: BG,
        alignItems: "flex-start",
        justifyContent: "center",
        paddingLeft: 160,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        {LINES.map((line, i) => {
          const inAnim = easeInOut(frame, i * STEP_FRAMES, 9);
          return (
            <div
              key={line}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                opacity: inAnim,
                transform: `translateY(${interpolate(inAnim, [0, 1], [4, 0])}px)`,
              }}
            >
              <div style={{ width: 22, height: 2, backgroundColor: AZZURRO }} />
              <div
                style={{
                  fontFamily: FONT,
                  fontWeight: i === 0 ? 600 : 400,
                  fontSize: i === 0 ? 34 : 26,
                  color: "#ffffff",
                }}
              >
                {line}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
