import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Background, Kicker, Reveal, SceneFrame} from '../components/ui';
import {useLayout} from '../layout';
import {font, palette, weight} from '../theme';
import type {AdContent} from '../content/schema';

/**
 * 3 · STACK — 360 frame, 5 passaggi da 72 frame (2,4 s).
 * La riga attiva si illumina e mostra il dettaglio; le precedenti restano
 * leggibili al 55%.
 */
const STEP_DURATION = 72;

export const Stack: React.FC<{content: AdContent}> = ({content}) => {
  const frame = useCurrentFrame();
  const {px} = useLayout();
  const steps = content.stack.steps;
  const activeIndex = Math.min(Math.floor(frame / STEP_DURATION), steps.length - 1);

  return (
    <>
      <Background />
      <SceneFrame>
        <Reveal delay={0}>
          <Kicker>{content.stack.title}</Kicker>
        </Reveal>
        <div style={{height: px(34)}} />
        <div style={{display: 'flex', flexDirection: 'column', gap: px(14)}}>
          {steps.map((step, i) => {
            const start = i * STEP_DURATION;
            const isActive = i === activeIndex;
            const seen = frame >= start;
            const opacity = interpolate(frame - start, [0, 14], [0, isActive ? 1 : 0.55], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const detailOpacity = interpolate(frame - start, [10, 26], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });

            return (
              <div
                key={step.index}
                style={{
                  opacity: seen ? opacity : 0,
                  display: 'flex',
                  gap: px(22),
                  borderLeft: `${px(3)}px solid ${isActive ? palette.green : 'transparent'}`,
                  paddingLeft: px(20),
                }}
              >
                <div
                  style={{
                    fontFamily: font.mono,
                    fontSize: px(20),
                    color: isActive ? palette.greenSoft : palette.textFaint,
                    paddingTop: px(8),
                    width: px(44),
                    flexShrink: 0,
                  }}
                >
                  {step.index}
                </div>
                <div>
                  <div style={{fontSize: px(34), fontWeight: weight.medium, lineHeight: 1.2}}>
                    {step.label}
                  </div>
                  {/* Sempre montato: se comparisse solo da attivo, la lista
                      salterebbe in verticale a ogni passaggio. */}
                  <div
                    style={{
                      fontSize: px(23),
                      lineHeight: 1.4,
                      color: palette.textMuted,
                      marginTop: px(6),
                      opacity: isActive ? detailOpacity : 0,
                    }}
                  >
                    {step.detail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SceneFrame>
    </>
  );
};
