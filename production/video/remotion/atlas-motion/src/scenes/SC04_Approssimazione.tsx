import { AbsoluteFill, useCurrentFrame } from "remotion";
import { OpenCaption, easeInOut } from "../shared";

// SC04 — Il costo dell'approssimazione (§5, TC 00:24-00:32, 8s @ 25fps = 200 frame)

const VO = "Chi stima invece di misurare paga due volte.\nPaga l'energia che spreca. E paga il carbonio che non sa di emettere.";

// pseudo-random deterministico (nessun Math.random, dipende solo dal frame)
const digitAt = (frame: number, slot: number) => Math.floor(Math.abs(Math.sin(frame * 0.31 + slot * 7.7)) * 10);

export const SC04_Approssimazione: React.FC = () => {
  const frame = useCurrentFrame();
  const captionIn = easeInOut(frame, 15, 9);
  const meterOut = easeInOut(frame, 90, 12);
  const valveIn = easeInOut(frame, 95, 12);
  const torchX = 60 + ((frame % 100) / 100) * 280;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0e1012" }}>
      {/* contatore elettrico, prima metà della scena */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: 1 - meterOut }}>
        <div
          style={{
            display: "flex",
            gap: 6,
            padding: "24px 32px",
            backgroundColor: "#1b1e21",
            borderRadius: 8,
            border: "1px solid #33373b",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 44,
                height: 64,
                backgroundColor: "#000",
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "monospace",
                fontSize: 40,
                color: "#e8a63c", // ambra neutro — evita qualunque verde diverso da V01
              }}
            >
              {digitAt(frame, i)}
            </div>
          ))}
        </div>
      </AbsoluteFill>

      {/* valvola che perde vapore, seconda metà, illuminata da una torcia in movimento */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: valveIn }}>
        <div style={{ position: "relative", width: 400, height: 260 }}>
          <div
            style={{
              position: "absolute",
              left: torchX,
              top: 40,
              width: 260,
              height: 260,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,244,214,0.18), rgba(255,244,214,0) 70%)",
            }}
          />
          <div style={{ position: "absolute", left: 140, top: 90, width: 120, height: 60, backgroundColor: "#2c3033", borderRadius: 6 }} />
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 190 + i * 10,
                top: 40,
                width: 18,
                height: 90,
                background: "linear-gradient(to top, rgba(255,255,255,0.22), rgba(255,255,255,0))",
                filter: "blur(6px)",
                opacity: 0.5 + 0.3 * Math.sin((frame + i * 20) / 10),
              }}
            />
          ))}
        </div>
      </AbsoluteFill>

      <OpenCaption text={VO} opacity={captionIn} />
    </AbsoluteFill>
  );
};
