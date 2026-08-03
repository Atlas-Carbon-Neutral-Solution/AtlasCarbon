import { useCurrentFrame } from "remotion";
import { AZZURRO, OpenCaption, SceneShell, easeInOut } from "../shared";

// SC03 — La pressione esterna (§5, TC 00:14-00:24, 10s @ 25fps = 250 frame)
//
// 4 vignette astratte da ~2.5s, testi sempre illeggibili per design (§2.2/§5).
// Ogni vignetta ha ora un bagliore da monitor dietro di se' ("luce fredda da
// monitor", §5) e elementi piu' grandi/definiti.

const VO = "Non lo chiede più solo il regolatore.\nLo chiedono le banche, i capitolati,\ni clienti a monte della tua filiera.";

const SEGMENTS = [63, 62, 63, 62];

export const SC03_Pressione: React.FC = () => {
  const frame = useCurrentFrame();
  const captionIn = easeInOut(frame, 12, 10);

  let acc = 0;
  const bounds = SEGMENTS.map((len) => {
    const start = acc;
    acc += len;
    return { start, end: acc, len };
  });

  return (
    <SceneShell bg="#12151a">
      <MonitorGlow />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {frame < bounds[0].end && <Vignette1 frame={frame - bounds[0].start} />}
        {frame >= bounds[0].end && frame < bounds[1].end && <Vignette2 frame={frame - bounds[1].start} />}
        {frame >= bounds[1].end && frame < bounds[2].end && <Vignette3 frame={frame - bounds[2].start} />}
        {frame >= bounds[2].end && <Vignette4 frame={frame - bounds[3].start} />}
      </div>

      <OpenCaption text={VO} opacity={captionIn} />
    </SceneShell>
  );
};

const MonitorGlow: React.FC = () => (
  <div
    style={{
      position: "absolute",
      left: "50%",
      top: "38%",
      width: 900,
      height: 900,
      transform: "translate(-50%,-50%)",
      background: `radial-gradient(circle, rgba(83,164,219,0.13), rgba(83,164,219,0) 60%)`,
    }}
  />
);

const Vignette1: React.FC<{ frame: number }> = ({ frame }) => (
  <div style={{ width: 680, height: 420, overflow: "hidden", position: "relative", borderRadius: 10, boxShadow: "0 40px 90px rgba(0,0,0,0.6)" }}>
    <div style={{ position: "absolute", inset: 0, backgroundColor: "#20242a" }} />
    <div style={{ position: "absolute", top: -frame * 3.4, left: 34, right: 34, display: "flex", flexDirection: "column", gap: 22 }}>
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} style={{ height: 18, width: `${58 + ((i * 13) % 34)}%`, backgroundColor: "#565c63", borderRadius: 4, filter: "blur(1.6px)" }} />
      ))}
    </div>
  </div>
);

const Vignette2: React.FC<{ frame: number }> = ({ frame }) => {
  const tap = easeInOut(frame, 18, 10);
  return (
    <div style={{ position: "relative", width: 300, height: 300 }}>
      <div style={{ position: "absolute", inset: 0, border: "4px solid #7a8087", borderRadius: 10, boxShadow: "0 30px 70px rgba(0,0,0,0.5)" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 10,
          backgroundColor: AZZURRO,
          opacity: tap * 0.55,
          transform: `scale(${1 - tap * 0.1})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -30,
          borderRadius: 20,
          boxShadow: `0 0 0 ${tap * 18}px rgba(83,164,219,${tap * 0.12})`,
        }}
      />
    </div>
  );
};

const Vignette3: React.FC<{ frame: number }> = ({ frame }) => {
  const circleIn = easeInOut(frame, 15, 12);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 62px)", gridTemplateRows: "repeat(4, 62px)", gap: 10 }}>
      {Array.from({ length: 28 }).map((_, i) => {
        const isTarget = i === 17;
        return (
          <div
            key={i}
            style={{
              width: 62,
              height: 62,
              borderRadius: 6,
              backgroundColor: "#262b31",
              border: isTarget ? `4px solid ${AZZURRO}` : "1px solid #3a3f45",
              opacity: isTarget ? 1 : 0.55,
              boxShadow: isTarget ? `0 0 0 ${circleIn * 6}px rgba(83,164,219,${circleIn * 0.3})` : "none",
            }}
          />
        );
      })}
    </div>
  );
};

const Vignette4: React.FC<{ frame: number }> = ({ frame }) => {
  const draw = Math.min(1, frame / 38);
  const pathLength = 640;
  return (
    <div style={{ padding: 60, backgroundColor: "#1b1f24", borderRadius: 12, boxShadow: "0 40px 90px rgba(0,0,0,0.55)" }}>
      <svg width={560} height={220} viewBox="0 0 560 220">
        <path
          d="M40 150 C 95 60, 140 200, 195 105 S 280 40, 325 128 S 410 178, 465 92 S 505 60, 525 105"
          fill="none"
          stroke="#d8dadc"
          strokeWidth={5}
          strokeLinecap="round"
          strokeDasharray={pathLength}
          strokeDashoffset={pathLength * (1 - draw)}
        />
      </svg>
    </div>
  );
};
