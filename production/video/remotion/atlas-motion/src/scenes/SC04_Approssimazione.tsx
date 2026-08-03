import { useCurrentFrame } from "remotion";
import { OpenCaption, SceneShell, easeInOut } from "../shared";

// SC04 — Il costo dell'approssimazione (§5, TC 00:24-00:32, 8s @ 25fps = 200 frame)

const VO = "Chi stima invece di misurare paga due volte.\nPaga l'energia che spreca, e il carbonio\nche non sa di emettere.";

// pseudo-random deterministico (nessun Math.random, dipende solo dal frame)
const digitAt = (frame: number, slot: number) => Math.floor(Math.abs(Math.sin(frame * 0.31 + slot * 7.7)) * 10);

export const SC04_Approssimazione: React.FC = () => {
  const frame = useCurrentFrame();
  const captionIn = easeInOut(frame, 15, 10);
  const meterOut = easeInOut(frame, 88, 12);
  const valveIn = easeInOut(frame, 92, 12);
  const torchX = 40 + ((frame % 110) / 110) * 340;

  return (
    <SceneShell bg="#07090a">
      {/* contatore elettrico, prima metà della scena */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 1 - meterOut }}>
        <div
          style={{
            display: "flex",
            gap: 8,
            padding: "30px 40px",
            backgroundColor: "#181b1e",
            borderRadius: 10,
            border: "1px solid #383d42",
            boxShadow: "0 40px 90px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 56,
                height: 82,
                backgroundColor: "#000",
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "monospace",
                fontSize: 52,
                color: "#e8a63c",
                textShadow: "0 0 18px rgba(232,166,60,0.55)",
              }}
            >
              {digitAt(frame, i)}
            </div>
          ))}
        </div>
      </div>

      {/* valvola che perde vapore, seconda metà, illuminata da una torcia in movimento */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: valveIn }}>
        <div style={{ position: "relative", width: 520, height: 320 }}>
          <div
            style={{
              position: "absolute",
              left: torchX,
              top: 40,
              width: 340,
              height: 340,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,244,214,0.24) 0%, rgba(255,244,214,0.08) 35%, rgba(255,244,214,0) 70%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 150,
              top: 120,
              width: 220,
              height: 90,
              backgroundColor: "#2c3033",
              borderRadius: 10,
              boxShadow: "inset 0 -12px 20px rgba(0,0,0,0.5), 0 20px 40px rgba(0,0,0,0.5)",
            }}
          />
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: 236 + i * 12,
                top: 60,
                width: 22,
                height: 130,
                background: "linear-gradient(to top, rgba(255,255,255,0.28), rgba(255,255,255,0))",
                filter: "blur(7px)",
                opacity: 0.45 + 0.3 * Math.sin((frame + i * 20) / 10),
              }}
            />
          ))}
        </div>
      </div>

      <OpenCaption text={VO} opacity={captionIn} />
    </SceneShell>
  );
};
