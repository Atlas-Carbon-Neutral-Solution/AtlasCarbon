import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {Background, Kicker, Reveal, SceneFrame} from '../components/ui';
import {FigureGlobe} from '../components/figures';
import {useLayout} from '../layout';
import {palette, weight} from '../theme';
import type {AdContent} from '../content/schema';

/** 1 · HOOK — 150 frame. Si ferma lo scroll con una tesi, non con un logo. */
export const Hook: React.FC<{content: AdContent}> = ({content}) => {
  const frame = useCurrentFrame();
  const {px, portrait, width, height} = useLayout();
  const push = interpolate(frame, [0, 150], [1, 1.035], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.33, 0, 0.67, 1),
  });
  const globeIn = interpolate(frame, [0, 40], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <>
      <Background tone="top-right" />
      {/* Il globo sta dietro al testo: dà profondità senza rubare la lettura. */}
      <AbsoluteFill
        style={{
          alignItems: portrait ? 'center' : 'flex-end',
          justifyContent: portrait ? 'flex-start' : 'center',
          paddingRight: portrait ? 0 : width * 0.06,
          paddingTop: portrait ? height * 0.12 : 0,
          opacity: globeIn,
          transform: `scale(${interpolate(globeIn, [0, 1], [0.94, 1])})`,
        }}
      >
        {/* Larghezza fissata: un SVG con width 100% si centrerebbe su tutto il
            fotogramma e finirebbe sotto al titolo. */}
        <div style={{width: px(portrait ? 420 : 560), opacity: 0.85}}>
          <FigureGlobe height={portrait ? 420 : 560} />
        </div>
      </AbsoluteFill>
      <SceneFrame>
        <div style={{transform: `scale(${push})`, transformOrigin: 'left center'}}>
          <Reveal delay={2}>
            <Kicker>{content.hook.kicker}</Kicker>
          </Reveal>
          <div style={{height: px(38)}} />
          <Reveal delay={10} distance={34}>
            <div
              style={{
                fontSize: px(96),
                fontWeight: weight.semibold,
                lineHeight: 1.06,
                letterSpacing: px(-2),
                textShadow: '0 6px 40px rgba(1,10,7,0.75)',
              }}
            >
              {content.hook.lines[0]}
            </div>
          </Reveal>
          <Reveal delay={30} distance={34}>
            <div
              style={{
                fontSize: px(96),
                fontWeight: weight.semibold,
                lineHeight: 1.06,
                letterSpacing: px(-2),
                color: palette.greenSoft,
                textShadow: '0 6px 40px rgba(1,10,7,0.75)',
              }}
            >
              {content.hook.lines[1]}
            </div>
          </Reveal>
        </div>
      </SceneFrame>
    </>
  );
};
