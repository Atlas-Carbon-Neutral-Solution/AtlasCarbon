import React from 'react';
import {Img, staticFile} from 'remotion';
import {useLayout} from '../layout';
import {font, palette, weight} from '../theme';

/**
 * Marchio Atlas.
 *
 * `src` punta a un file in `public/` (es. "logo-atlas.svg"): quando il marchio
 * registrato è disponibile si passa quello e nient'altro cambia. Senza `src`
 * resta il segnaposto vettoriale, che **non** è il marchio registrato
 * (versione Capra) — vedi README §5.
 */
export const Logo: React.FC<{
  size?: number;
  src?: string | null;
  /** Solo simbolo, senza il testo del marchio. */
  markOnly?: boolean;
}> = ({size = 54, src = null, markOnly = false}) => {
  const {px} = useLayout();
  const s = px(size);

  const mark = src ? (
    <Img src={staticFile(src)} style={{height: s, width: 'auto'}} />
  ) : (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none">
      <circle cx={24} cy={24} r={21} stroke={palette.accent} strokeWidth={2} opacity={0.55} />
      <path d="M24 41c0-9 5-15 13-17-1 10-6 16-13 17Z" fill={palette.earth} opacity={0.9} />
      <path d="M24 41c0-9-5-15-13-17 1 10 6 16 13 17Z" fill={palette.earthSoft} opacity={0.5} />
      <path d="M24 41V19" stroke={palette.accentSoft} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );

  if (markOnly || src) {
    return <div style={{display: 'flex', alignItems: 'center'}}>{mark}</div>;
  }

  return (
    <div style={{display: 'flex', alignItems: 'center', gap: px(size * 0.3)}}>
      {mark}
      <div style={{lineHeight: 1.1}}>
        <div
          style={{
            fontFamily: font.sans,
            fontSize: px(size * 0.48),
            fontWeight: weight.semibold,
            letterSpacing: px(size * 0.008),
            color: palette.text,
          }}
        >
          ATLAS
        </div>
        <div style={{fontFamily: font.mono, fontSize: px(size * 0.24), color: palette.textMuted}}>
          CARBON NEUTRAL SOLUTIONS
        </div>
      </div>
    </div>
  );
};
