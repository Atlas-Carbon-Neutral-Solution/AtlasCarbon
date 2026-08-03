import { AbsoluteFill, useCurrentFrame } from "remotion";
import { AZZURRO, FONT, VERDE, OpenCaption, easeInOut } from "../shared";

// SC07 — Decarbonizzazione e assorbimento (§5, TC 01:00-01:14, 14s @ 25fps = 350 frame)
//
// Campo di linee verticali (culmi) desaturato — "la natura qui e' infrastruttura
// produttiva, non idillio" (§5): niente verde vivido da cartolina, niente giungla.

const VO = "Ciò che non puoi eliminare, lo assorbi. Ma solo se lo conti davvero:\nettaro per ettaro, pianta per pianta, misura per misura.";

const WALK_END = 125; // 5s
const CALIPER_END = 225; // +4s
// resto: aerea (5s)

const CULMS = Array.from({ length: 22 }, (_, i) => ({
  x: (i * 57) % 1920,
  h: 520 + ((i * 41) % 260),
  phase: i * 0.7,
}));

export const SC07_Decarbonizzazione: React.FC = () => {
  const frame = useCurrentFrame();
  const captionIn = easeInOut(frame, 15, 9);
  const rise = frame >= CALIPER_END ? easeInOut(frame, CALIPER_END, 40) : 0;
  const fieldScale = 1 - rise * 0.55;
  const fieldY = rise * 260;

  return (
    <AbsoluteFill style={{ backgroundColor: "#171c17", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${fieldScale}) translateY(${fieldY}px)`,
        }}
      >
        {CULMS.map((c, i) => {
          const sway = Math.sin((frame + c.phase * 20) / 40) * 6;
          const isMeasured = i === 11;
          const measureIn = frame >= WALK_END && frame < CALIPER_END ? easeInOut(frame, WALK_END + 10, 15) : 0;
          return (
            <div key={i} style={{ position: "absolute", bottom: 0, left: c.x }}>
              <div
                style={{
                  width: 10,
                  height: c.h,
                  backgroundColor: isMeasured ? VERDE : "#3d4a3d",
                  opacity: isMeasured ? 0.9 : 0.55,
                  transform: `translateX(${sway}px)`,
                  borderRadius: 4,
                }}
              />
              {isMeasured && measureIn > 0 && (
                <div
                  style={{
                    position: "absolute",
                    left: -16,
                    bottom: 260,
                    width: 42,
                    height: 6 + measureIn * 0,
                    borderTop: `2px solid ${AZZURRO}`,
                    borderLeft: `2px solid ${AZZURRO}`,
                    borderRight: `2px solid ${AZZURRO}`,
                    opacity: measureIn,
                  }}
                />
              )}
            </div>
          );
        })}
      </AbsoluteFill>

      {rise > 0.15 && (
        <AbsoluteFill style={{ opacity: Math.min(1, (rise - 0.15) / 0.5) }}>
          <GridOverlay />
        </AbsoluteFill>
      )}

      {rise > 0.5 && (
        <div
          style={{
            position: "absolute",
            top: "18%",
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 36,
            letterSpacing: 2,
            color: "#ffffff",
            opacity: Math.min(1, (rise - 0.5) / 0.4),
          }}
        >
          MISURATO, NON STIMATO
        </div>
      )}

      <OpenCaption text={VO} opacity={captionIn * (rise > 0 ? 1 - rise : 1)} />
    </AbsoluteFill>
  );
};

const GridOverlay: React.FC = () => (
  <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: 8 }).map((_, i) => (
      <line key={`v${i}`} x1={(i * 1920) / 7} y1={0} x2={(i * 1920) / 7} y2={1080} stroke={AZZURRO} strokeWidth={1} opacity={0.35} />
    ))}
    {Array.from({ length: 5 }).map((_, i) => (
      <line key={`h${i}`} x1={0} y1={(i * 1080) / 4} x2={1920} y2={(i * 1080) / 4} stroke={AZZURRO} strokeWidth={1} opacity={0.35} />
    ))}
  </svg>
);
