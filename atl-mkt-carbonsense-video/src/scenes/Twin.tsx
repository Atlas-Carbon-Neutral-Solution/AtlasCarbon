import React from 'react';
import {Background, Kicker, Panel, Reveal, SceneFrame} from '../components/ui';
import {useLayout} from '../layout';
import {palette, weight} from '../theme';
import type {AdContent} from '../content/schema';

/** 5 · DIGITAL TWIN — 270 frame. Dalla certificazione alla gestione predittiva. */
export const Twin: React.FC<{content: AdContent}> = ({content}) => {
  const {px, portrait} = useLayout();

  return (
    <>
      <Background />
      <SceneFrame>
        <Reveal delay={0}>
          <Kicker>{content.twin.title}</Kicker>
        </Reveal>
        <div style={{height: px(30)}} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: portrait ? '1fr' : '1fr 1fr',
            gap: px(16),
          }}
        >
          {content.twin.cards.map((card, i) => (
            <Reveal key={card.title} delay={6 + i * 14} distance={16}>
              <Panel>
                <div style={{fontSize: px(31), fontWeight: weight.medium}}>{card.title}</div>
                {card.text ? (
                  <div
                    style={{
                      fontSize: px(21),
                      lineHeight: 1.4,
                      color: palette.textMuted,
                      marginTop: px(8),
                    }}
                  >
                    {card.text}
                  </div>
                ) : null}
              </Panel>
            </Reveal>
          ))}
        </div>
        <div style={{height: px(34)}} />
        <Reveal delay={168} distance={14}>
          <div style={{fontSize: px(30), fontWeight: weight.medium, color: palette.greenSoft}}>
            {content.twin.output}
          </div>
        </Reveal>
      </SceneFrame>
    </>
  );
};
