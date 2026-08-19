import React from 'react';
import {Background, Brandmark, Reveal, SceneFrame} from '../components/ui';
import {useLayout} from '../layout';
import {font, palette, weight} from '../theme';
import type {AdContent} from '../content/schema';

/**
 * 7 · CTA — 180 frame. Contatto e accreditamenti verificati.
 * Nessun logo di terzi: gli accreditamenti compaiono come testo.
 */
export const Cta: React.FC<{content: AdContent}> = ({content}) => {
  const {px} = useLayout();

  return (
    <>
      <Background grid={false} />
      <SceneFrame>
        <Reveal delay={0} distance={18}>
          <Brandmark size={76} />
        </Reveal>
        <div style={{height: px(40)}} />
        <Reveal delay={12} distance={22}>
          <div
            style={{
              fontSize: px(60),
              fontWeight: weight.semibold,
              lineHeight: 1.1,
              letterSpacing: px(-1.2),
            }}
          >
            {content.cta.claim}
          </div>
        </Reveal>
        <div style={{height: px(30)}} />
        <Reveal delay={30} distance={14}>
          <div
            style={{
              fontFamily: font.mono,
              fontSize: px(24),
              color: palette.greenSoft,
              display: 'flex',
              flexWrap: 'wrap',
              gap: px(26),
            }}
          >
            <span>{content.cta.site}</span>
            <span style={{color: palette.textMuted}}>{content.cta.email}</span>
          </div>
        </Reveal>
        <div style={{height: px(34)}} />
        <Reveal delay={48} distance={12}>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: px(10)}}>
            {content.cta.badges.map((badge) => (
              <div
                key={badge}
                style={{
                  fontFamily: font.mono,
                  fontSize: px(16),
                  letterSpacing: px(0.8),
                  color: palette.text,
                  border: `1px solid ${palette.line}`,
                  borderRadius: px(999),
                  padding: `${px(8)}px ${px(16)}px`,
                }}
              >
                {badge}
              </div>
            ))}
          </div>
        </Reveal>
        <div style={{height: px(28)}} />
        <Reveal delay={66} distance={8}>
          <div style={{fontSize: px(15), color: palette.textFaint, lineHeight: 1.5}}>
            {content.cta.legal}
          </div>
        </Reveal>
      </SceneFrame>
    </>
  );
};
