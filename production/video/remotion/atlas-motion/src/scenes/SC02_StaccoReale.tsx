import { AbsoluteFill, useCurrentFrame } from "remotion";
import { OpenCaption, easeInOut } from "../shared";

// SC02 — Lo stacco sul reale (§5, TC 00:07-00:14, 7s @ 25fps = 175 frame)
//
// Skyline industriale astratto (silos/nastri) al posto della ripresa drone reale
// descritta dallo script — nessuna camera disponibile in questo ambiente.

const VO = "Quasi nessuna ha un dato che regga una verifica esterna.";

export const SC02_StaccoReale: React.FC = () => {
  const frame = useCurrentFrame();
  const captionIn = easeInOut(frame, 15, 9);
  const drift = interpolateDrift(frame);

  return (
    <AbsoluteFill style={{ backgroundColor: "#1c2126", overflow: "hidden" }}>
      {/* cielo livido all'alba */}
      <AbsoluteFill
        style={{
          background: "linear-gradient(to bottom, #23303a 0%, #1c2126 60%)",
        }}
      />

      {/* skyline industriale, leggero drift laterale come un push-in drone */}
      <div style={{ position: "absolute", bottom: 0, left: -60 + drift, right: -60, display: "flex", alignItems: "flex-end", gap: 26 }}>
        {SILOS.map((h, i) => (
          <div
            key={i}
            style={{
              width: 54,
              height: h,
              backgroundColor: "#101315",
              borderRadius: "6px 6px 0 0",
            }}
          />
        ))}
        <div style={{ width: 220, height: 6, backgroundColor: "#101315" }} />
      </div>

      {/* vapore: strisce verticali sfocate con opacità pulsante */}
      {[220, 340, 460].map((x, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: 260,
            left: x + drift,
            width: 30,
            height: 220,
            background: "linear-gradient(to top, rgba(255,255,255,0.16), rgba(255,255,255,0))",
            filter: "blur(10px)",
            opacity: 0.4 + 0.2 * Math.sin((frame + i * 30) / 18),
          }}
        />
      ))}

      <OpenCaption text={VO} opacity={captionIn} />
    </AbsoluteFill>
  );
};

const SILOS = [180, 240, 150, 300, 190, 260, 170, 220];

function interpolateDrift(frame: number) {
  return -frame * 0.18; // push laterale lento, deterministico
}
