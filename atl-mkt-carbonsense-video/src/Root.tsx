import React from 'react';
import {Composition} from 'remotion';
import {CarbonSenseAd, DURATION, FPS} from './CarbonSenseAd';
import type {AdContent} from './content/schema';
import {en} from './content/en';
import {it} from './content/it';

/**
 * Registrazione delle composizioni: IT/EN × 16:9, 9:16, 1:1.
 * Naming: CarbonSense60-<LOCALE>-<RATIO>. Gli stessi id sono usati dagli
 * script npm e da scripts/render-all.mjs.
 */
const FORMATS = [
  {ratio: '16x9', width: 1920, height: 1080, subtitles: false},
  {ratio: '9x16', width: 1080, height: 1920, subtitles: true},
  {ratio: '1x1', width: 1080, height: 1080, subtitles: true},
] as const;

const LOCALES: {code: 'IT' | 'EN'; content: AdContent}[] = [
  {code: 'IT', content: it},
  {code: 'EN', content: en},
];

export const RemotionRoot: React.FC = () => (
  <>
    {LOCALES.map(({code, content}) =>
      FORMATS.map((format) => (
        <Composition
          key={`${code}-${format.ratio}`}
          id={`CarbonSense60-${code}-${format.ratio}`}
          component={CarbonSenseAd}
          durationInFrames={DURATION}
          fps={FPS}
          width={format.width}
          height={format.height}
          defaultProps={{
            content,
            voiceover: null,
            // Traccia generata da `npm run make:music`: prodotta in casa.
            music: 'music-atlas-ambient.mp3',
            // Diventa 'logo-atlas.svg' appena il marchio registrato è in public/.
            logo: null,
            subtitles: format.subtitles,
          }}
        />
      )),
    )}
  </>
);
