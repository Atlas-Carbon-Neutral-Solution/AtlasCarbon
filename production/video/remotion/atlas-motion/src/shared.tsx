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
          // la scala 1.006 e la virata calda su questo strato producono una
          // frangia ai bordi che legge come aberrazione cromatica, senza
          // pagare un terzo decode del video
          transform: "scale(1.006)",
          filter: "blur(26px) brightness(1.55) saturate(1.4) hue-rotate(-9deg)",
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

// ---------------------------------------------------------------------------
// Transizioni fra scene.
//
// Prima il montaggio era tutto a stacco secco: corretto per gli stacchi INTERNI
// alle scene (li' e' una figura retorica voluta, §5), ma fra scene diverse
// nove tagli identici appiattiscono il ritmo. Qui ogni passaggio ha una figura
// scelta in base al salto narrativo:
//
//   whip      panoramica sfocata: salto geografico (scrivania -> impianto)
//   punch     spinta dentro l'inquadratura: aumento di pressione
//   flash     lampo di luce: il cambio di fronte (entra Atlas)
//   dissolve  dissolvenza: passaggio morbido (industria -> natura, e l'endcard)
//
// Il whip in uscita da una scena e quello in entrata nella successiva si
// leggono come un unico movimento attraverso il taglio, perche' <Series> mette
// le scene esattamente una dopo l'altra.
export type TKind = "cut" | "whip" | "punch" | "flash" | "dissolve";

const WHIP = 7;
const PUNCH = 11;
const DISSOLVE = 13;
const FLASH = 6;

export const SceneTransition: React.FC<{
  duration: number;
  inKind?: TKind;
  outKind?: TKind;
  children: React.ReactNode;
}> = ({ duration, inKind = "cut", outKind = "cut", children }) => {
  const frame = useCurrentFrame();
  let tx = 0;
  let scale = 1;
  let blur = 0;
  let opacity = 1;
  let flash = 0;

  // ingresso
  if (inKind === "whip") {
    const p = easeInOut(frame, 0, WHIP);
    tx += (1 - p) * 150;
    blur += (1 - p) * 20;
  } else if (inKind === "punch") {
    const p = easeInOut(frame, 0, PUNCH);
    scale *= 1.075 - p * 0.075;
    blur += (1 - p) * 4;
  } else if (inKind === "dissolve") {
    opacity *= easeInOut(frame, 0, DISSOLVE);
  } else if (inKind === "flash") {
    flash = Math.max(flash, 1 - easeInOut(frame, 0, FLASH));
  }

  // uscita
  const outStart = duration - WHIP;
  if (outKind === "whip") {
    const p = easeInOut(frame, outStart, WHIP);
    tx -= p * 150;
    blur += p * 20;
  } else if (outKind === "punch") {
    const p = easeInOut(frame, duration - PUNCH, PUNCH);
    scale *= 1 + p * 0.05;
    blur += p * 3;
  } else if (outKind === "dissolve") {
    opacity *= 1 - easeInOut(frame, duration - DISSOLVE, DISSOLVE);
  } else if (outKind === "flash") {
    flash = Math.max(flash, easeInOut(frame, duration - FLASH, FLASH));
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", opacity }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateX(${tx}px) scale(${scale})`,
          filter: blur > 0.01 ? `blur(${blur}px)` : undefined,
        }}
      >
        {children}
      </div>
      {flash > 0.001 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 62% 42%, rgba(255,238,214,1) 0%, rgba(255,226,190,0.75) 38%, rgba(255,214,170,0) 78%)",
            mixBlendMode: "screen",
            opacity: flash * 0.9,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Artefatti di macchina: instabilita' del passo pellicola e micro-variazione di
// esposizione. Sono minuscoli — mezzo pixel e sei millesimi di stop — ma sono
// esattamente quello che manca a un render per non sembrare "troppo pulito":
// nessuna camera reale tiene il fotogramma perfettamente immobile ne'
// l'esposizione perfettamente costante.
export const LensArtifacts: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const wx = Math.sin(frame * 0.37) * 0.30 + Math.sin(frame * 1.13 + 1.7) * 0.22;
  const wy = Math.sin(frame * 0.29 + 0.8) * 0.26 + Math.sin(frame * 0.91) * 0.18;
  const exposure = 1 + Math.sin(frame * 0.53) * 0.0035 + Math.sin(frame * 1.7 + 2.1) * 0.0022;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        transform: `translate(${wx}px, ${wy}px)`,
        filter: `brightness(${exposure})`,
      }}
    >
      {children}
    </div>
  );
};
