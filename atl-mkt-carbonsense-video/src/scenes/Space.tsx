import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Background, Kicker, Reveal, SceneFrame} from '../components/ui';
import {useLayout} from '../layout';
import {font, palette, weight} from '../theme';
import type {AdContent} from '../content/schema';

/**
 * 4 · SPACE-NATIVE — 330 frame. Il differenziatore descrittivo: SAR,
 * osservazione su larga scala, proof-of-location. Negli ultimi 78 frame la
 * lista sfuma e resta il payoff a tutto schermo.
 */
const PAYOFF_START = 252;

export const Space: React.FC<{content: AdContent}> = ({content}) => {
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

  return (
    <>
      <Background />
      <AbsoluteFill style={{opacity: listOpacity}}>
        <SceneFrame>
          <Reveal delay={0}>
            <Kicker>{content.space.title}</Kicker>
          </Reveal>
          <div style={{height: px(34)}} />
          <div style={{display: 'flex', flexDirection: 'column', gap: px(22)}}>
            {content.space.rows.map((row, i) => (
              <Reveal key={row.tag} delay={8 + i * 22} distance={16}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: px(4),
                    borderTop: `1px solid ${palette.line}`,
                    paddingTop: px(14),
                  }}
                >
                  <div
                    style={{
                      fontFamily: font.mono,
                      fontSize: px(19),
                      letterSpacing: px(1.4),
                      color: palette.greenSoft,
                    }}
                  >
                    {row.tag}
                  </div>
                  <div style={{fontSize: px(28), lineHeight: 1.34, fontWeight: weight.regular}}>
                    {row.text}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
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
          }}
        >
          {content.space.payoff}
        </div>
      </AbsoluteFill>
    </>
  );
};
