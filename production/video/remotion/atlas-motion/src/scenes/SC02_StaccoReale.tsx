import { useCurrentFrame } from "remotion";
import { OpenCaption, SceneShell, easeInOut } from "../shared";

// SC02 — Lo stacco sul reale (§5, TC 00:07-00:14, 7s @ 25fps = 175 frame)
//
// Skyline industriale multi-livello (profondità atmosferica: strati più lontani più
// lenti, più scuri, più sfocati) al posto della ripresa drone reale — nessuna camera
// disponibile in questo ambiente.

const VO = "Quasi nessuna ha un dato che regga\nuna verifica esterna.";

const LAYER_FAR = [140, 190, 120, 230, 150, 200, 130, 170, 210, 160];
const LAYER_MID = [220, 280, 190, 320, 240, 270, 210, 260];
const LAYER_NEAR = [340, 260, 380, 300];

export const SC02_StaccoReale: React.FC = () => {
  const frame = useCurrentFrame();
  const captionIn = easeInOut(frame, 15, 10);
  const pushIn = 1 + frame * 0.0007; // lento push-in drone

  return (
    <SceneShell bg="#141c22">
      <div style={{ position: "absolute", inset: 0, transform: `scale(${pushIn})` }}>
        {/* cielo livido all'alba, con bagliore d'orizzonte */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, #1c2933 0%, #223541 45%, #2c3f47 62%, #17202400 100%)" }} />
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: 360,
            width: 900,
            height: 220,
            transform: "translateX(-50%)",
            background: "radial-gradient(ellipse at center, rgba(180,150,110,0.28), rgba(180,150,110,0) 70%)",
          }}
        />

        <Layer heights={LAYER_FAR} bottom={330} width={40} gap={18} color="#0f151a" opacity={0.55} blur={2} speed={0.05} frame={frame} />
        <Layer heights={LAYER_MID} bottom={280} width={50} gap={24} color="#0c1114" opacity={0.8} blur={0.6} speed={0.12} frame={frame} />
        <Layer heights={LAYER_NEAR} bottom={240} width={62} gap={30} color="#080b0d" opacity={1} blur={0} speed={0.22} frame={frame} />

        <div style={{ position: "absolute", bottom: 235, left: -80, right: -80, height: 8, backgroundColor: "#080b0d" }} />

        {/* vapore, piu' strati con timing variabile */}
        {[260, 360, 470, 560].map((x, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: 300,
              left: x,
              width: 26 + (i % 2) * 10,
              height: 260,
              background: "linear-gradient(to top, rgba(230,235,238,0.22), rgba(230,235,238,0))",
              filter: "blur(11px)",
              opacity: 0.35 + 0.25 * Math.sin((frame + i * 26) / 16),
              transform: `translateX(${Math.sin((frame + i * 40) / 30) * 8}px)`,
            }}
          />
        ))}
      </div>

      <OpenCaption text={VO} opacity={captionIn} />
    </SceneShell>
  );
};

const Layer: React.FC<{
  heights: number[];
  bottom: number;
  width: number;
  gap: number;
  color: string;
  opacity: number;
  blur: number;
  speed: number;
  frame: number;
}> = ({ heights, bottom, width, gap, color, opacity, blur, speed, frame }) => {
  const totalW = heights.length * (width + gap);
  const shift = (-frame * speed * 20) % totalW;
  return (
    <div style={{ position: "absolute", bottom, left: shift - totalW, display: "flex", gap, opacity, filter: blur ? `blur(${blur}px)` : undefined }}>
      {[...heights, ...heights, ...heights].map((h, i) => (
        <div key={i} style={{ width, height: h, backgroundColor: color, borderRadius: "3px 3px 0 0" }} />
      ))}
    </div>
  );
};
