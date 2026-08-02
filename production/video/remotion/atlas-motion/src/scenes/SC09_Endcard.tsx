import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

// SC09 — Endcard e CTA (script §5, TC 01:22-01:30, 8s @ 25fps = 200 frame)
//
// Renderizza SOLO le variabili confermate: V01 (palette istituzionale, linee guida
// Atlas 2025), V03 (logo bianco ufficiale) e la ragione sociale legale (V15).
// V04 (payoff) e V05 (CTA) sono vuote: per la regola §0.1 dello script, la riga va
// omessa, non riempita con un valore plausibile.

const BG = "#14171a"; // base fredda industriale (§7.1) — non è uno dei due colori di marchio
const AZZURRO = "#53a4db"; // V01
const RAGIONE_SOCIALE =
  "Atlas Carbon Neutral Solutions S.r.l. Società Benefit — P.IVA 14003650968 — Via Giuseppe Pecchio 1, 20131 Milano";

const easeInOut = (frame: number, from: number, durationInFrames: number) =>
  interpolate(frame, [from, from + durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const SC09_Endcard: React.FC = () => {
  const frame = useCurrentFrame();

  const logoIn = easeInOut(frame, 0, 9); // ~300ms @ 30fps timeline used by the studio preview
  const logoScale = interpolate(logoIn, [0, 1], [0.96, 1]);
  const lineIn = easeInOut(frame, 15, 9);
  const closingBeat = easeInOut(frame, 170, 9);

  return (
    <AbsoluteFill style={{ backgroundColor: BG }}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: 1 - closingBeat * 0.08,
        }}
      >
        <Img
          src={staticFile("logo/atlas-logo-bianco.png")}
          style={{
            width: 520,
            opacity: logoIn,
            transform: `scale(${logoScale})`,
          }}
        />
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          bottom: 48,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: lineIn,
          transform: `translateY(${interpolate(lineIn, [0, 1], [4, 0])}px)`,
          fontFamily: "Arial, Helvetica, sans-serif", // fallback §7.2 — V02 non specificato nelle linee guida
          fontSize: 15,
          letterSpacing: 0.2,
          color: "rgba(255,255,255,0.72)",
        }}
      >
        {RAGIONE_SOCIALE}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 48,
          left: 48,
          width: 64,
          height: 2,
          backgroundColor: AZZURRO,
          opacity: lineIn,
        }}
      />
    </AbsoluteFill>
  );
};
