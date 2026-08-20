import React from 'react';
import {
  Background,
  FigureCaption,
  Panel,
  Reveal,
  SceneFrame,
  SceneHeader,
  Split,
} from '../components/ui';
import {FigureTwin} from '../components/figures';
import {useLayout} from '../layout';
import {palette, weight} from '../theme';
import type {SceneProps} from '../content/schema';

/** 5 · DIGITAL TWIN — 270 frame. Dalla certificazione alla gestione predittiva. */
export const Twin: React.FC<SceneProps> = ({content}) => {
  const {px} = useLayout();

  return (
    <>
      <Background tone="left" />
      <SceneFrame>
        <SceneHeader {...content.twin.heading} size={42} />
        <Split
          ratio={[1, 1.12]}
          left={
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: px(12),
              }}
            >
              {content.twin.cards.map((card, i) => (
                <Reveal key={card.title} delay={18 + i * 12} distance={14}>
                  <Panel style={{height: '100%', padding: px(20)}}>
                    <div style={{fontSize: px(27), fontWeight: weight.medium}}>{card.title}</div>
                    {card.text ? (
                      <div
                        style={{
                          fontSize: px(19),
                          lineHeight: 1.38,
                          color: palette.textMuted,
                          marginTop: px(6),
                        }}
                      >
                        {card.text}
                      </div>
                    ) : null}
                  </Panel>
                </Reveal>
              ))}
            </div>
          }
          right={
            <Reveal delay={22}>
              <FigureTwin height={400} />
              <FigureCaption>{content.meta.figureNote}</FigureCaption>
            </Reveal>
          }
        />
        <div style={{height: px(28)}} />
        <Reveal delay={168} distance={14}>
          <div style={{fontSize: px(29), fontWeight: weight.medium, color: palette.greenSoft}}>
            {content.twin.output}
          </div>
        </Reveal>
      </SceneFrame>
    </>
  );
};
