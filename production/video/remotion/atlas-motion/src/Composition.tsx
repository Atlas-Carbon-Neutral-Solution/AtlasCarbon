import { Composition } from "remotion";
import { SC09_Endcard } from "./scenes/SC09_Endcard";

export const MyComposition = () => {
  return (
    <Composition
      id="SC09-Endcard"
      component={SC09_Endcard}
      durationInFrames={200}
      fps={25}
      width={1920}
      height={1080}
    />
  );
};
