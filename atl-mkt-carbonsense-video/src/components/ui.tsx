import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {useLayout} from '../layout';
import {font, palette, weight} from '../theme';

/**
 * Primitive grafiche dello stampo. Nessun testo qui dentro: i contenuti
 * arrivano sempre da `src/content/*.ts`.
 */

const easeOut = Easing.bezier(0.22, 1, 0.36, 1);

/** Fade + risalita, con ritardo espresso in frame relativi alla scena. */
export const Reveal: React.FC<{
  delay?: number;
  duration?: number;
  distance?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({delay = 0, duration = 22, distance = 26, style, children}) => {
  const frame = useCurrentFrame();
  const {px} = useLayout();
  const progress = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: easeOut,
  });

  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${px(distance) * (1 - progress)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Griglia orbitale in lenta deriva: contesto spaziale senza illustrazione. */
const OrbitalGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useLayout();
  const drift = frame * 0.035;

  return (
    <AbsoluteFill style={{opacity: 0.5}}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <g
          fill="none"
          stroke={palette.line}
          strokeWidth={1.2}
          transform={`translate(${width * 0.72} ${height * 0.34}) rotate(${-18 + drift})`}
        >
          {[0.24, 0.38, 0.52, 0.66, 0.8].map((r, i) => (
            <ellipse key={r} rx={width * r} ry={width * r * 0.34} opacity={0.9 - i * 0.14} />
          ))}
        </g>
        <g stroke={palette.line} strokeWidth={1} opacity={0.35}>
          {Array.from({length: 9}).map((_, i) => {
            const y = (height / 9) * (i + 1) + Math.sin((frame + i * 40) / 90) * 4;
            return <line key={i} x1={0} x2={width} y1={y} y2={y} />;
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Posizione della luce per scena: cambiare l'accento evita che sette scene
 * consecutive sullo stesso fondo sembrino la stessa immagine.
 */
export type Tone = 'top-right' | 'left' | 'bottom-right' | 'center';

const GLOW: Record<Tone, {x: string; y: string}> = {
  'top-right': {x: '80%', y: '16%'},
  left: {x: '14%', y: '34%'},
  'bottom-right': {x: '76%', y: '78%'},
  center: {x: '50%', y: '40%'},
};

export const Background: React.FC<{grid?: boolean; tone?: Tone}> = ({
  grid = true,
  tone = 'top-right',
}) => {
  const glow = GLOW[tone];

  return (
    <AbsoluteFill style={{backgroundColor: palette.night}}>
      {/* Strato 1: volume del fondo. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(110% 85% at ${glow.x} ${glow.y}, ${palette.canopy} 0%, ${palette.night} 44%, ${palette.nightDeep} 100%)`,
        }}
      />
      {/* Strato 2: alone verde, il punto luce della scena. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(38% 42% at ${glow.x} ${glow.y}, rgba(79,163,220,0.20) 0%, rgba(79,163,220,0) 70%)`,
        }}
      />
      {/* Strato 3: riflesso freddo opposto, per staccare i piani. */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(50% 50% at 8% 92%, rgba(122,192,67,0.12) 0%, rgba(122,192,67,0) 68%)',
        }}
      />
      {grid ? <OrbitalGrid /> : null}
      {/* Strato 4: grana fine. Un pattern CSS, non un filtro SVG: costa nulla
          per frame e sul render 1080p non si vede la differenza. */}
      <AbsoluteFill
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.055) 0.5px, rgba(255,255,255,0) 0.5px)',
          backgroundSize: '3px 3px',
          opacity: 0.85,
        }}
      />
      {/* Strato 5: vignettatura. */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(85% 75% at 50% 50%, rgba(0,0,0,0) 38%, rgba(0,0,0,0.52) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};

/** Contenitore di scena: margini di sicurezza uguali in tutti i formati. */
export const SceneFrame: React.FC<{
  justify?: React.CSSProperties['justifyContent'];
  children: React.ReactNode;
}> = ({justify = 'center', children}) => {
  const {pad, height, stacked} = useLayout();

  return (
    <AbsoluteFill
      style={{
        fontFamily: font.sans,
        color: palette.text,
        // Nei formati stretti il fondo è occupato dai sottotitoli incisi: lo
        // spazio va riservato, non conteso.
        paddingTop: height * (stacked ? 0.14 : 0.13),
        paddingBottom: height * (stacked ? 0.22 : 0.13),
        paddingLeft: pad,
        paddingRight: pad,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: justify,
        gap: 0,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const Kicker: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {px} = useLayout();

  return (
    <div
      style={{
        fontFamily: font.mono,
        fontSize: px(21),
        letterSpacing: px(3),
        textTransform: 'uppercase',
        color: palette.accentSoft,
      }}
    >
      {children}
    </div>
  );
};

export const SceneTitle: React.FC<{size?: number; children: React.ReactNode}> = ({
  size = 52,
  children,
}) => {
  const {px} = useLayout();

  return (
    <div
      style={{
        fontSize: px(size),
        fontWeight: weight.semibold,
        letterSpacing: px(-0.8),
        lineHeight: 1.12,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Testata di scena: etichetta numerata + titolo.
 * Senza il titolo lo spettatore vede una lista e non sa di che si parla: è la
 * stessa funzione che aveva il titolo di slide nel deck.
 */
export const SceneHeader: React.FC<{
  label: string;
  title: string;
  size?: number;
  delay?: number;
}> = ({label, title, size = 46, delay = 0}) => {
  const {px} = useLayout();

  return (
    <div style={{marginBottom: px(26)}}>
      <Reveal delay={delay}>
        <div style={{display: 'flex', alignItems: 'center', gap: px(14)}}>
          <div style={{width: px(34), height: px(2), backgroundColor: palette.accent}} />
          <Kicker>{label}</Kicker>
        </div>
      </Reveal>
      <Reveal delay={delay + 8} distance={18}>
        <div style={{marginTop: px(14)}}>
          <SceneTitle size={size}>{title}</SceneTitle>
        </div>
      </Reveal>
    </div>
  );
};

/**
 * Due colonne in orizzontale, una sotto l'altra in verticale: le scene non
 * ripetono la logica del formato.
 */
export const Split: React.FC<{
  ratio?: [number, number];
  align?: React.CSSProperties['alignItems'];
  left: React.ReactNode;
  right: React.ReactNode;
}> = ({ratio = [1, 1], align = 'center', left, right}) => {
  const {px, stacked} = useLayout();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: stacked ? 'column' : 'row',
        alignItems: stacked ? 'stretch' : align,
        gap: px(stacked ? 26 : 46),
      }}
    >
      <div style={{flex: ratio[0], minWidth: 0}}>{left}</div>
      <div style={{flex: ratio[1], minWidth: 0}}>{right}</div>
    </div>
  );
};

/**
 * Nota sotto le figure che somigliano a un grafico: dichiara che è uno schema,
 * non una misura. Serve esattamente dove il pubblico potrebbe leggere un dato.
 */
export const FigureCaption: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {px} = useLayout();

  return (
    <div
      style={{
        fontFamily: font.mono,
        fontSize: px(14),
        letterSpacing: px(0.6),
        color: palette.textFaint,
        marginTop: px(12),
      }}
    >
      {children}
    </div>
  );
};

/** Barra verde a sinistra del testo: usata per le frasi-chiave. */
export const AccentBar: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {px} = useLayout();

  return (
    <div style={{display: 'flex', gap: px(24), alignItems: 'stretch'}}>
      <div style={{width: px(5), backgroundColor: palette.accent, borderRadius: px(3)}} />
      <div style={{fontSize: px(40), fontWeight: weight.medium, lineHeight: 1.2}}>{children}</div>
    </div>
  );
};

export const Panel: React.FC<{
  active?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({active = true, style, children}) => {
  const {px} = useLayout();

  return (
    <div
      style={{
        backgroundColor: palette.panel,
        border: `1px solid ${active ? palette.line : 'rgba(255,255,255,0.06)'}`,
        borderRadius: px(14),
        padding: px(26),
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * Riga di stato TRL / brevetto. Non è decorativa: tiene lo spot dentro il
 * perimetro dichiarabile. Non ridurne la leggibilità (docs/COMPLIANCE_DELTA.md).
 */
export const StatusLine: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {px} = useLayout();

  return (
    <div
      style={{
        fontFamily: font.mono,
        fontSize: px(20),
        lineHeight: 1.5,
        color: palette.text,
        borderTop: `1px solid ${palette.line}`,
        paddingTop: px(14),
      }}
    >
      {children}
    </div>
  );
};

/**
 * Barra di avanzamento: assolve alla funzione di leggibilità in autoplay muto
 * segnalando quanto resta dello spot.
 */
export const ProgressRail: React.FC<{
  segments: {duration: number}[];
  frame: number;
  total: number;
}> = ({segments, frame, total}) => {
  const {px, pad, width} = useLayout();
  const available = width - pad * 2;
  const gap = px(6);
  const inner = available - gap * (segments.length - 1);
  let elapsed = 0;

  return (
    <div
      style={{
        position: 'absolute',
        left: pad,
        right: pad,
        bottom: px(34),
        display: 'flex',
        gap,
        opacity: interpolate(frame, [0, 20, total - 20, total], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }),
      }}
    >
      {segments.map((segment, i) => {
        const start = elapsed;
        elapsed += segment.duration;
        const fill = interpolate(frame, [start, start + segment.duration], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        return (
          <div
            key={i}
            style={{
              width: (inner * segment.duration) / total,
              height: px(3),
              backgroundColor: 'rgba(255,255,255,0.14)',
              borderRadius: px(2),
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${fill * 100}%`,
                height: '100%',
                backgroundColor: palette.accent,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

/**
 * Sottotitoli incisi. LinkedIn e Instagram partono in autoplay muto: sui
 * formati social restano sempre attivi (docs/…Script60_v1.md, doppiaggio).
 */
export const Subtitles: React.FC<{text: string}> = ({text}) => {
  const frame = useCurrentFrame();
  const {px, pad, stacked} = useLayout();

  return (
    <div
      style={{
        position: 'absolute',
        left: pad,
        right: pad,
        // In verticale i sottotitoli stanno più alti: sotto passa la barra di
        // avanzamento e, su Instagram, la UI dell'app.
        bottom: px(stacked ? 130 : 62),
        textAlign: 'center',
        fontFamily: font.sans,
        fontSize: px(26),
        lineHeight: 1.35,
        color: palette.text,
        textShadow: '0 2px 12px rgba(0,0,0,0.8)',
        opacity: interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'}),
      }}
    >
      {text}
    </div>
  );
};
