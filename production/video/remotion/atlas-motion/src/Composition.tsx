import { AbsoluteFill, Composition, Series } from "remotion";
import { Anamorphic, LensArtifacts, SceneTransition, LogoWatermark } from "./shared";
import { SC01_Apertura } from "./scenes/SC01_Apertura";
import { SC02_StaccoReale } from "./scenes/SC02_StaccoReale";
import { SC03_Pressione } from "./scenes/SC03_Pressione";
import { SC04_Approssimazione } from "./scenes/SC04_Approssimazione";
import { SC05_IngressoAtlas, SC05_TOTAL } from "./scenes/SC05_IngressoAtlas";
import { SC06_Efficientamento } from "./scenes/SC06_Efficientamento";
import { SC07_Decarbonizzazione } from "./scenes/SC07_Decarbonizzazione";
import { SC08_Proof } from "./scenes/SC08_Proof";
import { SC09_Endcard } from "./scenes/SC09_Endcard";
import { SOCIAL15_TOTAL, SocialVertical15 } from "./scenes/SocialVertical15";

// Durate in frame @ 25fps, dalle TC del master script §5 (90s totali = 2250 frame)
const DURATIONS = {
  SC01: 175, // 00:00-00:07
  SC02: 175, // 00:07-00:14
  SC03: 250, // 00:14-00:24
  SC04: 200, // 00:24-00:32
  SC05: 400, // 00:32-00:48
  SC06: 300, // 00:48-01:00
  SC07: 350, // 01:00-01:14
  SC08: 200, // 01:14-01:22
  SC09: 200, // 01:22-01:30
};

const FPS = 25;
const WIDTH = 1920;
const HEIGHT = 1080;

const TOTAL_FRAMES = Object.values(DURATIONS).reduce((a, b) => a + b, 0);

// SC05 monta tre clip in <Series>: se la somma dei tre movimenti non coprisse
// esattamente la durata della scena, l'ultimo clip resterebbe congelato sullo
// schermo. Meglio fallire in build che scoprirlo nel master.
if (SC05_TOTAL !== DURATIONS.SC05) {
  throw new Error(`SC05: i movimenti sommano ${SC05_TOTAL} frame, la scena ne dura ${DURATIONS.SC05}`);
}

export const AtlasMaster90: React.FC = () => {
  return (
    <AbsoluteFill>
      <LensArtifacts>
      {/* Figure di transizione scelte sul salto narrativo — v. SceneTransition */}
      <Series>
        <Series.Sequence durationInFrames={DURATIONS.SC01}>
          <SceneTransition duration={DURATIONS.SC01} outKind="whip">
            <SC01_Apertura />
          </SceneTransition>
        </Series.Sequence>
        <Series.Sequence durationInFrames={DURATIONS.SC02}>
          <SceneTransition duration={DURATIONS.SC02} inKind="whip" outKind="punch">
            <SC02_StaccoReale />
          </SceneTransition>
        </Series.Sequence>
        <Series.Sequence durationInFrames={DURATIONS.SC03}>
          <SceneTransition duration={DURATIONS.SC03} inKind="punch" outKind="whip">
            <SC03_Pressione />
          </SceneTransition>
        </Series.Sequence>
        <Series.Sequence durationInFrames={DURATIONS.SC04}>
          <SceneTransition duration={DURATIONS.SC04} inKind="whip" outKind="flash">
            <SC04_Approssimazione />
          </SceneTransition>
        </Series.Sequence>
        <Series.Sequence durationInFrames={DURATIONS.SC05}>
          {/* il lampo in entrata e' il cambio di fronte: entra Atlas */}
          <SceneTransition duration={DURATIONS.SC05} inKind="flash" outKind="punch">
            <SC05_IngressoAtlas />
          </SceneTransition>
        </Series.Sequence>
        <Series.Sequence durationInFrames={DURATIONS.SC06}>
          <SceneTransition duration={DURATIONS.SC06} inKind="punch" outKind="dissolve">
            <SC06_Efficientamento />
          </SceneTransition>
        </Series.Sequence>
        <Series.Sequence durationInFrames={DURATIONS.SC07}>
          {/* industria -> natura: l'unico passaggio morbido del montaggio */}
          <SceneTransition duration={DURATIONS.SC07} inKind="dissolve" outKind="dissolve">
            <SC07_Decarbonizzazione />
          </SceneTransition>
        </Series.Sequence>
        <Series.Sequence durationInFrames={DURATIONS.SC08}>
          <SceneTransition duration={DURATIONS.SC08} inKind="dissolve" outKind="flash">
            <SC08_Proof />
          </SceneTransition>
        </Series.Sequence>
        <Series.Sequence durationInFrames={DURATIONS.SC09}>
          <SceneTransition duration={DURATIONS.SC09} inKind="flash">
            <SC09_Endcard />
          </SceneTransition>
        </Series.Sequence>
      </Series>
      </LensArtifacts>
      <LogoWatermark totalFrames={TOTAL_FRAMES} />
      <Anamorphic />
    </AbsoluteFill>
  );
};

export const MyComposition = () => {
  return (
    <>
      <Composition id="AtlasMaster90" component={AtlasMaster90} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
      {/* Derivato 15" 9:16 (§9): composizione dedicata, non un ritaglio del master anamorfico */}
      <Composition id="AtlasSocial15" component={SocialVertical15} durationInFrames={SOCIAL15_TOTAL} fps={FPS} width={1080} height={1920} />
      <Composition id="SC01-Apertura" component={SC01_Apertura} durationInFrames={DURATIONS.SC01} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="SC02-StaccoReale" component={SC02_StaccoReale} durationInFrames={DURATIONS.SC02} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="SC03-Pressione" component={SC03_Pressione} durationInFrames={DURATIONS.SC03} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="SC04-Approssimazione" component={SC04_Approssimazione} durationInFrames={DURATIONS.SC04} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="SC05-IngressoAtlas" component={SC05_IngressoAtlas} durationInFrames={DURATIONS.SC05} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="SC06-Efficientamento" component={SC06_Efficientamento} durationInFrames={DURATIONS.SC06} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="SC07-Decarbonizzazione" component={SC07_Decarbonizzazione} durationInFrames={DURATIONS.SC07} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="SC08-Proof" component={SC08_Proof} durationInFrames={DURATIONS.SC08} fps={FPS} width={WIDTH} height={HEIGHT} />
      <Composition id="SC09-Endcard" component={SC09_Endcard} durationInFrames={DURATIONS.SC09} fps={FPS} width={WIDTH} height={HEIGHT} />
    </>
  );
};
