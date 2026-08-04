import { Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";

// Costanti condivise fra tutte le scene — vedi production/brand/README.md per la provenienza.
export const BG = "#14171a"; // base fredda industriale (§7.1) — non è un colore di marchio
export const BG_LIGHT = "#2a2e33"; // variante più chiara della stessa base, per elementi 3D/UI
export const VERDE = "#7fbb46"; // V01
export const AZZURRO = "#53a4db"; // V01
export const FONT = "Arial, Helvetica, sans-serif"; // V02 fallback §7.2 (nessun font specificato nelle linee guida)

// Formato anamorfico 2.39:1 dentro un file 16:9: è il segnale immediato di
// "questo è girato", e insieme costringe ogni inquadratura a una composizione
// orizzontale. 1920/2.39 = 803px di immagine, 138px di banda sopra e sotto.
export const BAR = Math.round((1080 - 1920 / 2.39) / 2); // 138
export const SAFE_TOP = BAR + 26;
export const SAFE_BOTTOM = BAR + 30;

export const easeInOut = (frame: number, from: number, durationInFrames: number) =>
  interpolate(frame, [from, from + durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const COVER: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

// Immagine di ripresa con grade e alone luminoso.
//
// L'alone (halation) è un secondo passaggio dello stesso fotogramma, sfocato e
// schiarito, ricomposto in `screen`: è il modo in cui la luce forte si diffonde
// nell'emulsione, e in un render pulito è la differenza fra "3D" e "girato".
// Il grade tiene i neri chiusi e la saturazione sotto l'unità: nessun colore
// squillante, coerente con la palette industriale del brief (§7.1).
export const CineVideo: React.FC<{
  src: string;
  halation?: number;
  contrast?: number;
  saturate?: number;
  brightness?: number;
  /** micro-movimento aggiuntivo, per rompere la fissità dove la camera 3D è lenta */
  drift?: number;
}> = ({ src, halation = 0.17, contrast = 1.1, saturate = 0.9, brightness = 1, drift = 0 }) => {
  const frame = useCurrentFrame();
  const scale = drift ? 1 + drift * (0.004 + 0.003 * Math.sin(frame / 90)) : 1;
  const dx = drift ? Math.sin(frame / 110) * drift * 5 : 0;
  const wrap: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    transform: drift ? `scale(${1.01 * scale}) translateX(${dx}px)` : undefined,
  };
  return (
    <div style={wrap}>
      <OffthreadVideo
        src={src}
        style={{ ...COVER, filter: `saturate(${saturate}) contrast(${contrast}) brightness(${brightness})` }}
      />
      <OffthreadVideo
        src={src}
        style={{
          ...COVER,
          filter: "blur(26px) brightness(1.55) saturate(1.4)",
          mixBlendMode: "screen",
          opacity: halation,
        }}
      />
    </div>
  );
};

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

// Ombre virate al freddo, alte luci appena calde: separa i piani senza toccare
// la palette di marchio, che vive solo negli elementi grafici.
export const ColdShadows: React.FC = () => (
  <>
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#0d1b26",
        mixBlendMode: "soft-light",
        opacity: 0.32,
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, rgba(255,196,140,0.05) 0%, rgba(0,0,0,0) 45%)",
        mixBlendMode: "screen",
        opacity: 0.8,
        pointerEvents: "none",
      }}
    />
  </>
);

// Bande anamorfiche, applicate una volta sola sopra tutto il montaggio.
export const Anamorphic: React.FC = () => (
  <>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: BAR, backgroundColor: "#000" }} />
    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: BAR, backgroundColor: "#000" }} />
  </>
);

// Bug/watermark del logo ufficiale — presente per tutta la durata del video (non solo
// in endcard). Logo bianco non alterato (solo scala uniforme via width), dentro
// l'area sicura del formato anamorfico, opacità ridotta per non competere con
// l'endcard dove il marchio torna a piena dimensione.
export const LogoWatermark: React.FC<{ totalFrames: number }> = ({ totalFrames }) => {
  const frame = useCurrentFrame();
  const fadeIn = easeInOut(frame, 8, 20);
  const endcardStart = totalFrames - 200; // SC09 già mostra il logo a piena dimensione
  const fadeOutForEndcard = easeInOut(frame, endcardStart - 15, 15);
  const opacity = fadeIn * (1 - fadeOutForEndcard) * 0.8;

  if (opacity <= 0.001) return null;

  return (
    <Img
      src={staticFile("logo/atlas-logo-bianco.png")}
      style={{
        position: "absolute",
        top: SAFE_TOP,
        right: 56,
        width: 148,
        opacity,
      }}
    />
  );
};

// Wrapper standard per ogni scena: sfondo + contenuto + grade/grana/vignetta uniformi.
export const SceneShell: React.FC<{ bg: string; children: React.ReactNode }> = ({ bg, children }) => (
  <div style={{ position: "absolute", inset: 0, backgroundColor: bg, overflow: "hidden" }}>
    {children}
    <ColdShadows />
    <FilmGrain />
    <Vignette />
  </div>
);

// Tipografia cinetica per il VO.
//
// Rivelazione parola per parola (non riga per riga): il testo entra come viene
// pronunciato e l'inquadratura non resta mai tipograficamente ferma. Filetto
// azzurro che si allunga come "battuta" d'ingresso. Allineamento a sinistra,
// dentro l'area sicura anamorfica; §7.3 (max 2 righe) resta rispettato riga per riga.
export const OpenCaption: React.FC<{
  text: string;
  opacity?: number;
  align?: "left" | "center";
  /** frame da cui far partire la rivelazione (inizio della battuta) */
  startFrame?: number;
}> = ({ text, opacity = 1, align = "left", startFrame = 0 }) => {
  const frame = useCurrentFrame() - startFrame;
  if (!text) return null;
  const lines = text.split("\n");
  const WORD_STEP = 2.6;
  const LINE_STEP = 7;
  const DUR = 12;
  const rule = easeInOut(frame, 2, 16);

  let wordIndex = 0;
  return (
    <div
      style={{
        position: "absolute",
        bottom: SAFE_BOTTOM + 36,
        left: align === "center" ? 0 : "7%",
        right: align === "center" ? 0 : "12%",
        textAlign: align,
        opacity,
      }}
    >
      <div
        style={{
          width: 74 * rule,
          height: 4,
          backgroundColor: AZZURRO,
          marginBottom: 20,
          marginLeft: align === "center" ? "auto" : 0,
          marginRight: align === "center" ? "auto" : 0,
          opacity: 0.95,
        }}
      />
      {lines.map((line, li) => (
        <div
          key={li}
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 46,
            lineHeight: 1.24,
            letterSpacing: -0.4,
            color: "#ffffff",
            textShadow: "0 3px 22px rgba(0,0,0,0.85)",
          }}
        >
          {line.split(" ").map((w) => {
            const at = li * LINE_STEP + wordIndex * WORD_STEP;
            wordIndex += 1;
            const r = easeInOut(frame, at, DUR);
            return (
              <span
                key={`${li}-${w}-${wordIndex}`}
                style={{
                  display: "inline-block",
                  marginRight: "0.28em",
                  opacity: r,
                  filter: `blur(${(1 - r) * 5}px)`,
                  transform: `translateY(${(1 - r) * 13}px)`,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Didascalie temporizzate: mostra la battuta attiva secondo la tabella in vo.ts.
//
// Sostituisce il blocco unico per scena. Con un solo blocco il testo restava
// immobile per tutta la scena (sedici secondi in SC05) mentre l'immagine
// cambiava inquadratura: la tipografia ora entra ed esce sugli stacchi.
export const TimedCaption: React.FC<{
  cues: { text: string; from: number; to: number }[];
  align?: "left" | "center";
}> = ({ cues, align = "left" }) => {
  const frame = useCurrentFrame();
  const FADE = 8;
  const active = cues.find((c) => frame >= c.from && frame < c.to);
  if (!active) return null;
  const inOp = easeInOut(frame, active.from, FADE);
  const outOp = 1 - easeInOut(frame, active.to - FADE, FADE);
  return (
    <OpenCaption
      text={active.text}
      opacity={inOp * outOp}
      align={align}
      startFrame={active.from}
    />
  );
};
