import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Background, Reveal, SceneFrame, SceneHeader, Split} from '../components/ui';
import {FigureOrbit} from '../components/figures';
import {useLayout} from '../layout';
import {font, palette, weight} from '../theme';
import type {SceneProps} from '../content/schema';

/**
 * 4 · SPACE-NATIVE — 330 frame. Il differenziatore descrittivo: SAR,
 * osservazione su larga scala, proof-of-location. Negli ultimi 78 frame la
 * lista sfuma e resta il payoff a tutto schermo.
 */
const PAYOFF_START = 252;

export const Space: React.FC<SceneProps> = ({content}) => {
  const frame = useCurrentFrame();
  const {px} = useLayout();
  const listOpacity = interpolate(frame, [PAYOFF_START, PAYOFF_START + 20], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const payoffOpacity = interpolate(frame, [PAYOFF_START + 12, PAYOFF_START + 34], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const payoffScale = interpolate(frame, [PAYOFF_START + 12, PAYOFF_START + 78], [0.97, 1.02], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <>
      <Background tone="center" />
      <AbsoluteFill style={{opacity: listOpacity}}>
        <SceneFrame>
          <SceneHeader {...content.space.heading} size={42} />
          <Split
            ratio={[1.08, 1]}
            left={
              <div style={{display: 'flex', flexDirection: 'column', gap: px(18)}}>
                {content.space.rows.map((row, i) => (
                  <Reveal key={row.tag} delay={20 + i * 18} distance={14}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: px(3),
                        borderTop: `1px solid ${palette.line}`,
                        paddingTop: px(12),
                      }}
                    >
                      <div
                        style={{
                          fontFamily: font.mono,
                          fontSize: px(18),
                          letterSpacing: px(1.4),
                          color: palette.accentSoft,
                        }}
                      >
                        {row.tag}
                      </div>
                      <div style={{fontSize: px(25), lineHeight: 1.34, fontWeight: weight.regular}}>
                        {row.text}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            }
            right={<FigureOrbit height={470} />}
          />
        </SceneFrame>
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: payoffOpacity,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontFamily: font.sans,
            fontSize: px(78),
            fontWeight: weight.semibold,
            letterSpacing: px(-1.4),
            color: palette.text,
            textAlign: 'center',
            transform: `scale(${payoffScale})`,
            textShadow: '0 8px 46px rgba(1,10,7,0.8)',
          }}
        >
          {content.space.payoff}
        </div>
      </AbsoluteFill>
    </>
  );
};
