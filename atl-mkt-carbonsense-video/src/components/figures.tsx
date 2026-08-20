import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {useLayout} from '../layout';
import {font, palette} from '../theme';

/**
 * Figure schematiche, disegnate in SVG e animate.
 *
 * Regole seguite qui, perché una figura in uno spot è una dichiarazione come
 * un'altra:
 * - nessun dato numerico: gli schemi mostrano rapporti e topologia, non misure.
 *   Dove la forma somiglia a un grafico, la scena mostra la nota
 *   "schema illustrativo" (`meta.figureNote` nei contenuti);
 * - identità mai affidata al solo colore: linee tratteggiate/continue e
 *   etichette dirette, così restano leggibili anche stampate o in b/n;
 * - un solo verde accento più i neutri della palette; niente scale arbitrarie.
 */

const ease = (value: number) => value * value * (3 - 2 * value);

/** Progressione 0→1 su una finestra di frame, con curva morbida. */
const useProgress = (from: number, to: number) => {
  const frame = useCurrentFrame();
  return ease(
    interpolate(frame, [from, to], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
};

type FigureProps = {
  /** Altezza massima in px del master: oltre, la figura si riduce in proporzione. */
  height?: number;
};

/**
 * La figura occupa tutta la larghezza della sua colonna e si limita in altezza:
 * fissare l'altezza la lascerebbe piccola in mezzo al vuoto.
 */
const Svg: React.FC<{
  viewBox: string;
  height: number;
  clip?: boolean;
  children: React.ReactNode;
}> = ({viewBox, height, clip = false, children}) => {
  const {px, stacked} = useLayout();

  return (
    <svg
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      style={{
        display: 'block',
        width: '100%',
        height: 'auto',
        maxHeight: px(height) * (stacked ? 0.82 : 1),
        overflow: clip ? 'hidden' : 'visible',
      }}
    >
      {children}
    </svg>
  );
};

const labelStyle = {
  fontFamily: font.mono,
  fontSize: 13,
  letterSpacing: 0.6,
  fill: palette.textMuted,
} as const;

/* ------------------------------------------------------------------ *
 * 1 · Globo — hook e chiusura: il dato nasce in un punto del pianeta.
 * ------------------------------------------------------------------ */
export const FigureGlobe: React.FC<FigureProps & {faint?: boolean}> = ({
  height = 420,
  faint = false,
}) => {
  const frame = useCurrentFrame();
  const spin = frame * 0.012;
  const r = 150;
  const pulse = 0.5 + 0.5 * Math.sin(frame / 16);

  return (
    <Svg viewBox="-190 -190 380 380" height={height}>
      <defs>
        <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={palette.green} stopOpacity={faint ? 0.1 : 0.22} />
          <stop offset="100%" stopColor={palette.green} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle r={r * 1.5} fill="url(#globeGlow)" />
      <circle r={r} fill="none" stroke={palette.greenSoft} strokeWidth={1.6} opacity={faint ? 0.3 : 0.6} />

      {/* Meridiani: l'ampiezza varia con la fase, così il globo sembra girare. */}
      {Array.from({length: 6}).map((_, i) => {
        const phase = spin + (i * Math.PI) / 6;
        const rx = Math.abs(Math.cos(phase)) * r;
        return (
          <ellipse
            key={i}
            rx={Math.max(rx, 0.5)}
            ry={r}
            fill="none"
            stroke={palette.line}
            strokeWidth={1.1}
            opacity={faint ? 0.35 : 0.75}
          />
        );
      })}

      {/* Paralleli. */}
      {[-0.72, -0.38, 0, 0.38, 0.72].map((k) => (
        <ellipse
          key={k}
          cy={r * k}
          rx={r * Math.sqrt(Math.max(1 - k * k, 0))}
          ry={r * 0.16 * Math.sqrt(Math.max(1 - k * k, 0.05))}
          fill="none"
          stroke={palette.line}
          strokeWidth={1}
          opacity={faint ? 0.28 : 0.6}
        />
      ))}

      {/* La particella: un campo, non il pianeta intero. */}
      {faint ? null : (
        <g transform={`translate(${r * 0.42} ${-r * 0.3})`}>
          <circle r={5 + pulse * 3} fill={palette.green} opacity={0.25} />
          <circle r={4} fill={palette.greenSoft} />
          <circle r={13 + pulse * 9} fill="none" stroke={palette.green} strokeWidth={1.2} opacity={0.7 - pulse * 0.5} />
        </g>
      )}
    </Svg>
  );
};

/* ------------------------------------------------------------------ *
 * 2 · Stima vs misura — il difetto di sistema, senza numeri.
 * ------------------------------------------------------------------ */
export const FigureUncertainty: React.FC<FigureProps> = ({height = 300}) => {
  const frame = useCurrentFrame();
  const band = useProgress(6, 40);
  const point = useProgress(52, 78);
  const breathe = Math.sin(frame / 22) * 10;

  const top = 74 - breathe;
  const bottom = 190 + breathe;

  return (
    <Svg viewBox="0 0 560 320" height={height}>
      {/* Banda di incertezza della stima: tratteggiata, quindi riconoscibile
          anche senza colore. */}
      <g opacity={band}>
        <path
          d={`M40 ${top} C 170 ${top - 22}, 320 ${top + 18}, 470 ${top - 6}
              L470 ${bottom - 6} C 320 ${bottom + 16}, 170 ${bottom - 20}, 40 ${bottom} Z`}
          fill={palette.greenSoft}
          fillOpacity={0.07}
          stroke={palette.textFaint}
          strokeWidth={1.4}
          strokeDasharray="7 6"
        />
        <text x={44} y={top - 14} style={labelStyle}>
          STIMA
        </text>
      </g>

      {/* Punti di stima: cerchi vuoti, dispersi dentro la banda. */}
      <g opacity={band}>
        {[80, 140, 200, 260, 320, 380].map((x, i) => (
          <circle
            key={x}
            cx={x}
            cy={132 + Math.sin(i * 1.7 + frame / 40) * 34}
            r={5}
            fill="none"
            stroke={palette.textMuted}
            strokeWidth={1.4}
          />
        ))}
      </g>

      {/* La misura verificabile: piena, ancorata, etichettata. */}
      <g opacity={point} transform="translate(430 132)">
        <line x1={-388 * point} x2={0} y1={0} y2={0} stroke={palette.green} strokeWidth={2} />
        <line x1={0} x2={0} y1={-46} y2={46} stroke={palette.green} strokeWidth={2} />
        <circle r={8} fill={palette.green} />
        <circle r={17} fill="none" stroke={palette.green} strokeWidth={1.4} opacity={0.55} />
        <text x={0} y={-62} textAnchor="middle" style={{...labelStyle, fill: palette.greenSoft}}>
          MISURA VERIFICABILE
        </text>
      </g>
    </Svg>
  );
};

/* ------------------------------------------------------------------ *
 * 3 · Lo stack: cinque strati, dal suolo al registry.
 * ------------------------------------------------------------------ */
/** Glifi degli strati: sensore, campo, orbita, motore, registro. */
const LayerIcon: React.FC<{index: number; active: boolean}> = ({index, active}) => {
  const stroke = active ? palette.greenSoft : palette.textFaint;

  if (index === 0) {
    return (
      <g stroke={stroke} strokeWidth={1.6} fill="none">
        <line x1={0} y1={8} x2={0} y2={-6} />
        <circle cy={-9} r={3} fill={stroke} stroke="none" />
        <path d="M-7 2 a 9 9 0 0 1 14 0" />
      </g>
    );
  }
  if (index === 1) {
    return (
      <g stroke={stroke} strokeWidth={1.6} fill="none">
        <rect x={-9} y={-7} width={18} height={13} rx={3} />
        <path d="M-3 6 l0 5 l5 -5" />
      </g>
    );
  }
  if (index === 2) {
    return (
      <g stroke={stroke} strokeWidth={1.6} fill="none">
        <rect x={-5} y={-5} width={10} height={10} rx={2} />
        <line x1={-12} y1={0} x2={-6} y2={0} />
        <line x1={6} y1={0} x2={12} y2={0} />
      </g>
    );
  }
  if (index === 3) {
    return (
      <g stroke={stroke} strokeWidth={1.6} fill="none">
        <rect x={-7} y={-7} width={14} height={14} rx={2} />
        <line x1={-11} y1={-3} x2={-7} y2={-3} />
        <line x1={-11} y1={3} x2={-7} y2={3} />
        <line x1={7} y1={-3} x2={11} y2={-3} />
        <line x1={7} y1={3} x2={11} y2={3} />
      </g>
    );
  }
  return (
    <g stroke={stroke} strokeWidth={1.6} fill="none">
      <rect x={-13} y={-5} width={9} height={9} rx={2} />
      <rect x={-4} y={-5} width={9} height={9} rx={2} />
      <rect x={5} y={-5} width={9} height={9} rx={2} />
    </g>
  );
};

export const FigureStackLayers: React.FC<FigureProps & {activeIndex: number}> = ({
  height = 380,
  activeIndex,
}) => {
  const frame = useCurrentFrame();
  const layers = 5;
  const layerHeight = 52;
  const gap = 14;
  const rise = (frame % 96) / 96;

  return (
    <Svg viewBox="0 0 440 396" height={height}>
      <defs>
        <linearGradient id="layerActive" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={palette.green} stopOpacity={0.28} />
          <stop offset="100%" stopColor={palette.green} stopOpacity={0.08} />
        </linearGradient>
      </defs>

      {/* Orientamento: due parole, non la ripetizione dei cinque passaggi. */}
      <text x={220} y={12} textAnchor="middle" style={{...labelStyle, fill: palette.greenSoft}}>
        REGISTRY
      </text>
      <text x={220} y={390} textAnchor="middle" style={labelStyle}>
        SUOLO
      </text>
      {Array.from({length: layers}).map((_, i) => {
        // Il suolo è in basso: lo strato più largo è l'ultimo, non il primo.
        const indexFromBottom = layers - 1 - i;
        const isActive = indexFromBottom === activeIndex;
        const seen = indexFromBottom <= activeIndex;
        const y = i * (layerHeight + gap) + 28;
        const inset = i * 13;

        return (
          <g key={i}>
            <rect
              x={30 + inset}
              y={y}
              width={380 - inset * 2}
              height={layerHeight}
              rx={9}
              fill={isActive ? 'url(#layerActive)' : palette.greenSoft}
              fillOpacity={isActive ? 1 : seen ? 0.07 : 0.03}
              stroke={isActive ? palette.green : palette.line}
              strokeWidth={isActive ? 2.2 : 1.2}
            />
            <text
              x={50 + inset}
              y={y + layerHeight / 2 + 5}
              style={{
                ...labelStyle,
                fontSize: 14,
                fill: isActive ? palette.greenSoft : palette.textFaint,
              }}
            >
              {`0${indexFromBottom + 1}`}
            </text>
            <g transform={`translate(${380 - inset} ${y + layerHeight / 2}) scale(1.45)`}>
              <LayerIcon index={indexFromBottom} active={isActive} />
            </g>
          </g>
        );
      })}

      {/* Il dato che risale gli strati, dal suolo al registry. */}
      <g opacity={0.85}>
        <line
          x1={220}
          x2={220}
          y1={366}
          y2={30}
          stroke={palette.line}
          strokeWidth={1}
          strokeDasharray="4 8"
        />
        <circle cx={220} cy={interpolate(rise, [0, 1], [366, 30])} r={5} fill={palette.greenSoft} />
      </g>
    </Svg>
  );
};

/* ------------------------------------------------------------------ *
 * 4 · Space-native: orbita, fasci, proof-of-location.
 * ------------------------------------------------------------------ */
export const FigureOrbit: React.FC<FigureProps> = ({height = 380}) => {
  const frame = useCurrentFrame();
  const sar = 0.5 + 0.5 * Math.sin(frame / 14);
  const optical = 0.5 + 0.5 * Math.sin(frame / 14 + Math.PI);
  const satA = (frame % 300) / 300;
  const satB = ((frame + 150) % 300) / 300;
  const drift = (frame % 600) / 600;

  const orbit = (t: number, rx: number, ry: number, cy: number) => ({
    x: 210 + Math.cos(Math.PI + t * Math.PI) * rx,
    y: cy + Math.sin(Math.PI + t * Math.PI) * ry,
  });

  const a = orbit(satA, 180, 70, 150);
  const b = orbit(satB, 140, 52, 122);

  return (
    <Svg viewBox="0 0 420 360" height={height} clip>
      {/* Orbite. */}
      <ellipse cx={210} cy={150} rx={180} ry={70} fill="none" stroke={palette.greenSoft} strokeWidth={1.2} opacity={0.32} />
      <ellipse cx={210} cy={122} rx={140} ry={52} fill="none" stroke={palette.greenSoft} strokeWidth={1} opacity={0.22} />

      {/* Terra: un arco, non un pianeta intero. */}
      <path d="M0 360 C 80 276, 340 276, 420 360 Z" fill={palette.canopy} stroke={palette.line} strokeWidth={1.2} />

      {/* Nuvole in deriva: il SAR le attraversa, l'ottico no. */}
      <g opacity={0.6}>
        {[0, 1, 2].map((i) => {
          const x = ((drift + i / 3) % 1) * 420 - 30;
          return (
            <g key={i} opacity={0.2}>
              <rect x={x} y={234} width={96} height={11} rx={6} fill={palette.text} />
              <rect x={x + 18} y={226} width={46} height={12} rx={6} fill={palette.text} />
            </g>
          );
        })}
        <text x={16} y={222} style={labelStyle}>
          NUVOLE
        </text>
      </g>

      {/* Fascio SAR: passa oltre lo strato nuvole. */}
      <g opacity={0.35 + sar * 0.5}>
        <path d={`M${a.x} ${a.y} L${196} 300 L${228} 300 Z`} fill={palette.green} fillOpacity={0.16} />
        <line x1={a.x} y1={a.y} x2={212} y2={300} stroke={palette.green} strokeWidth={1.8} />
        <text x={a.x + 10} y={a.y - 12} style={{...labelStyle, fill: palette.greenSoft}}>
          SAR
        </text>
      </g>

      {/* Fascio ottico: tratteggiato, si interrompe sulle nuvole. */}
      <g opacity={0.3 + optical * 0.45}>
        <line
          x1={b.x}
          y1={b.y}
          x2={252}
          y2={236}
          stroke={palette.greenSoft}
          strokeWidth={1.4}
          strokeDasharray="6 7"
        />
        <text x={b.x + 10} y={b.y - 12} style={labelStyle}>
          OTTICO
        </text>
      </g>

      {/* Satelliti. */}
      {[a, b].map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y}) scale(1.5)`}>
          <rect x={-9} y={-6} width={18} height={12} rx={3} fill={palette.text} opacity={0.9} />
          <rect x={-20} y={-3} width={9} height={6} rx={2} fill={palette.greenSoft} />
          <rect x={11} y={-3} width={9} height={6} rx={2} fill={palette.greenSoft} />
        </g>
      ))}

      {/* Sensore a terra con proof-of-location. */}
      <g transform="translate(212 300)">
        <line x1={0} y1={0} x2={0} y2={-26} stroke={palette.text} strokeWidth={2} />
        <circle cy={-30} r={5} fill={palette.green} />
        <circle r={3} fill={palette.text} />
        <circle r={14} fill="none" stroke={palette.green} strokeWidth={1.2} opacity={0.6} />
        <line x1={-26} x2={26} y1={0} y2={0} stroke={palette.green} strokeWidth={1} opacity={0.5} />
        <text x={0} y={34} textAnchor="middle" style={{...labelStyle, fill: palette.greenSoft}}>
          PROOF-OF-LOCATION
        </text>
      </g>
    </Svg>
  );
};

/* ------------------------------------------------------------------ *
 * 5 · Digital twin: la parcella e le due curve.
 * ------------------------------------------------------------------ */
export const FigureTwin: React.FC<FigureProps> = ({height = 330}) => {
  const grid = useProgress(4, 40);
  const measured = useProgress(24, 84);
  const simulated = useProgress(54, 116);
  const anomaly = useProgress(104, 128);

  // Due andamenti schematici: nessun valore sugli assi, nessuna scala.
  const measuredPath = 'M46 250 C 116 240, 156 208, 202 178 S 274 130, 328 112';
  const simulatedPath = 'M328 112 C 362 102, 392 86, 418 66';

  return (
    <Svg viewBox="0 0 460 320" height={height}>
      <defs>
        <linearGradient id="twinArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.green} stopOpacity={0.22} />
          <stop offset="100%" stopColor={palette.green} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Scheda del gemello digitale: dà un contenitore alla lettura. */}
      <rect
        x={8}
        y={8}
        width={444}
        height={304}
        rx={14}
        fill={palette.panel}
        stroke={palette.line}
        strokeWidth={1.2}
      />

      {/* Parcella: griglia in prospettiva, il campo di cui esiste il gemello. */}
      <g opacity={grid}>
        {Array.from({length: 5}).map((_, i) => (
          <line
            key={`h${i}`}
            x1={46 + i * 7}
            y1={286 - i * 9}
            x2={418 - i * 7}
            y2={286 - i * 9}
            stroke={palette.greenSoft}
            strokeWidth={1}
            opacity={0.26}
          />
        ))}
        {Array.from({length: 8}).map((_, i) => (
          <line
            key={`v${i}`}
            x1={46 + i * 53}
            y1={286}
            x2={74 + i * 46}
            y2={250}
            stroke={palette.greenSoft}
            strokeWidth={1}
            opacity={0.26}
          />
        ))}
      </g>

      {/* Area sotto il misurato: dà corpo alla curva. */}
      <path
        d={`${measuredPath} L328 250 L46 250 Z`}
        fill="url(#twinArea)"
        opacity={measured * 0.6}
      />

      {/* Misurato: linea continua. */}
      <path
        d={measuredPath}
        fill="none"
        stroke={palette.green}
        strokeWidth={3}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - measured}
      />
      <text x={50} y={274} style={{...labelStyle, fill: palette.greenSoft}}>
        MISURATO
      </text>

      {/* Il confine fra misurato e simulato: senza, il taglio dell'area
          sembrerebbe un artefatto grafico. */}
      <g opacity={simulated}>
        <line
          x1={328}
          x2={328}
          y1={112}
          y2={258}
          stroke={palette.textFaint}
          strokeWidth={1}
          strokeDasharray="4 5"
        />
        <text x={328} y={276} textAnchor="middle" style={labelStyle}>
          OGGI
        </text>
      </g>

      {/* Simulato: prosecuzione tratteggiata, distinta anche in b/n. */}
      <path
        d={simulatedPath}
        fill="none"
        stroke={palette.greenSoft}
        strokeWidth={2.6}
        strokeDasharray="9 7"
        strokeLinecap="round"
        opacity={simulated}
      />
      <text x={342} y={52} style={{...labelStyle, fill: palette.textMuted}} opacity={simulated}>
        SIMULATO
      </text>

      {/* Anomalia intercettata sul misurato. */}
      <g opacity={anomaly} transform="translate(202 178)">
        <circle r={8} fill={palette.forest} stroke={palette.text} strokeWidth={1.8} />
        <line x1={-4} y1={-4} x2={4} y2={4} stroke={palette.text} strokeWidth={1.6} />
        <line x1={4} y1={-4} x2={-4} y2={4} stroke={palette.text} strokeWidth={1.6} />
        <line x1={0} y1={-14} x2={0} y2={-30} stroke={palette.textMuted} strokeWidth={1} />
        <text x={0} y={-38} textAnchor="middle" style={labelStyle}>
          ANOMALIA
        </text>
      </g>
    </Svg>
  );
};

/* ------------------------------------------------------------------ *
 * 6 · Perché ora: tre spinte, una richiesta.
 * ------------------------------------------------------------------ */
/**
 * Tre spinte normative convergono sulla stessa richiesta. Le etichette non
 * stanno qui: le portano le card sotto la figura, allineate alle tre linee.
 */
export const FigureConvergence: React.FC<FigureProps & {flip?: boolean}> = ({
  height = 180,
  flip = false,
}) => {
  const grow = useProgress(8, 54);
  const box = useProgress(40, 72);
  const frame = useCurrentFrame();

  // `flip` porta il box in basso: serve nei formati verticali, dove le card
  // stanno sopra la figura.
  const y = (value: number) => (flip ? 170 - value : value);
  const columns = [130, 390, 650];
  const targetX = 390;

  return (
    <Svg viewBox="0 0 780 170" height={height}>
      {columns.map((x, i) => {
        const endX = targetX + (i - 1) * 46;
        const startY = y(168);
        const endY = y(74);
        const path = `M${x} ${startY} C ${x} ${y(108)}, ${endX} ${y(124)}, ${endX} ${endY}`;
        const travel = (frame / 90 + i / 3) % 1;

        return (
          <g key={x} opacity={grow}>
            <path
              d={path}
              fill="none"
              stroke={palette.green}
              strokeWidth={1.6}
              opacity={0.6}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - grow}
            />
            {/* Il dato che risale la spinta: rende leggibile la direzione. */}
            <circle
              cx={x + (endX - x) * travel}
              cy={startY + (endY - startY) * travel}
              r={3.5}
              fill={palette.greenSoft}
              opacity={grow * 0.9}
            />
          </g>
        );
      })}

      <g opacity={box}>
        <rect
          x={252}
          y={flip ? 96 : 4}
          width={276}
          height={70}
          rx={12}
          fill={palette.green}
          fillOpacity={0.14}
          stroke={palette.green}
          strokeWidth={1.8}
        />
        <text
          x={390}
          y={flip ? 137 : 45}
          textAnchor="middle"
          style={{...labelStyle, fontSize: 19, letterSpacing: 1.6, fill: palette.text}}
        >
          MISURA VERIFICABILE
        </text>
      </g>
    </Svg>
  );
};
