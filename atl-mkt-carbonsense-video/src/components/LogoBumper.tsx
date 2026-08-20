import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Logo} from './logo';
import {useLayout} from '../layout';
import {font, palette, weight} from '../theme';

/**
 * Stacco marchio in apertura e in chiusura.
 *
 * È un overlay sopra le scene, non una scena: la TIMELINE resta di 1800 frame
 * e i tempi del montaggio non cambiano.
 */

export const OPEN_BUMPER_END = 48;
export const CLOSE_BUMPER_START = 1746;

const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** Riga di luce che scorre sotto il marchio: dà un attacco al video. */
const Sweep: React.FC<{progress: number}> = ({progress}) => {
  const {px} = useLayout();
  const width = interpolate(progress, [0, 1], [0, 1], {easing: ease});

  return (
    <div
      style={{
        marginTop: px(26),
        width: px(240),
        height: px(2),
        backgroundColor: 'rgba(255,255,255,0.10)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${width * 100}%`,
          height: '100%',
          backgroundColor: palette.accent,
        }}
      />
    </div>
  );
};

export const OpenBumper: React.FC<{logo?: string | null}> = ({logo = null}) => {
  const frame = useCurrentFrame();

  if (frame > OPEN_BUMPER_END) return null;

  const veil = interpolate(frame, [0, OPEN_BUMPER_END - 14, OPEN_BUMPER_END], [1, 1, 0], {
    extrapolateRight: 'clamp',
  });
  const enter = interpolate(frame, [0, 16], [0, 1], {extrapolateRight: 'clamp', easing: ease});
  const scale = interpolate(frame, [0, OPEN_BUMPER_END], [0.965, 1.02], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{opacity: veil, backgroundColor: palette.nightDeep, fontFamily: font.sans}}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(42% 46% at 50% 46%, rgba(79,163,220,0.18) 0%, rgba(79,163,220,0) 72%)`,
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          opacity: enter,
          transform: `scale(${scale})`,
        }}
      >
        <Logo size={150} src={logo} />
        <Sweep progress={interpolate(frame, [8, OPEN_BUMPER_END], [0, 1], {extrapolateRight: 'clamp'})} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const CloseBumper: React.FC<{logo?: string | null; site: string}> = ({
  logo = null,
  site,
}) => {
  const frame = useCurrentFrame();
  const {px} = useLayout();

  if (frame < CLOSE_BUMPER_START) return null;

  const local = frame - CLOSE_BUMPER_START;
  const veil = interpolate(local, [0, 22], [0, 1], {extrapolateRight: 'clamp', easing: ease});
  const enter = interpolate(local, [8, 30], [0, 1], {extrapolateRight: 'clamp', easing: ease});
  const scale = interpolate(local, [8, 54], [0.98, 1.01], {extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill
      style={{opacity: veil, backgroundColor: palette.nightDeep, fontFamily: font.sans}}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(44% 48% at 50% 44%, rgba(79,163,220,0.20) 0%, rgba(79,163,220,0) 74%)`,
        }}
      />
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          opacity: enter,
          transform: `scale(${scale})`,
        }}
      >
        <Logo size={150} src={logo} />
        <div
          style={{
            marginTop: px(30),
            fontFamily: font.mono,
            fontSize: px(24),
            letterSpacing: px(1.6),
            fontWeight: weight.regular,
            color: palette.accentSoft,
          }}
        >
          {site}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
