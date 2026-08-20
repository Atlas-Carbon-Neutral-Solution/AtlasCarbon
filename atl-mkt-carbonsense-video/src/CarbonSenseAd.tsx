import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {ProgressRail, Subtitles} from './components/ui';
import {CloseBumper, OpenBumper} from './components/LogoBumper';
import type {AdContent, SceneKey, SceneProps} from './content/schema';
import {Cta} from './scenes/Cta';
import {Hook} from './scenes/Hook';
import {Problem} from './scenes/Problem';
import {Space} from './scenes/Space';
import {Stack} from './scenes/Stack';
import {Twin} from './scenes/Twin';
import {WhyNow} from './scenes/WhyNow';
import {palette} from './theme';

export const FPS = 30;
export const DURATION = 60 * FPS;

/** Frame di sovrapposizione fra due scene: crossfade breve, non dissolvenza lunga. */
const OVERLAP = 8;

type SceneComponent = React.FC<SceneProps>;

/**
 * TIMELINE — fonte unica del montaggio.
 * La somma dei `duration` deve coincidere con DURATION; i valori sono gli
 * stessi della tabella in docs/ATL_MKT_CarbonSense_Script60_v1.md.
 * Per un taglio da 20": tenere solo hook, space, cta e impostare
 * DURATION = 20 * FPS.
 */
export const TIMELINE: {key: SceneKey; duration: number; component: SceneComponent}[] = [
  {key: 'hook', duration: 150, component: Hook},
  {key: 'problem', duration: 240, component: Problem},
  {key: 'stack', duration: 360, component: Stack},
  {key: 'space', duration: 330, component: Space},
  {key: 'twin', duration: 270, component: Twin},
  {key: 'whyNow', duration: 270, component: WhyNow},
  {key: 'cta', duration: 180, component: Cta},
];

const timelineTotal = TIMELINE.reduce((sum, scene) => sum + scene.duration, 0);
if (timelineTotal !== DURATION) {
  throw new Error(
    `TIMELINE incoerente: ${timelineTotal} frame contro DURATION ${DURATION}. Vedi docs/PIPELINE_AGENT.md §"Cambiare il montaggio".`,
  );
}

/** Offset di inizio di ogni scena, calcolato una volta sola. */
export const SCENE_STARTS = TIMELINE.map((_, i) =>
  TIMELINE.slice(0, i).reduce((sum, scene) => sum + scene.duration, 0),
);

export type CarbonSenseAdProps = {
  content: AdContent;
  /** File in public/, es. "vo-it.mp3". Licenza documentata e archiviata. */
  voiceover?: string | null;
  /**
   * Musica in public/. La traccia inclusa è generata da
   * `npm run make:music`: prodotta in casa, nessuna licenza di terzi.
   */
  music?: string | null;
  /**
   * Marchio in public/ (es. "logo-atlas.svg"). Senza, gli stacchi usano il
   * segnaposto vettoriale, che non è il marchio registrato.
   */
  logo?: string | null;
  /** Sottotitoli incisi: obbligatori sui formati social (autoplay muto). */
  subtitles?: boolean;
};

/** Fade in/out del singolo blocco scena, per il crossfade con la successiva. */
const SceneFade: React.FC<{isLast: boolean; duration: number; children: React.ReactNode}> = ({
  isLast,
  duration,
  children,
}) => {
  const frame = useCurrentFrame();
  // L'ultima scena non ha nulla su cui dissolvere: resta piena fino alla fine.
  const opacity = isLast
    ? interpolate(frame, [0, OVERLAP], [0, 1], {extrapolateRight: 'clamp'})
    : interpolate(frame, [0, OVERLAP, duration, duration + OVERLAP], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });

  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

export const CarbonSenseAd: React.FC<CarbonSenseAdProps> = ({
  content,
  voiceover = null,
  music = null,
  logo = null,
  subtitles = false,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{backgroundColor: palette.forest}}>
      {TIMELINE.map((scene, i) => {
        const isLast = i === TIMELINE.length - 1;
        const Scene = scene.component;

        return (
          <Sequence
            key={scene.key}
            from={SCENE_STARTS[i]}
            durationInFrames={scene.duration + (isLast ? 0 : OVERLAP)}
            name={scene.key}
          >
            <SceneFade isLast={isLast} duration={scene.duration}>
              <Scene content={content} logo={logo} />
              {subtitles ? <Subtitles text={content.vo[scene.key]} /> : null}
            </SceneFade>
          </Sequence>
        );
      })}

      <ProgressRail segments={TIMELINE} frame={frame} total={DURATION} />

      {/* Stacchi marchio: overlay, non scene. La TIMELINE resta intatta. */}
      <OpenBumper logo={logo} />
      <CloseBumper logo={logo} site={content.cta.site} />

      {voiceover ? <Audio src={staticFile(voiceover)} /> : null}
      {/* Con il voiceover la musica scende: la voce deve restare intelligibile. */}
      {music ? <Audio src={staticFile(music)} volume={voiceover ? 0.2 : 0.34} /> : null}
    </AbsoluteFill>
  );
};
