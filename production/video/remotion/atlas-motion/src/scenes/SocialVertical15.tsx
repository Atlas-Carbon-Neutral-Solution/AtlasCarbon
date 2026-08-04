import { Img, Series, staticFile, useCurrentFrame } from "remotion";
import { AZZURRO, CineVideo, ColdShadows, FONT, FilmGrain, Vignette, easeInOut } from "../shared";

// Derivato 15" 9:16 (§9) — 1080x1920, 375 frame @25fps.
//
// Composizione dedicata, non un ritaglio del master: il master è anamorfico
// 2.39:1, e ritagliarlo in verticale darebbe quasi solo bande nere. Qui i
// girati riempiono il formato con `objectFit: cover` e la tipografia è
// ricomposta per il verticale.
//
// Nessun testo nuovo: le righe sono sottoinsiemi verbatim del VO §6.2 già
// approvato, e le variabili sono le sole confermate (V03 logo, V04 payoff,
// V05 CTA, ragione sociale).

const PAYOFF = "Il dato prima della promessa."; // V04
const CTA = "www.atlascarbonneutral.com"; // V05

const BLOCK = { PROBLEMA: 100, PROVA: 100, ENDCARD: 175 } as const;
export const SOCIAL15_TOTAL = BLOCK.PROBLEMA + BLOCK.PROVA + BLOCK.ENDCARD; // 375

const VerticalCaption: React.FC<{ text: string; at?: number }> = ({ text, at = 8 }) => {
  const frame = useCurrentFrame();
  const rule = easeInOut(frame, at, 14);
  const words = text.split(" ");
  return (
    <div style={{ position: "absolute", bottom: 240, left: 72, right: 72 }}>
      <div style={{ width: 88 * rule, height: 5, backgroundColor: AZZURRO, marginBottom: 26 }} />
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 66,
          lineHeight: 1.16,
          letterSpacing: -0.8,
          color: "#ffffff",
          textShadow: "0 4px 26px rgba(0,0,0,0.85)",
        }}
      >
        {words.map((w, i) => {
          const r = easeInOut(frame, at + 4 + i * 3, 12);
          return (
            <span
              key={`${w}-${i}`}
              style={{
                display: "inline-block",
                marginRight: "0.28em",
                opacity: r,
                filter: `blur(${(1 - r) * 6}px)`,
                transform: `translateY(${(1 - r) * 16}px)`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Endcard: React.FC = () => {
  const frame = useCurrentFrame();
  const logoIn = easeInOut(frame, 0, 16);
  const payoffIn = easeInOut(frame, 20, 14);
  const ctaIn = easeInOut(frame, 42, 16);
  const pulse = ctaIn >= 1 ? 1 + Math.sin((frame - 58) / 14) * 0.02 : 1;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#14171a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}
    >
      <Img
        src={staticFile("logo/atlas-logo-bianco.png")}
        style={{
          width: 700,
          opacity: logoIn,
          filter: `blur(${(1 - logoIn) * 12}px)`,
          transform: `scale(${0.92 + logoIn * 0.08})`,
        }}
      />
      <div
        style={{
          marginTop: 56,
          opacity: payoffIn,
          transform: `translateY(${(1 - payoffIn) * 12}px)`,
          fontFamily: FONT,
          fontWeight: 600,
          fontSize: 54,
          color: "#ffffff",
          textAlign: "center",
          padding: "0 80px",
        }}
      >
        {PAYOFF}
      </div>
      <div
        style={{
          marginTop: 54,
          opacity: ctaIn,
          transform: `translateY(${(1 - ctaIn) * 12}px) scale(${pulse})`,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "24px 46px",
          borderRadius: 999,
          backgroundColor: AZZURRO,
        }}
      >
        <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 32, color: "#0d1a24" }}>{CTA}</span>
        <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 32, color: "#0d1a24" }}>→</span>
      </div>
    </div>
  );
};

export const SocialVertical15: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, backgroundColor: "#07090a", overflow: "hidden" }}>
    <Series>
      <Series.Sequence durationInFrames={BLOCK.PROBLEMA}>
        <CineVideo src={staticFile("video/sc02-aerial.mp4")} halation={0.22} contrast={1.14} />
        <VerticalCaption text="Quasi nessuna ha un dato che regga una verifica esterna." />
      </Series.Sequence>
      <Series.Sequence durationInFrames={BLOCK.PROVA}>
        <CineVideo src={staticFile("video/sc05c-ledger.mp4")} halation={0.24} />
        <VerticalCaption text="Un registro notarizzato che nessuno può riscrivere." />
      </Series.Sequence>
      <Series.Sequence durationInFrames={BLOCK.ENDCARD}>
        <Endcard />
      </Series.Sequence>
    </Series>
    <ColdShadows />
    <FilmGrain />
    <Vignette strength={0.5} />
  </div>
);
