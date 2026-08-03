import { interpolate } from "remotion";

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

// Sottotitoli aperti (open caption) — §7.3: max 2 righe, terzo inferiore, margine di
// sicurezza. Qui usati su OGNI scena per veicolare il testo del VO, perché questo
// ambiente non dispone di un motore TTS: senza audio, il sottotitolo è l'unico modo
// per trasmettere il contenuto parlato dello script (§6.2).
export const OpenCaption: React.FC<{ text: string; opacity?: number }> = ({ text, opacity = 1 }) => {
  if (!text) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: "12%",
        left: "8%",
        right: "8%",
        textAlign: "center",
        opacity,
        fontFamily: FONT,
        fontWeight: 500,
        fontSize: 30,
        lineHeight: 1.3,
        color: "#ffffff",
        textShadow: "0 2px 10px rgba(0,0,0,0.6)",
      }}
    >
      {text}
    </div>
  );
};
