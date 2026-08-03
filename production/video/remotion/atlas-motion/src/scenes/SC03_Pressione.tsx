import { AbsoluteFill, useCurrentFrame } from "remotion";
import { AZZURRO, OpenCaption, easeInOut } from "../shared";

// SC03 — La pressione esterna (§5, TC 00:14-00:24, 10s @ 25fps = 250 frame)
//
// 4 vignette astratte da ~2.5s, testi sempre illeggibili per design (§2.2/§5:
// "i testi su schermo restano illeggibili per design").

const VO = "Non lo chiede più solo il regolatore. Lo chiedono le banche, i capitolati,\ni clienti a monte della tua filiera.";

const SEGMENTS = [63, 62, 63, 62];

export const SC03_Pressione: React.FC = () => {
  const frame = useCurrentFrame();
  const captionIn = easeInOut(frame, 12, 9);

  let acc = 0;
  const bounds = SEGMENTS.map((len) => {
    const start = acc;
    acc += len;
    return { start, end: acc, len };
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1d21" }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        {frame < bounds[0].end && <Vignette1 frame={frame - bounds[0].start} />}
        {frame >= bounds[0].end && frame < bounds[1].end && <Vignette2 frame={frame - bounds[1].start} />}
        {frame >= bounds[1].end && frame < bounds[2].end && <Vignette3 frame={frame - bounds[2].start} />}
        {frame >= bounds[2].end && <Vignette4 frame={frame - bounds[3].start} />}
      </AbsoluteFill>

      <OpenCaption text={VO} opacity={captionIn} />
    </AbsoluteFill>
  );
};

const Vignette1: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ width: 560, height: 340, overflow: "hidden", position: "relative" }}>
    <div style={{ position: "absolute", top: -frame * 3, left: 0, right: 0, display: "flex", flexDirection: "column", gap: 16 }}>
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} style={{ height: 14, width: `${60 + ((i * 13) % 30)}%`, backgroundColor: "#4a4f55", borderRadius: 3, filter: "blur(1.4px)" }} />
      ))}
    </div>
  </div>
);

const Vignette2: React.FC<{ frame: number }> = ({ frame }) => {
  const tap = easeInOut(frame, 20, 8);
  return (
    <div style={{ position: "relative", width: 220, height: 220 }}>
      <div style={{ position: "absolute", inset: 0, border: "3px solid #6b7076", borderRadius: 6 }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 6,
          backgroundColor: AZZURRO,
          opacity: tap * 0.5,
          transform: `scale(${1 - tap * 0.08})`,
        }}
      />
    </div>
  );
};

const Vignette3: React.FC<{ frame: number }> = ({ frame }) => {
  const circleIn = easeInOut(frame, 15, 10);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 46px)", gridTemplateRows: "repeat(4, 46px)", gap: 8 }}>
      {Array.from({ length: 28 }).map((_, i) => {
        const isTarget = i === 17;
        return (
          <div
            key={i}
            style={{
              width: 46,
              height: 46,
              borderRadius: 4,
              backgroundColor: "#2a2e33",
              border: isTarget ? `3px solid ${AZZURRO}` : "1px solid #3a3f45",
              opacity: isTarget ? 1 : 0.5,
              boxShadow: isTarget ? `0 0 0 ${circleIn * 4}px rgba(83,164,219,${circleIn * 0.25})` : "none",
            }}
          />
        );
      })}
    </div>
  );
};

const Vignette4: React.FC<{ frame: number }> = ({ frame }) => {
  const draw = Math.min(1, frame / 40);
  const pathLength = 600;
  return (
    <svg width={520} height={200} viewBox="0 0 520 200">
      <path
        d="M40 140 C 90 60, 130 190, 180 100 S 260 40, 300 120 S 380 170, 430 90 S 470 60, 490 100"
        fill="none"
        stroke="#c7cacd"
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={pathLength * (1 - draw)}
      />
    </svg>
  );
};
