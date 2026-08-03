import { useCurrentFrame } from "remotion";
import { OpenCaption, SceneShell, easeInOut } from "../shared";

// SC01 — L'apertura che nega il settore (§5, TC 00:00-00:07, 7s @ 25fps = 175 frame)
//
// Nessuna ripresa reale possibile in questo ambiente: rappresentazione astratta
// dell'azione descritta (fascicolo patinato che si chiude di scatto), con più
// profondità/luce rispetto alla prima versione — niente testo leggibile a schermo.

const VO = "Oggi ogni azienda ha un bilancio\ndi sostenibilità.";

export const SC01_Apertura: React.FC = () => {
  const frame = useCurrentFrame();

  const drift = frame * 0.35; // simula lo slider laterale 3cm/s del brief
  const snapFrame = 142;
  const closed = frame >= snapFrame;
  const snapProgress = easeInOut(frame, snapFrame, 5);
  const foldScaleY = 1 - snapProgress * 0.95;
  const foldTiltX = snapProgress * 8;

  const sweep = ((frame * 1.1) % 260) - 40; // luce radente che scorre sulla pagina

  const captionIn = easeInOut(frame, 24, 10);

  return (
    <SceneShell bg="#0b0d0f">
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective: 1400,
        }}
      >
        <div
          style={{
            width: 900,
            height: 560,
            backgroundColor: "#e4e6e8",
            borderRadius: 6,
            transform: `translateX(${drift}px) scaleY(${foldScaleY}) rotateX(${foldTiltX}deg)`,
            transformOrigin: "top center",
            boxShadow: "0 60px 120px rgba(0,0,0,0.55), 0 10px 30px rgba(0,0,0,0.4)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* luce radente */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: sweep,
              width: 180,
              background: "linear-gradient(100deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.55) 50%, rgba(255,255,255,0) 100%)",
              transform: "skewX(-18deg)",
            }}
          />

          <div style={{ padding: 64, opacity: closed ? 0 : 1, transition: "opacity 0.2s" }}>
            <div style={{ display: "flex", gap: 54, alignItems: "center" }}>
              <DonutGhost pct={0.62} />
              <DonutGhost pct={0.38} />
              <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ height: 8, width: `${92 - i * 16}%`, backgroundColor: "#b6b9bc", borderRadius: 4, filter: "blur(0.5px)" }} />
                ))}
              </div>
            </div>
            <div style={{ marginTop: 54, display: "flex", flexDirection: "column", gap: 12 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} style={{ height: 7, width: `${88 - i * 9}%`, backgroundColor: "#c7c9cc", borderRadius: 4 }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <OpenCaption text={VO} opacity={captionIn * (closed ? Math.max(0, 1 - snapProgress) : 1)} />
    </SceneShell>
  );
};

const DonutGhost: React.FC<{ pct: number }> = ({ pct }) => {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <svg width={112} height={112} style={{ filter: "blur(0.4px)" }}>
      <circle cx={56} cy={56} r={r} fill="none" stroke="#d4d6d8" strokeWidth={13} />
      <circle
        cx={56}
        cy={56}
        r={r}
        fill="none"
        stroke="#9aa0a6"
        strokeWidth={13}
        strokeDasharray={`${c * pct} ${c}`}
        strokeLinecap="round"
        transform="rotate(-90 56 56)"
      />
    </svg>
  );
};
