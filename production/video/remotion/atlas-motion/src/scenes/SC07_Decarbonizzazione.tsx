import { useCurrentFrame } from "remotion";
import { AZZURRO, FONT, VERDE, OpenCaption, SceneShell, easeInOut } from "../shared";

// SC07 — Decarbonizzazione e assorbimento (§5, TC 01:00-01:14, 14s @ 25fps = 350 frame)
//
// Campo di linee verticali (culmi) desaturato, ora su tre piani di profondità
// (fondo/medio/primo piano con blur e opacità decrescenti) — "la natura qui e'
// infrastruttura produttiva, non idillio" (§5).

const VO = "Ciò che non puoi eliminare, lo assorbi.\nMa solo se lo conti davvero: ettaro per ettaro,\npianta per pianta, misura per misura.";

const WALK_END = 125;
const CALIPER_END = 225;

const makeCulms = (count: number, seedBase: number) =>
  Array.from({ length: count }, (_, i) => ({
    x: (i * (1920 / count) + seedBase * 17) % 1920,
    h: 420 + ((i * 41 + seedBase * 30) % 380),
    phase: i * 0.7 + seedBase,
  }));

const BACK = makeCulms(16, 3);
const MID = makeCulms(18, 11);
const FRONT = makeCulms(14, 23);

export const SC07_Decarbonizzazione: React.FC = () => {
  const frame = useCurrentFrame();
  const captionIn = easeInOut(frame, 15, 10);
  const rise = frame >= CALIPER_END ? easeInOut(frame, CALIPER_END, 45) : 0;
  const fieldScale = 1 - rise * 0.55;
  const fieldY = rise * 260;

  return (
    <SceneShell bg="#101510">
      <div style={{ position: "absolute", inset: 0, transform: `scale(${fieldScale}) translateY(${fieldY}px)` }}>
        <CulmLayer culms={BACK} frame={frame} color="#293529" opacity={0.4} blur={4} swayAmp={4} measuredIndex={-1} />
        <CulmLayer culms={MID} frame={frame} color="#324332" opacity={0.65} blur={1.4} swayAmp={6} measuredIndex={-1} />
        <CulmLayer
          culms={FRONT}
          frame={frame}
          color="#3d4a3d"
          opacity={0.92}
          blur={0}
          swayAmp={8}
          measuredIndex={7}
          measuredWindow={[WALK_END, CALIPER_END]}
        />
      </div>

      {rise > 0.15 && (
        <div style={{ position: "absolute", inset: 0, opacity: Math.min(1, (rise - 0.15) / 0.5) }}>
          <GridOverlay />
        </div>
      )}

      {rise > 0.5 && (
        <div
          style={{
            position: "absolute",
            top: "16%",
            left: 0,
            right: 0,
            textAlign: "center",
            opacity: Math.min(1, (rise - 0.5) / 0.4),
          }}
        >
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 52, letterSpacing: 3, color: "#ffffff" }}>MISURATO, NON STIMATO</div>
          <div style={{ width: 90, height: 3, backgroundColor: AZZURRO, margin: "18px auto 0" }} />
        </div>
      )}

      <OpenCaption text={VO} opacity={captionIn * (rise > 0 ? Math.max(0, 1 - rise * 1.4) : 1)} />
    </SceneShell>
  );
};

const CulmLayer: React.FC<{
  culms: { x: number; h: number; phase: number }[];
  frame: number;
  color: string;
  opacity: number;
  blur: number;
  swayAmp: number;
  measuredIndex: number;
  measuredWindow?: [number, number];
}> = ({ culms, frame, color, opacity, blur, swayAmp, measuredIndex, measuredWindow }) => (
  <div style={{ position: "absolute", inset: 0, opacity, filter: blur ? `blur(${blur}px)` : undefined }}>
    {culms.map((c, i) => {
      const sway = Math.sin((frame + c.phase * 20) / 42) * swayAmp;
      const isMeasured = i === measuredIndex;
      const measureIn =
        isMeasured && measuredWindow && frame >= measuredWindow[0] && frame < measuredWindow[1]
          ? easeInOut(frame, measuredWindow[0] + 10, 16)
          : 0;
      return (
        <div key={i} style={{ position: "absolute", bottom: 0, left: c.x }}>
          <div
            style={{
              width: 12,
              height: c.h,
              backgroundColor: isMeasured ? VERDE : color,
              transform: `translateX(${sway}px)`,
              borderRadius: 5,
              boxShadow: isMeasured ? "0 0 24px rgba(127,187,70,0.35)" : "none",
            }}
          />
          {isMeasured && measureIn > 0 && (
            <div
              style={{
                position: "absolute",
                left: -20,
                bottom: c.h - 260,
                width: 52,
                height: 60,
                borderTop: `3px solid ${AZZURRO}`,
                borderLeft: `3px solid ${AZZURRO}`,
                borderRight: `3px solid ${AZZURRO}`,
                opacity: measureIn,
              }}
            />
          )}
        </div>
      );
    })}
  </div>
);

const GridOverlay: React.FC = () => (
  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: 8 }).map((_, i) => (
      <line key={`v${i}`} x1={(i * 1920) / 7} y1={0} x2={(i * 1920) / 7} y2={1080} stroke={AZZURRO} strokeWidth={1} opacity={0.32} />
    ))}
    {Array.from({ length: 5 }).map((_, i) => (
      <line key={`h${i}`} x1={0} y1={(i * 1080) / 4} x2={1920} y2={(i * 1080) / 4} stroke={AZZURRO} strokeWidth={1} opacity={0.32} />
    ))}
  </svg>
);
