import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {Background, SceneFrame, SceneHeader, Split} from '../components/ui';
import {FigureStackLayers} from '../components/figures';
import {useLayout} from '../layout';
import {font, palette, weight} from '../theme';
import type {AdContent} from '../content/schema';

/**
 * 3 · STACK — 360 frame, 5 passaggi da 72 frame (2,4 s).
 * La riga attiva si illumina e mostra il dettaglio; lo schema a lato dice
 * quale strato dello stack si sta guardando.
 */
const STEP_DURATION = 72;

export const Stack: React.FC<{content: AdContent}> = ({content}) => {
  const frame = useCurrentFrame();
  const {px} = useLayout();
  const steps = content.stack.steps;
  const activeIndex = Math.min(Math.floor(frame / STEP_DURATION), steps.length - 1);

  return (
    <>
      <Background tone="bottom-right" />
      <SceneFrame>
        <SceneHeader {...content.stack.heading} size={42} />
        <Split
          ratio={[1.15, 1]}
          left={
            <div style={{display: 'flex', flexDirection: 'column', gap: px(18)}}>
              {steps.map((step, i) => {
                const start = i * STEP_DURATION;
                const isActive = i === activeIndex;
                const opacity = interpolate(frame - start, [0, 14], [0, isActive ? 1 : 0.5], {
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
                      opacity: frame >= start ? opacity : 0,
                      display: 'flex',
                      gap: px(20),
                      borderLeft: `${px(3)}px solid ${isActive ? palette.green : 'transparent'}`,
                      paddingLeft: px(18),
                    }}
                  >
                    <div
                      style={{
                        fontFamily: font.mono,
                        fontSize: px(19),
                        color: isActive ? palette.greenSoft : palette.textFaint,
                        paddingTop: px(7),
                        width: px(40),
                        flexShrink: 0,
                      }}
                    >
                      {step.index}
                    </div>
                    <div>
                      <div style={{fontSize: px(31), fontWeight: weight.medium, lineHeight: 1.2}}>
                        {step.label}
                      </div>
                      {/* Sempre montato: se comparisse solo da attivo, la lista
                          salterebbe in verticale a ogni passaggio. */}
                      <div
                        style={{
                          fontSize: px(21),
                          lineHeight: 1.4,
                          color: palette.textMuted,
                          marginTop: px(5),
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
          }
          right={<FigureStackLayers height={470} activeIndex={activeIndex} />}
        />
      </SceneFrame>
    </>
  );
};
