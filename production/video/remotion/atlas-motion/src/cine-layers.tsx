import { useCurrentFrame } from "remotion";
import { easeInOut } from "./shared";

// ---------------------------------------------------------------------------
// Livelli atmosferici di composizione.
//
// Sono la parte del lavoro che NON conviene fare in 3D. Un fascio di luce
// volumetrico vero in EEVEE si paga su ogni fotogramma e su GL software è la
// singola voce di costo più alta della pipeline; qui la stessa lettura si ottiene
// in composizione, dove costa un gradiente. Per contro tutto ciò che deve stare
// dietro un oggetto — occlusione, parallasse, fuoco — resta in 3D, perché in
// composizione non si può inventare la profondità che non c'è.
//
// Regola di palette: questi livelli sono FOTOGRAFICI, non grafici. Restano su
// bianchi caldi e neutri; il verde e l'azzurro di marchio non compaiono qui,
// vivono solo negli elementi grafici (§7.1).

/** Numero pseudo-casuale stabile: funzione pura di (i, seed).
 *
 * Remotion renderizza i fotogrammi in processi paralleli e indipendenti, quindi
 * Math.random() darebbe posizioni diverse a ogni fotogramma e le particelle
 * sfarfallerebbero. Serve un hash deterministico, non un generatore. */
const rnd = (i: number, seed: number) => {
  const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------------------------------------------------------------------------
/** Fasci di luce fra i culmi.
 *
 * Sei fasci di larghezza e opacità diverse, inclinati, con respiro indipendente:
 * il respiro è la parte che conta. Un fascio a intensità costante legge come un
 * gradiente incollato sopra l'immagine; un fascio che pulsa lentamente e in
 * controfase con gli altri legge come luce che passa attraverso una chioma mossa
 * dal vento. La maschera radiale li spegne lontano dal sole, così non diventano
 * strisce che attraversano tutto il fotogramma. */
export const GodRays: React.FC<{
  /** posizione del sole in percentuale di fotogramma */
  sunX?: number;
  sunY?: number;
  /** inclinazione dei fasci rispetto alla verticale, in gradi */
  angle?: number;
  count?: number;
  opacity?: number;
  /** ampiezza del respiro (0 = fissi) */
  breathe?: number;
}> = ({ sunX = 64, sunY = 12, angle = -19, count = 8, opacity = 1, breathe = 1 }) => {
  const frame = useCurrentFrame();
  if (opacity <= 0.001) return null;
  // La maschera è larga di proposito. Concentrarla sul sole sembrava logico ed
  // era l'errore: in `screen` una luce aggiunta su un'area già chiara non cambia
  // nulla, e un fascio si vede proprio dove attraversa l'ombra. La maschera
  // quindi tiene i fasci anche nella metà bassa del fotogramma e si limita a
  // spegnerli sul bordo opposto al sole.
  const mask = `radial-gradient(ellipse 145% 155% at ${sunX}% ${sunY}%, rgba(0,0,0,1) 12%, rgba(0,0,0,0.88) 58%, rgba(0,0,0,0.22) 100%)`;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        mixBlendMode: "screen",
        opacity,
        pointerEvents: "none",
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: `${sunX}%`,
          top: `${sunY}%`,
          width: 0,
          height: 0,
          transform: `rotate(${angle}deg)`,
        }}
      >
        {Array.from({ length: count }).map((_, i) => {
          const w = 26 + rnd(i, 1) * 96;
          // I fasci si sviluppano DALLA parte del sole verso il lato opposto, non
          // simmetricamente attorno ad esso: con l'ancoraggio a destra e una
          // distribuzione simmetrica coprivano solo la metà destra e la sinistra
          // restava senza luce, che è l'opposto di come cade un controluce.
          const off = -1500 + i * (2150 / count) + rnd(i, 2) * 110;
          const speed = 0.008 + rnd(i, 3) * 0.016;
          const phase = rnd(i, 4) * 6.28;
          const pulse = 0.58 + 0.42 * Math.sin(frame * speed + phase);
          const a = (0.24 + rnd(i, 5) * 0.34) * (1 - breathe + breathe * pulse);
          const drift = Math.sin(frame * speed * 0.7 + phase) * 16;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: off + drift,
                top: -200,
                width: w,
                height: 2100,
                background: `linear-gradient(to bottom, rgba(255,246,224,0) 0%, rgba(255,244,218,${a}) 26%, rgba(255,236,202,${a * 0.72}) 62%, rgba(255,230,190,0) 100%)`,
                filter: `blur(${9 + rnd(i, 6) * 22}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
/** Prospettiva aerea: alone caldo attorno al sole, sollevamento freddo in basso.
 *
 * È la separazione dei piani che in un render pulito manca del tutto: nella
 * realtà l'aria fra la camera e il fondo schiarisce e desatura ciò che è
 * lontano, e lo fa in modo direzionale — verso la luce, non uniformemente. */
export const DepthHaze: React.FC<{
  sunX?: number;
  sunY?: number;
  strength?: number;
  /** sollevamento freddo delle ombre in basso */
  floor?: number;
}> = ({ sunX = 64, sunY = 12, strength = 0.5, floor = 0.16 }) => {
  if (strength <= 0.001 && floor <= 0.001) return null;
  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 70% 62% at ${sunX}% ${sunY}%, rgba(255,242,216,${0.30 * strength}) 0%, rgba(255,232,196,${0.14 * strength}) 40%, rgba(255,226,186,0) 76%)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(0deg, rgba(150,178,196,${floor}) 0%, rgba(150,178,196,0) 38%)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

// ---------------------------------------------------------------------------
/** Particolato in sospensione a ridosso dell'obiettivo.
 *
 * Il 3D ha già il suo polline, ma è tutto a fuoco alla distanza della scena.
 * Queste sono molto più grandi e molto più sfocate: leggono come particelle a
 * pochi centimetri dalla lente, e sono la ragione per cui una ripresa in bosco
 * ha una profondità che un render non ha. Salgono lentamente, come fa la polvere
 * in una colonna d'aria calda. */
export const AirParticles: React.FC<{
  count?: number;
  seed?: number;
  opacity?: number;
  /** raggio massimo in px */
  size?: number;
}> = ({ count = 26, seed = 0, opacity = 1, size = 16 }) => {
  const frame = useCurrentFrame();
  if (opacity <= 0.001) return null;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        mixBlendMode: "screen",
        opacity,
        pointerEvents: "none",
      }}
    >
      {Array.from({ length: count }).map((_, i) => {
        const r = 3 + rnd(i, seed + 1) * size;
        const speed = 0.10 + rnd(i, seed + 2) * 0.26;
        const x0 = rnd(i, seed + 3) * 108 - 4;
        const y0 = rnd(i, seed + 4) * 120;
        // salita continua con avvolgimento: nessuna particella scompare di colpo
        const y = (y0 - frame * speed * 0.14 + 240) % 120;
        const x = x0 + Math.sin(frame * 0.012 + i) * 1.6;
        const a = (0.26 + rnd(i, seed + 5) * 0.42) * Math.sin((y / 120) * Math.PI);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: r,
              height: r,
              borderRadius: "50%",
              background: "rgba(255,247,226,1)",
              filter: `blur(${r * 0.55}px)`,
              opacity: Math.max(0, a),
            }}
          />
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
/** Riassestamento del fuoco dopo uno stacco interno.
 *
 * Un operatore non è mai perfettamente a fuoco nel primo fotogramma dopo un
 * cambio di inquadratura: cerca il fuoco e lo trova in un terzo di secondo. In un
 * render il fuoco è esatto dal primo fotogramma, ed è uno di quei dettagli che
 * non si sanno nominare ma si sentono. */
export const FocusSettle: React.FC<{
  /** fotogrammi (locali alla scena) in cui cade uno stacco */
  cuts: number[];
  amount?: number;
  frames?: number;
  children: React.ReactNode;
}> = ({ cuts, amount = 3.4, frames = 9, children }) => {
  const frame = useCurrentFrame();
  let blur = 0;
  for (const c of cuts) {
    if (frame >= c && frame < c + frames) {
      blur = Math.max(blur, amount * (1 - easeInOut(frame, c, frames)));
    }
  }
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        filter: blur > 0.01 ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </div>
  );
};
