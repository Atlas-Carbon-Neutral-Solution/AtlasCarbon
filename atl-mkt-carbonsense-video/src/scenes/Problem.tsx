import React from 'react';
import {AccentBar, Background, Reveal, SceneFrame} from '../components/ui';
import {useLayout} from '../layout';
import {palette, weight} from '../theme';
import type {AdContent} from '../content/schema';

/** 2 · PROBLEMA — 240 frame. Il dato non verificabile è il difetto di sistema. */
export const Problem: React.FC<{content: AdContent}> = ({content}) => {
  const {px} = useLayout();

  return (
    <>
      <Background />
      <SceneFrame>
        <div style={{display: 'flex', flexDirection: 'column', gap: px(20)}}>
          {content.problem.bullets.map((bullet, i) => (
            <Reveal key={bullet} delay={4 + i * 13} distance={18}>
              <div style={{display: 'flex', alignItems: 'baseline', gap: px(18)}}>
                <div
                  style={{
                    width: px(9),
                    height: px(9),
                    borderRadius: px(9),
                    backgroundColor: palette.green,
                    flexShrink: 0,
                    transform: `translateY(${-px(4)}px)`,
                  }}
                />
                <div style={{fontSize: px(38), fontWeight: weight.regular, lineHeight: 1.28, color: palette.text}}>
                  {bullet}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <div style={{height: px(56)}} />
        <Reveal delay={112} distance={22}>
          <AccentBar>{content.problem.key}</AccentBar>
        </Reveal>
      </SceneFrame>
    </>
  );
};
