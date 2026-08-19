import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {Background, Kicker, Reveal, SceneFrame} from '../components/ui';
import {useLayout} from '../layout';
import {palette, weight} from '../theme';
import type {AdContent} from '../content/schema';

/** 1 · HOOK — 150 frame. Si ferma lo scroll con una tesi, non con un logo. */
export const Hook: React.FC<{content: AdContent}> = ({content}) => {
  const frame = useCurrentFrame();
  const {px} = useLayout();
  const push = interpolate(frame, [0, 150], [1, 1.035], {
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.33, 0, 0.67, 1),
  });

  return (
    <>
      <Background />
      <SceneFrame>
        <div style={{transform: `scale(${push})`, transformOrigin: 'left center'}}>
          <Reveal delay={2}>
            <Kicker>{content.hook.kicker}</Kicker>
          </Reveal>
          <div style={{height: px(38)}} />
          <Reveal delay={10} distance={34}>
            <div style={{fontSize: px(96), fontWeight: weight.semibold, lineHeight: 1.06, letterSpacing: px(-2)}}>
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
