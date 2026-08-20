import React from 'react';
import {
  AccentBar,
  Background,
  FigureCaption,
  Reveal,
  SceneFrame,
  SceneHeader,
  Split,
} from '../components/ui';
import {FigureUncertainty} from '../components/figures';
import {useLayout} from '../layout';
import {palette, weight} from '../theme';
import type {SceneProps} from '../content/schema';

/** 2 · PROBLEMA — 240 frame. Il dato non verificabile è il difetto di sistema. */
export const Problem: React.FC<SceneProps> = ({content}) => {
  const {px} = useLayout();

  return (
    <>
      <Background tone="left" />
      <SceneFrame>
        <SceneHeader {...content.problem.heading} size={44} />
        <Split
          ratio={[1.05, 1]}
          left={
            <div style={{display: 'flex', flexDirection: 'column', gap: px(16)}}>
              {content.problem.bullets.map((bullet, i) => (
                <Reveal key={bullet} delay={18 + i * 12} distance={16}>
                  <div style={{display: 'flex', alignItems: 'baseline', gap: px(16)}}>
                    <div
                      style={{
                        width: px(8),
                        height: px(8),
                        borderRadius: px(8),
                        backgroundColor: palette.green,
                        flexShrink: 0,
                        transform: `translateY(${-px(4)}px)`,
                      }}
                    />
                    <div style={{fontSize: px(30), fontWeight: weight.regular, lineHeight: 1.3}}>
                      {bullet}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          }
          right={
            <Reveal delay={24}>
              <FigureUncertainty height={300} />
              <FigureCaption>{content.meta.figureNote}</FigureCaption>
            </Reveal>
          }
        />
        <div style={{height: px(40)}} />
        <Reveal delay={112} distance={22}>
          <AccentBar>{content.problem.key}</AccentBar>
        </Reveal>
      </SceneFrame>
    </>
  );
};
