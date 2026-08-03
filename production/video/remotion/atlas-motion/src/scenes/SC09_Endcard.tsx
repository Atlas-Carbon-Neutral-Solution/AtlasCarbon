import { Img, staticFile, useCurrentFrame } from "remotion";
import { AZZURRO, FONT, SceneShell, easeInOut } from "../shared";

// SC09 — Endcard e CTA (script §5, TC 01:22-01:30, 8s @ 25fps = 200 frame)
//
// Variabili usate, tutte confermate: V01 (palette), V02 (font: fallback), V03
// (logo bianco ufficiale, invariato), V04 (payoff, opzione A), V05 (CTA), e la
// ragione sociale legale (V15, dato verificato).

const PAYOFF = "Il dato prima della promessa."; // V04
const CTA = "www.atlascarbonneutral.com"; // V05
const RAGIONE_SOCIALE =
  "Atlas Carbon Neutral Solutions S.r.l. Società Benefit — P.IVA 14003650968 — Via Giuseppe Pecchio 1, 20131 Milano";

export const SC09_Endcard: React.FC = () => {
  const frame = useCurrentFrame();

  const logoIn = easeInOut(frame, 0, 14);
  const logoScale = interpolateScale(logoIn, 0.9, 1);
  const payoffIn = easeInOut(frame, 18, 14);
  const ctaIn = easeInOut(frame, 36, 14);
  const legalIn = easeInOut(frame, 54, 14);
  const closingBeat = easeInOut(frame, 170, 10);

  return (
    <SceneShell bg="#14171a">
      <div style={{ position: "absolute", inset: 0, opacity: 1 - closingBeat * 0.1 }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Img
            src={staticFile("logo/atlas-logo-bianco.png")}
            style={{
              width: 560,
              opacity: logoIn,
              filter: `blur(${(1 - logoIn) * 10}px)`,
              transform: `scale(${logoScale})`,
            }}
          />

          <div
            style={{
              marginTop: 52,
              opacity: payoffIn,
              filter: `blur(${(1 - payoffIn) * 6}px)`,
              transform: `translateY(${(1 - payoffIn) * 10}px)`,
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 42,
              color: "#ffffff",
              letterSpacing: 0.3,
            }}
          >
            {PAYOFF}
          </div>

          <div
            style={{
              marginTop: 30,
              opacity: ctaIn,
              transform: `translateY(${(1 - ctaIn) * 8}px)`,
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: 28,
              color: AZZURRO,
              letterSpacing: 0.4,
            }}
          >
            {CTA}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 52,
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: legalIn,
            fontFamily: FONT,
            fontSize: 17,
            letterSpacing: 0.2,
            color: "rgba(255,255,255,0.68)",
          }}
        >
          {RAGIONE_SOCIALE}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 52,
            left: 52,
            width: 72,
            height: 3,
            backgroundColor: AZZURRO,
            opacity: legalIn,
          }}
        />
      </div>
    </SceneShell>
  );
};

function interpolateScale(t: number, from: number, to: number) {
  return from + (to - from) * t;
}
