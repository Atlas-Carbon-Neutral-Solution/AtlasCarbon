import { interpolate, useCurrentFrame } from "remotion";

// Costanti condivise fra tutte le scene — vedi production/brand/README.md per la provenienza.
export const BG = "#14171a"; // base fredda industriale (§7.1) — non è un colore di marchio
export const BG_LIGHT = "#2a2e33"; // variante più chiara della stessa base, per elementi 3D/UI
export const VERDE = "#7fbb46"; // V01
export const AZZURRO = "#53a4db"; // V01
export const FONT = "Arial, Helvetica, sans-serif"; // V02 fallback §7.2 (nessun font specificato nelle linee guida)

export const easeInOut = (frame: number, from: number, durationInFrames: number) =>
  interpolate(frame, [from, from + durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// Grana pellicola sottile — rompe la piattezza del CSS puro, texture da 35mm.
export const FilmGrain: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => {
  const frame = useCurrentFrame();
  const seed = frame % 40;
  return (
    <svg style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity }} width="100%" height="100%">
      <filter id="atlas-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" result="noise" />
        <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.9 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#atlas-grain)" />
    </svg>
  );
};

// Vignettatura — profondità, occhio guidato al centro, meno "slide piatta".
export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

// Wrapper standard per ogni scena: sfondo + contenuto + grana/vignetta uniformi.
export const SceneShell: React.FC<{ bg: string; children: React.ReactNode }> = ({ bg, children }) => (
  <div style={{ position: "absolute", inset: 0, backgroundColor: bg, overflow: "hidden" }}>
    {children}
    <FilmGrain />
    <Vignette />
  </div>
);

// Tipografia cinetica per il VO — righe multiple con reveal sequenziale (blur+scale+
// translateY), non un fade statico unico. Testo molto più grande e con più peso, per
// leggibilità e presenza (§7.3 max 2 righe resta rispettato riga per riga).
// `visible` gestisce l'eventuale dissolvenza in uscita a fine scena (0..1).
export const OpenCaption: React.FC<{ text: string; opacity?: number }> = ({ text, opacity = 1 }) => {
  const frame = useCurrentFrame();
  if (!text) return null;
  const lines = text.split("\n");
  const STAGGER = 8;
  const DUR = 14;

  return (
    <div
      style={{
        position: "absolute",
        bottom: "10%",
        left: "6%",
        right: "6%",
        textAlign: "center",
        opacity,
      }}
    >
      {lines.map((line, i) => {
        const reveal = easeInOut(frame, i * STAGGER, DUR);
        return (
          <div
            key={i}
            style={{
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 44,
              lineHeight: 1.28,
              color: "#ffffff",
              letterSpacing: 0.2,
              textShadow: "0 4px 18px rgba(0,0,0,0.75)",
              opacity: reveal,
              filter: `blur(${(1 - reveal) * 6}px)`,
              transform: `translateY(${(1 - reveal) * 16}px) scale(${0.97 + reveal * 0.03})`,
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};
