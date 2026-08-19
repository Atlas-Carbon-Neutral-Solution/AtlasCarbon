import React from 'react';
import {Background, Kicker, Panel, Reveal, SceneFrame, StatusLine} from '../components/ui';
import {useLayout} from '../layout';
import {font, palette, weight} from '../theme';
import type {AdContent} from '../content/schema';

/**
 * 6 · PERCHÉ ORA — 270 frame. Finestra regolatoria + stato reale della
 * tecnologia. La riga di stato è obbligatoria: TRL sdoppiato e "brevetto
 * depositato" (docs/COMPLIANCE_DELTA.md righe 1 e 9).
 */
export const WhyNow: React.FC<{content: AdContent}> = ({content}) => {
  const {px, portrait} = useLayout();

  return (
    <>
      <Background />
      <SceneFrame>
        <Reveal delay={0}>
          <Kicker>{content.whyNow.title}</Kicker>
        </Reveal>
        <div style={{height: px(30)}} />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: portrait ? '1fr' : 'repeat(3, 1fr)',
            gap: px(16),
          }}
        >
          {content.whyNow.cards.map((card, i) => (
            <Reveal key={card.title} delay={6 + i * 16} distance={16}>
              <Panel style={{height: '100%'}}>
                <div
                  style={{
                    fontFamily: font.mono,
                    fontSize: px(19),
                    letterSpacing: px(1.4),
                    color: palette.greenSoft,
                    textTransform: 'uppercase',
                  }}
                >
                  {card.title}
                </div>
                {card.text ? (
                  <div
                    style={{
                      fontSize: px(22),
                      lineHeight: 1.4,
                      fontWeight: weight.regular,
                      marginTop: px(10),
                    }}
                  >
                    {card.text}
                  </div>
                ) : null}
              </Panel>
            </Reveal>
          ))}
        </div>
        <div style={{height: px(38)}} />
        <Reveal delay={150} distance={10}>
          <StatusLine>{content.whyNow.statusLine}</StatusLine>
        </Reveal>
      </SceneFrame>
    </>
  );
};
