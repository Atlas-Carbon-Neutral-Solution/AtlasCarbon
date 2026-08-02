import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";

// SC09 — Endcard e CTA (script §5, TC 01:22-01:30, 8s @ 25fps = 200 frame)
//
// Variabili usate, tutte confermate: V01 (palette), V02 (font: fallback
// sans-serif geometrico, nessun font specificato nelle linee guida), V03
// (logo bianco ufficiale), V04 (payoff, opzione A raccomandata dal
// documento), V05 (CTA), e la ragione sociale legale (V15, dato
// verificato: P.IVA e sede legale).

const BG = "#14171a"; // base fredda industriale (§7.1) — non è uno dei due colori di marchio
const AZZURRO = "#53a4db"; // V01
const PAYOFF = "Il dato prima della promessa."; // V04 — opzione A, §8
const CTA = "www.atlascarbonneutral.com"; // V05
const RAGIONE_SOCIALE =
  "Atlas Carbon Neutral Solutions S.r.l. Società Benefit — P.IVA 14003650968 — Via Giuseppe Pecchio 1, 20131 Milano";

const FONT = "Arial, Helvetica, sans-serif"; // V02 fallback §7.2

const easeInOut = (frame: number, from: number, durationInFrames: number) =>
  interpolate(frame, [from, from + durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const SC09_Endcard: React.FC = () => {
  const frame = useCurrentFrame();

  const logoIn = easeInOut(frame, 0, 9);
  const logoScale = interpolate(logoIn, [0, 1], [0.96, 1]);
  const payoffIn = easeInOut(frame, 15, 9);
  const ctaIn = easeInOut(frame, 30, 9);
  const legalIn = easeInOut(frame, 45, 9);
  const closingBeat = easeInOut(frame, 170, 9);

  return (
    <AbsoluteFill style={{ backgroundColor: BG, opacity: 1 - closingBeat * 0.08 }}>
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Img
          src={staticFile("logo/atlas-logo-bianco.png")}
          style={{
            width: 460,
            opacity: logoIn,
            transform: `scale(${logoScale})`,
          }}
        />

        <div
          style={{
            marginTop: 40,
            opacity: payoffIn,
            transform: `translateY(${interpolate(payoffIn, [0, 1], [4, 0])}px)`,
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: 30,
            color: "#ffffff",
            letterSpacing: 0.2,
          }}
        >
          {PAYOFF}
        </div>

        <div
          style={{
            marginTop: 28,
            opacity: ctaIn,
            transform: `translateY(${interpolate(ctaIn, [0, 1], [4, 0])}px)`,
            fontFamily: FONT,
            fontWeight: 400,
            fontSize: 22,
            color: AZZURRO,
            letterSpacing: 0.3,
          }}
        >
          {CTA}
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          bottom: 48,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: legalIn,
          transform: `translateY(${interpolate(legalIn, [0, 1], [4, 0])}px)`,
          fontFamily: FONT,
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
          opacity: legalIn,
        }}
      />
    </AbsoluteFill>
  );
};
