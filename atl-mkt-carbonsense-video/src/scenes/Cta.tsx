import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Background, Brandmark, Reveal, SceneFrame} from '../components/ui';
import {FigureGlobe} from '../components/figures';
import {useLayout} from '../layout';
import {font, palette, weight} from '../theme';
import type {AdContent} from '../content/schema';

/**
 * 7 · CTA — 180 frame. Contatto e accreditamenti verificati.
 * Nessun logo di terzi: gli accreditamenti compaiono come testo.
 */
export const Cta: React.FC<{content: AdContent}> = ({content}) => {
  const frame = useCurrentFrame();
  const {px, portrait, width} = useLayout();
  const globeIn = interpolate(frame, [0, 30], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <>
      <Background grid={false} tone="bottom-right" />
      <AbsoluteFill
        style={{
          alignItems: 'flex-end',
          justifyContent: portrait ? 'flex-end' : 'center',
          paddingRight: portrait ? 0 : width * 0.04,
          opacity: globeIn * 0.9,
        }}
      >
        <div style={{width: px(portrait ? 380 : 520)}}>
          <FigureGlobe height={portrait ? 380 : 520} faint />
        </div>
      </AbsoluteFill>
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
              textShadow: '0 6px 40px rgba(1,10,7,0.7)',
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
                  backgroundColor: palette.panel,
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
