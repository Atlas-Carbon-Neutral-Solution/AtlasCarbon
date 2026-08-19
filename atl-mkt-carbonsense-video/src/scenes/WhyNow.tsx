import React from 'react';
import {Background, Panel, Reveal, SceneFrame, SceneHeader, StatusLine} from '../components/ui';
import {FigureConvergence} from '../components/figures';
import {useLayout} from '../layout';
import {font, palette, weight} from '../theme';
import type {AdContent} from '../content/schema';

/**
 * 6 · PERCHÉ ORA — 270 frame. Tre spinte regolatorie convergono sulla stessa
 * richiesta. La riga di stato è obbligatoria: TRL sdoppiato e "brevetto
 * depositato" (docs/COMPLIANCE_DELTA.md righe 1 e 9).
 */
export const WhyNow: React.FC<{content: AdContent}> = ({content}) => {
  const {px, portrait} = useLayout();
  const cards = content.whyNow.cards;

  return (
    <>
      <Background tone="top-right" />
      <SceneFrame>
        <SceneHeader {...content.whyNow.heading} size={42} />
        {portrait ? null : (
          <Reveal delay={16}>
            <div style={{marginBottom: px(26)}}>
              <FigureConvergence height={170} />
            </div>
          </Reveal>
        )}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: portrait ? '1fr' : 'repeat(3, 1fr)',
            gap: px(14),
          }}
        >
          {cards.map((card, i) => (
            <Reveal key={card.title} delay={26 + i * 14} distance={14}>
              <Panel style={{height: '100%', padding: px(22)}}>
                <div
                  style={{
                    fontFamily: font.mono,
                    fontSize: px(18),
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
                      fontSize: px(21),
                      lineHeight: 1.4,
                      fontWeight: weight.regular,
                      marginTop: px(9),
                    }}
                  >
                    {card.text}
                  </div>
                ) : null}
              </Panel>
            </Reveal>
          ))}
        </div>
        {portrait ? (
          <Reveal delay={30}>
            <div style={{marginTop: px(24)}}>
              <FigureConvergence height={150} flip />
            </div>
          </Reveal>
        ) : null}
        <div style={{height: px(30)}} />
        <Reveal delay={150} distance={10}>
          <StatusLine>{content.whyNow.statusLine}</StatusLine>
        </Reveal>
      </SceneFrame>
    </>
  );
};
